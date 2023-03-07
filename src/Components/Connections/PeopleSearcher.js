import { Skeleton, Grid, Select, ActionIcon } from "@mantine/core";
import React from "react";
import { useState, useEffect } from "react";
import { createErrorNotification } from "../Core/Notifications/ErrorNotification";
import { fetchPeople } from "../../SOLID/Connections/PeopleHandler";


export function PeopleSearcher(props) {
    const [loading, setLoading] = useState(true);
    const [people, setPeople] = useState([]);
    const [searchPerson, setSearchPerson] = useState(null);

    useEffect(() => {
        fetchPeople(props.podRootDir).then(([peoples, errors]) => {
            if (errors) {
                errors.forEach((error) => createErrorNotification(error));
            }
            // Filter using members list and filter prop somehow...

            setPeople(peoples);
            setLoading(false);
        })
    }, [props.podRootDir]);

    return (
        <Skeleton visible={loading}>
            <Grid grow justify="space-between" align="flex-end">
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
                    <ActionIcon color="sage" size="xl" onClick={() => props.action(people[searchPerson])}>
                        {props.icon}
                    </ActionIcon>
                </Grid.Col>
            </Grid>
        </Skeleton>
        
    );
}