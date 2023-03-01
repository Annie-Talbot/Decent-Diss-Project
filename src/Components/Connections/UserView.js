import { Center, Paper, Skeleton, Stack, Title, Text } from "@mantine/core";
import { Profile } from "../Profile/Profile";
import React from "react";
import { fetchPosts } from "../../SOLID/PostHandler";
import { POSTS_DIR } from "../../SOLID/Utils";
import { PostGrid } from "../Posts/PostGrid";


export class UserView extends React.Component {

    constructor(props) {
        super(props);
        this.podRoot = props.podRoot;
        this.webID = props.webID;
    }

    render() {
        return (
            <Stack justify="flex-start" spacing="sm">
                
                <Paper shadow="sm" p="md" withBorder style={{width:"100%",}}>
                    <Title>
                        Profile
                    </Title>
                    <Profile 
                        userPod={this.podRoot} 
                        editing={false}
                    />
                </Paper>
                <Paper shadow="sm" p="md" withBorder style={{width:"100%",}}>
                    <Title>
                        Posts
                    </Title>
                    <PostGrid
                        podRootDir={this.podRoot}
                        authorised={false}
                        emptyComponent={(<Center><Text> No posts to see...</Text></Center>)}
                    />
                </Paper>
            </Stack>
        );
    }
}