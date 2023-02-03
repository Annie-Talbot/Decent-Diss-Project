import { fetch } from '@inrupt/solid-client-authn-browser'
import { buildThing, getThing, createSolidDataset, createThing, FetchError, getSolidDataset, saveSolidDatasetAt, setThing, getSolidDatasetWithAcl } from '@inrupt/solid-client';
import { FOAF, SCHEMA_INRUPT } from '@inrupt/vocab-common-rdf';

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
        await getThing(
            dataset,
            thingUrl, 
            { fetch: fetch }
        )
        return true;
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
 * A function to create an empty dataset at the given url.
 * @param {string} datasetUrl 
 * @returns 
 */
async function createEmptyDataset(datasetUrl) {
    try {
        const dataset = await saveSolidDatasetAt(
            datasetUrl,
            createSolidDataset(),
            { fetch: fetch }
        );
        return dataset;
    } catch {
        console.log("An unknown error occured in createEmptyDir. Please contact support.");
    }
    return null;
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
 * It sets up a working directory to sotre all social media related data, 
 * a posts directory to store post data, a central social dataset and a 
 * profile Thing. If any of these already exists, it does not replace them.
 * @param {string} podRootUrl The URL of the root directory in the pod 
 *              e.g. http://pod-provider.com/mypodname/
 */
export default async function findOrCreateSocialSpace(podRootUrl) {
    if (! await datasetExists(podRootUrl + "social/")) {
        console.log("No social directory found, creating social directory.")
        // Social directory does not exist, create it and all subdirectories
        await createEmptyDataset(podRootUrl + "social/");
        await createEmptyDataset(podRootUrl + "social/posts/");
        let socialDataset = await createEmptyDataset(podRootUrl + "social/social");
        await createSampleProfile(socialDataset, podRootUrl + "social/social");
        return;
    }
    // social directory exists
    
    if (! await datasetExists(podRootUrl + "social/posts/")) {
        await createEmptyDataset(podRootUrl + "social/posts/");
    }
    if (! await datasetExists(podRootUrl + "social/social")) {
        await createEmptyDataset(podRootUrl + "social/social");
    }
    
    let socialDatset = await getSolidDataset(podRootUrl + "social/social", 
                                                { fetch: fetch });
    if (! await thingExists(socialDatset, podRootUrl + "social/social#profile")) {
        await createSampleProfile(socialDatset, podRootUrl + "social/social");
    }
    if (! await thingExists(socialDatset, podRootUrl + "social/social#links")) {
        await createSampleProfile(socialDatset, podRootUrl + "social/social");
    }
    return;
}