import { Paper, Skeleton, Stack, Title } from "@mantine/core";
import {getProfile}from "../../SOLID/ProfileFetcher";
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
        this.state = {
            profileData: {},
            postList: [],
            loading: true,
        }
    }

    async componentDidMount() {
        // Fetch profile
        const [profile, error] = await getProfile(this.podRoot);
        // Fetch posts
        const [posts, errors] = await fetchPosts(this.podRoot + POSTS_DIR);

        this.setState(prevState => (
            {...prevState, 
            profileData: profile,
            postList: posts,
            loading: false
        }))
    }

    render() {
        return (
            <Skeleton visible={this.state.loading}>
                <Stack justify="flex-start" spacing="sm">
                    
                    <Paper shadow="sm" p="md" withBorder style={{width:"100%",}}>
                        <Title>
                            Profile
                        </Title>
                        <Profile profileData={this.state.profileData}/>
                    </Paper>
                    <Paper shadow="sm" p="md" withBorder style={{width:"100%",}}>
                        <Title>
                            Posts
                        </Title>
                        <PostGrid
                            authorised={false}
                            posts={this.state.postList} 
                            host={this}
                        />
                    </Paper>
                </Stack>
            </Skeleton>
        );
    }
}