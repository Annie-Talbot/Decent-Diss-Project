import { ActionIcon, Center, Grid, Group, Skeleton, Stack, Text } from "@mantine/core";
import { IconTrash } from "@tabler/icons";
import { useState, useEffect } from "react";
import { fetchPeopleWithFeedAppendAccess } from "../../SOLID/FeedHandler";
import { Person } from "../Connections/Person";



export function AccessList(props) {
    const [loading, setLoading] = useState(true);
    const [people, setPeople] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPeopleWithFeedAppendAccess(props.podRootDir).then(([peoples, error]) => {
            if (error) {
                setError(error.title);
                setLoading(false);
                return;
            }
            setPeople(peoples);
            setLoading(false);
        })
        
    }, [props.podRootDir]);

    return (
        <Skeleton visible={loading}>
            {error?
                <Center><Text>Error loading people with access: {error}</Text></Center>
            :
                <Stack style={{gap: "2px"}}>
                    {people.map((person, index) => (
                        <Grid justify={"space-evenly"} align={"center"} grow>
                            <Grid.Col span={11}>
                                <Person 
                                    // viewPerson={() => props.viewPerson(person)}
                                    key={index} 
                                    person={person}
                                />
                            </Grid.Col>
                            <Grid.Col span={1}>
                                <ActionIcon 
                                    onClick={() => props.revoke(person.webId)} 
                                    color="red" 
                                    variant="light"
                                    size="lg"
                                >
                                    <IconTrash/>
                                </ActionIcon>
                            </Grid.Col>
                        </Grid>
                        ))
                    }
                </Stack>
            }
        </Skeleton>
    );
}