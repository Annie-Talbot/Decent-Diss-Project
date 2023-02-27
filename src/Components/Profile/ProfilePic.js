import { ActionIcon, Avatar, Center, FileInput, Grid, Group } from "@mantine/core";
import { IconTrash, IconUpload } from "@tabler/icons";


export function ProfilePic(props) {
    if (props.pic != null) {
        if (!props.editing) {
            return (
                <Center>
                    <Avatar radius="md" size="xl" color="sage" 
                        src={props.pic? URL.createObjectURL(props.pic) : null} />
                </Center>
            );
        } else {
            return (
                <Grid grow>
                <Grid.Col span={10}>
                    <Group>
                        <Avatar radius="md" size="xl" color="sage" 
                                src={props.pic? URL.createObjectURL(props.pic) : null} />
                        <FileInput
                            value={props.pic}
                            style={{width: "50%"}} 
                            label="Select file" 
                            icon={<IconUpload />} 
                            onChange={(event) => props.update(event)}
                        />
                    </Group>
                </Grid.Col>
                <Grid.Col span={1}>
                    <Center style={{height: "100%", width: "100%"}}>
                    <ActionIcon
                        onClick={props.delete}
                        c="red"
                    >
                        <IconTrash/>
                    </ActionIcon>
                    </Center>
                </Grid.Col>                
            </Grid>
            );
        }
    }
}