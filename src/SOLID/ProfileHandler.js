import { createSolidDataset, createThing, getDate, getSolidDataset, 
    getStringNoLocale, getThing, getUrl, saveSolidDatasetAt, addDate, setThing,
    removeStringNoLocale, removeDate, removeUrl, deleteFile, addStringNoLocale, 
    saveFileInContainer, addUrl, getSourceUrl, buildThing } from "@inrupt/solid-client";
import { fetch } from '@inrupt/solid-client-authn-browser'
import { FOAF, SCHEMA_INRUPT } from "@inrupt/vocab-common-rdf";
import { setReadAccess } from "./AccessHandler";
import { delay, getImage, PROFILE_DATASET, PROFILE_THING, simplifyError, SOCIAL_ROOT } from "./Utils";



export async function doesProfileExist(podRootDir) {
    try {
        const dataset = await getSolidDataset(
            podRootDir + PROFILE_DATASET, 
            { fetch: fetch }
        )
        const thing = getThing(dataset, podRootDir + PROFILE_THING);
        if (thing == null) {
            return [false, null]
        }
        return [true, null];
    } catch (error) {
        let e = simplifyError(error, "Whilst checking if profile exists.");
        if (e.code === 404) {
            return [false, null];
        }
        return [false, e];
    }
}

export async function createSampleProfile(podRootDir) {
    let profileThing  = buildThing(createThing({ name: "me" }))
        .addStringNoLocale(SCHEMA_INRUPT.name, "CoolNewUser")
        .addStringNoLocale(SCHEMA_INRUPT.description, "I'm a new user!")
        .addDate(FOAF.birthday, new Date("2000-03-07"))
        .build();
    let profileDataset = createSolidDataset();
    profileDataset = setThing(profileDataset, profileThing);
    try {
        await saveSolidDatasetAt(
            podRootDir + PROFILE_DATASET,
            profileDataset,
            { fetch: fetch }
        );
        await delay(500);
        await setReadAccess(podRootDir + PROFILE_DATASET, true, null);
        return null;
    } catch (error) {
        return simplifyError(error);
    }
    
}



export async function getProfile(podRootUrl) {
    let profile = {};
    let profileDataset;
    try {
        profileDataset = await getSolidDataset(
            podRootUrl + PROFILE_DATASET, 
            { fetch: fetch }
        );
    } catch (error) {
        return [profile, simplifyError(error)]
    }
    const profileThing = getThing(profileDataset, podRootUrl + PROFILE_THING, 
        { fetch: fetch });
    if (profileThing == null) {
        return [profile, {code: 0, title: "No profile Thing found", 
            description: "Whilst attempting to load profile."}];
    }
    
    // name
    profile["name"] = getStringNoLocale(
        profileThing, 
        SCHEMA_INRUPT.name, 
        { fetch: fetch }
    );
    // birthday
    profile["birthday"] = getDate(
        profileThing, 
        FOAF.birthday, 
        { fetch: fetch }
    );
    // description
    profile["description"] = getStringNoLocale(
        profileThing, 
        SCHEMA_INRUPT.description, 
        { fetch: fetch }
    );
    // profile pic
    const profilePicUrl = getUrl(
        profileThing, 
        FOAF.depiction, 
        { fetch: fetch }
    );
    if (profilePicUrl) {
        const [image, error] = await getImage(profilePicUrl);
        if (error) {
            return [profile, error];
        }
        profile["profilePic"] = image;
    }
    return [profile, null]
};

export async function removeProfileAttributes(profileThing) {
    let oldValue = getStringNoLocale(profileThing, SCHEMA_INRUPT.name);
    if (oldValue != null) {
        profileThing = removeStringNoLocale(profileThing, SCHEMA_INRUPT.name, oldValue);
    }
    oldValue = getStringNoLocale(profileThing, SCHEMA_INRUPT.description);
    if (oldValue != null) {
        profileThing = removeStringNoLocale(profileThing, SCHEMA_INRUPT.description, oldValue);
    }
    oldValue = getDate(profileThing, FOAF.birthday);
    if (oldValue != null) {
        profileThing = removeDate(profileThing, FOAF.birthday, oldValue);
    }
    oldValue = getUrl(profileThing, FOAF.depiction);
    if (oldValue != null) {
        // Delete file
        await deleteFile(oldValue, {fetch: fetch});
        // Remove url reference
        profileThing = removeUrl(profileThing, FOAF.depiction, oldValue);
    }
    return profileThing;
    
}


export async function updateProfile(podRootUrl, profile) {
    let errors = [];
    let success = true;
    let profileDataset = await getSolidDataset(
        podRootUrl + PROFILE_DATASET, 
        { fetch: fetch }
    );
    if (profileDataset == null) {
        profileDataset = createSolidDataset();
    }
    let profileThing = getThing(profileDataset, podRootUrl +  PROFILE_THING, 
                                    { fetch: fetch });
    if (profileThing == null) {
        profileThing = createThing({ name: "profile" });
    } 
    // Remove all our supported attributes if they exist.
    // This is rather than replacing the entire file as the user may have
    // attributes from other applications in here they want to keep.
    profileThing = await removeProfileAttributes(profileThing);
    
    // Add new attributes
    if (profile.name) {
        profileThing = addStringNoLocale(profileThing, SCHEMA_INRUPT.name, profile.name)
    }
    if (profile.description) {
        profileThing = addStringNoLocale(profileThing, SCHEMA_INRUPT.description, profile.description)
    }
    if (profile.birthday) {
        profileThing = addDate(profileThing, FOAF.birthday, profile.birthday)
    }
    if (profile.profilePic) {
        const pictureFile = await saveFileInContainer(podRootUrl + SOCIAL_ROOT, 
            profile.profilePic, {slug: profile.profilePic.name, fetch: fetch});
        if (pictureFile != null) {
            profileThing = addUrl(profileThing, FOAF.depiction, getSourceUrl(pictureFile));
            await setReadAccess(getSourceUrl(pictureFile), true);
        } else {
            errors.push({
                code: 0, 
                title: "Could not save profile picture.", 
                description: "Whilst updating profile."});
        }
    }
    profileDataset = setThing(profileDataset, profileThing);
    try {
        await saveSolidDatasetAt(
            podRootUrl + PROFILE_DATASET,
            profileDataset,
            { fetch: fetch }
        );
        await setReadAccess(podRootUrl + PROFILE_DATASET, true);
    } catch (e) {
        errors.push(simplifyError(e, "Whilst saving profile dataset."));
        success = false;
    }
    return [success, errors];
}