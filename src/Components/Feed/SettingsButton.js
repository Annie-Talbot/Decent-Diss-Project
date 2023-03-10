import { Center, ActionIcon } from "@mantine/core";
import { IconSettings } from "@tabler/icons";


export function SettingsButton(props) {
    return (
    <Center>
        <ActionIcon 
            onClick={props.onClick}
            variant='light' 
            color="sage" 
            size="xl"
        >
            <IconSettings/>
        </ActionIcon>
    </Center>);
}