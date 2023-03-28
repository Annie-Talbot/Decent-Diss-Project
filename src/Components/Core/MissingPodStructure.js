import { Center, Stack, Title, Button, ActionIcon, HoverCard, Badge, Group, ThemeIcon, Space, Text, LoadingOverlay } from "@mantine/core";
import { IconExclamationCircle, IconInfoCircle, IconSquareRoundedPlusFilled } from "@tabler/icons-react";
import { useState } from "react";
import { createErrorNotification } from "./Notifications/ErrorNotification";
import { createLoadingNotification } from "./Notifications/LoadingNotification";


export function MissingPodStructure(props) {
    const [loading, setLoading] = useState(false);
    
    return (
        <Center style={{marginTop: 44, marginBottom: 44}}>
            <LoadingOverlay visible={loading} />
            <Stack align={'center'}>
                <ThemeIcon
                    size='xl'
                    color='red'
                    variant="light"
                    >
                        <IconExclamationCircle/>
                </ThemeIcon>
                <Group align='flex-start' p={0} spacing={4} >
                    <Title order={3} >
                        No {props.podStructureRequired} found in your POD
                    </Title>
                    <HoverCard width={300}>
                        <HoverCard.Target>
                            <ThemeIcon size='sm'
                                variant='light'
                            >
                                <IconInfoCircle />
                            </ThemeIcon>
                            
                        </HoverCard.Target>
                        <HoverCard.Dropdown>
                            <Text size='sm' >
                                {"In order to use this feature of the app, you require a new \
                                file or folder to be created inside your POD. This is so \
                                that the app has a place to store all the information created \
                                from using this feature."}
                            </Text>
                        </HoverCard.Dropdown>
                    </HoverCard>
                </Group>
                <Space h={5} />
                <Title order={4}>
                    Create a new one?
                </Title>
                <ActionIcon 
                    size={80}
                    color='sage'
                    onClick={async() => {
                        createLoadingNotification("create-pod-thing", "Creating...", "",
                            () => props.createFunction(props.podRootDir), () => {
                                props.setExists(true);
                                setLoading(false);
                            })
                        setLoading(true);
                    }}
                >
                    <IconSquareRoundedPlusFilled size={57} />
                </ActionIcon>
            </Stack>
        </Center>
    );
}