import { universalAccess } from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { simplifyError } from "./Utils";

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
   try {
    let access;
        if (agentID) {
            access = await universalAccess.setAgentAccess(resourceUrl, agentID, readAccess, {fetch: fetch});
        } else {
            access = await universalAccess.setPublicAccess(resourceUrl, readAccess, {fetch: fetch});
        }
        return access;
    } catch (e) {
        return simplifyError(e, "Whilst setting read access.");
    }
}

export const ACCESS_AGENT_TYPE = {
    Group: 0,
    Person: 1
}


export async function getAllAgentWebIDs(agentList) {
    let webIds = [];
    agentList.forEach((agent) => {
        if (agent.type === ACCESS_AGENT_TYPE.Person) {
            console.log("Encountered person agent. Added to list.")
            webIds.push(agent.webId)
        } else if (agent.type === ACCESS_AGENT_TYPE.Group) {
            console.log("Encountered group agent. No handling for this yet.")
        } else {
            console.log("Encountered unknown type of agent. ID: " + agent.webId)
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

export async function setAllPublicReadAccess(resourceUrls) {
    resourceUrls.forEach(async (res) => await setReadAccess(res));
}

export async function setPublicAppendAccess(resourceUrl) {
    const appendAccess = {
        read: false,
        write: false,
        append: true
    }
    await universalAccess.setPublicAccess(resourceUrl, appendAccess, {fetch: fetch});
}


export async function getAgentAccess(webId, resourceUrl) {
    try{
        const access = await universalAccess.getAgentAccess(resourceUrl, webId, {fetch: fetch});
        return [access, null];
    } catch (e) {
        return [null, simplifyError(e, "Whlist checking the access for this agent.")];
    }
}