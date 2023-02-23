import { Button, Space, Group, Modal, Text } from '@mantine/core';
import { createSocialDirectory } from '../../SOLID/SocialDirHandler';
import { SOCIAL_ROOT } from '../../SOLID/Utils';


export function SocialDirErrorPopup(app) {
    return (<Modal 
        centered
        size="md"
        withCloseButton={false}
        overlayOpacity={0.55}
        overlayBlur={3}
        opened={app.state.loggedIn && !app.state.socialDir}
        title={"No valid social media directory found in your pod at '" + 
            app.podRootDir + SOCIAL_ROOT + "'."}
        onClose={() => {}}
    >
        <Text>
            Issue found: {app.socialDirError}
        </Text>
        <Space h="md" />
        <Group position="center">
            <Button
                onClick={async () => {
                    await createSocialDirectory(app.podRootDir)
                    app.socialDirFound(app);
                }}
            >
                Create New Directory
            </Button>
        </Group>
    </Modal>
    );
}