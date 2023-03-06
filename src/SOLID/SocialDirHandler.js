import { fetch } from '@inrupt/solid-client-authn-browser'
import {  FetchError, getSolidDataset, deleteSolidDataset, getPodUrlAll } from '@inrupt/solid-client';
import { createEmptyDataset, simplifyError, SOCIAL_ROOT } from './Utils';
import { setReadAccess } from './AccessHandler'

/**
 * A function to check if there is a Dataset at the given URL.
 * @param {string} datasetUrl 
 * @returns True if the dataset exists
 * 
 */
async function datasetExists(datasetUrl) {
    try {
        await getSolidDataset(
            datasetUrl, 
            { fetch: fetch }
        )
        return true;
    } catch (error) {
        if (error instanceof FetchError) {
            if (error.statusCode === 404) {
                return false;
            }
        }
        return false;
    }
    
}

/**
 * A function to be called when a user is logging into a social application.
 * It checks whether the social directory is set up correctly and returns an
 * error if not.
 * @param {string} podRootUrl The URL of the root directory in the pod 
 *              e.g. http://pod-provider.com/mypodname/
 * @returns [bool, string] [valid, error] valid is True if the directory is set up correctly
 *                                        error explains the issue with the directory 
 *                                        in the case that valid is false
 */
export async function validateSocialDir(podRootDir) {
    // check if social directory exists
    try {
        await getSolidDataset(
            podRootDir + SOCIAL_ROOT, 
            { fetch: fetch }
        )
        return [true, null];
    } catch (error) {
        let e = simplifyError(error, "Whilst checking if social directory exists.");
        if (e.code === 404) {
            return [false, null];
        }
        return [false, e];
    }
}


/**
 * Creates a valid social directory in a user's pod.
 * @param {string} podRootUrl The URL of the root directory in the pod 
 *              e.g. http://pod-provider.com/mypodname/
 */
export async function createSocialDirectory(podRootDir) {
    if (await datasetExists(podRootDir + SOCIAL_ROOT)) {
        await deleteSolidDataset(
            podRootDir + SOCIAL_ROOT,
            { fetch: fetch }
        );
    }
    // Main - public read access to directory and profile
    try {
        await createEmptyDataset(podRootDir + SOCIAL_ROOT);
        await setReadAccess(podRootDir + SOCIAL_ROOT, null);
    } catch (e) {
        return simplifyError(e);
    }
    return null;
}

export async function findUsersSocialPod(webId) {
    let podList;
    try {
        podList = await getPodUrlAll(webId);
    } catch (error) {
        return [false, null, simplifyError(error, "This user has no associated pods.")];
    }

    for (let i = 0; i < podList.length; i++) {
        try {
            await getSolidDataset(
                podList[i] + SOCIAL_ROOT,
                {fetch: fetch}
            )
            return [true, podList[i], null];
        } catch {
            continue;
        }
    }
    return [false, podList, null];
}