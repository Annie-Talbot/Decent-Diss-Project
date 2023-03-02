import { ActionIcon, MultiSelect, Center, FileInput, Modal, Space, Textarea, TextInput, Checkbox, Title } from "@mantine/core";
import { IconRocket } from "@tabler/icons";
import { useState, useEffect } from "react";
import { fetchAllConnections } from "../../SOLID/Connections/ConnectionHandler";
import { createPost } from "../../SOLID/PostHandler";
import { POSTS_DIR } from "../../SOLID/Utils";
import { createErrorNotification } from "../Core/Notifications/ErrorNotification";
import { createPlainNotification } from "../Core/Notifications/PlainNotification";

async function handleCreatePost(post, connections, closePopup, updatePosts) {
    const agents = post.agentAccess.map((index) => connections[parseInt(index)])
    post["agentAccess"] = agents;
    const [success, error] = await createPost(post);
    if (!success) {
        createErrorNotification(error);
        return;
    }
    closePopup();
    createPlainNotification({title: "Success!", description: "Successfully created post."})
    updatePosts();
}


export function CreatePostForm(props) {
    const [connections, setConnections] = useState([]);
    const [post, setPost] = useState({
        dir: props.podRootDir + POSTS_DIR,
        title: "",
        text: "",
        image: null,
        agentAccess: [],
        publicAccess: 0,
    });

    useEffect(() => {
        fetchAllConnections(props.podRootDir).then(([connects, error]) => {
            if (error) {
                return;
            }
            setConnections(connects.map((c, i) => ({value: i.toString(), label: c.nickname})))
        })
    }, [props.podRootDir]);

    return (
        <Modal
            centered
            size="md"
            overlayOpacity={0.55}

            overlayBlur={3}
            opened={props.opened}
            title={"Create a new post"}
            onClose={props.toggleOpened}
        >
            <Space />
            <TextInput
                value={post.title}
                onChange={(event) => setPost(
                    {...post, 
                    title: event.currentTarget.value})
                }
                placeholder="My new post"
                label="Title"
                description="The title of your post."
                withAsterisk
            />
            <Space />
            <Textarea
                value={post.text}
                onChange={(event) => setPost(
                    {...post, 
                    text: event.currentTarget.value})
                }
                placeholder="Wow this new decentralised social media is really cool!"
                label="Text"
                description="Some text to be included in the body of your post."
            />
            <Space />
            <FileInput
                value={post.image}
                onChange={(event) => {
                    setPost(
                    {...post, 
                        image: event}
                ); }}
                placeholder="cool_pic.jpg"
                label="Image"
                description="Add an image to your post."
                withAsterisk
            />
            <Space h="md"/>
            <Center><Title c="grey" order={5}>Access Control</Title></Center>
            <Checkbox
                label="Public Access"
                value={post.publicAccess}
                onChange={(event) => setPost({
                    ...post,
                    publicAccess: event.currentTarget.value === true? 0: 1,
                })}
            />
            {connections.length > 0 &&
                <MultiSelect
                    data={connections}
                    disabled={post.publicAccess}
                    label="Who would you like to give access to"
                    placeholder="Pick all that you like"
                    value={post.agentAccess}
                    onChange={(event) => {
                        setPost(
                        {...post, 
                            agentAccess: event}
                    ); }}
                />
            }
            <Space h="md"/>
            <Center>
                <ActionIcon
                    color="sage" 
                    variant="filled"
                    size="xl"
                    onClick={() => {
                        handleCreatePost(post, 
                            connections, 
                            props.toggleOpened, 
                            props.updatePosts);
                    }}
                >
                    <IconRocket />
                </ActionIcon>
            </Center>
            
        </Modal>
    );
}