import { buildThing, createSolidDataset, createThing, getDatetime, getSolidDataset, getThing, getUrl, getUrlAll, saveSolidDatasetInContainer, setThing } from "@inrupt/solid-client";
import { createEmptyDataset, delay, deleteDataset, FEED_DIR, FEED_THING, getChildUrlsList, simplifyError } from "./Utils";
import { setPublicAppendAccess } from "./AccessHandler";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { SOCIAL_SOLID } from "./SolidTerms";
import { RDF } from "@inrupt/vocab-common-rdf";
import { fetchPeople } from "./Connections/PeopleHandler";
import { findSocialPodFromWebId } from "./NotificationHandler"


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
        let e = simplifyError(error, "Whilst checking if notifications directory exists.");
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
    await setPublicAppendAccess(podRootDir + FEED_DIR);
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
    if (recipientList) {
        // Get pod roots for only specific contacts
        for (let i = 0; i < recipientList.length; i ++) {
            let [podRoot, error] = await findSocialPodFromWebId(recipientList[i]);
            if (podRoot) {
                recipientPodRoots.push(podRoot);
            }
        }
    } else {
        // Get pod roots for all contacts
        let [people, errors] = await fetchPeople(podRootDir);
        for (let i = 0; i < people.length; i ++) {
            let [podRoot, error] = await findSocialPodFromWebId(people[i].webId);
            if (podRoot) {
                recipientPodRoots.push(podRoot);
            }
        }
    }
    console.log(recipientPodRoots);
    recipientPodRoots.forEach(async (podRoot) => {
        let beep = await createPostAlert(podRoot, {webId: webId, postUrl: postUrl});
        console.log(beep);
    });
    
    return;
}