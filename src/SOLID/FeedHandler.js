import { buildThing, createSolidDataset, createThing, getDatetime, getSolidDataset, 
    getThing, getUrl, getUrlAll, saveSolidDatasetInContainer, setThing } from "@inrupt/solid-client";
import { createEmptyDataset, delay, deleteDataset, FEED_DIR, FEED_THING, getChildUrlsList, simplifyError } from "./Utils";
import { getAllAgentsAppendAccess, setAppendAccess } from "./AccessHandler";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { SOCIAL_SOLID } from "./SolidTerms";
import { RDF } from "@inrupt/vocab-common-rdf";
import { fetchPeople } from "./Connections/PeopleHandler";
import { findSocialPodFromWebId } from "./NotificationHandler"
import { fetchPeopleFromList } from "./Connections/PeopleHandler";
import { fetchPosts } from "./PostHandler";


export const FEED_ITEM_TYPES = {
    PostAlert: 0,
}

export async function doesFeedDirExist(podRootDir) {
    try {
        await getSolidDataset(
            podRootDir + FEED_DIR, 
            { fetch: fetch }
        )
        return [true, null];
    } catch (error) {
        let e = simplifyError(error, "Whilst checking if feed directory exists.");
        if (e.code === 404) {
            return [false, null];
        }
        return [false, e];
    }
}

export async function createFeedDir(podRootDir) {
    const error = await createEmptyDataset(podRootDir + FEED_DIR)[1];
    if (error) {
        return error;
    }
    await delay(500);
}


export async function createPostAlert(recieverPodRoot, {webId, postUrl}) {
    let alertDataset = createSolidDataset();
    let alertThing = buildThing(createThing({name: "this"}))
        .addUrl(RDF.type, SOCIAL_SOLID.PostAlert)
        .addUrl(SOCIAL_SOLID.SenderWebId, webId)
        .addUrl(SOCIAL_SOLID.PostContainer, postUrl)
        .addUrl(SOCIAL_SOLID.SupportedApplications, SOCIAL_SOLID.Decent)
        .addDatetime(SOCIAL_SOLID.DatetimeCreated, new Date(Date.now()))
        .build();
    
    alertDataset = setThing(alertDataset, alertThing);

    try {
        await saveSolidDatasetInContainer(
            recieverPodRoot + FEED_DIR,
            alertDataset,
            { fetch: fetch }
        );
    } catch (e) {
        let error = simplifyError(e, "Whilst adding post alert to feed.");
        if (error.code === 404) {
            // Not found
            return {title: "User has no feed directory", 
                description: "Cannot send a post alert to them."};
        }
        if (error.code === 403) {
            // Unauthorised
            return {title: "No access to this user's feed directory", 
                description: "You may have been blocked."};
        }
        return {title: "Cannot add to feed directory", 
            description: error.description};
    }
    return null;
}

function getPostAlertFromThing(postAlertThing) {
    // Sender web id
    const webId = getUrl(postAlertThing, SOCIAL_SOLID.SenderWebId, { fetch: fetch });
    if (webId == null) {
        return [null, {
            code: 0,
            title: "Failed to load notification",
            description: "Connection request has no web id."
        }]
    }

    // Sender Pod root directory
    const postContainer = getUrl(postAlertThing, SOCIAL_SOLID.PostContainer, { fetch: fetch });
    if (postContainer == null) {
        return [null, {
            code: 0,
            title: "Failed to load post alert",
            description: "Post Alert has no post container url."
        }];
    }
    return [{
        type: FEED_ITEM_TYPES.PostAlert,
        senderWebId: webId,
        postContainer: postContainer,
    }, null]
}

