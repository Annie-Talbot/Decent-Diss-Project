import { ActionIcon, Grid, Select, Skeleton, Stack } from "@mantine/core";
import { createPeopleDataset, deletePerson, doesPeopleDatasetExist, fetchPeople } from "../../SOLID/Connections/PeopleHandler";
import { createErrorNotification } from "../Core/Notifications/ErrorNotification";
import { Person } from "./Person";
import { useState, useEffect } from "react";
import { PageLoader } from "../Core/PageLoader";
import { IconCircleChevronsRight } from "@tabler/icons";
import { createPlainNotification } from "../Core/Notifications/PlainNotification"



async function handleDeletePerson(podRootDir, person, update) {
    let error = await deletePerson(podRootDir, person.url);
    if (error) {
        createErrorNotification(error);
        return;
    }
    createPlainNotification({title: "Successfully deleted"});
    update();
}

function People(props) {
    const [loading, setLoading] = useState(true);
    const [people, setPeople] = useState([]);
    const [searchPerson, setSearchPerson] = useState(null);

    useEffect(() => {
        fetchPeople(props.podRootDir).then(([peoples, errors]) => {
            if (errors) {
                errors.forEach((error) => createErrorNotification(error));
            }
            setPeople(peoples);
            setLoading(false);
        })
        
    }, [props.podRootDir]);

    return (
        <Skeleton visible={loading}>
            <Stack style={{gap: "2px"}}>
                <Grid grow align="flex-end" >
                    <Grid.Col span={10}>
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
                        <ActionIcon color="sage" size="xl" onClick={() => props.viewPerson(people[searchPerson])}>
                            <IconCircleChevronsRight size={34}/>
                        </ActionIcon>
                    </Grid.Col>
                </Grid>
                {people.map((person, index) => (
                    <Person 
                        viewPerson={() => props.viewPerson(person)}
                        key={index} 
                        person={person}
                        authorised={props.authorised}
                        delete={() => handleDeletePerson(props.podRootDir, person, props.update)}
                    />))}
            </Stack>
        </Skeleton>
    );
}

export function PeopleList(props) {
    const [key, setKey] = useState(0);

    return (
        <PageLoader
            checkFunction={doesPeopleDatasetExist}
            createFunction={createPeopleDataset}
            podRootDir={props.podRootDir}
            podStructureRequired="people dataset"
        >
            <People 
                key={key}
                podRootDir={props.podRootDir}
                viewPerson={props.viewPerson}
                update={() => setKey(key + 1)}
                authorised={props.authorised}
            />
        </PageLoader>
    );
}