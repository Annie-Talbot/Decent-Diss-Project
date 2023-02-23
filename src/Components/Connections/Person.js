import { Stack, Title, Text, UnstyledButton, Group } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons";
import { isWebIdDecent } from "../../SOLID/ConnectionHandler";
import { createErrorNotification } from "../Core/Notifications/ErrorNotification";
import { createPlainNotification } from "../Core/Notifications/PlainNotification";
import { ViewStates } from "./ConnectionsPage";

async function viewAnotherUser(page, webId) {
    let [podRoot, error] = await isWebIdDecent(webId);
    if (error) {
        createErrorNotification(error);
        return;
    }
    createPlainNotification({
        title: "Success!",
        description: "This user does have a Decent profile!!"
    });
    
    page.viewUserPodRoot = podRoot;
    page.viewUserWebID = webId;
    page.setState(prevState => (
        {...prevState, 
            currView: ViewStates.UserView,
    }));
}


export function Person(props) {
    const person = props.person;
    return (
            <UnstyledButton
                sx={(theme) => ({
                    display: 'block',
                    width: '100%',
                    padding: theme.spacing.xs,
                    borderRadius: theme.radius.sm,
                    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
            
                    '&:hover': {
                        backgroundColor:
                        theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
                    },
                })}
                onClick={() => viewAnotherUser(props.hostPage, person.webId)}>
                <Group position="apart">
                    <Stack justify="flex-start" style={{width: "80%", gap: "0px"}}>
                            <Title order={4}>
                                {person.nickname}
                            </Title>
                        <Text c="dimmed" style={{textIndent: "20px",}}>{person.webId}</Text>
                    </Stack>
                    <IconChevronRight style={{width: "10%"}}/>
                </Group>
                
            </UnstyledButton>
    );
}