import { Paper, Button, Space } from "@mantine/core";
import React from 'react';
import { createConnectionRequest, createNotificationsDir, doesNotificationsDirExist } from "../../SOLID/NotificationHandler";
import { PageLoader } from "../Core/PageLoader";
import { NotificationList } from "./NotificationList";

export class NotificationsPage extends React.Component {
    constructor(props) {
        super(props);
        this.podRootDir = props.app.podRootDir;
    }

    render() {

        return (
            <Paper p="sm" shadow="xs">
                <PageLoader 
                    checkFunction={doesNotificationsDirExist}
                    createFunction={createNotificationsDir}
                    podRootDir={this.podRootDir}
                    podStructureRequired="notification directory"
                >
                    <Button onClick={() => createConnectionRequest({
                            webId: "https://id.inrupt.com/at698",
                            msg: "Hi, this is at698. Add me to your contacts!",
                            socialPod: this.podRootDir
                        }, this.podRootDir)}>
                        create notification
                    </Button>
                    <Space h="md"/>
                    <NotificationList podRootDir={this.podRootDir} />
                </PageLoader>
            </Paper>
        );
    }
}
