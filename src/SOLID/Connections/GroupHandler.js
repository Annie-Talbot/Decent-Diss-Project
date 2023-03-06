import { asUrl, buildThing, createThing, getSolidDataset, getStringNoLocale, getThingAll, getUrl, getUrlAll, saveSolidDatasetAt, setThing } from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { FOAF, RDF } from "@inrupt/vocab-common-rdf";
import { ACCESS_AGENT_TYPE } from "../AccessHandler";
import { CONNECTIONS_DIR, PEOPLE_DATASET, createEmptyDataset, delay, GROUPS_DATASET, simplifyError } from "../Utils";

export async function doesGroupsDatasetExist(podRootDir) {
    try {
        await getSolidDataset(
            podRootDir + CONNECTIONS_DIR + GROUPS_DATASET,
            {fetch: fetch}
        );
        return [true, null];
    } catch (error) {
        let e = simplifyError(error, "Whilst checking if groups dataset exists.");
        if (e.code === 404) {
            return [false, null];
        }
        return [false, e];
    }
}

export async function createGroupsDataset(podRootDir) {
    const error = await createEmptyDataset(podRootDir + CONNECTIONS_DIR + GROUPS_DATASET)[1];
    if (error) {
        return error;
    }
    await delay(500)
    return null;
}


async function getGroupsDataset(podRootDir) {
    try {
        let dataset = await getSolidDataset(podRootDir + CONNECTIONS_DIR + GROUPS_DATASET, {fetch: fetch})
        return [dataset, null];
    } catch(e) {
        let error = simplifyError(e, "Encountered whilst attempting to access groups dataset");
        if (error.code === 404) {
            error.title = "Could not find your groups dataset at " + CONNECTIONS_DIR + PEOPLE_DATASET;
        }
        return [null, error];
    }
}

export async function createGroup(podRootDir, group) {
    let [dataset, error] = await getGroupsDataset(podRootDir);
    if (error) {
        return error;
    }
    let groupThing = buildThing(createThing())
        .addStringNoLocale(FOAF.name, group.name)
        .addUrl(RDF.type, FOAF.Group)
        .build()
    dataset = setThing(dataset, groupThing);

    try{
        await saveSolidDatasetAt(podRootDir + CONNECTIONS_DIR + GROUPS_DATASET, dataset, {fetch:fetch});
    } catch (error) {
        return simplifyError(error, "Whilst saving the group.");
    }
    return null;
}


function getGroupFromThing(thing) {
    if (getUrl(thing, RDF.type) !== FOAF.Group) {
        return [null, "Thing is not a group."];
    }
    // Get webId
    let groupName = getStringNoLocale(thing, FOAF.name);
    if (groupName == null) {
        return [null, "Group has no name."];
    }

    // Get name
    let groupMembers = getUrlAll(thing, FOAF.member);
    if (groupMembers == null) {
        groupMembers = [];
    }
    const url = asUrl(thing);
    // return person as dictionary
    return [{
        name: groupName,
        members: groupMembers,
        type: ACCESS_AGENT_TYPE.Group,
        url: url,
    }, null];
    
}

async function getAllGroups(groupsDataset) {
    const groupThings = getThingAll(groupsDataset);
    console.log(groupThings);
    let groups = [];
    let errorList = [];
    groupThings.forEach((thing) => {
        let [group, error] = getGroupFromThing(thing);
        if (error) {
            errorList.push({title: error, description: ""});
        } else {
            groups.push(group);
        }
    });
    return [groups, errorList];
}

export async function fetchGroups(podRootDir) {
    // Fetch group dataset
    let [dataset, error] = await getGroupsDataset(podRootDir);
    if (error) {
        return [[], [error]];
    }
    // Turn dataset into people
    return await getAllGroups(dataset);
    
}