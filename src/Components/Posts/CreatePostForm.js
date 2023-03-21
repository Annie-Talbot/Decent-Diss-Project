import { ActionIcon, MultiSelect, Center, FileInput, Modal, Space, Textarea, TextInput, Checkbox, Title, Radio } from "@mantine/core";
import { IconRocket } from "@tabler/icons";
import { useState, useEffect } from "react";
import { fetchGroups } from "../../SOLID/Connections/GroupHandler";
import { createPost, POST_ACCESS_TYPES } from "../../SOLID/PostHandler";
import { createErrorNotification } from "../Core/Notifications/ErrorNotification";
import { createPlainNotification } from "../Core/Notifications/PlainNotification";

async function handleCreatePost(user, post, groups, finalise) {
    post.accessType = parseInt(post.accessType);
    if (post.accessType === POST_ACCESS_TYPES.Specific) {
        const agents = post.specificAccess.map((index) => groups[parseInt(index)])
        post.specificAccess = agents;
    }
    
    const [success, error] = await createPost(user.podRootDir, user.webId, post);
    if (!success) {
        createErrorNotification(error);
        return;
    }
    finalise();
}


export function CreatePostForm(props) {
    const [groups, setGroups] = useState([]);
    const [groupIndexes, setGroupIndexes] = useState([]);
    const [post, setPost] = useState({
        title: "",
        text: "",
        image: null,
        specificAccess: [],
        accessType: POST_ACCESS_TYPES.Public.toString(),
    });

    useEffect(() => {
        fetchGroups(props.user.podRootDir).then(([fetchedGroups, errors]) => {
            errors.forEach((e) => createErrorNotification(e));
            setGroups(fetchedGroups);
            setGroupIndexes(fetchedGroups.map((c, i) => ({value: i.toString(), label: c.name})));
        })
    }, [props]);

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
            <Radio.Group
                value={post.accessType}
                onChange={(event) => {setPost({
                    ...post,
                    accessType: event,
                })}}
                name="accessType"
                label="Access Type"
                description="Who you would like to be able to view this post"
                withAsterisk
            >
                <Radio value={POST_ACCESS_TYPES.Public.toString()} label="Public" />
                <Radio value={POST_ACCESS_TYPES.Private.toString()} label="Private" />
                {groups.length > 0 && <Radio value={POST_ACCESS_TYPES.Specific.toString()} label="Specific" />}
            </Radio.Group>
            <Space h='md'/>
            {post.accessType == POST_ACCESS_TYPES.Specific &&
                <MultiSelect
                    data={groupIndexes}
                    label="Group Selector"
                    placeholder="Pick which groups you would like to view this post"
                    value={post.specificAccess}
                    onChange={(event) => setPost(
                        {...post, 
                            specificAccess: event}
                    )}
                />
            }
            <Space h="md"/>
            <Center>
                <ActionIcon
                    color="sage" 
                    variant="filled"
                    size="xl"
                    onClick={() => {
                        handleCreatePost(
                            props.user,
                            post, 
                            groups,
                            () => {
                                props.toggleOpened();
                                createPlainNotification(
                                    {title: "Success!", 
                                    description: "Successfully created post."});
                                props.updatePosts();
                            });
                        
                    }}
                >
                    <IconRocket />
                </ActionIcon>
            </Center>
            
        </Modal>
    );
}