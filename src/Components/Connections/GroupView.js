import { Center, Paper, Skeleton, Stack, Title, Text } from "@mantine/core";
import { Profile } from "../Profile/Profile";
import React from "react";
import { useState, useEffect } from "react";
import { PostGrid } from "../Posts/PostGrid";
import { findSocialPodFromWebId } from "../../SOLID/NotificationHandler";
import { doesProfileExist } from "../../SOLID/ProfileHandler";
import { doesPostsDirExist } from "../../SOLID/PostHandler";
import { createErrorNotification } from "../Core/Notifications/ErrorNotification";


export function GroupView(props) {
    // const [loading, setLoading] = useState(true);
    // const [members, setMembers] = useState([]);
    
    // useEffect(() => {
    //     let memberList = [];
    //     props.group.members.forEach(async (member) => {
    //         let [person, error] = await getPerson(member);
    //         if (error) {
    //             createErrorNotification(error);
    //         } else {
    //             memberList.push(person);
    //         }
    //     })
        
    // }, [props.person]);
    return (
        <Skeleton visible={loading}>
            {error ? 
                <Center>
                    <Title order={4}>{error}</Title>
                </Center>
            :
                <Stack justify="flex-start" spacing="sm">
                    <Paper shadow="sm" p="md" withBorder style={{width:"100%",}}>
                        <Title>
                            Profile
                        </Title>
                        {profileExists ?
                            <Profile 
                                userPod={podRoot} 
                                editing={false}
                            />
                        : 
                            <Center>
                                <Text> Could not access this user's profile. </Text>
                            </Center>
                        }
                    </Paper>
                    <Paper shadow="sm" p="md" withBorder style={{width:"100%",}}>
                        <Title>
                            Posts
                        </Title>
                        {postsExist ?
                            <PostGrid
                                podRootDir={podRoot}
                                authorised={false}
                                emptyComponent={(<Center><Text> No posts to see...</Text></Center>)}
                            />
                        : 
                            <Center>
                                <Text> Could not access this user's posts. </Text>
                            </Center>
                        }
                    </Paper>
                </Stack>
            }
        </Skeleton>
        
    );
}