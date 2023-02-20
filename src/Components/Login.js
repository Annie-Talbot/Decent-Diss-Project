import React from 'react';
import { Paper, Title, Text, Stack, Divider, Button, Group, TextInput, LoadingOverlay, Modal } from '@mantine/core';
import SolidLoginHandler from '../SOLID/LoginHandler';


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
class Login extends React.Component {
    constructor(props) {
        super(props);
        this.app = props.app;
        this.state = {
            solidProvider: '',
            solidProviderError: '',
            loading: true,
        }
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleLogin = this.handleLogin.bind(this)
    }

    async handleLogin(loginController) {     
        const errMsg = await SolidLoginHandler(loginController.state.solidProvider, "Decent");
        if (errMsg !== '') {
            loginController.setState(prevState => (
                {...prevState, 
                solidProviderError: errMsg,
            }));
        }
      }

    handleInputChange(event) {
        this.setState({solidProvider: event.target.value});
    }

    componentDidMount() {
        if (this.app.state.loggedIn == false) {
            this.setState(prevState => (
                {...prevState, 
                loading: false,
            }));
            return;
        }
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
                        <TextInput
                            placeholder="http://localhost:3000/"
                            label="Solid Identity Provider"
                            size="md"
                            withAsterisk
                            value={this.state.solidProvider}
                            onChange={this.handleInputChange}
                            error={this.state.solidProviderError}
                        />
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

export default Login;