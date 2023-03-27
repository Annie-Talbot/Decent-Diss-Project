import { Center, Stack, Title, Button, ActionIcon, HoverCard, Badge, Group, ThemeIcon, Space, Text } from "@mantine/core";
import { IconInfoCircle, IconSquareRoundedPlusFilled } from "@tabler/icons-react";
import { createErrorNotification } from "./Notifications/ErrorNotification";


export function MissingPodStructure(props) {
    return (
        <Center style={{marginTop: 44, marginBottom: 44}}>
            <Stack align={'center'}>
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
                        const error = await props.createFunction(props.podRootDir);
                        if (error) {
                            createErrorNotification(error);
                            return;
                        }
                        props.setExists(true);
                    }}
                >
                    <IconSquareRoundedPlusFilled size={57} />
                </ActionIcon>
            </Stack>
        </Center>
    );
}