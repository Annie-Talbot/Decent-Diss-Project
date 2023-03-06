import { buildThing, createSolidDataset, createThing, getBoolean, getDatetime, 
    getPodUrlAll, getSolidDataset, getStringNoLocale, getThing, getUrl, getUrlAll, 
    saveSolidDatasetInContainer, setThing } from "@inrupt/solid-client";
import { RDF } from "@inrupt/vocab-common-rdf";
import { createEmptyDataset, delay, deleteDataset, getChildUrlsList, NOTIFICATIONS_DIR, 
    NOTIFICATIONS_THING, simplifyError, SOCIAL_ROOT } from "./Utils";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { SOCIAL_SOLID } from "./SolidTerms";
import { setPublicAppendAccess } from "./AccessHandler";

export const NOTIFICATIONS_TYPES = {
    ConnectionRequest: 0,
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
            return [null, error];
        }
        return [null, error];
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
        return [null, {title: "Failed to find social information.",
            description: "Could not find a pod with a social directory belonging to " + webId}];
    }
    // No issues
    return [socialPod, null];
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
        return error;
    }
    await delay(500);
    await setPublicAppendAccess(podRootDir + NOTIFICATIONS_DIR);
}


export async function createConnectionRequest(senderDetails, recieverPodRoot) {
    //senderDetails = {webId, msg, socialPod}
    let notifDataset = createSolidDataset();
    let notifThing = buildThing(createThing({name: "this"}))
        .addUrl(RDF.type, SOCIAL_SOLID.ConnReq)
        .addUrl(SOCIAL_SOLID.NotifSenderWebId, senderDetails.webId)
        .addStringNoLocale(SOCIAL_SOLID.NotifMessage, senderDetails.msg)
        .addUrl(SOCIAL_SOLID.NotifSenderPodRoot, senderDetails.socialPod)
        .addUrl(SOCIAL_SOLID.SupportedApplications, SOCIAL_SOLID.Decent)
        .addBoolean(SOCIAL_SOLID.HasBeenRead, false)
        .addDatetime(SOCIAL_SOLID.DatetimeCreated, new Date(Date.now()))
        .build();
    
    notifDataset = setThing(notifDataset, notifThing);

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
            return {title: "User has no notifications directory", 
                description: "Cannot send a notification to them."};
        }
        if (error.code === 403) {
            // Unauthorised
            return {title: "No access to this user's notifications directory", 
                description: "You may have been blocked."};
        }
        return {title: "Cannot add to notifications directory", 
            description: error.description};
    }
    return null;
}



function getConnectionRequestNotification(notifThing) {
    // Sender web id
    const webId = getUrl(notifThing, SOCIAL_SOLID.NotifSenderWebId, { fetch: fetch });
    if (webId == null) {
        return [null, {
            code: 0,
            title: "Failed to load notification",
            description: "Connection request has no web id."
        }]
    }

    // Sender Pod root directory
    const pod = getUrl(notifThing, SOCIAL_SOLID.NotifSenderPodRoot, { fetch: fetch });
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
        msg = getStringNoLocale(notifThing, SOCIAL_SOLID.msg, { fetch: fetch });
        if (msg == null) {
            msg = "";
        }
    } catch (error) {
        msg = "";
    }
    
    
    return [{
        type: NOTIFICATIONS_TYPES.ConnectionRequest,
        senderWebId: webId,
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

    let notif;
    const notifType = getUrl(notifThing, RDF.type, { fetch: fetch });
    if (notifType === SOCIAL_SOLID.ConnReq) {
        [notif, error] = getConnectionRequestNotification(notifThing);
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
        datetime: dateCreated
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
    return await deleteDataset(notifUrl)[1];
}