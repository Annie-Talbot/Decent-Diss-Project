import { getDatetime, getFile, getSolidDataset, getStringNoLocale, getThing, getUrl } from "@inrupt/solid-client";
import { fetch } from '@inrupt/solid-client-authn-browser'
import { FOAF, LDP, SCHEMA_INRUPT, VCARD } from "@inrupt/vocab-common-rdf";
import { GetPostDatasetUrl, POST_DETAILS, getChildUrlsList, deleteDirectory, simplifyError } from "./Utils";




/**
 * This function retrieves all information about a post and returns
 * it as a local dictionary for displaying.
 * 
 * @param {string} postUrl The URL where the post dataset is.
 * @returns {dict} A dictionary will post information in.
 */
async function getPost(postDir, postName) {
    const postDatasetUrl = GetPostDatasetUrl(postDir, postName)
    let postDataset;
    try {
        postDataset = await getSolidDataset(
            postDatasetUrl, 
            { fetch: fetch }  // fetch function from authenticated session
        );
    } catch (error) {
        return [null, simplifyError(error, "Encountered whilst fetching " +
                                            "post data for " + postDatasetUrl)];
    }
    //TODO: Wrap all of these into functions so that a 404 error does not make post not found.

    // Post information is found in the #details Thing at the dataset:
    // details Thing URL: https://provider/podname/social/posts/postname/postname#details
    const postThing = getThing(postDataset, postDatasetUrl + POST_DETAILS, { fetch: fetch });
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
        dir: postDir,
        name: postName,
    };
    return [post, null];

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
export async function fetchPosts(postContainerUrl) {
    console.log("Fetching posts from " + postContainerUrl);
    let postList = [];
    let postUrlList = [];
    let error;
    [postUrlList, error] = await getChildUrlsList(postContainerUrl);
    if (error) {
        return [[], [error]];
    }

    // regex must be used to extract the name of a post's directory
    // so it can be used to find the solid dataset representing the
    // post. e.g. 
    // post container URL: https://provider/podname/social/posts/postname/
    // post dataset URL: https://provider/podname/social/posts/postname/postname

    const postRegex = new RegExp(postContainerUrl + '(.*)/');
    let post;
    let errorList = [];
    for (const i in postUrlList) {
        const postName = postUrlList[i].match(postRegex)[1];
        [post, error] = await getPost(postUrlList[i], postName);
        if (error) {
            errorList.push(error);
            continue;
        }
        postList.push(post);
    }
    return [postList, errorList];
}

/**
 * This function removes everything inside the post's 
 * directory and the directory itself. If there is an 
 * error, it is logged TODO: Change this so that the 
 * error is returned and a pop up displays it.
 * @param {string} postDir URL of the post's directory
 */
export async function deletePost(postDir) {
    return await deleteDirectory(postDir);
}