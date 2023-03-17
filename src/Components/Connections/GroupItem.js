import { Title, UnstyledButton, Group, Grid, Menu, ActionIcon } from "@mantine/core";
import { IconChevronRight, IconDotsVertical, IconTrash } from "@tabler/icons-react";

export function GroupItem(props) {
    const group = props.group;
    return (
        <Grid justify="flex-start" align="center" grow>
            <Grid.Col span={11}>
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
                    onClick={props.viewGroup}
                >
                    <Title order={5}>
                        {group.name}
                    </Title>
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