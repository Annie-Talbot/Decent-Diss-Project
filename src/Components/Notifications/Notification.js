import { Paper, Stack, Text } from "@mantine/core";
import { NOTIFICATIONS_TYPES } from "../../SOLID/NotificationHandler";
import { ConnectionRequestNotification } from "./ConnReqNotification";

export function Notification(props) {
    console.log(props.notification);
    const notif = props.notification;
    let content;
    if (notif.type === NOTIFICATIONS_TYPES.ConnectionRequest) {
        content = (
            <ConnectionRequestNotification
                user={props.user}
                notif={notif}
                delete={props.delete}
            />
        );
    } else {
        content = (<Stack>
            <Text> Notification of unknown type found. URL: </Text>
            <Text>{notif.url}</Text>
        </Stack>);
    }
    return (
        <Paper p="md" shadow="md" withBorder>
            {content}
        </Paper>
    );
}