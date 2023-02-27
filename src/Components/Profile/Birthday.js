import { Text, Textarea, Title, Grid, Center, ActionIcon } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { IconCake, IconTrash } from "@tabler/icons";

export function Birthday(props) {
    if (props.birthday != null) {
        if (!props.editing) {
            return (
                <div style={{width: "100%"}}>
                    <Title order={4}>Birthday: </Title>
                    <Text style={{ marginLeft: "10px"}}>{props.birthday.toISOString().slice(0, 10)}</Text>
                </div>
            );
        } else {
            return (
                <Grid grow>
                <Grid.Col span={10}>
                    <DatePicker
                        value={props.birthday}
                        inputFormat="MM/DD/YYYY"
                        placeholder="Your birthdate"
                        label= "birthday"
                        icon={<IconCake/>}
                        onChange={(event) => props.update(event)}
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