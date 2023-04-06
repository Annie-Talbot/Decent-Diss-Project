import { Skeleton, Grid, Select, ActionIcon } from "@mantine/core";
import React from "react";
import { useState, useEffect } from "react";
import { createErrorNotification } from "../Core/Notifications/ErrorNotification";
import { fetchPeople } from "../../SOLID/Connections/PeopleHandler";
import { fetchGroups } from "../../SOLID/Connections/GroupHandler";

function Searcher(props) {
    const [loading, setLoading] = useState(true);
    const [listItems, setListItems] = useState([]);
    const [searchItem, setSearchItem] = useState(null);

    useEffect(() => {
        props.fetch(props.podRootDir).then(([fetchedList, errors]) => {
            if (errors) {
                errors.forEach((error) => createErrorNotification(error));
            }
            setListItems(fetchedList);
            setLoading(false);
        })
    }, [props]);

    return (
        <Skeleton visible={loading}>
            <Grid grow justify="space-between" align="flex-end">
                <Grid.Col span={9}>
                    <Select
                        label="Search"
                        searchable
                        nothingFound="Nothing found."
                        data={listItems.map((item, index) => ({value: index.toString(), label: item[props.label]}))}
                        value={searchItem}
                        onChange={(event) => {
                            setSearchItem(event)
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={2}>
                    <ActionIcon color="sage" size="xl" onClick={() => {if (searchItem) props.action(listItems[searchItem])}}>
                        {props.icon}
                    </ActionIcon>
                </Grid.Col>
            </Grid>
        </Skeleton>
        
    );
}


export function PeopleSearcher(props) {
    return (
        <Searcher
            podRootDir={props.podRootDir}
            fetch={fetchPeople}
            icon={props.icon}
            action={props.action}
            label={"nickname"}
        />
    );
}

export function GroupSearcher(props) {
    return (
        <Searcher
            podRootDir={props.podRootDir}
            fetch={fetchGroups}
            icon={props.icon}
            action={props.action}
            label={"name"}
        />
    );
}