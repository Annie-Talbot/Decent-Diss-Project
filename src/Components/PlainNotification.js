import { showNotification } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons";


export function createPlainNotification({title, description}) {
    showNotification({
        title: title,
        message: description,
        color: 'sage',
        });
}