import { Paper, Skeleton, Stack, Title, Text, Grid, Select, ActionIcon, ThemeIcon, Center } from "@mantine/core";
import { IconPlus } from "@tabler/icons";
import React from "react";
import { useState, useEffect } from "react";
import { addMember, fetchGroup, fetchGroupDetailed } from "../../SOLID/Connections/GroupHandler";
import { createErrorNotification } from "../Core/Notifications/ErrorNotification";
import { Members } from "./Members";
import { PeopleSearcher } from "./PeopleSearcher";

async function handleAddMember(podRootDir, groupUrl, personUrl, updateGroup) {
    const error = await addMember(podRootDir, groupUrl, personUrl);
    if (error) {
        createErrorNotification(error);
        return;
    }
    updateGroup();
}

// async function handleDeleteMember(podRootDir, groupUrl, personUrl, updateGroup) {
//     const error = await deleteMember(podRootDir, groupUrl, personUrl);
//     if (error) {
//         createErrorNotification(error);
//         return;
//     }
//     updateGroup();
// }


function Group(props) {
    const [loading, setLoading] = useState(true);
    const [group, setGroup] = useState({members: []});
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchGroupDetailed(props.podRootDir, props.url).then(([group, e]) => {
            if (e) setError(e);
            setGroup(group);
            setLoading(false);
        });
    }, [props.podRootDir, props.url]);
    
    return (
        <Skeleton visible={loading} >
            {error?
                <Center p="md">
                    <Text>An error occured loading this group.</Text>
                    <Text>{error.title}</Text>
                    <Text>{error.description}</Text>
                </Center>
            :
                <Stack p="md">
                    <Paper shadow="sm" p="md" withBorder >
                        <Title order={3}>Group Name</Title>
                        <Text style={{ marginLeft: "10px"}}>{group.name} </Text>
                    </Paper>
                    <Paper shadow="sm" p="md" withBorder >
                        <Stack>
                            <Title order={3}>Members:</Title>
                            <PeopleSearcher 
                                podRootDir={props.podRootDir}
                                icon={<IconPlus />}
                                action={(person) => handleAddMember(props.podRootDir, group.url, person.url, props.updateGroup)}
                            />
                            <Members 
                                podRootDir={props.podRootDir}
                                members={group.members}
                            />
                        </Stack>
                    </Paper>
                </Stack>
            }
            
        </Skeleton>
    );
}

export class GroupView extends React.Component {

    constructor(props) {
        super(props)
        this.groupUrl = props.groupUrl;
        this.podRootDir = props.podRootDir;
        this.state = {
            groupKey: 0
        }
    }
    
    updateGroup(groupView) {
        groupView.setState(prevState => ({
            ...prevState,
            groupKey: groupView.state.groupKey + 1,
        }));
    }
    
    render() {
        return (
            <Group
                key={this.state.groupKey}
                url={this.groupUrl}
                podRootDir={this.podRootDir}
                updateGroup={() => this.updateGroup(this)}
            />      
        );
    }
    
}




