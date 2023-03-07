import { Center, Stack, Title, Button } from "@mantine/core";
import { createErrorNotification } from "./Notifications/ErrorNotification";


export function MissingPodStructure(props) {
    return (
        <Center>
            <Stack>
                <Title order={4} >
                    No {props.podStructureRequired} found. Create a new one?
                </Title>
                <Button onClick={async() => {
                    const error = await props.createFunction(props.podRootDir);
                    if (error) {
                        createErrorNotification(error);
                        return;
                    }
                    props.setExists(true);
                }}>
                    Create {props.podStructureRequired}.
                </Button>
            </Stack>
        </Center>
    );
}