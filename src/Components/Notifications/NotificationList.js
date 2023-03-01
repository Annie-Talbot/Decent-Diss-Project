import { Skeleton, Stack } from "@mantine/core";
import { createErrorNotification } from "../Core/Notifications/ErrorNotification";
import { useState, useEffect } from "react";
import { Notification } from "./Notification";
import { fetchNotifications } from "../../SOLID/NotificationHandler";


export function NotificationList(props) {
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        fetchNotifications(props.podRootDir).then(([notifs, errors]) => {
            console.log(notifs);
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
                {notifications.map((notif, index) => (<Notification key={index} notification={notif} />))}
            </Stack>
        </Skeleton>
    );
}