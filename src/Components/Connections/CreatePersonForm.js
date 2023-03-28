import { ActionIcon, Group, LoadingOverlay, Modal, Space, TextInput } from "@mantine/core";
import { IconSquareRoundedPlusFilled } from "@tabler/icons-react";
import { useState } from "react";
import { backtraceAccess } from "../../SOLID/AccessHandler";
import { createPerson } from "../../SOLID/Connections/PeopleHandler";
import { createConnectionRequest, findSocialPodFromWebId } from "../../SOLID/NotificationHandler";
import { isValidWebID } from "../../SOLID/Utils";
import { createLoadingNotification } from "../Core/Notifications/LoadingNotification";
import { createPlainNotification } from "../Core/Notifications/PlainNotification";

async function handleCreatePerson(user, person, update, close) {
    createLoadingNotification("create-person", "Sending connection request and creating person...", "",
        () => sendConnReqAndCreatePerson(user, person), update);
    close();
}

async function sendConnReqAndCreatePerson(user, person) {
    if (!await isValidWebID(person.webId)) {
        return {success: false, error: {title: "Invalid WebID."}};
    }
    let result = await findSocialPodFromWebId(person.webId);
    if (!result.success) {
        return result;
    }

    result = await createConnectionRequest(user, {webId: person.webId, podRootDir: result.pod});
    if (!result.success) {
        return result;
    }
    createPlainNotification({title: "Sent connection request!"});
    result = await createPerson(user.podRootDir, person);
    if (!result.success) {
        return result;
    }
    return {success: true};
}


export function CreatePersonForm(props) {
    const [person, setPerson] = useState({
        webId: "",
        nickname: "",
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
            <Group position='center'>
                <ActionIcon
                    size='xl'
                    c='sage'
                    onClick={() =>
                        handleCreatePerson(props.user, 
                            person, props.updatePeople, () => {
                                props.toggleOpened();
                                setPerson({webId: "", nickname: ""});
                            })
                    }
                >
                    <IconSquareRoundedPlusFilled size={48}/>
                </ActionIcon>
            </Group>
            
        </Modal>
    );
}