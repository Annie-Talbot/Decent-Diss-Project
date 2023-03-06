import { Stack, Title, Text, UnstyledButton, Group } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons";

export function GroupItem(props) {
    const group = props.group;
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
                onClick={props.viewGroup}
                >
                <Group position="apart">
                    <Title order={5}>
                        {group.name}
                    </Title>
                    <IconChevronRight style={{width: "10%"}}/>
                </Group>
                
            </UnstyledButton>
    );
}