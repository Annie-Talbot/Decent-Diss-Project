import { asUrl, buildThing, createThing, getPodUrlAll, getSolidDataset, getStringNoLocale, getThing, getThingAll, getUrl, saveSolidDatasetAt, setThing } from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { RDF, SCHEMA_INRUPT, VCARD } from "@inrupt/vocab-common-rdf";
import { ACCESS_AGENT_TYPE, setPublicAppendAccess } from "./AccessHandler";
import { CONNECTIONS_DIR, createEmptyDataset, delay, makeId, PEOPLE_DATASET, simplifyError } from "./Utils";



export async function doesConnectionsDirExist(podRootDir) {
    try {
        await getSolidDataset(
            podRootDir + CONNECTIONS_DIR, 
            { fetch: fetch }
        )
        return [true, null];
    } catch (error) {
        let e = simplifyError(error, "Whilst checking if connections directory exists.");
        if (e.code == 404) {
            return [false, null];
        }
        return [false, e];
    }
}

export async function createConnectionsDir(podRootDir) {
    const error = await createEmptyDataset(podRootDir + CONNECTIONS_DIR)[1];
    if (error) {
        return error;
    }
}

export async function doesPeopleDatasetExist(podRootDir) {
    try {
        await getSolidDataset(
            podRootDir + CONNECTIONS_DIR + PEOPLE_DATASET,
            {fetch: fetch}
        );
        return [true, null];
    } catch (error) {
        let e = simplifyError(error, "Whilst checking if people dataset exists.");
        if (e.code == 404) {
            return [false, null];
        }
        return [false, e];
    }
}

export async function createPeopleDataset(podRootDir) {
    const error = await createEmptyDataset(podRootDir + CONNECTIONS_DIR + PEOPLE_DATASET)[1];
    if (error) {
        return error;
    }
    await delay(500)
    return null;
}

export async function isWebIdDecent(webId) {
    // Check if a pod exists for this webId.
    let socialDir = "";
    try {
        const podUrls = await getPodUrlAll(webId, { fetch: fetch });
        socialDir = podUrls[0];
    } catch (e) {
        const error = simplifyError(e, "Whilst attempting to validate WebID: " + webId);
        if (error.code === 404) {
            error.title = "WebID does not exist";
            return [socialDir, error];
        }
        return [socialDir, error];
    }
    return [socialDir, null];
    // TODO: This function should also check if this pod has a decent link.
    // TODO: This function should also work if multiple pods exist
}

async function getPeopleDataset(url) {
    try {
        let dataset = await getSolidDataset(url, {fetch: fetch})
        return [dataset, null];
    } catch(error) {
        error = simplifyError(error, "Encountered whilst attempting to access people dataset");
        if (error.code === 404) {
            error.title = "Could not find your people dataset at " + CONNECTIONS_DIR + PEOPLE_DATASET;
        }
        return [null, error];
    }
}


export async function createPerson(person) {
    // Fetch people dataset
    let [dataset, error] = await getPeopleDataset(person.dataset);
    if (error) {
        return error;
    }

    // Find an available id for the new Thing
    let thing;
    let id;
    while (true) {
        id = makeId(10);
        try {
            thing = getThing(
                person.dataset + "#" + id,
                {fetch: fetch}
            )
        } catch (error) {
            // Found a valid id
            break;
        }
    }

    // Create Person thing
    thing = buildThing(createThing({ name: id }))
        .addStringNoLocale(VCARD.nickname, person.nickname)
        .addUrl(SCHEMA_INRUPT.identifier, person.webId)
        .addUrl(RDF.type, SCHEMA_INRUPT.Person)
        .build();

    // add person Thing to people Dataset and save
    dataset = setThing(dataset, thing);
    try {
        await saveSolidDatasetAt(person.dataset, dataset, {fetch: fetch});
    } catch (error) {
        error = simplifyError(error, "Encountered whilst attempting to create a person.");
        error.title = "Could no save the person";
        return error;
    }
    return null;
}



function getPersonFromThing(thing) {
    if (getUrl(thing, RDF.type) !== SCHEMA_INRUPT.Person) {
        return [null, "Thing is not a person."];
    }
    // Get webId
    let webId = getUrl(thing, SCHEMA_INRUPT.identifier);
    if (webId == null) {
        return [null, "Person has no webID."];
    }

    // Get name
    let name = getStringNoLocale(thing, VCARD.nickname);
    if (name == null) {
        name = webId;
    }
    if (name === "") {
        name = webId;
    }
    const url = asUrl(thing);
    // return person as dictionary
    return [{
        nickname: name,
        webId: webId,
        type: ACCESS_AGENT_TYPE.Person,
        url: url,
    }, null];
    
}

async function getAllPeople(peopleDataset) {
    const peopleThings = getThingAll(peopleDataset);
    let people = [];
    let errorList = [];
    peopleThings.forEach((thing) => {
        let [person, error] = getPersonFromThing(thing);
        if (error) {
            errorList.push({code: 400, title: error, description: ""});
        } else {
            person["dataset"] = peopleDataset.datasetUrl;
            people.push(person);
        }
    });
    return [people, errorList];
}

export async function fetchPeople(podRootDir) {
    // Fetch people dataset
    let [dataset, error] = await getPeopleDataset(podRootDir + CONNECTIONS_DIR + PEOPLE_DATASET);
    if (error) {
        return [null, [error]];
    }
    // Turn dataset into people
    return await getAllPeople(dataset);
    
}

export async function fetchAllConnections(podRootDir) {
    // Fetch people dataset
    const [dataset, error] = await getPeopleDataset(podRootDir + CONNECTIONS_DIR + PEOPLE_DATASET);
    if (error) {
        return [null, error]
    }

    const [people, _] = await getAllPeople(dataset, podRootDir + CONNECTIONS_DIR + PEOPLE_DATASET);
    return [people, null]
}