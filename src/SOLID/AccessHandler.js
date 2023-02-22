import { universalAccess } from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";
/**
* Sets the access of a resource to read-only. If agentID is null, 
* public access is set. Otherwise, agent access is set.
* @param {string} resourceUrl 
* @param {string} agentID 
* @returns error?
*/
export async function setReadAccess(resourceUrl, agentID) {
   const readAccess = {
       read: true,
       write: false,
       append: false
   }
   if (agentID) {
       await universalAccess.setAgentAccess(resourceUrl, agentID, readAccess, {fetch: fetch});
   } else {
       await universalAccess.setPublicAccess(resourceUrl, readAccess, {fetch: fetch});
   }
}

export const ACCESS_AGENT_TYPE = {
    Group: 0,
    Person: 1
}


export async function getAllAgentWebIDs(agentList) {
    console.log("agent list: " + agentList);
    let webIds = [];
    agentList.forEach(([type, id]) => {
        console.log("type: " + type)
        console.log("id: " + id)
        if (type == ACCESS_AGENT_TYPE.Person) {
            console.log("Encountered person agent. Added to list.")
            webIds.push(id)
        } else if (type == ACCESS_AGENT_TYPE.Group) {
            console.log("Encountered group agent. No handling for this yet.")
        } else {
            console.log("Encountered unknown type of agent. ID: " + id)
        }
    });
    return webIds;
}

export async function setAllReadAccess(resourceUrls, agentList) {
    let errorList = [];
    agentList.forEach((id) => {
        resourceUrls.forEach(async (res) => await setReadAccess(res, id));
    })
    return errorList;
}