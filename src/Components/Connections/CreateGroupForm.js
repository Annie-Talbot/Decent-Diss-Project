import { ActionIcon, Center, Modal, Space, Stack, Text, TextInput, ThemeIcon } from "@mantine/core";
import { IconExclamationCircle, IconSquareRoundedPlusFilled } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { createGroup, doesGroupsDatasetExist } from "../../SOLID/Connections/GroupHandler";
import { createLoadingNotification } from "../Core/Notifications/LoadingNotification";

async function handleCreateGroup(podRootDir, group, close, update) {
    createLoadingNotification("create-group", "Creating group...", "",
        () => createGroup(podRootDir, group), () => {update();close();})
}


export function CreateGroupForm(props) {
    const [group, setGroup] = useState({
        name: ""
    });
    const [error, setError] = useState(null);


    useEffect(() => {
        doesGroupsDatasetExist(props.user.podRootDir).then((result) => {
            if (!result[0]) {
                setError("No groups folder in your POD.");
            }
        })
    }, [props]);

    return (
        <Modal
            centered
            size="md"
            overlayOpacity={0.55}
            overlayBlur={3}
            opened={props.opened}
            title={"Create a new group"}
            onClose={props.close}
        >
            {error? 
            <Stack align="center" justify="center" style={{height: "100%", marginTop: 64, marginBottom: 64}}>
                <ThemeIcon
                color='red' 
                variant="light"
                size="xl">
                    <IconExclamationCircle />
                </ThemeIcon>
                <Text align="center" size={"lg"}>{error}</Text>
            </Stack>
            :
            <Stack>
            <TextInput
                value={group.name}
                onChange={(event) => setGroup(
                    {...group, 
                    name: event.currentTarget.value})
                }
                placeholder="Best Friends"
                label="Group name"
                description="The name to give to this group"
                withAsterisk
            />
            <Space h="sm" />
            <Center>
                <ActionIcon
                    size="xl"
                    color="sage"
                    onClick={() => {
                        handleCreateGroup(props.user.podRootDir, group, props.close, props.updateGroups);
                    }}
                >
                    <IconSquareRoundedPlusFilled size={48} />
                </ActionIcon>
            </Center>
            </Stack>
            }
        </Modal>
    );
}