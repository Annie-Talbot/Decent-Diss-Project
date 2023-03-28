import { Center, Group, Modal, Skeleton, Stack, Text, Title, Button, ThemeIcon, ActionIcon, Space } from "@mantine/core";
import React, { useEffect, useState } from "react";
import { createSocialDirectory, findUsersSocialPod } from "../../SOLID/SocialDirHandler";
import { createErrorNotification } from "../Core/Notifications/ErrorNotification";
import { IconExclamationCircle, IconSquareRoundedPlusFilled } from "@tabler/icons-react";

async function addSocialDirectory(podRootDir, setPod) {
    const result = await createSocialDirectory(podRootDir)
    if (!result.success) {
        createErrorNotification(result.error);
        return;
    }
    setPod();
}


function PodButton(props) {
    return (
        <Button
            onClick={() => addSocialDirectory(props.pod, props.setPod)}
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
            onClose={()=>{}}
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
                        <Stack align='center' spacing='xs'>
                            <ThemeIcon 
                                variant="light"
                                size="xl">
                                <IconExclamationCircle/>
                            </ThemeIcon>
                            <Title order={4}>No social folder found in any of your PODs</Title>
                            <Space h={8}/>
                            {pods.length > 1?
                                <>
                                <Text>Create one in which POD?</Text>
                                <Group>
                                    {pods}
                                </Group>
                                </>
                            :
                                <>
                                <Text>Create one?</Text>
                                <ActionIcon
                                    size={64}
                                    color='sage'
                                    onClick={() => addSocialDirectory(pods[0], () => props.setPod(pods[0]))}
                                >
                                    <IconSquareRoundedPlusFilled size={48}/>
                                </ActionIcon>
                                </>
                            }
                        </Stack>
                    }
                </Center>
            </Skeleton>
        </Modal>
    );
}