import { getContainedResourceUrlAll, getDatetime, getFile, getSolidDataset, getStringNoLocale, getThing, getUrl } from "@inrupt/solid-client";
import { fetch } from '@inrupt/solid-client-authn-browser'
import { FOAF, LDP, SCHEMA_INRUPT, VCARD } from "@inrupt/vocab-common-rdf";


/**
 * Function to find all the sub containers in the post directory.
 * There should only be post containers in this direction, 
 * anything other than a container is removed from the list.
 * 
 * @param {string} postContainerUrl the URL of the pod container 
 * holding the user's posts.
 * @returns {[string]} A list of string URLs, each one should hold a 
 * post (but this is not guarenteed).
 */
async function getPostUrlsList(postContainerUrl) {
    // get all contains in the post folder
    const allPostUrls = getContainedResourceUrlAll(
        await getSolidDataset(
            postContainerUrl, 
            { fetch: fetch }  
        ), 
        { fetch: fetch } // fetch function specifies this authenticated session
    ); 
    console.log("All URLS: " + allPostUrls);
    return allPostUrls;
}

/**
 * This function retrieves all information about a post and returns
 * it as a local dictionary for displaying.
 * 
 * @param {string} postUrl The URL where the post dataset is.
 * @returns {dict} A dictionary will post information in.
 */
async function getPost(postUrl) {
    const postDataset = await getSolidDataset(
        postUrl, 
        { fetch: fetch }  // fetch function from authenticated session
    );
    // Post information is found in the #details Thing at the dataset:
    // details Thing URL: https://provider/podname/social/posts/postname/postname#details
    const postThing = getThing(postDataset, postUrl + "#details", { fetch: fetch });
    console.log(postThing);
    // Text
    const postText = getStringNoLocale(postThing, SCHEMA_INRUPT.text, { fetch: fetch });
    // Date
    const postDatetime = getDatetime(postThing, "http://schema.org/dateCreated", { fetch: fetch });
    // Image
    const postImageLocation = getUrl(postThing, SCHEMA_INRUPT.image, { fetch: fetch });
    const imageBlob = await getFile(postImageLocation, { fetch: fetch });
    // TODO: Missing author details as need some utility functions to do that

    let post = {
        text: postText,
        datetime: postDatetime.toLocaleString(),
        image: URL.createObjectURL(imageBlob),
    };
    return post;

}

/**
 * This function finds and collects all social media posts in 
 * a given directory.
 * 
 * @param {string} postContainerUrl The URL of the container holding 
 * all the posts in a POD
 * @returns {[dict]} A list of dictionaries, each one container 
 * a seperate post's information.
 */
export default async function fetchPosts(postContainerUrl) {
    let postList = [];
    const postUrlList = await getPostUrlsList(postContainerUrl);

    // regex must be used to extract the name of a post's directory
    // so it can be used to find the solid dataset representing the
    // post. e.g. 
    // post container URL: https://provider/podname/social/posts/postname/
    // post dataset URL: https://provider/podname/social/posts/postname/postname

    const postRegex = new RegExp(postContainerUrl + '(.*)/');
    for (const i in postUrlList) {
        const postName = postUrlList[i].match(postRegex)[1];
        const postUrl = postUrlList[i] + postName;
        console.log(postUrl)
        postList.push(await getPost(postUrl));
    }
    return postList;
}