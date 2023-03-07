import React from 'react';
import { Paper, Title, Text, Stack, Divider, Button, Group, TextInput, LoadingOverlay, Modal } from '@mantine/core';
import SolidLoginHandler from '../../SOLID/LoginHandler';
import { AppStates } from '../Core/Constants/AppStates';
import { getDefaultSession, handleIncomingRedirect } from '@inrupt/solid-client-authn-browser';


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
        return (
            <>
                <LoadingOverlay visible={this.state.loading} overlayBlur={2}/>
                <Paper shadow="xs" p="md">
                    <Stack justify="flex-start" spacing="sm">
                        <Title order={2}>Welcome to the decentralised web!</Title>
                        <Text>
                            To get started, you'll need to log in. If you have a 
                            pod already, go to the Log in section. If you don't, 
                            you'll need to sign up for a Pod in the sign up section.
                        </Text>
                        <Divider my="sm"/>
                        <Title order={3}>
                            Log In
                        </Title>
                        <Text>
                            Enter the url of your pod provider and you will be 
                            directed to webpage to authenticate. When you return, 
                            click start session to start using the app.
                        </Text>
                        <Group align="center" position="apart" spacing="sm">
                            <TextInput
                                placeholder="http://login.inrupt.com/"
                                label="Solid Identity Provider"
                                size="md"
                                withAsterisk
                                value={this.state.solidProvider}
                                onChange={this.handleInputChange}
                                error={this.state.solidProviderError}
                                style={{width: "80%"}}
                            />
                            <Button style={{width: "18%"}} color="blue" onClick={() => {this.inruptLogin(this)}}>Inrupt</Button>
                        </Group>
                        
                        <Group position="center" spacing="sm">
                            <Button onClick={() => {this.handleLogin(this)}}>Log in</Button>
                        </Group>
                        <Divider my="sm"/>
                        <Title order={3}>
                            Sign Up
                        </Title>
                        <Group position="apart" spacing="sm">
                            <Text>
                                Looks like you need to create a pod first. Once created, 
                                return to this page to log in and get started.
                            </Text>
                            <a href="https://start.inrupt.com/profile">
                                <Button>Create a POD</Button>
                            </a>
                        </Group>
                    </Stack>
                </Paper>
            </>
        );
    }
}

export default LoginPage;