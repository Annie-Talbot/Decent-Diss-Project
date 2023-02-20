import React from 'react';
import './css/App.css';
import Login from './Components/Login';
import SideBar from './Components/Sidebar.js'
import { AppShell, Header, LoadingOverlay, MantineProvider } from '@mantine/core';
import AppHeader from './Components/Header';
import { PostsPage } from './Components/Pages/Posts';
import { AppStates } from './Constants/AppStates';
import { handleIncomingRedirect, getDefaultSession } from '@inrupt/solid-client-authn-browser'
import { AppTheme } from './Constants/AppTheme';
import ProfilePage from './Components/Pages/Profile';
import { validateSocialDir } from './SOLID/SocialDirHandler';
import { SocialDirErrorPopup } from './Components/SocialDirErrorPopup';
import { getPodUrlAll } from "@inrupt/solid-client";
import { NotificationsProvider } from '@mantine/notifications';
import { ConnectionsPage } from './Components/Pages/Connections';

/**
 * App Component represents the entire app, it uses it's 
 * state to control the content that is displayed.
 */
class App extends React.Component {
    constructor(props) {
        super(props);
        this.podRootDir = '';
        this.socialDirError = '';
        this.state = {
            currPage: AppStates.LogIn,
            loggedIn: false,
            socialDir: false,
            loading:true,
        }
    }

    async componentDidMount() {
        // Check if we are in the correct state, or if 
        // something has changed e.g. Just been logged in
        if (this.state.loggedIn == false) {
            // Check if we've just returned from log in redirect
            await handleIncomingRedirect();
            if (getDefaultSession().info.isLoggedIn) {
                // User has just logged in
                // Attempt to find root social directory
                console.log(getDefaultSession().info);
                const webId = getDefaultSession().info.webId;
                const rootList = await getPodUrlAll(webId, {fetch: fetch});
                this.podRootDir = rootList[0];
                
                console.log(this.podRootDir);
                const [valid, error] = await validateSocialDir(this.podRootDir);
                let nextState = AppStates.Profile
                if (!valid) {
                    this.socialDirError = error;
                    nextState = AppStates.LogIn
                }

                this.setState(prevState => (
                    {...prevState, 
                    loggedIn: true,
                    loading: false,
                    socialDir: valid,
                    currPage: nextState,
                }))
                return;
            }
        }
        // We are in correct state, display app.
        this.setState(prevState => (
            {...prevState,
            loading: false,
        }))
        return;
    }

    socialDirFound(app) {
        app.setState(prevState => (
            {...prevState, 
            socialDir: true,
            currPage: AppStates.Profile,
        }))
    }

    render() {
        let content = [];
        content.push(SocialDirErrorPopup(this));

        if (this.state.currPage == AppStates.LogIn) {
            content.push(<Login app={this}/>);
        } else if (this.state.currPage == AppStates.Posts) {
            content.push(<PostsPage app={this}/>);
        } else if (this.state.currPage == AppStates.Profile) {
            content.push(<ProfilePage app={this}/>);
        } else if (this.state.currPage == AppStates.Connections) {
            content.push(<ConnectionsPage app={this}/>);
        }  else {
            this.setState(prevState => (
                {...prevState, 
                currPage: AppStates.LogIn,
                loggedIn: false,
            }))
            content.push(<Login app={this}/>)
        }
        
                
        return (
            <MantineProvider
            withGlobalStyles 
            withNormalizeCSS
            theme={AppTheme}
            >
                <NotificationsProvider>
                    <LoadingOverlay visible={this.state.loading} overlayBlur={1}/>
                    <AppShell
                        padding = "md"
                        navbar = {<SideBar app={this}/>}
                        header={
                            <Header height={60} p="xs">
                                {<AppHeader app={this} />}
                            </Header>
                            }>
                        {content}
                    </AppShell>
                </NotificationsProvider>
          </MantineProvider>
        
        );
    }
}

export default App;
