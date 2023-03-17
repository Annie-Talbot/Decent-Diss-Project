import React from 'react';
import { Paper, Title, Text, Stack, Divider, Button, Group, TextInput, LoadingOverlay, Modal, Center, Grid, ActionIcon } from '@mantine/core';
import SolidLoginHandler from '../../SOLID/LoginHandler';
import { AppStates } from '../Core/Constants/AppStates';
import { getDefaultSession, handleIncomingRedirect } from '@inrupt/solid-client-authn-browser';
import { IconArrowBack } from '@tabler/icons';
import { SignUpGuide } from './SignUpGuide';



const PageStates = {
    Main: 0,
    SignUp: 1
}

/**
 * Class to build a SOLID login component, includes a link to create a pod and uses 
 * SolidLoginHandler to complete a log in operation using the URL of a POD provider.
 *
 * @param {string} solidProvider The url of the Solid Pod Provider that 
 * holds the user's pod.
 * @param {string} appName the name of the app requesting access to the POD.
 * @return {string} errMsg The message corresponding to the error recieved.
 * If no error, then the function returns ''.
 */
class LoginPage extends React.Component {
    constructor(props) {
        super(props);
        this.app = props.app;
        this.state = {
            solidProvider: '',
            solidProviderError: '',
            loading: true,
            display: PageStates.Main
        }
    }

    handleLogin(loginController) {     
        const errMsg = SolidLoginHandler(loginController.state.solidProvider, "Decent");
        if (errMsg !== '') {
            loginController.setState(prevState => (
                {...prevState, 
                solidProviderError: errMsg,
            }));
        }
    }

    back(loginPage) {
        loginPage.setState(prevState => ({
            ...prevState,
            display: PageStates.Main
        }))
    }

    inruptLogin(loginController) {
        loginController.setState(prevState => (
            {...prevState, 
                solidProvider: "https://login.inrupt.com",
        }));
    }

    handleInputChange(event) {
        this.setState(prevState => (
            {...prevState, 
                solidProvider: event.target.value,
        }));
    }

    socialDirCreated(app) {
        app.setState(prevState => (
            {...prevState, 
            socialDir: true,
            currPage: AppStates.Profile,
        }))
    }

    async componentDidMount() {
        // Check if we are in the correct state, or if 
        // something has changed e.g. Just been logged in
        if (this.app.state.loggedIn === false) {
            // Check if we've just returned from log in redirect
            await handleIncomingRedirect();
            if (getDefaultSession().info.isLoggedIn) {
                // User has just logged in
                this.app.webId = getDefaultSession().info.webId;
                // set app state to loggedIn and page to social directory page.
                this.app.setState(prevState => ({
                    ...prevState,
                    loggedIn: true,
                    currPage: AppStates.FindSocialDirectory
                }))
                return;
            }
            // Still not logged in
            this.setState(prevState => (
                {...prevState, 
                loading: false,
            }));
            return;
        }
        console.log("oh no");
        // loggedIn is true. Should not be here.
    }

    render() {
        if (this.state.display === PageStates.SignUp) {
            return (<SignUpGuide back={() => this.back(this)}/>);
        }

        return (
            <>
                <LoadingOverlay visible={this.state.loading} overlayBlur={2}/>
                <Center>
                    <Paper shadow="xs" p="md">
                        <Stack align="center" justify="center" spacing="sm" style={{width: "500px"}}>
                            <Title order={2}>Welcome to Decent!</Title>
                            <Title order={3}>
                                Log In
                            </Title>
                            <Grid align="flex-end" justify="space-between" style={{width: "100%"}}>
                                <Grid.Col span={10}>
                                    <TextInput
                                        placeholder="http://login.inrupt.com/"
                                        label="Solid Identity Provider"
                                        size="md"
                                        withAsterisk
                                        value={this.state.solidProvider}
                                        onChange={this.handleInputChange}
                                        error={this.state.solidProviderError}
                                    />
                                </Grid.Col>
                                <Grid.Col span={2}>
                                    <Button  color="blue" onClick={() => {this.inruptLogin(this)}}>Inrupt</Button>
                                </Grid.Col>

                            </Grid>
                            <Group position="center" spacing="sm">
                                <Button onClick={() => {this.handleLogin(this)}}>Log in</Button>
                            </Group>
                            <Divider my="sm"/>
                            <Group position="apart" spacing="sm">
                                <Text>
                                    No POD? Unsure?
                                </Text>
                                <Button onClick={() => {
                                    window.open("https://start.inrupt.com/profile", 
                                        "signup", "popup=true");
                                    this.setState(prevState => ({
                                        ...prevState,
                                        display: PageStates.SignUp
                                    }))
                                }}>
                                    Sign up
                                </Button>
                            </Group>
                        </Stack>
                    </Paper>
                </Center>
            </>
        );
    }
}

export default LoginPage;