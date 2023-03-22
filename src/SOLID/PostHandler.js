import { addStringNoLocale, addUrl, buildThing, createContainerInContainer, createSolidDataset, 
    createThing, getDatetime, getSolidDataset, getSourceUrl, 
    getStringNoLocale, getThing, getUrl, getUrlAll, saveFileInContainer, 
    saveSolidDatasetAt, saveSolidDatasetInContainer, setThing } from "@inrupt/solid-client";
import { fetch } from '@inrupt/solid-client-authn-browser'
import { RDF, SCHEMA_INRUPT } from "@inrupt/vocab-common-rdf";
import { GetPostDatasetUrl, POST_DETAILS, getChildUrlsList, deleteDirectory,
    simplifyError, makeId, createEmptyDataset, getImage, POSTS_DIR, delay, POST_ACCESS_THING, POST_ACCESS_DATASET, POST_DATASET, POST_THING, deleteDataset } from "./Utils";
import { setAllPublicReadAccess, setAllReadAccess, setReadAccess } from './AccessHandler'
import { createPostAlerts } from "./FeedHandler";
import { SOCIAL_SOLID } from "./SolidTerms";
import { fetchPeople, fetchPeopleFromList } from "./Connections/PeopleHandler";

export const POST_ACCESS_TYPES = {
    Public: 0, // all users can see
    Private: 1, // all people in your connections can see
    Specific: 2 // only people in the groups specified can see
}
function convertAccessUrlToType(url) {
    if (url === SOCIAL_SOLID.PublicAccess) return POST_ACCESS_TYPES.Public
    else if (url === SOCIAL_SOLID.PrivateAccess) return POST_ACCESS_TYPES.Private
    else return POST_ACCESS_TYPES.Specific
}
function convertAccessTypeToUrl(type) {
    if (type === POST_ACCESS_TYPES.Public) return SOCIAL_SOLID.PublicAccess
    else if (type === POST_ACCESS_TYPES.Private) return SOCIAL_SOLID.PrivateAccess
    else return SOCIAL_SOLID.SpecificAccess
}


export async function doesPostsDirExist(podRootDir) {
    try {
        await getSolidDataset(
            podRootDir + POSTS_DIR, 
            { fetch: fetch }
        )
        return [true, null];
    } catch (error) {
        let e = simplifyError(error, "Whilst checking if posts directory exists.");
        if (e.code === 404) {
            return [false, null];
        }
        return [false, e];
    }
}


export async function createPostsDir(podRootDir) {
    const error = await createEmptyDataset(podRootDir + POSTS_DIR)[1];
    if (error) {
        return error;
    }
    await delay(500);
    await setReadAccess(podRootDir + POSTS_DIR, true, null);
}


async function getPostFromThing(postThing) {
    // Title
    const postTitle = getStringNoLocale(postThing, SOCIAL_SOLID.PostTitle);
    // Date
    const postDatetime = getDatetime(postThing, SOCIAL_SOLID.DatetimeCreated, { fetch: fetch });
    // these are the only required attributes so return error if it doesn't exist
    if (!postTitle) {
        return [null, {
            code: 0,
            title: "Post has no title or datetime predicate, this is required.",
            description: "",
        }]
    }
    // Text
    const postText = getStringNoLocale(postThing, SCHEMA_INRUPT.text, { fetch: fetch });
    // Image
    const postImageLocation = getUrl(postThing, SCHEMA_INRUPT.image, { fetch: fetch });
    let postImg = null;
    if (postImageLocation) {
        const [image, error] = await getImage(postImageLocation);
        if (error) {
            return [null, error]
        }
        postImg = URL.createObjectURL(image);
    }
    
    let post = {
        title: postTitle,
        text: postText,
        datetime: postDatetime,
        image: postImg,
    };
    return [post, null];
}

/**
 * This function retrieves all information about a post and returns
 * it as a local dictionary for displaying.
 * 
 * @param {string} postUrl The URL where the post dataset is.
 * @returns {dict} A dictionary will post information in.
 */
