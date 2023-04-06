import { fetch } from '@inrupt/solid-client-authn-browser'
import { getSolidDataset, getPodUrlAll } from '@inrupt/solid-client';
import { createEmptyDataset, simplifyError, SOCIAL_ROOT } from './Utils';
import { setReadAccess } from './AccessHandler'
import { createNotificationsDir } from './NotificationHandler';
import { createFeedDir } from './FeedHandler';
import { createPostsDir } from './PostHandler';
import { createSampleProfile } from './ProfileHandler';
import { createConnectionsDir } from './Connections/ConnectionHandler';
import { createPeopleDataset } from './Connections/PeopleHandler';
import { createGroupsDataset } from './Connections/GroupHandler';

/**
 * Creates a valid social directory in a user's pod.
 * @param {string} podRootUrl The URL of the root directory in the pod 
 *              e.g. http://pod-provider.com/mypodname/
 */
export async function createSocialDirectory(podRootDir) {
    // Main - public read access to directory and profile
    try {
        await createEmptyDataset(podRootDir + SOCIAL_ROOT);
        await setReadAccess(podRootDir + SOCIAL_ROOT, true, null);
    } catch (e) {
        return {success: false, error: simplifyError(e)};
    }
    await createNotificationsDir(podRootDir);
    await createFeedDir(podRootDir);
    await createPostsDir(podRootDir);
    await createSampleProfile(podRootDir);
    await createConnectionsDir(podRootDir);
    await createPeopleDataset(podRootDir);
    await createGroupsDataset(podRootDir);
    return {success: true};
}

export async function findUsersSocialPod(webId) {
    let podList;
    try {
        podList = await getPodUrlAll(webId);
    } catch (error) {
        return {
            success: false, 
            error: simplifyError(error, "This user has no associated pods.")
        };
    }

    for (let i = 0; i < podList.length; i++) {
        try {
            await getSolidDataset(
                podList[i] + SOCIAL_ROOT,
                {fetch: fetch}
            )
            return {success: true, fetchedPod: podList[i]};
        } catch {
            continue;
        }
    }
    return {success: false, fetchedPod: podList};
}