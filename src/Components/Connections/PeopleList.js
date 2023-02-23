import { Skeleton, Stack } from "@mantine/core";
import { Person } from "./Person";

export function PeopleList(props) {

    return (
        <Skeleton visible={props.loading}>
            <Stack style={{gap: "2px"}}>
                {props.people.map((person) => (<Person hostPage={props.host} person={person} />))}
            </Stack>
        </Skeleton>
    );
}