import { Center, Drawer, Stack, Group, Text, ActionIcon, Indicator } from "@mantine/core";
import { createNotificationsDir, createNotificationSocket, deleteNotification, doesNotificationsDirExist, fetchNotifications } from "../../SOLID/NotificationHandler";
import { createErrorNotification } from "../Core/Notifications/ErrorNotification";
import { createPlainNotification } from "../Core/Notifications/PlainNotification";
import { NotificationList } from "./NotificationList";
import { useDisclosure } from "@mantine/hooks";
import { IconBellRinging } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { MissingPodStructure } from "../Core/MissingPodStructure";
import { SettingsButton } from "../Feed/SettingsButton";
import { PageHeader } from "../Core/PageHeader";
import { BlockSettings } from "./BlockSettings";


async function handleDeleteNotification(notifUrl, updateNotifications) {
    const error = await deleteNotification(notifUrl);
    if (error) {
        createErrorNotification(error);
        return;
    }
    createPlainNotification({title: "Success", description: "Successfully deleted notification!"});
    updateNotifications();
}

async function updateNotifications(podRootDir, setNotifications, setAlert) {
    let [notifs, errors] = await fetchNotifications(podRootDir);
    errors.forEach(e => {
        createErrorNotification(e);
    });
    setAlert(notifs.length);
    setNotifications(notifs);
}

export function Notifications(props) {
    const [opened, {open, close}] = useDisclosure(false);
    const [alert, setAlert] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [exists, setExists] = useState(false);
    const [error, setError] = useState("");
    const [viewSettings, setViewSettings] = useState(false);

    useEffect(() => {
        doesNotificationsDirExist(props.user.podRootDir).then(async ([success, e]) => {
            if (e) {
                setError(e.title);
                return;
            }
            if (!success) {
                return;
            }
            setExists(true);
            let [notifs, errors] = await fetchNotifications(props.podRootDir);
            errors.forEach(e => {
                createErrorNotification(e);
            });
            setAlert(notifs.length);
            setNotifications(notifs);
            // Set up socket
            e = await createNotificationSocket(props.podRootDir, () => updateNotifications(props.podRootDir, 
                    setNotifications, setAlert));
            if (e) createErrorNotification(e);
        })
    }, [props.podRootDir]);

    return (
        <>
            <Drawer size="40%" padding="md" opened={opened} onClose={close}>
                {error !== "" ?
                    <Center><Text>An error occured: {error}. Try again later.</Text></Center>
                :
                    <>
                        {!exists?
                            <MissingPodStructure
                                podRootDir={props.user.podRootDir}
                                podStructureRequired="notifications directory"
                                createFunction={createNotificationsDir}
                                setExists={setExists}
                            />
                        :
                            <Stack p='md'>
                                <PageHeader
                                    back={() => setViewSettings(false)}
                                    backDisabled={viewSettings === false}
                                    title={viewSettings? 'Notification Settings' : 'Notifications'}
                                    actionButton={<SettingsButton onClick={() => setViewSettings(true)}/>}
                                    actionDisabled={viewSettings}
                                />
                                {!viewSettings?
                                    <NotificationList
                                        podRootDir={props.user.podRootDir}
                                        notifications={notifications}
                                        deleteNotification={(notifUrl) => 
                                            handleDeleteNotification(notifUrl, () => 
                                                updateNotifications(props.user.podRootDir, setNotifications, 
                                                    setAlert))}
                                    />
                                :
                                    <BlockSettings user={props.user} />
                                }
                            </Stack>
                        }
                    </>
                }
            </Drawer>
            <Indicator 
                disabled={!alert > 0} 
                offset={6} 
                inline 
                position="top-start" 
                label={alert} 
                withBorder 
                size={22} 
                color="rouge.4"
            >
                <ActionIcon color="sage" onClick={open} size="xl" >
                    <IconBellRinging />
                </ActionIcon>
            </Indicator>
        </>
    )
}