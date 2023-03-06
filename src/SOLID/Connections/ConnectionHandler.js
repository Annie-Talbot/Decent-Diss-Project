import { getSolidDataset} from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { CONNECTIONS_DIR, createEmptyDataset, delay, PEOPLE_DATASET, 
    simplifyError } from "../Utils";
import { fetchPeople, getAllPeople, getPeopleDataset } from "./PeopleHandler";

export async function doesConnectionsDirExist(podRootDir) {
    try {
        await getSolidDataset(
            podRootDir + CONNECTIONS_DIR, 
            { fetch: fetch }
        )
        return [true, null];
    } catch (error) {
        let e = simplifyError(error, "Whilst checking if connections directory exists.");
        if (e.code === 404) {
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
    await delay(500)
}

export async function fetchAllConnections(podRootDir) {
    // Fetch people dataset
    return await fetchPeople(podRootDir);
}