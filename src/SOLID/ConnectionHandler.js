import { getPodUrlAll } from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { simplifyError, SOCIAL_ROOT } from "./Utils";


export async function isWebIdDecent(webId) {
    // Check if a pod exists for this webId.
    let socialDir = "";
    try {
        const podUrls = await getPodUrlAll(webId, { fetch: fetch });
        socialDir = podUrls[0];
    } catch (e) {
        const error = simplifyError(e, "Whilst attempting to validate WebID: " + webId);
        if (error.code == 404) {
            error.title = "WebID does not exist";
            return [socialDir, error];
        }
        return [socialDir, error];
    }
    return [socialDir, null];
    // TODO: This function should also check if this pod has a decent link.
    // TODO: This function should also work if multiple pods exist
}