import { showNotification } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons";


export function createErrorNotification(error) {
    if (error.code) {
        if (error.code !== -1) error.title = error.code + ": " + error.title;
    }
    showNotification({
        title: error.title,
        message: error.description,
        color: 'red',
        icon: <IconAlertCircle />,
        });
}