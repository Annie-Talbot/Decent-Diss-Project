import { ActionIcon, Grid, Group, Select, Skeleton, Stack } from "@mantine/core";
import { createGroupsDataset, doesGroupsDatasetExist } from "../../SOLID/Connections/GroupHandler";
import { createErrorNotification } from "../Core/Notifications/ErrorNotification";
import { Person } from "./Person";
import { useState, useEffect } from "react";
import { PageLoader } from "../Core/PageLoader";
import { IconCircleChevronsRight } from "@tabler/icons";
import { createPlainNotification } from "../Core/Notifications/PlainNotification";
import { ViewStates } from "./ConnectionsPage";

function Groups(props) {
    const [loading, setLoading] = useState(true);
    // const [people, setPeople] = useState([]);
    // const [searchPerson, setSearchPerson] = useState(null);

    // useEffect(() => {
    //     fetchPeople(props.podRootDir).then(([peoples, errors]) => {
    //         console.log(peoples);
    //         if (errors) {
    //             errors.forEach((error) => createErrorNotification(error));
    //         }
    //         setPeople(peoples);
    //         setLoading(false);
    //     })
        
    // }, [props.podRootDir]);

    return (
        <Skeleton visible={loading}>
            <Stack style={{gap: "2px"}}>
                {/* <Grid grow align="center">
                    <Grid.Col span={10} grow>
                        <Select
                            label="Search"
                            searchable
                            nothingFound="No people found."
                            data={people.map((person, index) => ({value: index.toString(), label: person.nickname}))}
                            value={searchPerson}
                            onChange={(event) => {
                                setSearchPerson(event)
                            }}
                        />
                    </Grid.Col>
                    <Grid.Col span={1}>
                        <ActionIcon color="sage" size="xl" onClick={() => viewAnotherUser(props.host, people[searchPerson])}>
                            <IconCircleChevronsRight size={34}/>
                        </ActionIcon>
                    </Grid.Col>
                </Grid>
                {people.map((person, index) => (
                    <Person 
                        viewUser={() => viewAnotherUser(props.host, person)}
                        key={index} 
                        person={person}
                    />))} */}
            </Stack>
        </Skeleton>
    );
}

export function GroupsList(props) {
    return (
        <PageLoader
            checkFunction={doesGroupsDatasetExist}
            createFunction={createGroupsDataset}
            podRootDir={props.podRootDir}
            podStructureRequired="groups dataset"
        >
            <Groups host={props.host} podRootDir={props.podRootDir}/>
            
        </PageLoader>
    );
}