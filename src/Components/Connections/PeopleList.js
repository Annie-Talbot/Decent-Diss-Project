import { Skeleton, Stack } from "@mantine/core";
import { createPeopleDataset, doesPeopleDatasetExist, fetchPeople } from "../../SOLID/ConnectionHandler";
import { createErrorNotification } from "../Core/Notifications/ErrorNotification";
import { Person } from "./Person";
import { useState, useEffect } from "react";
import { PageLoader } from "../Core/PageLoader";


function People(props) {
    const [loading, setLoading] = useState(true);
    const [people, setPeople] = useState([]);

    useEffect(() => {
        fetchPeople(props.podRootDir).then(([peoples, errors]) => {
            console.log(peoples);
            if (errors) {
                errors.forEach((error) => createErrorNotification(error));
                return;
            }
            setPeople(peoples);
            setLoading(false);
        })
        
    }, [props.podRootDir]);

    return (
        <Skeleton visible={loading}>
            <Stack style={{gap: "2px"}}>
                {people.map((person, index) => (<Person key={index} hostPage={props.host} person={person} />))}
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