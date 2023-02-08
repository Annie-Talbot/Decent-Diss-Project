import { showNotification } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons";


export function createErrorNotification({code, title, description}) {
    showNotification({
        title: code + ": " + title,
        message: description,
        color: 'red',
        icon: <IconAlertCircle />,
        });
}