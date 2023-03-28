import { ActionIcon, Button, Group, Modal, Space, TextInput } from "@mantine/core";
import { createPerson } from "../../SOLID/Connections/PeopleHandler";
import { isValidWebID } from "../../SOLID/Utils";
import { createErrorNotification } from "../Core/Notifications/ErrorNotification";
import { useState } from "react";
import { addLatestToFeed, followPerson } from "../../SOLID/FeedHandler";
import { findSocialPodFromWebId } from "../../SOLID/NotificationHandler";
import { createLoadingNotification } from "../Core/Notifications/LoadingNotification";
import { backtraceAccess } from "../../SOLID/AccessHandler";
import { IconSquareRoundedPlusFilled } from "@tabler/icons-react";





async function handleCreatePerson(user, person, closePopup, deleteNotification) {
    console.log("create")
    console.log(user);
    console.log(person)
    if (!await isValidWebID(person.webId)) {
        createErrorNotification({title: "Invalid webID.", 
            description: "WebID is not a valid URL."});
        return;
    }
    createLoadingNotification("add-person", "Adding person...", "",
        async () => {
            let result = await createPerson(user.podRootDir, person);
            if (!result.success) {
                return result;
            }
            await findSocialPodFromWebId(person.webId).then(async (result) => {
                if (!result.success) {
                    return result;
                }
                await addLatestToFeed({webId: user.webId, podRootDir: user.podRootDir}, 
                    {webId: person.webId, podRootDir: result.pod});
                await addLatestToFeed({webId: person.webId, podRootDir: result.pod}, 
                    {webId: user.webId, podRootDir: user.podRootDir});
            })
            return {success: true};
        }, deleteNotification
    );
    closePopup();
}

export function CreatePersonFromConnReqForm(props) {
    const [person, setPerson] = useState({
        webId: props.webId,
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
            onClose={props.closePopup}
        >
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
            <Group position='center' >
                <ActionIcon
                    size='xl'
                    color='sage'
                    onClick={() => {
                        handleCreatePerson(props.user, person, () => {
                            props.closePopup();
                            setPerson(prev => ({...prev, nickname: ""}));
                        }, props.delete);
                    }}
                >
                    <IconSquareRoundedPlusFilled size={48} />
                </ActionIcon>
            </Group>
            
        </Modal>
    );
}