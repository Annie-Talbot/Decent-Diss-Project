import { Text, TextInput, Title } from "@mantine/core";


export function Username(props) {
    if (props.name != null) {
        if (!props.editing) {
            return (
                <div style={{width: "100%"}}>
                    <Title order={4}>Username: </Title>
                    <Text style={{ marginLeft: "10px"}}>{props.name}</Text>
                </div>
            );
        } else {
            return (
                <TextInput 
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