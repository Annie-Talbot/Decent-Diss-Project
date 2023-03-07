import { CreatePersonFromConnReqForm } from "./CreatePersonFromNotificationForm";
import { ActionIcon, Badge, Button, Grid, Group, Stack, Text, Title } from "@mantine/core";
import { useState } from "react";
import { IconTrash } from "@tabler/icons";


export function ConnectionRequestNotification(props) {
    const [popup, setPopup] = useState(false);

    return (
        <Grid align="center" justify="space-between" grow>
            <Grid.Col span={10}>
                <Stack spacing="xs">
                    <CreatePersonFromConnReqForm 
                        opened={popup}
                        closePopup={() => setPopup(false)}
                        webId={props.notif.senderWebId}
                        podRootDir={props.podRootDir}
                    />
                    <Group position="apart">
                        <Title order={5}>
                            Connection request
                        </Title>
                        {props.notif.datetime &&
                            <Badge>
                                {props.notif.datetime.toString().substring(0,24)}   
                            </Badge>
                        }
                    </Group>
                    
                    <Text style={{marginLeft: "10px"}} fz="sm" >From: {props.notif.senderWebId}</Text>
                    {props.notif.message &&
                        <Text style={{marginLeft: "10px"}} fz="sm" >{props.notif.message}</Text>
                    }
                    <Group position="center">
                        <Button onClick={() => setPopup(true)}>
                            Create Person
                        </Button>
                    </Group>
                </Stack>
            </Grid.Col>
            <Grid.Col span={1}>
                <ActionIcon size="lg"  c="red" onClick={props.delete}>
                    <IconTrash />
                </ActionIcon>
            </Grid.Col>
        </Grid>
    );
}