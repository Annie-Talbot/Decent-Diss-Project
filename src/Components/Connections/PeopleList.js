import { ActionIcon, Text, Grid, Select, Skeleton, Stack, ThemeIcon } from "@mantine/core";
import { createPeopleDataset, deletePerson, doesPeopleDatasetExist, fetchPeople } from "../../SOLID/Connections/PeopleHandler";
import { createErrorNotification } from "../Core/Notifications/ErrorNotification";
import { Person } from "./Person";
import { useState, useEffect } from "react";
import { PageLoader } from "../Core/PageLoader";
import { IconBeach, IconCircleChevronsRight } from "@tabler/icons-react";
import { createPlainNotification } from "../Core/Notifications/PlainNotification"
import { createLoadingNotification } from "../Core/Notifications/LoadingNotification";



async function handleDeletePerson(podRootDir, person, update) {
    createLoadingNotification("delete-person", "Deleting person...", "",
        () => deletePerson(podRootDir, person.url), update);
}


function EmptyPeople() {
    return (
        <Stack align="center" justify="center" style={{height: "100%", marginTop: 48, marginBottom: 48}}>
            <ThemeIcon 
            variant="light"
            size="xl">
                <IconBeach />
            </ThemeIcon>
            <Text size={"lg"}>No people to see...</Text>
        </Stack>
    );
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
                        <ActionIcon color="sage" size="xl" 
                            onClick={() => {if (searchPerson) props.viewPerson(people[searchPerson]);}}
                        >
                            <IconCircleChevronsRight size={34}/>
                        </ActionIcon>
                    </Grid.Col>
                </Grid>
                {people.length > 0?
                    people.map((person, index) => (
                    <Person 
                        viewPerson={() => props.viewPerson(person)}
                        key={index} 
                        person={person}
                        authorised={props.authorised}
                        delete={() => handleDeletePerson(props.podRootDir, person, props.update)}
                    />))
                :
                    <EmptyPeople/>
                }
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