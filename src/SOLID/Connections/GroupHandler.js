import { getSolidDataset } from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { CONNECTIONS_DIR, createEmptyDataset, delay, GROUPS_DATASET, simplifyError } from "../Utils";

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