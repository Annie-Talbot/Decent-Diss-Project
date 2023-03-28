import { createSolidDataset, saveSolidDatasetAt, FetchError, deleteFile, 
    deleteSolidDataset, getContainedResourceUrlAll, getSolidDataset, 
    isContainer, getFile, getPodUrlAll } from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";


export const DATE_CREATED = "http://schema.org/dateCreated";
export const TITLE = "http://schema.org/title";




export const SOCIAL_ROOT = "social/";
export const POSTS_DIR = "social/posts/";
export const SOCIAL_DATASET = "social/social";
export const PROFILE_DATASET = "social/profile";
export const PROFILE_THING = "social/profile#me";
export const CONNECTIONS_DIR = "social/connections/"
export const NOTIFICATIONS_DIR = "social/notifications/"
export const NOTIFICATIONS_THING = "#this"
export const FEED_DIR = "social/feed/"
export const FEED_THING = "#this"

export function GetPostDatasetUrl(postDir, postName) {return postDir + postName;}
export const POST_THING = "#this";
export const POST_DATASET = 'post'
export const POST_ACCESS_DATASET = 'access';
export const POST_ACCESS_THING = '#this'

export const PEOPLE_DATASET = "people"
export const GROUPS_DATASET = "groups"


export function simplifyError(error, context) {
    if (error instanceof FetchError) {
        return {
            code: error.statusCode, 
            title: error.statusText, 
            description: context
        }
    } else {
        return {
            code: -1, 
            title: "Unknown error: " + error, 
            description: context,
        }
    }
}

/**
 * Function to find all the sub containers in a container directory.
 * 
 * @param {string} containerUrl the URL of the container.
 * @returns {[string]} A list of string URLs
 */
export async function getChildUrlsList(containerUrl) {
    try {
        const childUrls = await getContainedResourceUrlAll(
            await getSolidDataset(
                containerUrl, 
                { fetch: fetch }  
            ), 
            { fetch: fetch } // fetch function specifies this authenticated session
        ); 
        return [childUrls, null];
    } catch(error) {
        const e = simplifyError(error, "Encountered whilst attemping to " + 
                            "fetch the child URLs of directory" + containerUrl)
        return [[], e]
    }
}

async function deleteRawFile(url) {
    try {
        await deleteFile(
          url, 
          { fetch: fetch }
        );
        return [true, null];
    } catch(error) {
        return [false, simplifyError(
            error, 
            "Encountered whilst attempting to delete the file at " + url)
        ]
    }
}

export async function deleteDataset(url) {
    try {
        await deleteSolidDataset(
          url, 
          { fetch: fetch }
        );
        return {success: true};
    } catch (error) {
        return {success: false, error: simplifyError(error, 
            "Encountered whilst attempting to delete the dataset at " + url)}
    }
}

export async function deleteDirectory(dirUrl) {
    let success;
    let result;
    let isFile = false;
    let isCtnr = false;
    let [childUrls, error] = await getChildUrlsList(dirUrl);
    if (error) {
        return [false, error];
    }
    for (let i = 0; i < childUrls.length; i++) {
        try {
            let res = await getSolidDataset(
                childUrls[i], 
                {fetch: fetch}
            );
            isCtnr = isContainer(res);
        } catch (e) {
            const error = simplifyError(e, "Encountered whilst attempting to fetch the " +
                                        "dataset at " + childUrls[i] + ". During the " +
                                        "delete directory operation on " + dirUrl +".")
            if (error.code === 406) {
                isFile = true;
            } else {
                return [false, error]
            }
        }
        if (isFile) {
            [success, error] = await deleteRawFile(childUrls[i]);
            if (!success) {
                return {success: false, error: error};
            }
        } else if (isCtnr) {
            result = await deleteDirectory(childUrls[i]);
            if (!result.success) {
                return result;
            }
        } else {
            result = await deleteDataset(childUrls[i]);
            if (!result.success) {
                return result;
            }
        }
        isFile = false;
        isCtnr = false;
    }

    [childUrls, error] = await getChildUrlsList(dirUrl);
    if (error) {
        return {success: false, error: error};
    }
    if (childUrls.length > 0) {
        return {success: false, error: {
            title: "Unknown error",
            description: "Could not delete a file within " +
                        "the directory, so could not remove this directory",
        }};
    }
    return await deleteDataset(dirUrl);
}

export function makeId(length) {
    let id = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
      id += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return id;
}

/**
 * A function to create an empty dataset at the given url.
 * @param {string} datasetUrl 
 * @returns 
 */
export async function createEmptyDataset(datasetUrl) {
    try {
        const dataset = await saveSolidDatasetAt(
            datasetUrl,
            createSolidDataset(),
            { fetch: fetch }
        );
        return [dataset, null];
    } catch (error) {
        return [null, simplifyError(error, "Encountered when creating dataset at " + datasetUrl)]
    }
}


export async function getImage(url) {
    try {
        const imageBlob = await getFile(url, { fetch: fetch });
        return [imageBlob, null];
       } catch (error) {
        return [null, simplifyError(error, "Could not load image at " + url)]
    }
}

export const delay = ms => new Promise(res => setTimeout(res, ms));


export async function isValidWebID(webId) {
    try{
        await getPodUrlAll(webId);
        return true;
    } catch {
        return false;
    }
}