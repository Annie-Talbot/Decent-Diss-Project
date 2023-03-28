import { CreatePersonFromConnReqForm } from "./CreatePersonFromNotificationForm";
import { ActionIcon, Badge, Button, Grid, Group, Stack, Text, Title } from "@mantine/core";
import { useState } from "react";
import { IconTrash } from "@tabler/icons";
import { IconSquareRoundedPlusFilled } from "@tabler/icons-react";


export function ConnectionRequestNotification(props) {
    const [popup, setPopup] = useState(false);

    return (
        <Group position="apart" >
            <CreatePersonFromConnReqForm 
                opened={popup}
                closePopup={() => setPopup(false)}
                webId={props.notif.senderWebId}
                user={props.user}
                delete={props.delete}
            />
            <Stack justify='apart' >
                <Title order={5}>New connection request!</Title>
                <Text style={{marginLeft: "20px"}} fz="sm" >Sent from {props.notif.senderWebId}</Text>
                {props.notif.datetime &&
                    <Badge>
                        Sent {props.notif.datetime.toString().substring(0,24)}   
                    </Badge>
                }
            </Stack>
            <Stack justify='center' >
                <ActionIcon
                    size='lg'
                    color='sage'
                    onClick={() => setPopup(true)}
                >
                    <IconSquareRoundedPlusFilled size={32} />
                </ActionIcon>
                <ActionIcon size="lg"  c="red" onClick={props.delete}>
                    <IconTrash />
                </ActionIcon>
            </Stack>
        </Group>
    );
}