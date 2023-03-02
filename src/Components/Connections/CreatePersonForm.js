import { Button, Group, Modal, Space, TextInput } from "@mantine/core";
import { useState } from "react";
import { createPerson } from "../../SOLID/Connections/PeopleHandler";
import { createConnectionRequest, findSocialPodFromWebId } from "../../SOLID/NotificationHandler";
import { isValidWebID } from "../../SOLID/Utils";
import { createErrorNotification } from "../Core/Notifications/ErrorNotification";

async function handleCreateAPerson(person) {
    const error = await createPerson(person);
    if (error) {
        createErrorNotification(error);
        return false;
    }
    return true;
}

async function sendConnectionRequest(webId, pod, person) {
    // Check we can send a notification first.
    let [personPod, error] = await findSocialPodFromWebId(person.webId);
    if (error) {
        createErrorNotification(error);
        return false;
    }
    console.log("valid notif dir");
    error = await createConnectionRequest({webId: webId, socialPod: pod, msg: "Hello."}, personPod);
    if (error) {
        createErrorNotification(error);
        return false;
    }
    return true;
}

async function handleCreatePerson(webId, pod, person, closePopup, updatePeople, sendConnReq) {
    if (!await isValidWebID(person.webId)) {
        createErrorNotification({title: "Invalid webID.", 
            description: "WebID is not a valid URL."});
        return;
    }
    let success = true;
    if (sendConnReq) {
        success = await sendConnectionRequest(webId, pod, person);
    }
    if (success) {
        if (await handleCreateAPerson(person)) {
            closePopup();
            updatePeople();
        }
    }
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
            title={"Add a new person"}
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
            <Group>
                <Button
                    onClick={() => {
                        handleCreatePerson(props.webId, props.pod, 
                            person, props.toggleOpened, props.updatePeople, true);
                    }}
                >
                    Add and Send Connection Request
                </Button>
                <Button
                    onClick={() => {
                        handleCreatePerson(props.webId, props.pod, 
                            person, props.toggleOpened, props.updatePeople, false);
                    }}
                >
                    Just Add
                </Button>
            </Group>
            
        </Modal>
    );
}