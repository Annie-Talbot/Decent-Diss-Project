import { createSolidDataset, saveSolidDatasetAt, FetchError, deleteFile, deleteSolidDataset, getContainedResourceUrlAll, getSolidDataset, isContainer, getFile } from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";

export const DATE_CREATED = "http://schema.org/dateCreated";
export const TITLE = "http://schema.org/title";




export const SOCIAL_ROOT = "social/";
export const POSTS_DIR = "social/posts/";
export const SOCIAL_DATASET = "social/social";
export const PROFILE_THING = "social/social#profile";
export const CONNECTIONS_DIR = "social/connections/"

export function GetPostDatasetUrl(postDir, postName) {return postDir + postName;}
export const POST_DETAILS = "#details";

export const PEOPLE_DATASET = "people"
export const GROUPS_DATASET = "groups"


export function simplifyError(error, context) {
    if (error instanceof FetchError) {
        console.log(error)
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
        error = simplifyError(error, "Encountered whilst attemping to " + 
                            "fetch the child URLs of directory" + containerUrl)
        return [[], error]
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

async function deleteDataset(url) {
    try {
        await deleteSolidDataset(
          url, 
          { fetch: fetch }
        );
        return [true, null];
    } catch (error) {
        return [false, simplifyError(error, 
            "Encountered whilst attempting to delete the dataset at " + url)
        ]
    }
}

export async function deleteDirectory(dirUrl) {
    let success;
    let isFile = false;
    let isCtnr = false;
    let [childUrls, error] = await getChildUrlsList(dirUrl);
    if (error) {
        return [false, error];
    }
    console.log(childUrls);
    for (let i = 0; i < childUrls.length; i++) {
        try {
            let res = await getSolidDataset(
                childUrls[i], 
                {fetch: fetch}
            );
            isCtnr = isContainer(res);
        } catch (error) {
            error = simplifyError(error, "Encountered whilst attempting to fetch the " +
                                        "dataset at " + childUrls[i] + ". During the " +
                                        "delete directory operation on " + dirUrl +".")
            if (error.code == 406) {
                isFile = true;
            } else {
                return [false, error]
            }
        }
        if (isFile) {
            [success, error] = await deleteRawFile(childUrls[i]);
            if (!success) {
                return [false, error]
            }
        } else if (isCtnr) {
            [success, error] = await deleteDirectory(childUrls[i]);
            if (!success) {
                return [false, error]
            }
        } else {
            [success, error] = await deleteDataset(childUrls[i]);
            if (!success) {
                return [false, error]
            }
        }
        isFile = false;
        isCtnr = false;
    }

    [childUrls, error] = await getChildUrlsList(dirUrl);
    if (error) {
        return [false, error];
    }
    if (childUrls.length > 0) {
        return [false, {
            code: -1,
            title: "Unknown error",
            description: "Could not delete a file within " +
                        "the directory, so could not remove this directory",
        }]
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

