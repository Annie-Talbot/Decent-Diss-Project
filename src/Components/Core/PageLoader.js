import { Button, Center, Skeleton, Stack, Title } from "@mantine/core";
import { createErrorNotification } from "./Notifications/ErrorNotification";
import { useState, useEffect } from "react";



export function PageLoader(props) {
    const [loading, setLoading] = useState(true);
    const [podError, setPodError] = useState(false);
    const [podStructureExists, setPodStructureExists] = useState(false);

    useEffect(() => {
        props.checkFunction(props.podRootDir).then(([success, error]) => {
            if (!success) {
                if (error) {
                    createErrorNotification(error);
                    setPodError(true);
                    setLoading(false);
                    return;
                }
                // Unsuccessfull and no error, continue leaving state.profileExists as false
                setLoading(false);
                return;
            }
            // Successfull at finding profile
            setPodStructureExists(true);
            setLoading(false);
        });
    }, [props.podRootDir, props.checkFunction]);

    let content;
    if (!podStructureExists) {
        if (podError) {
            // Error occured
            content = (<Center>
                <Title order={4}>An error occured whilst attempting to fetch your
                    {props.podStructureRequired}. Refresh and try again, or contact support.</Title>
            </Center>);
        } else {
            // pod structure does not exist
            content = (
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
                            setPodStructureExists(true);
                        }}>
                            Create {props.podStructureRequired}.
                        </Button>
                    </Stack>
                </Center>
            )
        }
    } else {
        // pod structure exists
        content = (<>{props.children}</>);
    }

    return (
        <Skeleton visible={loading}>
            {content}
        </Skeleton>
    );
}