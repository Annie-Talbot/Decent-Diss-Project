import { Card, Text, Image, Badge, Menu, ActionIcon, Stack, Grid, Title } from '@mantine/core';
import { IconEdit, IconDotsVertical, IconTrash } from '@tabler/icons';
import {Person} from '../Connections/Person';

export function Post(props) {
    return (
        <Card shadow="sm" p="lg" radius="md" withBorder style={{"maxWidth": 600}}>
            <Card.Section style={{"height": 55}} withBorder>
                <Person person={props.author}/>
            </Card.Section>
            {props.post.image? 
                <Card.Section style={{"height": 300}} withBorder >
                    <Image
                            radius="md"
                            fit="contain"
                            height={300}
                            src={props.post.image}
                        />
                </Card.Section>
            :<></>}
            
            <Grid mt="md" mb="xs">
                <Grid.Col span="auto">
                    <Title order={3}>
                        {props.post.title}
                    </Title>
                </Grid.Col>
                <Grid.Col span="content">
                    <Badge color="sage" variant="light">
                        {props.post.datetime}
                    </Badge>
                </Grid.Col>
                {props.authorised? 
                    <Grid.Col span="content">
                        <Menu shadow="md" width={100} withinPortal>
                            <Menu.Target>
                                <ActionIcon color="sage" size="lg" variant="default">
                                    <IconDotsVertical size={26} />
                                </ActionIcon>
                            </Menu.Target>

                            <Menu.Dropdown>
                                <Menu.Item icon={<IconEdit size={14} />}>Edit</Menu.Item>
                                <Menu.Item 
                                    onClick={props.deletePost}
                                    color="red" 
                                    icon={<IconTrash size={14} />}>
                                        Delete
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Grid.Col> 
                : 
                    <></>
                }
            </Grid>
            {props.post.text? <Text size="md">{props.post.text}</Text>: <></>}
        </Card>
    );
}
