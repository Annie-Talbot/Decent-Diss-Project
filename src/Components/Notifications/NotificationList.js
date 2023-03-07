import { Stack, ThemeIcon, Text } from "@mantine/core";
import { Notification } from "./Notification";
import { IconBeach } from "@tabler/icons";

function EmptyNotifications() {
    return (
        <Stack align="center" justify="center">
            <ThemeIcon 
            variant="light"
            size="xl">
                <IconBeach />
            </ThemeIcon>
            <Text size={"lg"}>No notifications</Text>
        </Stack>
    );
}


export function NotificationList(props) {
    console.log(props.notifications)
    return (
        <>
            {props.notifications.length > 0 ?
                <Stack spacing="xs">
                    {props.notifications.map((notif, index) => (
                        <Notification 
                            key={index} 
                            notification={notif} 
                            delete={() => props.deleteNotification(notif.url)}
                            podRootDir={props.podRootDir}
                        />
                    ))}
                </Stack>
            :
                <EmptyNotifications />
            }
        </>
    );
}