import { FetchError, deleteSolidDataset, getContainedResourceUrlAll, getSolidDataset, isContainer } from "@inrupt/solid-client";


export const SOCIAL_ROOT = "social/";
export const POSTS_DIR = "social/posts/";
export const SOCIAL_DATASET = "social/social";
export const PROFILE_THING = "social/social#profile";


export function GetPostDatasetUrl(postDir, postName) {return postDir + postName;}
export const POST_DETAILS = "#details";


/**
 * Function to find all the sub containers in a container directory.
 * 
 * @param {string} containerUrl the URL of the container.
 * @returns {[string]} A list of string URLs
 */
export async function getChildUrlsList(containerUrl) {
    // get all contains in the post folder
    const childUrls = getContainedResourceUrlAll(
        await getSolidDataset(
            containerUrl, 
            { fetch: fetch }  
        ), 
        { fetch: fetch } // fetch function specifies this authenticated session
    ); 
    return childUrls;
}

export async function deleteFile(url) {
    try {
        await deleteFile(
          url, 
          { fetch: fetch }
        );
        return null;
    } catch (error) {
        return error;
    }
}

export async function deleteDataset(url) {
    try {
        await deleteSolidDataset(
          url, 
          { fetch: fetch }
        );
        return null;
    } catch (error) {
        return error;
    }
}

export async function deleteDirectory(dirUrl) {
    let isFile = false;
    let isCtnr = false;
    let childUrls = await getChildUrlsList(dirUrl);
    for (let i = 0; i < childUrls.length; i++) {
        try {
            let res = getSolidDataset(
                childUrls[i], 
                {fetch: fetch}
            );
            isCtnr = isContainer(res);
        } catch (error) {
            if (error instanceof FetchError) {
                if (error.statusCode == 406) {
                    isFile = true;
                }
            }
        }
        if (isFile) {
            await deleteFile(childUrls[i]);
        } else if (isCtnr) {
            await deleteDirectory(childUrls[i]);
        }
        await deleteDataset(childUrls[i]);
        isFile = false;
        isCtnr = false;
    }

    if ((await getChildUrlsList(dirUrl)).length > 0) {
        return "Could not delete a file within the directory, so could not remove this directory";
    }
    try {
        await deleteSolidDataset(
            dirUrl, 
          { fetch: fetch }
        );
        return null;
    } catch (error) {
        return error;
    }
}