async function getPost(postDir, getAccess) {
    const errContext = "Encountered whilst attempting to get post " +
                            "data for " + postDir;
    const postDatasetUrl = postDir + POST_DATASET
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

    // Post information is found in the #details Thing at the dataset:
    // details Thing URL: https://provider/podname/social/posts/postname/postname#details
    const postThing = getThing(postDataset, postDatasetUrl + POST_THING, { fetch: fetch });
    if (!postThing) {
        return [null, {
            code: 0,
            title: "Post has no #this Thing.",
            description: errContext,
        }]
    }
    
    let [post, error] = await getPostFromThing(postThing);
    if (error) {
        return [null, error]
    }
    post.url = postDir;

    if (getAccess) {
        let accessDataset;
        try {
            accessDataset = await getSolidDataset(
                postDir + POST_ACCESS_DATASET, 
                { fetch: fetch }  // fetch function from authenticated session
            );
        } catch (error) {
            return [null, simplifyError(error, "Encountered whilst fetching " +
                                                "access data for " + postDatasetUrl)];
        }

        const accessThing = getThing(
            accessDataset, 
            postDir + POST_ACCESS_DATASET + POST_ACCESS_THING,
            {fetch: fetch}
        )
        let accessType = getUrl(accessThing, RDF.type);
        if (!accessType) {
            // This is a required property so return an error
            return [null, {title: "Invalid post at " + postDir, description: "No access type."}]
        }
        accessType = convertAccessUrlToType(accessType);
        post.accessType = accessType;
        post.accessGroups = [];
        if (accessType === POST_ACCESS_TYPES.Specific) {
            let groups = getUrlAll(accessThing, SOCIAL_SOLID.AccessList);
            if (!groups) {
                groups = []
            }
            post.accessGroups = groups;
        }
    }
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
export async function fetchPosts(podRootDir, getAccess) {
    let postList = [];
    let postUrlList = [];
    let error;
    [postUrlList, error] = await getChildUrlsList(podRootDir + POSTS_DIR);
    if (error) {
        return [[], [error]];
    }

    // regex must be used to extract the name of a post's directory
    // so it can be used to find the solid dataset representing the
    // post. e.g. 
    // post container URL: https://provider/podname/social/posts/postname/
    // post dataset URL: https://provider/podname/social/posts/postname/postname

    let post;
    let errorList = [];
    for (const i in postUrlList) {
        [post, error] = await getPost(postUrlList[i], getAccess);
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




async function createPostDataset(postDirUrl, post) {
    // Create post dataset
    const postDatasetUrl = postDirUrl + POST_DATASET;
    let urls = [postDatasetUrl];

    let date = new Date(Date.now());
    if (post.url) {
        // If editing use previous date
        date = post.datetime
    }

    let postDataset = createSolidDataset();
    let postThing  = buildThing(createThing({ name: "this" }))
        .addStringNoLocale(SOCIAL_SOLID.PostTitle, post.title)
        .addDatetime(SOCIAL_SOLID.DatetimeCreated, date)
        .build();

    // Create image first because we need the url it is saved at.
    if (post.image) {
        let imgFile;
        try {
            imgFile = await saveFileInContainer(
            postDirUrl,
            post.image,
            { slug: post.image.name, 
                contentType: post.image.type, 
                fetch: fetch }
            );
        } catch (error) {
            return [false, simplifyError(error, "Encountered whilst trying to save image file.")]
        }
        postThing = addUrl(postThing, SCHEMA_INRUPT.image, getSourceUrl(imgFile))
        urls.push(getSourceUrl(imgFile));
    }

    if (post.text) {
        postThing = addStringNoLocale(
            postThing, 
            SCHEMA_INRUPT.text, 
            post.text);
    }

    postDataset = setThing(postDataset, postThing);
    console.log(postDatasetUrl)
    try {
        await saveSolidDatasetAt(
            postDatasetUrl,
            postDataset,
            { fetch: fetch }
          );
    } catch(error) {
        console.log(error);
        return [false, simplifyError(error, "Encountered whilst trying to create post dataset.")]
    }
    return [true, urls, null]
}

async function createPostAccessDataset(postDirUrl, post) {
    let accessType = convertAccessTypeToUrl(post.accessType);
    let accessDataset = createSolidDataset();
    let accessThing  = buildThing(createThing({ name: "this" }))
        .addUrl(RDF.type, accessType)
        .build();
    if (post.accessType === POST_ACCESS_TYPES.Specific) {
        post.accessList.forEach(group => {
            accessThing = addUrl(accessThing,
                SOCIAL_SOLID.AccessList,
                group.url);
        });
    }
    accessDataset = setThing(accessDataset, accessThing);
    try {
        await saveSolidDatasetAt(
            postDirUrl + POST_ACCESS_DATASET,
            accessDataset,
            { fetch: fetch }
          );
    } catch(error) {
        return [false, simplifyError(error, "Encountered whilst trying to create post access dataset.")];
    }
    await setAllPublicReadAccess([postDirUrl + "access"], false);

    return [true, null];
}

export async function createPost(podRootDir, webId, post, doAlerts) {
    console.log(post)
    // Create post directory
    let postDirUrl;
    let error;
    if (post.url) {
        // If editing a post, dont create a new directory
        postDirUrl = post.url;
    } else {
        // If creating a new post, create a new directory
        try {
            const postDir = await createContainerInContainer(
                podRootDir + POSTS_DIR,
                {fetch: fetch}
            )
            postDirUrl = getSourceUrl(postDir);
        } catch (e) {
            error = simplifyError(e, "Ecountered whilst creating a new post directory.");
            return [false, error]
        }
    }
    console.log(postDirUrl);

    if (post.url) {
        // If editing a post, remove the old datasets
        error = await deleteDataset(postDirUrl + POST_DATASET)[1];
        if (error) {
            return [false, {title: "Failed to edit post.", 
            description: "Could not remove previous details."}]
        }
        error = await deleteDataset(postDirUrl + POST_ACCESS_DATASET)[1];
        if (error) {
            return [false, {title: "Failed to edit post.", 
            description: "Could not remove previous details."}]
        }
    }

    // create post dataset
    let success, postUrls;
    [success, postUrls, error] = await createPostDataset(postDirUrl, post);
    if (!success) {
        return [false, error]
    }
    
    // CREATE access document
    [success, error] = await createPostAccessDataset(postDirUrl, post);
    if (!success) {
        return [false, error]
    }

    // create access list
    postUrls.push(postDirUrl);
    let accessList = [];
    if (post.accessType === POST_ACCESS_TYPES.Specific) {
        // fill recipient list with all member of groups
        for (let i = 0; i < post.accessList.length; i++) {
            let group = post.accessList[i];
            let people = (await fetchPeopleFromList(podRootDir, group.members))[0];
            people.forEach(person => accessList.push(person));
        }
    } else {
        // fill recipient list with all people we know
        let people = (await fetchPeople(podRootDir))[0];
        people.forEach(person => accessList.push(person));
    }

    // Set access
    if (post.accessType === POST_ACCESS_TYPES.Specific) {
        await setAllPublicReadAccess(postUrls, true);
    } else {
        await setAllPublicReadAccess(postUrls, false);
        await setAllReadAccess(postUrls, accessList.map(person => person.webId));
    }

    // Create post alerts for feed
    if (doAlerts) {
        await createPostAlerts(postDirUrl, podRootDir, webId, accessList);
    }
    return [true, null];
}

export async function fetchPost(postUrl) {
    let postDataset;
    try {
        postDataset = await getSolidDataset(
            postUrl + POST_DATASET, 
            { fetch: fetch }  // fetch function from authenticated session
        );
    } catch (e) {
        let error = simplifyError(e, "Whilst fetching post data.");
        if (error.code === 404) {
            // Not found
            return {title: "Post URL does not exist", 
                description: "Cannot load post."};
        }
        if (error.code === 403) {
            // Unauthorised
            return {title: "No access to this post", 
                description: "Cannot load post."};
        }
        return {title: "Cannot fetch post", 
            description: error.description};
    }

    const postThing = getThing(postDataset, postUrl + POST_DATASET + POST_THING, { fetch: fetch });
    if (!postThing) {
        return [null, {
            title: "Post has no #details Thing",
            description: "Cannot load post.",
        }]
    }
    return getPostFromThing(postThing);

}