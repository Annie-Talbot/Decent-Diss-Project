import { Skeleton, Stack } from "@mantine/core";
import { Person } from "./Person";

export function PeopleList(props) {

    return (
        <Skeleton visible={props.loading}>
            <Stack style={{gap: "2px"}}>
                {props.people.map((person, index) => (<Person key={index} hostPage={props.host} person={person} />))}
            </Stack>
        </Skeleton>
    );
}