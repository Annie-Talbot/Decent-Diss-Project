import { ActionIcon, Grid, Select, Skeleton, Stack } from "@mantine/core";
import { createPeopleDataset, doesPeopleDatasetExist, fetchPeople } from "../../SOLID/Connections/PeopleHandler";
import { createErrorNotification } from "../Core/Notifications/ErrorNotification";
import { Person } from "./Person";
import { useState, useEffect } from "react";
import { PageLoader } from "../Core/PageLoader";
import { IconCircleChevronsRight } from "@tabler/icons";
import { createPlainNotification } from "../Core/Notifications/PlainNotification";
import { ViewStates } from "./ConnectionsPage";
import { findSocialPodFromWebId } from "../../SOLID/NotificationHandler";


async function viewAnotherUser(page, person) {
    let [podRoot, error] = await findSocialPodFromWebId(person.webId);
    if (error) {
        createErrorNotification(error);
        return;
    }
    createPlainNotification({
        title: "Success!",
        description: "This user does have a Decent profile!!"
    });
    
    page.viewUserPodRoot = podRoot;
    page.viewUserWebID = person.webId;
    page.setState(prevState => (
        {...prevState, 
            currView: ViewStates.UserView,
    }));
}


function People(props) {
    const [loading, setLoading] = useState(true);
    const [people, setPeople] = useState([]);
    const [searchPerson, setSearchPerson] = useState(null);

    useEffect(() => {
        fetchPeople(props.podRootDir).then(([peoples, errors]) => {
            console.log(peoples);
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
                <Grid grow align="center">
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
                    />))}
            </Stack>
        </Skeleton>
    );
}

export function PeopleList(props) {

    return (
        <PageLoader
            checkFunction={doesPeopleDatasetExist}
            createFunction={createPeopleDataset}
            podRootDir={props.podRootDir}
            podStructureRequired="people dataset"
        >
            <People host={props.host} podRootDir={props.podRootDir}/>
            
        </PageLoader>
    );
}