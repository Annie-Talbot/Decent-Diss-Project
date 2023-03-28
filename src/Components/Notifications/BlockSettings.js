import { Stack, Grid, Title, Divider, ActionIcon, Paper, Text, TextInput, SimpleGrid, Tabs } from "@mantine/core"
import { IconArrowBack, IconPlus } from "@tabler/icons"
import { AccessList } from "../Feed/AccessList";
import { useState } from "react";
import { PeopleSearcher } from "../Feed/Searchers";
import { createErrorNotification } from "../Core/Notifications/ErrorNotification";
import { followGroup, followPerson, revokeFollowPerson } from "../../SOLID/FeedHandler";
import { createPlainNotification } from "../Core/Notifications/PlainNotification";
import { isValidWebID } from "../../SOLID/Utils";
import { blockPerson, fetchPeopleWithoutNotificationAppendAccess, revokeBlockPerson } from "../../SOLID/NotificationHandler";
import { createLoadingNotification } from "../Core/Notifications/LoadingNotification";

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

async function handleBlockPerson(podRootDir, person, updateList) {
    createLoadingNotification("block-person", "Blocking person...", "",
        () => blockPerson(podRootDir, person.webId), updateList);
}

async function handleBlockWebId(podRootDir, webId, updateList) {
    if (!(await isValidWebID(webId))) {
        createErrorNotification({title: "Invalid WebID", description: "Could not block."})
        return;
    }
    await handleBlockPerson(podRootDir, {webId: webId}, updateList);
}

async function handleRevokeBlock(podRootDir, webId, updateList) {
    createLoadingNotification("revoke-block-person", "Revoking person block...", "",
        () => revokeBlockPerson(podRootDir, webId), updateList);
}


export function BlockSettings(props) {
    const [accesslistKey, setAccesslistKey] = useState(0);

    return (
            <Paper shadow="md" p="md" withBorder>
                <Stack>
                <Title order={2}>Blocked Users:</Title>

                <Tabs defaultValue="people" color='sage'>
                    <Tabs.List grow position="center">
                        <Tabs.Tab value="people">Block by Person</Tabs.Tab>
                        <Tabs.Tab value="webId">Block by WebID</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="people">
                        <PeopleSearcher
                            podRootDir={props.user.podRootDir}
                            action={(person) => handleBlockPerson(props.user.podRootDir, person,
                                () => setAccesslistKey(accesslistKey + 1))}
                            icon={(<IconPlus/>)}
                        />
                    </Tabs.Panel>
                    <Tabs.Panel value="webId">
                            <TextInputAction
                                placeholder="https://id.inrupt.com/webID"
                                label="WebID"
                                icon={<IconPlus/>}
                                action={(webId) => handleBlockWebId(props.user.podRootDir, webId, 
                                    () => setAccesslistKey(accesslistKey + 1))}
                            />
                    </Tabs.Panel>
                </Tabs>
                <Paper shadow="sm" p="sm" withBorder>
                    <Stack>
                        <Title order={3}>People who are blocked: </Title>
                        <AccessList
                            key={accesslistKey}
                            fetchFunction={() => fetchPeopleWithoutNotificationAppendAccess(props.user.podRootDir)}
                            revoke={(webId) => handleRevokeBlock(props.user.podRootDir, webId,
                                () => setAccesslistKey(accesslistKey + 1))}
                        />
                    </Stack>
                    
                </Paper>
                </Stack>
            </Paper>
    )
}