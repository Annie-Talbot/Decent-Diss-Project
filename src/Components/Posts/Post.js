import { Card, Text, Image, Badge, Menu, ActionIcon, Stack, Grid, Title, Group } from '@mantine/core';
import { useHover } from '@mantine/hooks';
import { IconEdit, IconDotsVertical, IconTrash, IconHandLittleFinger, IconHeart } from '@tabler/icons';
import { IconHeartFilled } from '@tabler/icons-react';
import {Person} from '../Connections/Person';

export function Post(props) {
    const { hovered, ref } = useHover();

    return (
        <Card 
            shadow="sm" 
            radius="md"
            p={12}
            withBorder 
            style={{maxWidth: 600, minWidth: 350, minHeight: 200, paddingBottom: 6}}
        >
            <Card.Section style={{"height": 60}} withBorder>
                <Person person={props.author} viewPerson={props.viewPerson} />
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
            <Stack justify='space-between' >
                <Grid mt="md" mb="xs">
                    <Grid.Col span="auto">
                        <Title order={3}>
                            {props.post.title}
                        </Title>
                    </Grid.Col>
                    <Grid.Col span="content">
                        <Badge color="sage" variant="light">
                            {props.post.datetime && props.post.datetime.toLocaleString()}
                        </Badge>
                    </Grid.Col>
                </Grid>
                {props.post.text? <Text size="md">{props.post.text}</Text>: <></>}
                {!props.authorised ?
                    props.sendLike && 
                    <Group position='center' align='center' p="sm" style={{paddingBottom: 0, height: 50}}>
                        <ActionIcon 
                            ref={ref}
                            color="pink" 
                            size="lg" 
                            title='Send like'
                            onClick={props.sendLike}
                        >
                            {hovered? <IconHeartFilled/> : <IconHeart/>}
                        </ActionIcon>
                    </Group>
                :
                    <Group position='right' align='flex-end' p="sm" style={{paddingBottom: 0, height: 50}}>
                        <Menu shadow="md" width={100} withinPortal>
                            <Menu.Target>
                                <ActionIcon color="sage" size="lg" variant="default">
                                    <IconDotsVertical size={26} />
                                </ActionIcon>
                            </Menu.Target>

                            <Menu.Dropdown>
                                <Menu.Item
                                    onClick={props.editPost}
                                    icon={<IconEdit size={14} />}
                                >
                                    Edit
                                </Menu.Item>
                                <Menu.Item 
                                    onClick={props.deletePost}
                                    color="red" 
                                    icon={<IconTrash size={14} />}>
                                        Delete
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Group>
                }
            </Stack>
        </Card>
    );
}
