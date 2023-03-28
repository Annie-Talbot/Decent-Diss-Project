import { showNotification, updateNotification } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons";
import { IconCheck } from "@tabler/icons-react";


export async function createLoadingNotification(id, title, message, asyncFunction, onFinish) {
    showNotification({
        id: id,
        title: title,
        message: message,
        color: "sage",
        loading: true,
        autoClose: false,
    })

    let result = await asyncFunction();
    setTimeout(onFinish, 1000);
    if (!result.success) {
        updateNotification({
            id: id,
            color: 'red',
            icon: <IconAlertCircle />,
            title: 'Error',
            message: result.error.title,
            autoClose: 3000,
        })
        return;
    } 
    updateNotification({
        id: id,
        color: 'sage',
        icon: <IconCheck />,
        title: 'Success!',
        message: "",
        autoClose: 2000,
    })
}