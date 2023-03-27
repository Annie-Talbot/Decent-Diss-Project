import { Center, Paper, Skeleton, Stack, Title, Text } from "@mantine/core";
import { Profile } from "../Profile/Profile";
import React from "react";
import { useState, useEffect } from "react";
import { PostGrid } from "../Posts/PostGrid";
import { findSocialPodFromWebId, sendLike } from "../../SOLID/NotificationHandler";
import { doesProfileExist } from "../../SOLID/ProfileHandler";
import { doesPostsDirExist } from "../../SOLID/PostHandler";

export function PersonView(props) {
    const [loading, setLoading] = useState(true);
    const [podRoot, setPodRoot] = useState("");
    const [error, setError] = useState(null);
    const [profileExists, setProfileExists] = useState(false);
    const [postsExist, setPostsExist] = useState(false);
    
    useEffect(() => {
        findSocialPodFromWebId(props.person.webId).then(async ([pod, e]) => {
            if (e) {
                setError("Unable to fetch this person's data from their pod.")
                return;
            }
            if (pod === null) {
                setError("This user has no valid social pod.")
                return;
            }
            setPodRoot(pod);
            if ((await doesProfileExist(pod))[0]) {
                setProfileExists(true);
            }
            if ((await doesPostsDirExist(pod))[0]) {
                setPostsExist(true);
            }
            setLoading(false);
        })
        
    }, [props.person]);
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
                                author={props.person}
                                user={{podRootDir: podRoot, webId: props.person.webId}}
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