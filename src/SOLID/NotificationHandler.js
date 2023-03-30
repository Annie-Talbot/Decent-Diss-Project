import { buildThing, createSolidDataset, createThing, getBoolean, getDatetime, 
    getPodUrlAll, getSolidDataset, getStringNoLocale, getThing, getUrl, getUrlAll, 
    saveSolidDatasetInContainer, setThing } from "@inrupt/solid-client";
import { RDF } from "@inrupt/vocab-common-rdf";
import { createEmptyDataset, delay, deleteDataset, getChildUrlsList, NOTIFICATIONS_DIR, 
    NOTIFICATIONS_THING, POSTS_DIR, POST_DETAILS, simplifyError, SOCIAL_ROOT } from "./Utils";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { SOCIAL_SOLID } from "./SolidTerms";
import { getAllAgentsAppendAccess, setReadAppendAccess, setPublicAppendAccess } from "./AccessHandler";
import { WebsocketNotification } from "@inrupt/solid-client-notifications";
import { fetchPeople } from "./Connections/PeopleHandler";

export const NOTIFICATIONS_TYPES = {
    ConnectionRequest: 0,
    Like: 1,
}


export async function findSocialPodFromWebId(webId) {
    // Get all pods of this webId
    let podUrls;
    try {
        podUrls = await getPodUrlAll(webId, { fetch: fetch });
    } catch (e) {
        const error = simplifyError(e, "Whilst attempting to validate WebID: " + webId);
        if (error.code === 404) {
            error.title = "WebID has no associated pods.";
            return {success: false, error};
        }
        return {success: false, error};
    }
    // Find the pod with the social directory
    let socialPod;
    for (let i = 0; i < podUrls.length; i++) {
        try {
            await getSolidDataset(podUrls[i] + SOCIAL_ROOT, {fetch: fetch});
            // If no error, this pod has a social directory!
            socialPod = podUrls[i];
            break;
        } catch {
            // No social directory here, try next pod
            continue;
        }
    }
    if (socialPod == null) {
        return {success: true};
    }
    // No issues
    return {success: true, pod: socialPod};
}

export async function doesNotificationsDirExist(podRootDir) {
    try {
        await getSolidDataset(
            podRootDir + NOTIFICATIONS_DIR, 
            { fetch: fetch }
        )
        return [true, null];
    } catch (error) {
        let e = simplifyError(error, "Whilst checking if notifications directory exists.");
        if (e.code === 404) {
            return [false, null];
        }
        return [false, e];
    }
}

export async function createNotificationsDir(podRootDir) {
    const error = await createEmptyDataset(podRootDir + NOTIFICATIONS_DIR)[1];
    if (error) {
        return {success: false, error: error};
    }
    await delay(500);
    await setPublicAppendAccess(podRootDir + NOTIFICATIONS_DIR);
    return {success: true};
}


export async function createConnectionRequest(sender, reciever) {
    //senderDetails = {webId, msg, socialPod}
    let notifDataset = createSolidDataset();
    let notifThing = buildThing(createThing({name: "this"}))
        .addUrl(RDF.type, SOCIAL_SOLID.ConnReq)
        .addUrl(SOCIAL_SOLID.SenderWebId, sender.webId)
        .addUrl(SOCIAL_SOLID.SenderPodRoot, sender.podRootDir)
        .addUrl(SOCIAL_SOLID.SupportedApplications, SOCIAL_SOLID.Decent)
        .addBoolean(SOCIAL_SOLID.HasBeenRead, false)
        .addDatetime(SOCIAL_SOLID.DatetimeCreated, new Date(Date.now()))
        .build();
    
    notifDataset = setThing(notifDataset, notifThing);

    return await sendNotification(notifDataset, reciever.podRootDir);
}

function getLikeNotification(notifThing) {
    const post = getUrl(notifThing, SOCIAL_SOLID.PostContainer, { fetch: fetch });
    if (post == null) {
        return [null, {
            code: 0,
            title: "Failed to load notification",
            description: "Like has no post linked."
        }];
    }
    return [{
        type: NOTIFICATIONS_TYPES.Like,
        post: post
    }, null]
}

function getConnectionRequestNotification(notifThing) {
    // Sender Pod root directory
    const pod = getUrl(notifThing, SOCIAL_SOLID.SenderPodRoot, { fetch: fetch });
    if (pod == null) {
        return [null, {
            code: 0,
            title: "Failed to load notification",
            description: "Connection request has no sender pod url."
        }];
    }

    // Message
    let msg;
    try{
        msg = getStringNoLocale(notifThing, SOCIAL_SOLID.NotifMessage, { fetch: fetch });
        if (msg == null) {
            msg = "";
        }
    } catch (error) {
        msg = "";
    }
    
    
    return [{
        type: NOTIFICATIONS_TYPES.ConnectionRequest,
        senderPodRootDir: pod,
        message: msg
    }, null]
}

