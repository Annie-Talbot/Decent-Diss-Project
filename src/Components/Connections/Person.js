import { Stack, Title, Text, UnstyledButton, Group, Menu, ActionIcon, Grid } from "@mantine/core";
import { IconDotsVertical, IconTrash } from "@tabler/icons-react";

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
        <Grid justify="flex-start" align="center" grow>
            <Grid.Col span={11}>
                <UnstyledButton
                    sx={style}
                    onClick={props.viewPerson}
                >
                        <Stack justify="flex-start" style={{width: "80%", gap: "0px"}}>
                            <Title order={5}>
                                {person.nickname? person.nickname : "Unnamed"}
                            </Title>
                            <Text c="dimmed" style={{textIndent: "20px",}}>{person.webId}</Text>
                        </Stack>
                </UnstyledButton>
            </Grid.Col>
            {props.authorised &&
            <Grid.Col span={1} >
                <Menu>
                    <Menu.Target>
                        <ActionIcon size={"lg"} >
                            <IconDotsVertical />
                        </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item
                            color="red"
                            icon={<IconTrash size={14} />}
                            onClick={props.delete}
                        >  
                            Delete
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Grid.Col>
            }
        </Grid>
    );
}