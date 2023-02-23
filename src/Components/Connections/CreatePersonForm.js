import { ActionIcon, Center, Modal, Space, TextInput } from "@mantine/core";
import { IconRocket } from "@tabler/icons";
import { useState } from "react";
import { createPerson } from "../../SOLID/ConnectionHandler";
import { createErrorNotification } from "../Core/Notifications/ErrorNotification";

async function handleCreatePerson(person, closePopup, updatePeople) {
    const error = await createPerson(person);
    if (error) {
        createErrorNotification(error);
        return;
    }
    closePopup();
    updatePeople();
}


export function CreatePersonForm(props) {
    const [person, setPerson] = useState({
        webId: "",
        nickname: "",
        dataset: props.datasetUrl
    });
    return (
        <Modal
            centered
            size="md"
            overlayOpacity={0.55}
            overlayBlur={3}
            opened={props.opened}
            title={"Create a new person"}
            onClose={props.toggleOpened}
        >
            <Space />
            <TextInput
                value={person.webId}
                onChange={(event) => setPerson(
                    {...person, 
                    webId: event.currentTarget.value})
                }
                placeholder="https://id.inrupt.com/username"
                label="WebID"
                description="The webID of this user"
                withAsterisk
            />
            <Space />
            <TextInput
                value={person.nickname}
                onChange={(event) => setPerson(
                    {...person, 
                    nickname: event.currentTarget.value})
                }
                placeholder="Sister from another mister!"
                label="Nickname"
                description="The name to give to this user."
            />
            <Space h="md"/>
            <Center>
                <ActionIcon
                    color="sage" 
                    variant="filled"
                    size="xl"
                    onClick={() => {
                        handleCreatePerson(person, props.toggleOpened, props.updatePeople);
                    }}
                >
                    <IconRocket />
                </ActionIcon>
            </Center>
            
        </Modal>
    );
}