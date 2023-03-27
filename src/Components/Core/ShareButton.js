import { Button, Group, Text, Space, MediaQuery } from "@mantine/core";
import { IconCopy } from "@tabler/icons-react";
import { createPlainNotification } from "./Notifications/PlainNotification";

export function ShareButton(props) {
    const msg = "Add me on Decent!\n" + props.webId;
    return (
        <Button
            variant="light"
            color="pink" 
            onClick={() => {
            navigator.clipboard.writeText(msg);
            createPlainNotification({title: "Copied to clipboard!", description: msg});
        }}>
        <Group>
            <MediaQuery smallerThan='sm' styles={{display: 'none'}}>
                <Text>Invite friends </Text>
            </MediaQuery>
            <IconCopy/>
        </Group>
        </Button>
        
    );
}