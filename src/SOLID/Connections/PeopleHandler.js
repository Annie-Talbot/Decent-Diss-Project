import { asUrl, buildThing, createThing, getSolidDataset, getStringNoLocale, 
    getThing, getThingAll, getUrl, saveSolidDatasetAt, setThing } from '@inrupt/solid-client';
import { CONNECTIONS_DIR, delay, makeId, createEmptyDataset, PEOPLE_DATASET, simplifyError } from '../Utils';
import { fetch } from '@inrupt/solid-client-authn-browser';
import { RDF, SCHEMA_INRUPT, VCARD } from '@inrupt/vocab-common-rdf';
import { ACCESS_AGENT_TYPE } from '../AccessHandler';
import { followPerson } from '../FeedHandler';

export async function doesPeopleDatasetExist(podRootDir) {
    try {
        await getSolidDataset(
            podRootDir + CONNECTIONS_DIR + PEOPLE_DATASET,
            {fetch: fetch}
        );
        return [true, null];
    } catch (error) {
        let e = simplifyError(error, "Whilst checking if people dataset exists.");
        if (e.code === 404) {
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

async function getPeopleDataset(podRootDir) {
    try {
        let dataset = await getSolidDataset(podRootDir + CONNECTIONS_DIR + PEOPLE_DATASET, {fetch: fetch})
        return [dataset, null];
    } catch(e) {
        let error = simplifyError(e, "Encountered whilst attempting to access people dataset");
        if (error.code === 404) {
            error.title = "Could not find your people dataset at " + CONNECTIONS_DIR + PEOPLE_DATASET;
        }
        return [null, error];
    }
}


export async function createPerson(podRootDir, person) {
    // Fetch people dataset
    let [dataset, error] = await getPeopleDataset(podRootDir);
    if (error) {
        return error;
    }

    // Create Person thing
    let thing = buildThing(createThing())
        .addStringNoLocale(VCARD.nickname, person.nickname)
        .addUrl(SCHEMA_INRUPT.identifier, person.webId)
        .addUrl(RDF.type, SCHEMA_INRUPT.Person)
        .build();

    // add person Thing to people Dataset and save
    dataset = setThing(dataset, thing);
    try {
        await saveSolidDatasetAt(podRootDir + CONNECTIONS_DIR + PEOPLE_DATASET, dataset, {fetch: fetch});
    } catch (e) {
        let error = simplifyError(e, "Encountered whilst attempting to create a person.");
        error.title = "Could no save the person";
        return error;
    }

    // start following them
    await followPerson(podRootDir, person.webId);
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
            errorList.push({title: error, description: ""});
        } else {
            people.push(person);
        }
    });
    return [people, errorList];
}

export async function fetchPeople(podRootDir) {
    // Fetch people dataset
    let [dataset, error] = await getPeopleDataset(podRootDir);
    if (error) {
        return [[], [error]];
    }
    // Turn dataset into people
    return await getAllPeople(dataset);
    
}


export async function fetchPeopleFromList(podRootDir, peopleUrlList) {
    if (peopleUrlList.length === 0) {
        return [[], []];
    }
    // Fetch people dataset
    let [dataset, error] = await getPeopleDataset(podRootDir);
    if (error) {
        return [[], [error]];
    }
    // Get people
    let people = [];
    let errors = [];
    for (let i = 0; i < peopleUrlList.length; i++) {
        // Get thing
        let personThing = getThing(dataset, peopleUrlList[i]);
        if (personThing === null) {
            errors.push({title: "Could not load person: " + peopleUrlList[i], 
                description: "Thing does not exist."});
            continue;
        }
        let [person, error] = getPersonFromThing(personThing);
        if (error) {
           errors.push({title: error, description: ""});
           continue;
        }
        people.push(person);
    }
    return [people, errors];

}


export async function findPerson(podRootDir, webId) {
    let [people, errors] = await fetchPeople(podRootDir);
    if (people.length === 0) {
        return {
            webId: webId,
            nickname: "",
        };
    }
    
    let person = people.find(p => p.webId === webId);
    if (person === null) {
        return {
            webId: webId,
            nickname: "",
        };
    }
    return person;
}