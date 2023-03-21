import { ActionIcon, MultiSelect, Center, Modal, Space, TextInput, Title, Radio, Stack, Group, Stepper, Container, ThemeIcon, Text } from "@mantine/core";
import { IconArrowLeft, IconGift, IconRocket } from "@tabler/icons";
import { IconArrowRight, IconRocketOff } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { fetchGroups } from "../../SOLID/Connections/GroupHandler";
import { createPost, POST_ACCESS_TYPES } from "../../SOLID/PostHandler";
import { createErrorNotification } from "../Core/Notifications/ErrorNotification";
import { createPlainNotification } from "../Core/Notifications/PlainNotification";
import { PostAdditionsMenu } from "./PostInputs/PostAdditionsMenu";
import { PostImageInput } from "./PostInputs/PostImageInput";
import { PostTextInput } from "./PostInputs/PostTextInput";

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
    const [active, setActive] = useState(1);
    const nextStep = () => setActive((current) => (current < 2 ? current + 1 : current));
    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

    const [groups, setGroups] = useState([]);
    const [groupIndexes, setGroupIndexes] = useState([]);
    const [post, setPost] = useState({
        title: "",
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
            size="lg"
            overlayOpacity={0.55}
            overlayBlur={3}
            opened={props.opened}
            title={"Create a new post"}
            onClose={props.toggleOpened}
        >
            <Container p='sm' style={{marginLeft: 30, marginRight: 30}}>
            <Stepper active={active} onStepClick={setActive} breakpoint="sm">
                <Stepper.Step label="Design Post" description="Create your post">
                    <Stack p='md' spacing='xs'>
                        <Group position='apart'>
                            <Title order={3}>Post Designer</Title>
                            <PostAdditionsMenu
                                post={post}
                                add={(key, value) => {
                                    let copy = {...post};
                                    copy[key] = value;
                                    setPost(copy);
                                }}
                            />
                        </Group>
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
                        <PostTextInput 
                            value={post.text} 
                            onChange={(event) => setPost(
                                {...post, 
                                text: event.currentTarget.value})
                            }
                            delete={() => setPost({...post, text: null})}
                        />
                        <PostImageInput
                            value={post.image}
                            onChange={(event) => {
                                setPost(
                                {...post, 
                                    image: event}
                            ); }}
                            delete={() => setPost({...post, image: null})}
                        />
                    </Stack>
                </Stepper.Step>
                <Stepper.Step label="Set Privacy" description="Decide who sees your post">
                    <Stack p='md' spacing='xs'>
                        <Group position='left'>
                            <Title order={3}>Privacy Control</Title>
                        </Group>
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
                    </Stack>
                </Stepper.Step>
                <Stepper.Completed>
                <Stack align="center" justify="center" style={{height: "100%", marginTop: 24, marginBottom: 24}}>
                    <Title order={4}>Post completed.</Title>
                    <Space h='md' />
                    <ActionIcon 
                    variant="light"
                    color='sage'
                    radius='xl'
                    size={100}
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
                        <IconRocket size={60} />
                    </ActionIcon>
                    <Title order={3}>Send?</Title>
                </Stack>
                </Stepper.Completed>
            </Stepper>
            </Container>
                
            <Group position="center" mt="xl">
                    <ActionIcon 
                        size="lg" 
                        variant="light" 
                        c="sage" 
                        onClick={prevStep}
                        disabled={active <= 0}
                    >
                        <IconArrowLeft />
                    </ActionIcon>
                    <ActionIcon 
                        size="lg" 
                        variant="light" 
                        c="sage" 
                        onClick={nextStep}
                        disabled={active >= 2}
                    >
                        <IconArrowRight />
                    </ActionIcon>
                </Group>
        </Modal>
    );
}