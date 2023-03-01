import { Badge, Button, Grid, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { NOTIFICATIONS_TYPES } from "../../SOLID/NotificationHandler";



export function Notification(props) {
    const notif = props.notification;
    let content;
    if (notif.type === NOTIFICATIONS_TYPES.ConnectionRequest) {
        content = (
            <Stack>
                <Group position="apart">
                    <Title order={4}>
                        Connection request
                    </Title>
                    {notif.datetime &&
                        <Badge>
                            {notif.datetime.toString().substring(0,24)}   
                        </Badge>
                    }
                </Group>
                
                <Text>From: {notif.senderWebId}</Text>
                {notif.msg &&
                    <Text>{notif.msg}</Text>
                }
                <Group position="center" spacing="xl">
                    <Button>
                        Create Person
                    </Button>
                    <Button>
                        Send Friend Request Back
                    </Button>
                    <Button>
                        Ignore
                    </Button>
                </Group>
            </Stack>);
    } else {
        content = (<Stack>
            <Text> Notification of unknown type found. URL: </Text>
            <Text>{notif.url}</Text>
        </Stack>);
    }
    return (
        <Paper p="md" withBorder>
            {content}
        </Paper>
    );
}