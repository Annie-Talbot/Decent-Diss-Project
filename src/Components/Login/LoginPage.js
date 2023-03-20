import { useEffect, useState } from 'react';
import { Paper, Title, Text, Stack, Divider, Button, Group, 
    TextInput, LoadingOverlay, Image, Grid } from '@mantine/core';
import { loginHandler, getSession } from '../../SOLID/LoginHandler';
import { SignUpGuide } from './SignUpGuide';
import logo from '../../assets/Logo.png'



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
function LoginPage(props) {
    const [solidProvider, setSolidProvider] = useState("");
    const [solidProviderError, setSolidProviderError] = useState("");
    const [loading, setLoading] = useState(true);
    const [display, setDisplay] = useState(PageStates.Main);

    let handleLogin = async function () {     
        const result = await loginHandler(solidProvider, "Decent");
        if (!result.success) {
            setSolidProviderError(result.error);
        }
    }

    useEffect(() => {
        // Check if we've just returned from log in redirect
        getSession().then((result) => {
            if (result.loggedIn) {
                props.setUser(result);
                props.redirect();
                return;
            }
            // Not logged in, display the log in page
            setLoading(false);
            return;
        });
    }, [props]);

    if (display === PageStates.SignUp) {
        return (<SignUpGuide back={() => setDisplay(PageStates.Main)}/>);
    }

    return (
        <>
            <LoadingOverlay visible={loading} overlayBlur={2}/>
            <Grid  p={200} grow>
            <Grid.Col span={6}>
                <Stack align='center' >
                    <Title>Welcome to Decent!</Title>
                    <Image maw={240} mx="auto" src={logo}/>
                </Stack>
                
            </Grid.Col>
            <Grid.Col span={6}>
                <Paper p='lg' shadow='sm' withBorder>
                <Stack align="center" justify="center" spacing="sm" style={{width: "500px"}}>
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
                                    value={solidProvider}
                                    onChange={(e) => setSolidProvider(e.currentTarget.value)}
                                    error={solidProviderError}
                                />
                            </Grid.Col>
                            <Grid.Col span={2}>
                                <Button  color="blue" onClick={() => setSolidProvider(
                                    "https://login.inrupt.com"
                                )}>Inrupt</Button>
                            </Grid.Col>

                        </Grid>
                        <Group position="center" spacing="sm">
                            <Button onClick={() => handleLogin(this)}>Log in</Button>
                        </Group>
                        <Divider my="sm"/>
                        <Group position="apart" spacing="sm">
                            <Text>
                                No POD? Unsure?
                            </Text>
                            <Button onClick={() => {
                                window.open("https://start.inrupt.com/profile", 
                                    "signup", "popup=true");
                                setDisplay(PageStates.SignUp);
                            }}>
                                Sign up
                            </Button>
                        </Group>
                    </Stack>
                </Paper>
            </Grid.Col>
        </Grid>
        </>
    );
}





export default LoginPage;