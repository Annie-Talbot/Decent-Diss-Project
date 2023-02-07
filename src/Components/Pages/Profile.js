import React from 'react';
import { Avatar, Center, Container, Divider, Paper, Text, LoadingOverlay, SimpleGrid, Stack, Title} from '@mantine/core';
import getProfile from '../../SOLID/ProfileFetcher';

function Profile(profileData)  {
    let dataDisplay = [];
    if (profileData.profilePic) {
        dataDisplay.push(
            (
                <Center>
                    <Avatar radius="md" size="xl" color="sage" 
                        src={profileData.profilePic? profileData.profilePic : null} />
                </Center>
            )
        );
    }
    if (profileData.name) {
        dataDisplay.push((
        <Container style={{ marginLeft: "2%"}}>
            <Title order={3}>Your username: </Title>
            <Text style={{ marginLeft: "10px"}}>{profileData.name}</Text>
        </Container>)
        );
    }
    if (profileData.description) {
        dataDisplay.push((
        <Container style={{ marginLeft: "2%"}}>
            <Title order={3}>About me: </Title>
            <Text style={{ marginLeft: "10px"}}>{profileData.description}</Text>
        </Container>)
        );
    }
    return (
        <Stack>
            {dataDisplay}
        </Stack>
    );
}


class ProfilePage extends React.Component {
    constructor(props) {
        super(props);
        this.app = props.app;

        this.state = {
            loading: true,
            profileData: {}
        }
    }

    async componentDidMount() {
        // TODO: get profile info here
        const profile = await getProfile(this.app.podRootDir);
        console.log(profile);
        this.setState(prevState => (
            {...prevState, 
            loading: false,
            profileData: profile,
        }))

    }

    render() {
        return (
            <Paper p="sm" shadow="xs">
                <LoadingOverlay visible={this.state.loading} overlayBlur={2} />
                {Profile(this.state.profileData)}
            </Paper>
        );
    }
}

export default ProfilePage;