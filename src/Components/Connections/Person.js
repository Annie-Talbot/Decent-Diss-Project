import { Stack, Title, Text, UnstyledButton, Group } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons";

export function Person(props) {
    const person = props.person;
    let style;
    if (props.viewPerson === undefined) {
        style = (theme) => ({
            display: 'block',
            width: '100%',
            padding: "2px 2px 2px 15px",
            borderRadius: theme.radius.sm,
            color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
        });
    } else {
        style = (theme) => ({
            display: 'block',
            width: '100%',
            padding: "2px 2px 2px 15px",
            borderRadius: theme.radius.sm,
            color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
    
            '&:hover': {
                backgroundColor:
                theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
            },
        });
    }
    return (
            <UnstyledButton
                sx={style}
                onClick={props.viewPerson}>
                <Stack justify="flex-start" style={{width: "80%", gap: "0px"}}>
                        <Title order={5}>
                            {person.nickname}
                        </Title>
                    <Text c="dimmed" style={{textIndent: "20px",}}>{person.webId}</Text>
                </Stack>
                
            </UnstyledButton>
    );
}