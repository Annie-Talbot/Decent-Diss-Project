import { Stack, ThemeIcon, Text } from "@mantine/core";
import { IconBeach } from "@tabler/icons";
import { Person } from "./Person";

function EmptyMembers() {
    return (
        <Stack align="center" justify="center">
            <ThemeIcon 
            variant="light"
            size="xl">
                <IconBeach />
            </ThemeIcon>
            <Text size={"lg"}>No members yet...</Text>
            <Text>To add people, use the search and add button above.</Text>
        </Stack>
    );
    }

export function Members(props) {
    return (
        <Stack>
            {props.members.length > 0 ?
                <Stack>
                    {props.members.map((person, index) => (
                    <Person 
                        viewPerson={() => props.viewPerson(person)}
                        key={index} 
                        person={person}
                    />))}
                </Stack>
            :
                <EmptyMembers />
            }
        </Stack>
    );
}