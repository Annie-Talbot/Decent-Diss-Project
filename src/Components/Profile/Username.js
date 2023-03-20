import { Text, TextInput, Title, Group } from "@mantine/core";
import { IconUser } from "@tabler/icons-react";


export function Username(props) {
    if (props.name != null) {
        if (!props.editing) {
            return (
                <div style={{width: "100%"}}>
                    <Group spacing='xs'>
                        <IconUser />
                        <Title order={4}>Username: </Title>
                    </Group>
                    <Text style={{ marginLeft: "50px"}}>{props.name}</Text>
                </div>
            );
        } else {
            return (
                <TextInput 
                    icon={<IconUser/>}
                    value={props.name}
                    onChange={(event) => props.update(event.currentTarget.value)}
                    placeholder="CoolKid123"
                    label="Username"
                    description="A name to be recognised by."
                    withAsterisk
                />
            );
        }
    }
}