import { showNotification } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons";


export function createErrorNotification({code, title, description}) {
    if (code) {
        if (code !== -1) title = code + ": " + title;
    }
    showNotification({
        title: title,
        message: description,
        color: 'red',
        icon: <IconAlertCircle />,
        });
}