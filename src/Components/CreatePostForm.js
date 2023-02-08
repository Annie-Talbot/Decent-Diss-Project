import { ActionIcon, FileInput, Modal, Space, Text, Textarea, TextInput } from "@mantine/core";
import { IconRocket } from "@tabler/icons";
import { useState } from "react";
import { createPost } from "../SOLID/PostHandler";
import { createErrorNotification } from "./ErrorNotification";



async function handleCreatePost(post) {
    const [success, error] = await createPost(post);
    if (!success) {
        createErrorNotification(error);
    }
}


export function CreatePostForm(props) {
    const [post, setPost] = useState({
        dir: props.postDir,
        title: "",
        text: "",
        image: null,
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
            <ActionIcon
            onClick={() => handleCreatePost(post)}
            >
                <IconRocket />
            </ActionIcon>
        </Modal>
    );
}