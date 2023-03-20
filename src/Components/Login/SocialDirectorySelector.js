import { Center, Group, Modal, Skeleton, Stack, Text, Title, Button, ThemeIcon } from "@mantine/core";
import React, { useEffect, useState } from "react";
import { createSocialDirectory, findUsersSocialPod } from "../../SOLID/SocialDirHandler";
import { createErrorNotification } from "../Core/Notifications/ErrorNotification";
import { IconExclamationCircle } from "@tabler/icons-react";


function PodButton(props) {
    return (
        <Button
            onClick={async () => {
                const result = await createSocialDirectory(props.pod)
                if (!result.success) {
                    createErrorNotification(result.error);
                    return;
                }
                props.setPod();
            }}
        >
            {props.pod}
        </Button>
    )
}

export function SocialDirectorySelector(props) {
    const [loading, setLoading] = useState(true);
    const [pods, setPods] = useState([]);
    const [error, setError] = useState(false);

    useEffect(() => {
        findUsersSocialPod(props.user.webId).then(({success, fetchedPod, error}) => {
            if (error) {
                // An error occured
                createErrorNotification(error);
                setError(true);
                setLoading(false);
                return;
            }
            if (!success) {
                // Pods found, but none with a social directory.
                setPods(fetchedPod);
                setLoading(false);
                return;
            }
            props.setPod(fetchedPod);
        });
    }, [props]);

    const podOptions = pods.map((podRootDir) => (
        <PodButton key={podRootDir} pod={podRootDir} setPod={() => props.setPod(podRootDir)} />
    ));

    return (
        <Modal
            opened={props.opened}
            title="Finding your social information..."
            size='auto'
        >
            <Skeleton visible={loading}>
                <Center p='md'>
                    {error? 
                        <Stack align="center" justify="center" style={{height: "100%"}}>
                            <ThemeIcon 
                                variant="light"
                                size="xl"
                            >
                                <IconExclamationCircle />
                            </ThemeIcon>
                            <Title order={4}>An error occured whilst attempting to fetch your
                            social information from your POD. </Title>
                            <Text>Refresh and try again, or contact support.</Text>
                        </Stack>
                    :
                        <Stack align='center'>
                            <ThemeIcon 
                                variant="light"
                                size="xl">
                                <IconExclamationCircle/>
                            </ThemeIcon>
                            <Title order={4}>No social information found in any of your PODs</Title>
                            <Text>Create a folder in which POD?</Text>
                            <Group>
                                {podOptions}
                            </Group>
                        </Stack>
                    }
                </Center>
            </Skeleton>
        </Modal>
    );
}