async function getFeedItem(feedItemUrl) {
    const errContext = "Encountered whilst attempting to get feed item " +
                        "data for " + feedItemUrl;
    let itemDataset;
    let error;
    try {
        itemDataset = await getSolidDataset(
            feedItemUrl, 
            { fetch: fetch }  // fetch function from authenticated session
        );
    } catch (error) {
        return [null, simplifyError(error, errContext)];
    }

    const itemThing = getThing(itemDataset, feedItemUrl + FEED_THING, { fetch: fetch });
    if (!itemThing) {
        return [null, {
            code: 0,
            title: "Post alert has no "+ FEED_THING + " Thing.",
            description: errContext,
        }]
    }
    // Supported apps
    const supportedApps = getUrlAll(itemThing, SOCIAL_SOLID.SupportedApplications, { fetch: fetch });
    if (!supportedApps.includes(SOCIAL_SOLID.Decent)) {
        // Unsupported, no error returned as we don't 
        // want to create an alert for this if it for
        // another app
        return [null, null]
    }

    // Date of creation - all should have a date.
    const dateCreated = getDatetime(itemThing, SOCIAL_SOLID.DatetimeCreated, {fetch: fetch});

    let feedItem;
    const itemType = getUrl(itemThing, RDF.type, { fetch: fetch });
    if (itemType === SOCIAL_SOLID.PostAlert) {
        [feedItem, error] = getPostAlertFromThing(itemThing);
        if (error) {
            return [null, error];
        }
    } else {
        return [null, {
            code: 0,
            title: "Alert type unknown.",
            description: errContext
        }]
    }
    feedItem = {
        ...feedItem,
        url: feedItemUrl,
        datetime: dateCreated
    }
    return [feedItem, null];
}

export async function fetchFeedItems(podRootDir) {
    let feedItems = [];
    let feedItemUrls = [];
    let error;
    [feedItemUrls, error] = await getChildUrlsList(podRootDir + FEED_DIR);
    if (error) {
        return [feedItems, [error]];
    }
    let feedItem;
    let errorList = [];
    for (let i = 0; i < feedItemUrls.length; i++) {
        [feedItem, error] = await getFeedItem(feedItemUrls[i]);
        if (error) {
            errorList.push(error);
            continue;
        }
        if (feedItem == null) {
            // No error but don't want alert
            continue;
        }
        feedItems.push(feedItem);
    }
    return [feedItems, errorList];
}

export async function deleteFeedItem(feedItemUrl) {
    return await deleteDataset(feedItemUrl);
}


export async function createPostAlerts(postUrl, podRootDir, webId, recipientList) {
    let recipientPodRoots = [];
    // Get pod roots for only specific contacts
    for (let i = 0; i < recipientList.length; i ++) {
        let result = await findSocialPodFromWebId(recipientList[i].webId);
        if (result.pod) {
            recipientPodRoots.push(result.pod);
        }
    }
    recipientPodRoots.forEach(async (podRoot) => {
        let beep = await createPostAlert(podRoot, {webId: webId, postUrl: postUrl});
        console.log(beep);
    });
    
    return;
}

export async function fetchPeopleWithFeedAppendAccess(podRootDir) {
    let [accessList, error] = await getAllAgentsAppendAccess(podRootDir + FEED_DIR, true);
    if (error) {
        return [[], error];
    }
    let [people, errors] = await fetchPeople(podRootDir);
    for (let i = 0; i < accessList.length; i++) {
        let person = people.find(p => p.webId === accessList[i].webId);
        if (person) {
            console.log("Adjusted person");
            accessList[i] = person;
        }
    }

    return [accessList, null]
}

export async function followPerson(podRootDir, webId) {
    return await setAppendAccess(podRootDir + FEED_DIR, webId, true);
}

export async function revokeFollowPerson(podRootDir, webId) {
    return await setAppendAccess(podRootDir + FEED_DIR, webId, false)
}

export async function followGroup(podRootDir, group) {
    let [people, errors] = await fetchPeopleFromList(podRootDir, group.members);
    if (people.length === 0) {
        return {success: false, error: 
            {title: "Group has no people.", 
            description: "No one has been followed."}};
    }
    for (let i = 0; i < people.length; i++) {
        await followPerson(podRootDir, people[i].webId);
    }
    return {success: true};
}


export async function addLatestToFeed(from, to) {
    let [success, posts, errors] = await fetchPosts(from.podRootDir, false);
    if (!success) {
        return {success: false, error: errors[0]};
    }
    // get 3 latest posts
    const latestPosts = posts.sort((p1, p2) => {
            if (p1.date < p2.date) return -1;
            else if (p2.date < p1.date) return 1;
            else return 0;
        }).slice(-3);
    
    // send to feed
    await latestPosts.forEach(async (post) => 
        await createPostAlert(to.podRootDir, {webId: from.webId, postUrl: post.url}));

    return {success: true}
}