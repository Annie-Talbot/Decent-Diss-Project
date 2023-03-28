import { Paper, Stack, Text } from "@mantine/core";
import { NOTIFICATIONS_TYPES } from "../../SOLID/NotificationHandler";
import { ConnectionRequestNotification } from "./ConnReqNotification";
import { LikeNotification } from "./LikeNotification";

export function Notification(props) {
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
    } else if (notif.type === NOTIFICATIONS_TYPES.Like){
        content = (
            <LikeNotification
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