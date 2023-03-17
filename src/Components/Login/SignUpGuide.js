import { ActionIcon, ThemeIcon, Stack, Container, Grid, Group, List, Paper, Stepper, Title, Text, Image, HoverCard } from "@mantine/core";
import { IconArrowBack, IconArrowLeft, IconArrowRight, IconCircleCheck, IconQuestionMark } from "@tabler/icons";
import { useState } from "react";
import agree from './../../assets/Sign_up_agree.png'
import signup from './../../assets/sign_up_button.png'
import credentials from './../../assets/sign_up_details.png'
import verify from './../../assets/sign_up_verify_link.png'
import continue_button from './../../assets/sign_up_continue.png'

export function SignUpGuide(props) {
    const [active, setActive] = useState(0);
    const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current));
    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));
  
    return (
        <Paper shadow="xs" p="md">
            <Grid grow align="center" justify="flex-start">
                <Grid.Col span={1}>
                    <ActionIcon onClick={props.back} >
                        <IconArrowBack />
                    </ActionIcon>
                </Grid.Col>
                <Grid.Col span={8}>
                    <Title align="right" order={2}>Sign Up Guide</Title>
                </Grid.Col>
            </Grid>
            <Container p="lg">
                <Stepper active={active} onStepClick={setActive} breakpoint="sm">
                <Stepper.Step label="First step" description="Accept in-development warning">
                    <Group align="center" position="center" >
                        <Container style={{width: "50%"}}>
                            <Group>
                                <Title style={{width: "80%"}} order={3}>Agree to not store sensitive data in your POD.</Title>
                                <HoverCard width={280} shadow="md">
                                    <HoverCard.Target>
                                        <ActionIcon c="sage" variant="light">
                                            <IconQuestionMark />
                                        </ActionIcon>
                                        
                                    </HoverCard.Target>
                                    <HoverCard.Dropdown>
                                        <Text style={{marginLeft: "10px"}}>The warning is to make your aware that the server that 
                                            hosts the data in your POD is not secured to production standard. Because of this they 
                                            ask you to agree to not store any sensitive information in your POD.
                                        </Text>
                                    </HoverCard.Dropdown>
                                </HoverCard>
                            </Group>
                            <List type="ordered" withPadding>
                                <List.Item>Select your closest location.</List.Item>
                                <List.Item>Tick agree check box.</List.Item>
                                <List.Item>Click Log In/Sign Up button.</List.Item>
                            </List>
                        </Container>
                        <Image 
                            style={{width: "40%"}}
                            src={agree}
                        />
                    </Group>
                    
                </Stepper.Step>
                <Stepper.Step label="Second step" description="Create an account">
                        <Container withPadding style={{width: "80%"}}>
                            <Title order={3}>Create your account</Title>
                            <List type="ordered" withPadding>
                                <List.Item>
                                    <Stack>
                                        <Text>Select Sign Up (under the log in button).</Text>
                                        <Image 
                                            width={300}
                                            src={signup}
                                        />
                                    </Stack>
                                </List.Item>
                                <List.Item>
                                    <Stack>
                                        <Text >Fill in your details.</Text>
                                        <Image 
                                            width={300}
                                            src={credentials}
                                        />
                                    </Stack>
                                    </List.Item>
                                <List.Item>Click Sign Up</List.Item>
                            </List>
                        </Container>
                </Stepper.Step>
                <Stepper.Step label="Final step" description="Verify your email">
                    <Container withPadding style={{width: "80%"}}>
                            <Title order={3}>Verify your email</Title>
                            <List type="ordered" withPadding>
                                <List.Item>Check your email inbox</List.Item>
                                <List.Item>
                                    <Stack>
                                        <Text>Click the verification link in the email.</Text>
                                        <Image 
                                            width={300}
                                            src={verify}
                                        />
                                    </Stack>
                                </List.Item>
                                <List.Item>
                                    <Stack>
                                        <Text>Return to the log in page, and click continue.</Text>
                                        <Image 
                                            width={300}
                                            src={continue_button}
                                        />
                                    </Stack>
                                </List.Item>
                            </List>
                        </Container>
                </Stepper.Step>
                <Stepper.Completed>
                    <Stack align="center" justify="center" style={{height: "100%"}}>
                        <ThemeIcon 
                        variant="light"
                        size="xl">
                            <IconCircleCheck />
                        </ThemeIcon>
                        <Text size={"lg"}>Completed!</Text>
                        <Text>Click the back button in the top left to return to the login screen.</Text>
                    </Stack>
                </Stepper.Completed>
                </Stepper>

                <Group position="center" mt="xl">
                    <ActionIcon size="lg" variant="light" onClick={prevStep}>
                        <IconArrowLeft />
                    </ActionIcon>
                    <ActionIcon size="lg" variant="light" c="sage" onClick={nextStep}>
                        <IconArrowRight />
                    </ActionIcon>
                </Group>
            </Container>
            
        </Paper>
    );
  }