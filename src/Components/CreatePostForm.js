import { ActionIcon, MultiSelect, Center, FileInput, Modal, Space, Text, Textarea, TextInput } from "@mantine/core";
import { IconRocket } from "@tabler/icons";
import { useState } from "react";
import { ACCESS_AGENT_TYPE } from "../SOLID/AccessHandler";
import { createPost } from "../SOLID/PostHandler";
import { createErrorNotification } from "./ErrorNotification";

const userOptions = [
    {value: [ACCESS_AGENT_TYPE.Person, 'https://id.inrupt.com/at698'], label: 'Annie T'},

]


async function handleCreatePost(post, closePopup, updatePosts) {
    console.log(post.agentAccess);
    const [success, error] = await createPost(post);
    if (!success) {
        createErrorNotification(error);
        return;
    }
    closePopup();
    updatePosts();
}


export function CreatePostForm(props) {
    const [post, setPost] = useState({
        dir: props.postDir,
        title: "",
        text: "",
        image: null,
        agentAccess: [],
    });
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
                value={post.image? post.image.name: ""}
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
            <Space />
            <MultiSelect
                data={userOptions}
                label="Who would you like to give access to"
                placeholder="Pick all that you like"
                value={post.agentAccess}
                onChange={(event) => {
                    console.log(event);
                    setPost(
                    {...post, 
                        agentAccess: event}
                ); }}
            />
            <Space h="md"/>
            <Center>
                <ActionIcon
                    color="sage" 
                    variant="filled"
                    size="xl"
                    onClick={() => {
                        handleCreatePost(post, props.toggleOpened, props.updatePosts);
                    }}
                >
                    <IconRocket />
                </ActionIcon>
            </Center>
            
        </Modal>
    );
}