async function getNotification(notifUrl) {
    const errContext = "Encountered whilst attempting to get notification " +
                        "data for " + notifUrl;
    let notifDataset;
    let error;
    try {
        notifDataset = await getSolidDataset(
            notifUrl, 
            { fetch: fetch }  // fetch function from authenticated session
        );
    } catch (error) {
        return [null, simplifyError(error, errContext)];
    }

    // Notification information is found in the #this Thing at the dataset:
    // details Thing URL: https://provider/podname/social/notifications/notifname#this
    const notifThing = getThing(notifDataset, notifUrl + NOTIFICATIONS_THING, { fetch: fetch });
    if (!notifThing) {
        return [null, {
            code: 0,
            title: "Notification has no #this Thing.",
            description: errContext,
        }]
    }

    // Supported apps
    const supportedApps = getUrlAll(notifThing, SOCIAL_SOLID.SupportedApplications, { fetch: fetch });
    if (!supportedApps.includes(SOCIAL_SOLID.Decent)) {
        return [null, null]
    }

    // is the notification read
    const isRead = getBoolean(notifThing, SOCIAL_SOLID.HasBeenRead, { fetch: fetch });
    if (isRead === true) {
        return [null, null]
    }

    // Date of creation
    const dateCreated = getDatetime(notifThing, SOCIAL_SOLID.DatetimeCreated, {fetch: fetch});

    // Sender web id
    const webId = getUrl(notifThing, SOCIAL_SOLID.SenderWebId, { fetch: fetch });
    if (webId == null) {
        return [null, null]
    }

    let notif;
    const notifType = getUrl(notifThing, RDF.type, { fetch: fetch });
    if (notifType === SOCIAL_SOLID.ConnReq) {
        [notif, error] = getConnectionRequestNotification(notifThing);
        if (error) {
            return [null, error];
        }
    } else if (notifType === SOCIAL_SOLID.Like) {
        [notif, error] = getLikeNotification(notifThing);
        if (error) {
            return [null, error];
        }
    } else {
        return [null, {
            code: 0,
            title: "Notification type unknown.",
            description: errContext
        }]
    }
    notif = {
        ...notif,
        url: notifUrl,
        datetime: dateCreated,
        senderWebId: webId
    }
    return [notif, null];
}


export async function fetchNotifications(podRootDir) {
    let notifList = [];
    let notifUrlList = [];
    let error;
    [notifUrlList, error] = await getChildUrlsList(podRootDir + NOTIFICATIONS_DIR);
    if (error) {
        return [notifList, [error]];
    }
    let notif;
    let errorList = [];
    for (let i = 0; i < notifUrlList.length; i++) {
        [notif, error] = await getNotification(notifUrlList[i]);
        if (error) {
            errorList.push(error);
            continue;
        }
        if (notif == null) {
            // No error but don't want notification
            continue;
        }
        notifList.push(notif);
    }
    return [notifList, errorList];
}



export async function deleteNotification(notifUrl) {
    return await deleteDataset(notifUrl); 
}


function connectSocket(socket, updateFunction) {
    socket.on("message", updateFunction);
    
    socket.on("close", function(e) {
      console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
      setTimeout(function() {
        connectSocket(updateFunction);
      }, 1000);
    });
  
    socket.on("error", function(err) {
      console.error('Socket encountered error: ', err.message, 'Closing socket');
      socket.disconnect();
    });

    socket.connect();
  }

export async function createNotificationSocket(podRootDir, changeHandler) {
    var socket;
    try {
        socket = new WebsocketNotification(
            podRootDir + NOTIFICATIONS_DIR,
            { fetch: fetch }
        );
    } catch (e) {
        return simplifyError(e, "Trying to create notification listener.");
    }
    connectSocket(socket, changeHandler);
    return null;
}

async function sendNotification(notifDataset, recieverPodRoot) {
    try {
        await saveSolidDatasetInContainer(
            recieverPodRoot + NOTIFICATIONS_DIR,
            notifDataset,
            { fetch: fetch }
        );
    } catch (e) {
        let error = simplifyError(e, "Whilst creating connection request notification.");
        if (error.code === 404) {
            // Not found
            return {success: false, error: {title: "User has no notifications directory", 
                description: "Cannot send a notification to them."}};
        }
        if (error.code === 403) {
            // Unauthorised
            return  {success: false, error: {title: "No access to this user's notifications directory", 
                description: "You may have been blocked."}};
        }
        return  {success: false, error: {title: "Cannot add to notifications directory", 
            description: error.description}};
    }
    return {success: true};
}


export async function createLikeNotification(senderWebId, postUrl, recieverPodRoot) {
    let notifDataset = createSolidDataset();
    let notifThing = buildThing(createThing({name: "this"}))
        .addUrl(RDF.type, SOCIAL_SOLID.Like)
        .addUrl(SOCIAL_SOLID.SenderWebId, senderWebId)
        .addUrl(SOCIAL_SOLID.PostContainer, postUrl)
        .addUrl(SOCIAL_SOLID.SupportedApplications, SOCIAL_SOLID.Decent)
        .addDatetime(SOCIAL_SOLID.DatetimeCreated, new Date(Date.now()))
        .build();
    
    notifDataset = setThing(notifDataset, notifThing);

    return await sendNotification(notifDataset, recieverPodRoot);
}

export async function sendLike(senderWebId, postUrl, recieverWebId) {
    let result = await findSocialPodFromWebId(recieverWebId);
    if (!result.success) {
        return result;
    }
    return await createLikeNotification(senderWebId, postUrl, result.pod);
}


export async function fetchPeopleWithoutNotificationAppendAccess(podRootDir) {
    let [accessList, error] = await getAllAgentsAppendAccess(podRootDir + NOTIFICATIONS_DIR, false);
    if (error) {
        return [[], error];
    }
    let [people, errors] = await fetchPeople(podRootDir);
    for (let i = 0; i < accessList.length; i++) {
        let person = people.find(p => p.webId === accessList[i].webId);
        if (person) {
            accessList[i] = person;
        }
    }

    return [accessList, null]
}


export async function blockPerson(podRootDir, webId) {
    let error = await setReadAppendAccess(podRootDir + NOTIFICATIONS_DIR, webId, true, false);
    if (error) {
        return {success: false, error: {title: "Could not change access."}};
    }
    return {success: true};
}

export async function revokeBlockPerson(podRootDir, webId) {
    let error = await setReadAppendAccess(podRootDir + NOTIFICATIONS_DIR, webId, false, true);
    if (error) {
        return {success: false, error: {title: "Could not change access."}};
    }
    return {success: true};
}