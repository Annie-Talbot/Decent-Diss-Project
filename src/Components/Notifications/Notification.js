import { Badge, Button, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { NOTIFICATIONS_TYPES } from "../../SOLID/NotificationHandler";
import { CONNECTIONS_DIR, PEOPLE_DATASET } from "../../SOLID/Utils";
import { CreatePersonFromConnReqForm } from "./CreatePersonFromNotificationForm";
import { useState } from "react";

export function Notification(props) {
    const [popup, setPopup] = useState(false);

    const notif = props.notification;
    let content;
    if (notif.type === NOTIFICATIONS_TYPES.ConnectionRequest) {
        content = (
            <Stack>
                <CreatePersonFromConnReqForm 
                    opened={popup}
                    closePopup={() => setPopup(false)}
                    webId={notif.senderWebId}
                    podRootDir={props.podRootDir}
                />
                <Group position="apart">
                    <Title order={4}>
                        Connection request
                    </Title>
                    {notif.datetime &&
                        <Badge>
                            {notif.datetime.toString().substring(0,24)}   
                        </Badge>
                    }
                </Group>
                
                <Text>From: {notif.senderWebId}</Text>
                {notif.msg &&
                    <Text>{notif.msg}</Text>
                }
                <Group position="center" spacing="xl">
                    <Button onClick={() => setPopup(true)}>
                        Create Person
                    </Button>
                    <Button onClick={props.delete}>
                        Ignore
                    </Button>
                </Group>
            </Stack>);
    } else {
        content = (<Stack>
            <Text> Notification of unknown type found. URL: </Text>
            <Text>{notif.url}</Text>
        </Stack>);
    }
    return (
        <Paper p="md" withBorder>
            {content}
        </Paper>
    );
}