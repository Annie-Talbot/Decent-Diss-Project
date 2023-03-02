import { Stack, Title, Text, UnstyledButton, Group } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons";

export function Person(props) {
    const person = props.person;
    return (
            <UnstyledButton
                sx={(theme) => ({
                    display: 'block',
                    width: '100%',
                    padding: theme.spacing.xs,
                    borderRadius: theme.radius.sm,
                    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
            
                    '&:hover': {
                        backgroundColor:
                        theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
                    },
                })}
                onClick={() => props.viewUser()}>
                <Group position="apart">
                    <Stack justify="flex-start" style={{width: "80%", gap: "0px"}}>
                            <Title order={5}>
                                {person.nickname}
                            </Title>
                        <Text c="dimmed" style={{textIndent: "20px",}}>{person.webId}</Text>
                    </Stack>
                    <IconChevronRight style={{width: "10%"}}/>
                </Group>
                
            </UnstyledButton>
    );
}