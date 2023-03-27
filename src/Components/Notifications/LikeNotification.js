import { ActionIcon, Badge, Button, Grid, Group, Modal, Stack, Text, Title, UnstyledButton } from "@mantine/core";
import { useState, useEffect } from "react";
import { IconTrash } from "@tabler/icons";
import { findPerson } from "../../SOLID/Connections/PeopleHandler";
import { useDisclosure } from "@mantine/hooks";
import { Post } from "../Posts/Post";
import { fetchPost } from "../../SOLID/PostHandler";

        <UnstyledButton
            sx={(theme) => ({
                display: 'block',
                width: '100%',
                padding: "2px 2px 2px 15px",
                borderRadius: theme.radius.sm,
                color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
            
                '&:hover': {
                    backgroundColor:
                    theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
                },
            })}
            />



export function LikeNotification(props) {
    const [person, setPerson] = useState({webId: props.notif.senderWebId, nickname: "Unknown user"});
    const [opened, { open, close }] = useDisclosure(false);
    const [post, setPost] = useState({});

    useEffect(() => {
        findPerson(props.user.podRootDir, props.notif.senderWebId).then((fetchedPerson) => {
            setPerson(fetchedPerson);
            console.log(fetchedPerson)
        })
        fetchPost(props.notif.post, false).then((result) => {
            if (result.success) {
                setPost(result.post)
            }
        });
    }, [])
    return (
            <Grid 
                align="center" 
                justify="space-between" 
                grow
            >
                <Modal opened={opened} onClose={close} title="Post like!">
                    <Post
                        author={person}
                        authorised={false}
                        post={post}
                    />
                </Modal>
                <Grid.Col span={10}>
                    <UnstyledButton
                        sx={(theme) => ({
                            display: 'block',
                            width: '100%',
                            borderRadius: theme.radius.sm,
                            color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
                        
                            '&:hover': {
                                backgroundColor:
                                theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
                            },
                        })}
                        onClick={open}
                    >
                        <Stack spacing="xs">
                            <Group position="apart">
                                <Title order={5}>
                                    {person.nickname} liked your post!
                                </Title>
                                {props.notif.datetime &&
                                    <Badge>
                                        {props.notif.datetime.toString().substring(0,24)}   
                                    </Badge>
                                }
                            </Group>
                            <Text style={{marginLeft: "10px"}} fz="sm" >WebID: {person.webId}</Text>
                        </Stack>
                    </UnstyledButton>
                </Grid.Col>
                <Grid.Col span={1}>
                    <ActionIcon size="lg"  c="red" onClick={props.delete}>
                        <IconTrash />
                    </ActionIcon>
                </Grid.Col>
            </Grid>
    );
}