import { Stack, ThemeIcon, Text, Grid, ActionIcon } from "@mantine/core";
import { IconBeach, IconMinus } from "@tabler/icons";
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
                        <Grid grow justify="center" align="space-between">
                            <Grid.Col span={1}>
                                <ActionIcon 
                                style={{width: "100%", height: "100%"}}
                                color="red"
                                onClick={() => props.removeMember(person.url)}
                                >
                                    <IconMinus
                                        size={26}
                                    />
                                </ActionIcon>
                            </Grid.Col>
                            <Grid.Col span={11}>
                                <Person 
                                    viewPerson={() => props.viewPerson(person)}
                                    key={index} 
                                    person={person}
                                />
                            </Grid.Col>
                            
                        </Grid>
                    ))}
                </Stack>
            :
                <EmptyMembers />
            }
        </Stack>
    );
}