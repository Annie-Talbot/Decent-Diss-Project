import { showNotification } from "@mantine/notifications";

export function createPlainNotification({title, description}) {
    showNotification({
        title: title,
        message: description,
        color: 'sage',
        });
}