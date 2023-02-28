import { buildThing, createSolidDataset, createThing, saveSolidDatasetAt, setThing } from "@inrupt/solid-client";
import { RDF } from "@inrupt/vocab-common-rdf";
import { makeId, NOTIFICATIONS_DIR, simplifyError } from "./Utils";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { SOCIAL_SOLID } from "./SolidTerms";

export async function createConnectionRequest(senderDetails, recieverPodRoot) {
    console.log("creating request");
    //senderDetails = {webId, msg, socialPod}
    let notifDataset = createSolidDataset();
    let notifThing = buildThing(createThing({name: "this"}))
        .addUrl(RDF.type, SOCIAL_SOLID.conn_req)
        .addUrl(SOCIAL_SOLID.notif_sender_webid, senderDetails.webId)
        .addStringNoLocale(SOCIAL_SOLID.notif_message, senderDetails.msg)
        .addUrl(SOCIAL_SOLID.notif_sender_pod_root, senderDetails.socialPod)
        .addUrl(SOCIAL_SOLID.supported_applications, SOCIAL_SOLID.Decent)
        .addUrl(SOCIAL_SOLID.has_been_read, false)
        .build();
    
    notifDataset = setThing(notifDataset, notifThing);

    let id;
    let invalidId = true;
    for (let i = 0; i < 20; i++) {
        id = makeId(10);
        try {
            await saveSolidDatasetAt(
                recieverPodRoot + NOTIFICATIONS_DIR + id,
                notifDataset,
                { fetch: fetch }
            );
            invalidId = false;
            break;
        } catch (e) {
            let error = simplifyError(e, "Whilst creating connection request notification.");
            if (error.code != 412) {
                return error;
            }
        }
    }
    if (invalidId) {
        return {
            code : 0,
            title: "Could not create a unique id for this notification.",
            description: "Failed to create connection request. Try again."
        }
    }
    return null;
}