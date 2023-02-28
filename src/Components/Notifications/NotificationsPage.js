import { Paper, Button } from "@mantine/core";
import React from 'react';
import { createConnectionRequest } from "../../SOLID/NotificationHandler";

export class NotificationsPage extends React.Component {
    constructor(props) {
        super(props);
        this.podRootDir = props.app.podRootDir;
    }

    render() {
        return (
            <Paper p="sm" shadow="xs">
                <Button onClick={() => createConnectionRequest({
                        webId: "https://id.inrupt.com/at698",
                        msg: "Hi, this is at698. Add me to your contacts!",
                        socialPod: this.podRootDir
                    }, this.podRootDir)}>
                    create notification
                </Button>
            </Paper>
        );
    }
}
