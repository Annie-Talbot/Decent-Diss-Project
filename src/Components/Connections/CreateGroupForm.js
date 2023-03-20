import { ActionIcon, Button, Center, Group, Modal, Space, TextInput } from "@mantine/core";
import { IconCirclePlus } from "@tabler/icons-react";
import { useState } from "react";
import { createGroup } from "../../SOLID/Connections/GroupHandler";
import { createErrorNotification } from "../Core/Notifications/ErrorNotification";

async function handleCreateGroup(podRootDir, group, close, update) {
    const error = await createGroup(podRootDir, group);
    if (error) {
        createErrorNotification(error);
        return;
    }
    update();
    close();
}


export function CreateGroupForm(props) {
    const [group, setGroup] = useState({
        name: ""
    });
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
            <Space />
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
            <Space h="md" />
            <Center>
                <ActionIcon
                    size="xl"
                    color="sage"
                    variant="filled"
                    onClick={() => {
                        handleCreateGroup(props.user.podRootDir, group, props.close, props.updateGroups);
                    }}
                >
                    <IconCirclePlus size={36} />
                </ActionIcon>
            </Center>
            
        </Modal>
    );
}