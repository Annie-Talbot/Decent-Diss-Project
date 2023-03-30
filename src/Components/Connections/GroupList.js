import { ActionIcon, Text, Grid, Select, Skeleton, Stack, ThemeIcon } from "@mantine/core";
import { createGroupsDataset, deleteGroup, doesGroupsDatasetExist, fetchGroups } from "../../SOLID/Connections/GroupHandler";
import { createErrorNotification } from "../Core/Notifications/ErrorNotification";
import { useState, useEffect } from "react";
import { PageLoader } from "../Core/PageLoader";
import { IconCircleChevronsRight } from "@tabler/icons";
import { GroupItem } from "./GroupItem";
import { createPlainNotification } from "../Core/Notifications/PlainNotification";
import { IconBeach } from "@tabler/icons-react";
import { createLoadingNotification } from "../Core/Notifications/LoadingNotification";

async function handleDeleteGroup(podRootDir, group, update) {
    createLoadingNotification("delete-group", "Deleting group...", "",
        () => deleteGroup(podRootDir, group.url), update);
}

function EmptyGroups() {
    return (
        <Stack align="center" justify="center" style={{height: "100%", marginTop: 48, marginBottom: 48}}>
            <ThemeIcon 
            variant="light"
            size="xl">
                <IconBeach />
            </ThemeIcon>
            <Text size={"lg"}>No groups yet...</Text>
        </Stack>
    );
}


function Groups(props) {
    const [loading, setLoading] = useState(true);
    const [groups, setGroups] = useState([]);
    const [searchGroup, setSearchGroup] = useState(null);

    useEffect(() => {
        fetchGroups(props.podRootDir).then(([groupList, errors]) => {
            if (errors) {
                errors.forEach((error) => createErrorNotification(error));
            }
            setGroups(groupList);
            setLoading(false);
        })
        
    }, [props.podRootDir]);

    return (
        <Skeleton visible={loading}>
            <Stack style={{gap: "2px"}}>
                <Grid grow align="flex-end">
                    <Grid.Col span={10}>
                        <Select
                            label="Search"
                            searchable
                            nothingFound="No groups found."
                            data={groups.map((group, index) => ({value: index.toString(), label: group.name}))}
                            value={searchGroup}
                            onChange={(event) => {
                                setSearchGroup(event)
                            }}
                        />
                    </Grid.Col>
                    <Grid.Col span={1}>
                        <ActionIcon 
                            color="sage" 
                            size="xl" 
                            onClick={() => {if (searchGroup) props.viewGroup(groups[searchGroup])}}
                        >
                            <IconCircleChevronsRight 
                                size={34}
                            />
                        </ActionIcon>
                    </Grid.Col>
                </Grid>
                {groups.length > 0? 
                    groups.map((group, index) => (
                        <GroupItem 
                            key={index} 
                            group={group}
                            viewGroup={() => props.viewGroup(group)}
                            people={props.people}
                            authorised={props.authorised}
                            delete={() => handleDeleteGroup(props.podRootDir, group, props.update)}
                        />))
                :
                    <EmptyGroups/>
                }
            </Stack>
        </Skeleton>
    );
}

export function GroupsList(props) {
    const [key, setKey] = useState(0);

    return (
        <PageLoader
            checkFunction={doesGroupsDatasetExist}
            createFunction={createGroupsDataset}
            podRootDir={props.podRootDir}
            podStructureRequired="groups dataset"
        >
            <Groups 
                key={key}
                podRootDir={props.podRootDir} 
                viewGroup={props.viewGroup}
                people={props.people}
                update={() => setKey(key + 1)}
                authorised={props.authorised}
            />
            
        </PageLoader>
    );
}