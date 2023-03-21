import { ActionIcon, FileInput, Group, Space, Stack } from "@mantine/core";
import { IconTrash } from "@tabler/icons";

export function PostImageInput(props) {
    if (props.value != null) {
        return (
            <Group position="apart" align='center'>
                <FileInput
                    style={{width: "80%"}}
                    value={props.value}
                    onChange={props.onChange}
                    placeholder="cool_pic.jpg"
                    label="Image"
                    description="Add an image to your post."
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