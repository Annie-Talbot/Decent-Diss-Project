import { addUrl, asUrl, buildThing, createThing, getSolidDataset, getStringNoLocale, getThing, getThingAll, getUrl, getUrlAll, removeThing, removeUrl, saveSolidDatasetAt, setThing } from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { FOAF, RDF } from "@inrupt/vocab-common-rdf";
import { ACCESS_AGENT_TYPE, backtraceAccess } from "../AccessHandler";
import { POST_ACCESS_TYPES } from "../PostHandler";
import { CONNECTIONS_DIR, PEOPLE_DATASET, createEmptyDataset, delay, GROUPS_DATASET, simplifyError } from "../Utils";
import { fetchPeopleFromList } from "./PeopleHandler";

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
        return {success: false, error: error};
    }
    await delay(500)
    return {success: true};
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
        return {success: false, error: error};
    }
    let groupThing = buildThing(createThing())
        .addStringNoLocale(FOAF.name, group.name)
        .addUrl(RDF.type, FOAF.Group)
        .build()
    dataset = setThing(dataset, groupThing);

    try{
        await saveSolidDatasetAt(podRootDir + CONNECTIONS_DIR + GROUPS_DATASET, dataset, {fetch:fetch});
    } catch (error) {
        return {success: false, error: simplifyError(error, "Whilst saving the group.")};
    }
    return {success: true};
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

export async function fetchGroup(podRootDir, groupUrl) {
    let error, dataset, group;
    [dataset, error] = await getGroupsDataset(podRootDir);
    if (error) {
        return [null, error];
    }
    let groupThing = getThing(dataset, groupUrl);
    if (groupThing === null) {
        return [null, {title: "Could not add member.", 
            description: "Failed to get group information."}];
    }
    [group, error] = getGroupFromThing(groupThing);
    if (error) {
        return [null, error];
    }
    return [group, null];
}

export async function fetchGroupDetailed(podRootDir, groupUrl) {
    let error, dataset, group;
    [dataset, error] = await getGroupsDataset(podRootDir);
    if (error) {
        return [null, error];
    }
    let groupThing = getThing(dataset, groupUrl);
    if (groupThing === null) {
        return [null, {title: "Could not add member.", 
            description: "Failed to get group information."}];
    }
    [group, error] = getGroupFromThing(groupThing);
    if (error) {
        return [null, error];
    }
    if (group.members.length > 0) {
        let [people, errors] = await fetchPeopleFromList(podRootDir, group.members);
        if (people == null){
            return [null, {title: "Could not fetch group members",
            description: ""}];
        }
        group.members = people;
    }
    return [group, null];
}


export async function addMember(podRootDir, group, person) {
    // Fetch group dataset
    let [dataset, error] = await getGroupsDataset(podRootDir);
    if (error) {
        return {success: false, error: error};
    }

    let groupThing = getThing(dataset, group.url);
    if (groupThing === null) {
        return {success: false, error: {title: "Could not add member.", 
            description: "Failed to get group information."}};
    }

    groupThing = addUrl(groupThing, FOAF.member, person.url);

    dataset = setThing(dataset, groupThing);

    try{
        saveSolidDatasetAt(
            podRootDir + CONNECTIONS_DIR + GROUPS_DATASET,
            dataset,
            {fetch: fetch}
        )
    } catch (error) {
        return {success: false, error: simplifyError(error, "Could not save group with new member added.")};
    }

    await backtraceAccess(podRootDir, person.webId, 
        (post) => post.accessType === POST_ACCESS_TYPES.Groups &&
            post.accessList.includes(group.url));
    await delay(200);
    return {success: true};
}


export async function removeMember(podRootDir, groupUrl, personUrl) {
    // Fetch group dataset
    let [dataset, error] = await getGroupsDataset(podRootDir);
    if (error) {
        return {success: false, error: error};
    }
    let groupThing = getThing(dataset, groupUrl);
    if (groupThing === null) {
        return {success: false, error: {title: "Could not remove member.", 
            description: "Failed to get group information."}};
    }
    groupThing = removeUrl(groupThing, FOAF.member, personUrl);
    dataset = setThing(dataset, groupThing);
    try{
        saveSolidDatasetAt(
            podRootDir + CONNECTIONS_DIR + GROUPS_DATASET,
            dataset,
            {fetch: fetch}
        )
    } catch (error) {
        return {success: false, error: 
            simplifyError(error, "Could not save group with new member added.")};
    }
    await delay(500);
    return {success: false};
}


export async function deleteGroup(podRootDir, groupUrl) {
    // Get person thing
    let [dataset, error] = await getGroupsDataset(podRootDir);
    if (error) return error;
    let groupThing = getThing(dataset, groupUrl);
    if (groupThing === null) {
        return {success: false, error: {title: "Could not load group: " + groupThing, 
            description: "Thing does not exist."}};
    }
    // remove person thing
    dataset = removeThing(dataset, groupThing);
    // save dataset
    try {
        await saveSolidDatasetAt(
            podRootDir + CONNECTIONS_DIR + GROUPS_DATASET,
            dataset,
            {fetch: fetch});
    } catch(e) {
        return {success: false, error: simplifyError(e, "An error occured whilst deleting Group.")};
    }
    return {success: true};
}