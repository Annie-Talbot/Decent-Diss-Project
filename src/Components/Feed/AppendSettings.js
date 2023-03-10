import { Stack, Grid, Title, Divider, ActionIcon, Paper, Text, TextInput } from "@mantine/core"
import { IconArrowBack, IconPlus } from "@tabler/icons"
import { AccessList } from "./AccessList"
import { useState } from "react";
import { PeopleSearcher, GroupSearcher } from "./Searchers";
import { createErrorNotification } from "../Core/Notifications/ErrorNotification";
import { followGroup, followPerson, revokeFollowPerson } from "../../SOLID/FeedHandler";
import { createPlainNotification } from "../Core/Notifications/PlainNotification";
import { isValidWebID } from "../../SOLID/Utils";

function TextInputAction(props) {
    const [input, setInput] = useState("");

    return (
        <Grid grow justify="space-between" align="flex-end">
            <Grid.Col span={9}>
                <TextInput
                    placeholder={props.placeholder}
                    label={props.label}
                    value={input}
                    onChange={(event) => setInput(event.currentTarget.value)}
                />
            </Grid.Col>
            <Grid.Col span={2}>
                <ActionIcon color="sage" size="xl" onClick={() => props.action(input)}>
                    {props.icon}
                </ActionIcon>
            </Grid.Col>
        </Grid>
    );
}




async function handleFollowPerson(podRootDir, person, updateList) {
    let error = await followPerson(podRootDir, person.webId);
    if (error) {
        createErrorNotification(error);
        return;
    }
    createPlainNotification({title: "Successfully added!", description: ""});
    updateList();
}

async function handleFollowGroup(podRootDir, group, updateList) {
    let errors = await followGroup(podRootDir, group);
    errors.forEach((error) => createErrorNotification(error));
    updateList();
}

async function handleFollowWebId(podRootDir, webId, updateList) {
    if (!(await isValidWebID(webId))) {
        createErrorNotification({title: "Invalid WebID", description: "Could not follow."})
        return;
    }
    let error = await followPerson(podRootDir, webId);
    if (error) {
        createErrorNotification(error);
        return;
    }
    createPlainNotification({title: "Successfully added!", description: ""});
    updateList();
}

async function handleRevokeFollow(podRootDir, webId, updateList) {
    let error = await revokeFollowPerson(podRootDir, webId);
    if (error) {
        createErrorNotification(error);
        return;
    }
    createPlainNotification({title: "Successfully revoked access.", description: ""});
    updateList();
}


export function AppendSettings(props) {
    const [accesslistKey, setAccesslistKey] = useState(0);

    return (
        <Stack justify="flex-start" spacing="xs">
            <Grid align="flex-end" justify="flex-start">
                <Grid.Col span={1}>
                    <ActionIcon onClick={props.back} >
                        <IconArrowBack />
                    </ActionIcon>
                </Grid.Col>
                <Grid.Col span={10}>
                    <Title align="center" order={3}>Settings</Title>
                </Grid.Col>
            </Grid>
            <Divider h="md"/>
            <Paper shadow="md" p="md" withBorder>
                <Stack>
                <Title order={2}>Following:</Title>
                <Text variant="dimmed" style={{marginLeft: "10px"}}>
                    These are the people whose new posts you would like to view on your feed.
                </Text>
                    <Grid justify="space-evenly" grow>
                        <Grid.Col span={4}>
                            <Paper shadow="sm" p="sm" withBorder>
                                <Stack>
                                    <Title order={3}>Add People</Title>
                                </Stack>
                                <PeopleSearcher
                                    podRootDir={props.podRootDir}
                                    action={(person) => handleFollowPerson(props.podRootDir, person,
                                        () => setAccesslistKey(accesslistKey + 1))}
                                    icon={(<IconPlus/>)}
                                />
                            </Paper>
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <Paper shadow="sm" p="sm" withBorder>
                                <Stack>
                                    <Title order={3}>Add Groups</Title>
                                </Stack>
                                <GroupSearcher 
                                    podRootDir={props.podRootDir}
                                    action={(group) => handleFollowGroup(props.podRootDir, group,
                                        () => setAccesslistKey(accesslistKey + 1))}
                                    icon={(<IconPlus/>)}
                                />
                            </Paper>
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <Paper shadow="sm" p="sm" withBorder>
                                <Stack>
                                    <Title order={3}>Add by WebID</Title>
                                </Stack>
                                <TextInputAction
                                    placeholder="https://id.inrupt.com/webID"
                                    label="WebID"
                                    icon={<IconPlus/>}
                                    action={(webId) => handleFollowWebId(props.podRootDir, webId, 
                                        () => setAccesslistKey(accesslistKey + 1))}
                                />
                            </Paper>
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <Paper shadow="sm" p="sm" withBorder>
                                <Stack>
                                    <Title order={3}>People you are following: </Title>
                                    <AccessList
                                        key={accesslistKey}
                                        podRootDir={props.podRootDir}
                                        revoke={(webId) => handleRevokeFollow(props.podRootDir, webId,
                                            () => setAccesslistKey(accesslistKey + 1))}
                                    />
                                </Stack>
                                
                            </Paper>
                        </Grid.Col>
                        
                    </Grid>
                    
                </Stack>
            </Paper>
        </Stack>
    )
}