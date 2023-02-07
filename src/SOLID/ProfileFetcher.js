import { getDatetime, getFile, getSolidDataset, 
    getStringNoLocale, getThing, getUrl } from "@inrupt/solid-client";
import { fetch } from '@inrupt/solid-client-authn-browser'
import { FOAF, SCHEMA_INRUPT } from "@inrupt/vocab-common-rdf";
import { PROFILE_THING, SOCIAL_DATASET } from "./Utils";


async function addName(profileThing, profile) {
    try {
        const name = await getStringNoLocale(
            profileThing, 
            SCHEMA_INRUPT.name, 
            { fetch: fetch }
        );
        // Exit if no name exists
        if (name == null) {
            console.log("Profile has no name.");
            return;
        }
        profile["name"] = name;
    } catch (error) {
        console.log("Error when fetching name.");
    }
}

async function addBirthday(profileThing, profile) {
    try {
        const bday = await getDatetime(
            profileThing, 
            FOAF.birthday, 
            { fetch: fetch }
        );
        // Exit if no birthday exists
        if (bday == null) {
            console.log("Profile has no birthday attribute.");
            return;
        }
        profile["birthday"] = bday;
    } catch (error) {
        console.log("Error when fetching birthday.");
    }
}

async function addDescription(profileThing, profile) {
    try {
        const description = await getStringNoLocale(
            profileThing, 
            SCHEMA_INRUPT.description, 
            { fetch: fetch }
        );
        // Exit if no name exists
        if (description == null) {
            console.log("Profile has no description.");
            return;
        }
        profile["description"] = description;
    } catch (error) {
        console.log("Error when fetching description.");
    }
}

async function addProfilePic(profileThing, profile) {
    try {
        const profilePicUrl = await getUrl(
            profileThing, 
            FOAF.depiction, 
            { fetch: fetch }
        );
        const imageBlob = await getFile(profilePicUrl, { fetch: fetch });
        profile["profilePic"] = URL.createObjectURL(imageBlob);
    } catch (error) {
        console.log("Error when fetching profilePic.");
    }
}

export default async function getProfile(podRootUrl) {
    console.log(podRootUrl);
    
    const profileDataset = await getSolidDataset(
        podRootUrl + SOCIAL_DATASET, 
        { fetch: fetch }
    );

    const profileThing = await getThing(
        profileDataset, 
        podRootUrl + PROFILE_THING, 
        { fetch: fetch }
    );

    let profile = {};

    // name
    await addName(profileThing, profile)

    // birthday
    await addBirthday(profileThing, profile);

    // description
    await addDescription(profileThing, profile);

    // profile pic
    await addProfilePic(profileThing, profile);
    
    return profile;
};