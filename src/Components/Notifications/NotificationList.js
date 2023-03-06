import { Skeleton, Stack } from "@mantine/core";
import { createErrorNotification } from "../Core/Notifications/ErrorNotification";
import { useState, useEffect } from "react";
import { Notification } from "./Notification";
import { deleteNotification, fetchNotifications } from "../../SOLID/NotificationHandler";
import { createPlainNotification } from "../Core/Notifications/PlainNotification";

async function handleDeleteNotification(notifUrl, notifIndex, notifications, setNotifications) {
    const error = await deleteNotification(notifUrl);
    if (error) {
        createErrorNotification(error);
        return;
    }
    createPlainNotification({title: "Success", description: "Successfully deleted notification!"});
    let list = [...notifications];
    list.splice(notifIndex, 1);
    setNotifications(list);
}


export function NotificationList(props) {
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        fetchNotifications(props.podRootDir).then(([notifs, errors]) => {
            if (errors) {
                errors.forEach((error) => createErrorNotification(error));
            }
            setNotifications(notifs);
            setLoading(false);
        })
        
    }, [props.podRootDir]);

    return (
        <Skeleton visible={loading}>
            <Stack spacing="sm">
                {notifications.map((notif, index) => (
                    <Notification 
                        key={index} 
                        notification={notif} 
                        delete={() => handleDeleteNotification(notif.url, index, 
                            notifications, setNotifications)}
                        podRootDir={props.podRootDir}
                    />
                ))}
            </Stack>
        </Skeleton>
    );
}