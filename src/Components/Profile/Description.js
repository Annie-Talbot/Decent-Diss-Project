import { Text, Textarea, Title, Grid, Center, ActionIcon, Group } from "@mantine/core";
import { IconKarate, IconTrash } from "@tabler/icons-react";

export function Description(props) {
    if (props.description != null) {
        if (!props.editing) {
            return (
                <div style={{width: "100%"}}>
                    <Group spacing='xs'>
                        <IconKarate />
                        <Title order={4}>Description: </Title>
                    </Group>
                    <Text style={{ marginLeft: "50px"}}>{props.description}</Text>
                </div>
            );
        } else {
            return (
                <Grid grow>
                <Grid.Col span={10}>
                    <Textarea
                        icon={<IconKarate/>}
                        value={props.description}
                        onChange={(event) => props.update(event.currentTarget.value)}
                        placeholder="Hi, I'm Jared, I'm 19, and I never learned how to read."
                        label="Description"
                        description="A little bit about you."
                    />
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