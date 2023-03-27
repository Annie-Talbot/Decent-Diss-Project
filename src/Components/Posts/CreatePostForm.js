import { ActionIcon, MultiSelect, Center, Modal, Space, TextInput, Title, Radio, Stack, Group, Stepper, Container, ThemeIcon, Text } from "@mantine/core";
import { IconArrowLeft, IconCheckbox, IconGift, IconRocket } from "@tabler/icons";
import { IconArrowRight, IconRocketOff } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { fetchGroups } from "../../SOLID/Connections/GroupHandler";
import { createPost, POST_ACCESS_TYPES } from "../../SOLID/PostHandler";
import { createErrorNotification } from "../Core/Notifications/ErrorNotification";
import { createPlainNotification } from "../Core/Notifications/PlainNotification";
import { PostAdditionsMenu } from "./PostInputs/PostAdditionsMenu";
import { PostImageInput } from "./PostInputs/PostImageInput";
import { PostTextInput } from "./PostInputs/PostTextInput";

async function handleCreatePost(user, post, doAlerts, groups, finalise) {
    post.accessType = parseInt(post.accessType);
    if (post.accessType === POST_ACCESS_TYPES.Specific) {
        const agents = post.accessList.map((index) => groups[parseInt(index)])
        post.accessList = agents;
    }
    
    const [success, error] = await createPost(user.podRootDir, user.webId, post, doAlerts);
    if (!success) {
        createErrorNotification(error);
        return;
    }
    finalise();
}


export function CreatePostForm(props) {
    const [active, setActive] = useState(0);
    const nextStep = () => setActive((current) => (current < 2 ? current + 1 : current));
    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

    const [groups, setGroups] = useState([]);
    const [groupIndexes, setGroupIndexes] = useState([]);

    useEffect(() => {
        fetchGroups(props.user.podRootDir).then(([fetchedGroups, errors]) => {
            setGroups(fetchedGroups);
            setGroupIndexes(fetchedGroups.map((c, i) => ({value: i.toString(), label: c.name})));
        }).then(() => {
            if (props.post.accessGroups) {
                let accessList = [];
                props.post.accessGroups.forEach((group) => {
                    const index = groups.findIndex((g) => g.url === group)
                    if (index !== -1) {
                        accessList.push(index.toString());
                    }
                })
                props.setPost({...props.post, accessGroups: null, accessList: accessList})
            }
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
            onClose={() => {setActive(0); props.close();}}
        >
            <Container p='sm' style={{marginLeft: 30, marginRight: 30}}>
            <Stepper active={active} onStepClick={setActive} breakpoint="sm">
                <Stepper.Step label="Design Post" description="Create your post">
                    <Stack p='md' spacing='xs'>
                        <Group position='apart'>
                            <Title order={3}>Post Designer</Title>
                            <PostAdditionsMenu
                                post={props.post}
                                add={(key, value) => {
                                    let copy = {...props.post};
                                    copy[key] = value;
                                    props.setPost(copy);
                                }}
                            />
                        </Group>
                        <TextInput
                            value={props.post.title}
                            onChange={(event) => props.setPost(
                                {...props.post, 
                                title: event.currentTarget.value})
                            }
                            placeholder="My new post"
                            label="Title"
                            description="The title of your post."
                            withAsterisk
                        />
                        <PostTextInput 
                            value={props.post.text} 
                            onChange={(event) => props.setPost(
                                {...props.post, 
                                text: event.currentTarget.value})
                            }
                            delete={() => props.setPost({...props.post, text: null})}
                        />
                        <PostImageInput
                            value={props.post.image}
                            onChange={(event) => {
                                props.setPost(
                                {...props.post, 
                                    image: event}
                            ); }}
                            delete={() => props.setPost({...props.post, image: null})}
                        />
                    </Stack>
                </Stepper.Step>
                <Stepper.Step label="Set Privacy" description="Decide who sees your post">
                    <Stack p='md' spacing='xs'>
                        <Group position='left'>
                            <Title order={3}>Privacy Control</Title>
                        </Group>
                        <Radio.Group
                            value={props.post.accessType}
                            onChange={(event) => {props.setPost({
                                ...props.post,
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
                        {props.post.accessType == POST_ACCESS_TYPES.Specific &&
                            <MultiSelect
                                data={groupIndexes}
                                label="Group Selector"
                                placeholder="Pick which groups you would like to view this post"
                                value={props.post.accessList}
                                onChange={(event) => props.setPost(
                                    {...props.post, 
                                        accessList: event}
                                )}
                            />
                        }
                    </Stack>
                </Stepper.Step>
                <Stepper.Completed>
                <Stack align="center" justify="center" style={{height: "100%", marginTop: 24, marginBottom: 24}}>
                    <Title order={4}>Design completed.</Title>
                    <Space h='md' />
                    <Group position="apart" spacing='xl'>
                        {props.post.url &&
                            <>
                            <Stack align='center'  >
                                <ActionIcon 
                                    variant="light"
                                    color='sage'
                                    radius='xl'
                                    size={100}
                                    onClick={() => {
                                        handleCreatePost(
                                            props.user,
                                            props.post, 
                                            false,
                                            groups,
                                            () => {
                                                setActive(0);
                                                props.close();
                                                createPlainNotification(
                                                    {title: "Success!", 
                                                    description: "Successfully created post."});
                                                props.updatePosts();
                                            });
                                        
                                    }}
                                    >
                                        <IconCheckbox size={60} />
                                    </ActionIcon>
                                    <Title order={3}>Save</Title>
                            </Stack>
                            <Text>or</Text>
                            </>
                        }
                        <Stack align='center'  >
                            <ActionIcon 
                            variant="light"
                            color='sage'
                            radius='xl'
                            size={100}
                            onClick={() => {
                                handleCreatePost(
                                    props.user,
                                    props.post, 
                                    true,
                                    groups,
                                    () => {
                                        setActive(0);
                                        props.close();
                                        createPlainNotification(
                                            {title: "Success!", 
                                            description: "Successfully created post."});
                                        props.updatePosts();
                                    });
                                
                            }}
                            >
                                <IconRocket size={60} />
                            </ActionIcon>
                            <Title order={3}>{props.post.url? 'Re-post?' : 'Post?'}</Title>
                        </Stack>
                    </Group>
                    
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