import { buildThing, createSolidDataset, createThing, getDatetime, getFile, getSolidDataset, getSourceUrl, getStringNoLocale, getThing, getUrl, saveFileInContainer, saveSolidDatasetAt, setThing } from "@inrupt/solid-client";
import { fetch } from '@inrupt/solid-client-authn-browser'
import { SCHEMA_INRUPT } from "@inrupt/vocab-common-rdf";
import { GetPostDatasetUrl, POST_DETAILS, getChildUrlsList, deleteDirectory, simplifyError, makeId, createEmptyDataset, DATE_CREATED, TITLE, getImage } from "./Utils";
import { getAllAgentWebIDs, setAllPublicReadAccess, setAllReadAccess, setReadAccess } from './AccessHandler'




/**
 * This function retrieves all information about a post and returns
 * it as a local dictionary for displaying.
 * 
 * @param {string} postUrl The URL where the post dataset is.
 * @returns {dict} A dictionary will post information in.
 */
async function getPost(postDir, postName) {
    const errContext = "Encountered whilst attempting to get post " +
                            "data for " + postDir + postName;
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

    // Post information is found in the #details Thing at the dataset:
    // details Thing URL: https://provider/podname/social/posts/postname/postname#details
    const postThing = getThing(postDataset, postDatasetUrl + POST_DETAILS, { fetch: fetch });
    if (!postThing) {
        return [null, {
            code: 0,
            title: "Post has no #details Thing.",
            description: errContext,
        }]
    }
    // Title
    const postTitle = getStringNoLocale(postThing, TITLE);
    // Date
    const postDatetime = getDatetime(postThing, DATE_CREATED, { fetch: fetch });
    // these are the only required attributes so return error if it doesn't exist
    if (!postTitle) {
        return [null, {
            code: 0,
            title: "Post has no title or datetime predicate, this is required.",
            description: errContext,
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
    // TODO: Missing author details as need some utility functions to do that

    let post = {
        title: postTitle,
        text: postText,
        datetime: postDatetime.toLocaleString(),
        image: postImg,
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

export async function createPost(post) {
    // Find valid ID
    let validId = false;
    let id;
    while (!validId) {
        id = makeId(10);
        try {
            await getSolidDataset(
                post.dir + id + "/",
                {fetch: fetch}
            )
        } catch (error) {
            error = simplifyError(error, "Ecountered whilst creating a new post ID.");
            if (error.code == 404 || error.code == 401) {
                validId = true;
            } else {
                return [false, error]
            }
        }
    }
    // Create post directory
    const postDirUrl = post.dir + id + "/";
    let dataset;
    let error;
    [dataset, error] = await createEmptyDataset(postDirUrl);
    if (error) {
        return [false, error];
    }

    // create image first because we need the url it is saved at.
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
    const postImgUrl = getSourceUrl(imgFile);

    const postDatasetUrl = postDirUrl + id;
    let postDataset = createSolidDataset();
    let postThing  = buildThing(createThing({ name: "details" }))
    .addStringNoLocale(TITLE, post.title)
    .addStringNoLocale(SCHEMA_INRUPT.text, post.text)
    .addDatetime(DATE_CREATED, new Date(Date.now()))
    .addUrl(SCHEMA_INRUPT.image, postImgUrl)
    .build();
    postDataset = setThing(postDataset, postThing);


    try {
        await saveSolidDatasetAt(
            postDatasetUrl,
            postDataset,
            { fetch: fetch }             // fetch from authenticated Session
          );
    } catch(error) {
        return [false, simplifyError(error, "Encountered whilst trying to create post dataset.")]
    }
    if (post.publicAccess) {
        await setAllPublicReadAccess([postDirUrl, postImgUrl, postDatasetUrl]);
    } else {
        // Generate list of agents who will have read access
        let accessList = await getAllAgentWebIDs(post.agentAccess);
        // Set access for post directory, image file, and post dataset
        await setAllReadAccess([postDirUrl, postImgUrl, postDatasetUrl], accessList);
    }
    return [true, null];
}