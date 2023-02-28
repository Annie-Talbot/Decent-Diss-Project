import { fetch } from '@inrupt/solid-client-authn-browser'
import { buildThing, getThing, createThing, FetchError, getSolidDataset, saveSolidDatasetAt, setThing, deleteSolidDataset } from '@inrupt/solid-client';
import { FOAF, SCHEMA_INRUPT } from '@inrupt/vocab-common-rdf';
import { CONNECTIONS_DIR, createEmptyDataset, GROUP_DATASET, NOTIFICATIONS_DIR, PEOPLE_DATASET, POSTS_DIR, PROFILE_THING, SOCIAL_DATASET, SOCIAL_ROOT } from './Utils';
import { setPublicAppendAccess, setReadAccess } from './AccessHandler'

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
            if (error.statusCode == 404) {
                console.log("No pre-existing " + datasetUrl + " directory found.")
                return false;
            }
        }
        console.log("An unknown error occured whilst checking if the dataset, " + 
            datasetUrl + ", exists . Please contact support. Error: " + error);
        return false;
    }
    
}

/**
 * A function to check if there is a Thing at the given URL.
 * @param {SolidDataset} dataset 
 * @param {string} thingUrl 
 * @returns True if the thing exists
 */
async function thingExists(dataset, thingUrl) {
    try {
        const thing = await getThing(
            dataset,
            thingUrl, 
            { fetch: fetch }
        )
        if (thing) {
            return true
         } else {
            return false;
         } 
    } catch (error) {
        if (error instanceof FetchError) {
            if (error.statusCode == 404) {
                console.log("No pre-existing " + thingUrl + " directory found.")
                return false;
            }
        }
        console.log("An unknown error occured whilst checking if the thing, " + 
            thingUrl + ", exists . Please contact support. Error: " + error);
        return false;
    }
}

/**
 * A function to create and save a sample profile Thing at 
 * the given dataset, under the name '#profile'.
 * @param {SolidDataset} socialDataset The dataset to add the profile Thing to
 * @param {string} datasetUrl The URL of the dataset
 */
async function createSampleProfile(socialDataset, datasetUrl) {
    let profileThing  = buildThing(createThing({ name: "profile" }))
    .addStringNoLocale(SCHEMA_INRUPT.name, "CoolNewUser")
    .addStringNoLocale(SCHEMA_INRUPT.description, "I'm a new user!")
    .addDate(FOAF.birthday, new Date("2000-03-07"))
    .build();
    socialDataset = setThing(socialDataset, profileThing);

    await saveSolidDatasetAt(
        datasetUrl,
        socialDataset,
        { fetch: fetch }
    );
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
export async function validateSocialDir(podRootUrl) {
    // check if social directory exists
    if (!await datasetExists(podRootUrl + SOCIAL_ROOT)) {
        return [false, "No " + SOCIAL_ROOT + " directory found."]
    }
    // check if the posts directory exists
    if (! await datasetExists(podRootUrl + POSTS_DIR)) {
        return [false, "No " + POSTS_DIR + " directory found."]
    }
    // check if the social dataset exists
    if (! await datasetExists(podRootUrl + SOCIAL_DATASET)) {
        return [false, "No " + SOCIAL_DATASET + " dataset found."]
    }
    // check if the profile Thing exists
    let socialDatset = await getSolidDataset(podRootUrl + SOCIAL_DATASET, 
                                                { fetch: fetch });
    if (! await thingExists(socialDatset, podRootUrl + PROFILE_THING)) {
        return [false, "No profile found at " + PROFILE_THING + "."]
    }
    // check if connections directory exists
    if (! await datasetExists(podRootUrl + CONNECTIONS_DIR)) {
        return [false, "No " + CONNECTIONS_DIR + " directory found."]
    }
    // check if notifications directory exists
    if (! await datasetExists(podRootUrl + NOTIFICATIONS_DIR)) {
        return [false, "No " + NOTIFICATIONS_DIR + " directory found."]
    }
    return [true, null];
}


/**
 * Creates a valid social directory with all the required element 
 * in a user's pod.
 * @param {string} podRootUrl The URL of the root directory in the pod 
 *              e.g. http://pod-provider.com/mypodname/
 */
export async function createSocialDirectory(podRootUrl) {
    if (await datasetExists(podRootUrl + SOCIAL_ROOT)) {
        await deleteSolidDataset(
            podRootUrl + SOCIAL_ROOT,
            { fetch: fetch }
        );
    }
    // Main - public read access to directory and profile
    await createEmptyDataset(podRootUrl + SOCIAL_ROOT);
    await setReadAccess(podRootUrl + SOCIAL_ROOT, null);
    let [socialDataset, error] = await createEmptyDataset(podRootUrl + SOCIAL_DATASET);
    await createSampleProfile(socialDataset, podRootUrl + SOCIAL_DATASET);
    await setReadAccess(podRootUrl + SOCIAL_DATASET, null);

    // Posts - public read access to the containing 
    // directory but not to individual hosts
    await createEmptyDataset(podRootUrl + POSTS_DIR);
    await setReadAccess(podRootUrl + POSTS_DIR, null);

    // Connections - no public read access
    await createEmptyDataset(podRootUrl + CONNECTIONS_DIR);
    await createEmptyDataset(podRootUrl + CONNECTIONS_DIR + PEOPLE_DATASET);

    // Notifications - public append access
    await createEmptyDataset(podRootUrl + NOTIFICATIONS_DIR);
    await setPublicAppendAccess(podRootUrl + NOTIFICATIONS_DIR);
}