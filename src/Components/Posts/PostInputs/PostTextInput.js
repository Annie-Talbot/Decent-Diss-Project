import { ActionIcon, Group, Space, Stack, Textarea } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";


export function PostTextInput(props) {
    if (props.value != null) {
        return (
            <Group position="apart" align='center'>
                <Textarea
                    style={{width: "80%"}}
                    value={props.value}
                    onChange={props.onChange}
                    placeholder="Wow this new decentralised social media is really cool!"
                    label="Add Some Text"
                    description="The text to be included in the body of your post."
                />
                <ActionIcon
                    onClick={props.delete}
                    c="red"
                >
                    <IconTrash/>
                </ActionIcon>
            </Group>
        );
    } else {
        return (<></>);
    }
}