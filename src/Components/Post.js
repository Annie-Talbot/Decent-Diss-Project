import { Group, Card, Text, Image, Badge, Menu, ActionIcon, Stack, Grid } from '@mantine/core';
import { IconTrash, IconEdit, IconDotsVertical } from '@tabler/icons';
export default function Post(post) {
    return (
        <Card shadow="sm" p="lg" radius="md" withBorder style={{"maxWidth": 600}}>
            <Card.Section withBorder >
            <Image
                    radius="md"
                    fit="contain"
                    height={160}
                    src={post.post.image}
                />
            </Card.Section>

            <Grid mt="md" mb="xs">
                <Grid.Col span="auto">
                    <Text size="md">{post.post.text}</Text>
                </Grid.Col>
                <Grid.Col span="content">
                    <Stack style={{"minHeight": 100}} align="flex-end" justify="space-between">
                        <Badge color="sage" variant="light">
                            {post.post.datetime}
                        </Badge>
                        <Menu shadow="md" width={200}>
                            <Menu.Target>
                            <ActionIcon color="sage" size="lg" variant="default">
                                <IconDotsVertical size={26} />
                            </ActionIcon>
                            </Menu.Target>

                            <Menu.Dropdown>
                                <Menu.Item icon={<IconEdit size={14} />}>Edit</Menu.Item>
                                <Menu.Item color="red" icon={<IconTrash size={14} />}>Delete</Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Stack>
                </Grid.Col>
            </Grid>
        </Card>
    );
}