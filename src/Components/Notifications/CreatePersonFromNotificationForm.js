import { Button, Group, Modal, Space, TextInput } from "@mantine/core";
import { createPerson } from "../../SOLID/Connections/PeopleHandler";
import { isValidWebID } from "../../SOLID/Utils";
import { createErrorNotification } from "../Core/Notifications/ErrorNotification";
import { useState } from "react";
import { addLatestToFeed, followPerson } from "../../SOLID/FeedHandler";
import { findSocialPodFromWebId } from "../../SOLID/NotificationHandler";


async function handleCreatePerson(user, person, closePopup) {
    if (!await isValidWebID(person.webId)) {
        createErrorNotification({title: "Invalid webID.", 
            description: "WebID is not a valid URL."});
        return;
    }
    const error = await createPerson(user.podRootDir, person);
    if (error) {
        createErrorNotification(error);
        return;
    }
    findSocialPodFromWebId(person.webId).then(async ([podRoot, error]) => {
        if (error) {
            return;
        }
        await addLatestToFeed({podRootDir: user.podRootDir}, 
            {webId: person.webId, podRootDir: podRoot});
        await addLatestToFeed({podRootDir: podRoot}, 
            {webId: user.webId, podRootDir: user.podRootDir});

    })
    // fetch feed items from person,
    // send feed items to person

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
            <Group>
                <Button
                    onClick={() => {
                        handleCreatePerson(props.user, person, props.closePopup);
                    }}
                >
                    Add
                </Button>
            </Group>
            
        </Modal>
    );
}