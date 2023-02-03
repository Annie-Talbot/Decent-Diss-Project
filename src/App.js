import React from 'react';
import './css/App.css';
import Login from './Components/Login';
import SideBar from './Components/Sidebar.js'
import { AppShell, Header, LoadingOverlay, MantineProvider } from '@mantine/core';
import AppHeader from './Components/Header';
import Home from './Components/Pages/Home';
import { AppStates } from './Constants/AppStates';
import { handleIncomingRedirect, getDefaultSession } from '@inrupt/solid-client-authn-browser'
import { AppTheme } from './Constants/AppTheme';
import ProfilePage from './Components/Pages/Profile';
import findOrCreateSocialSpace from './SOLID/FirstLoginHandler';

/**
 * App Component represents the entire app, it uses it's 
 * state to control the content that is displayed.
 */
class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            currPage: AppStates.LogIn,
            loggedIn: false,
            loading:true,
            webId: '',
        }
    }

    async componentDidMount() {
        await handleIncomingRedirect();
        if (getDefaultSession().info.isLoggedIn) {
            // User has logged in
            // Check if they have a social media directory, 
            // if not create a generic profile and posts dir.
            const webId = getDefaultSession().info.webId;
            const podRootDir = webId.match('(.*)profile/card#me')[1];

            findOrCreateSocialSpace(podRootDir);

            console.log(getDefaultSession().info);
            this.setState(prevState => (
                {...prevState, 
                currPage: AppStates.Profile,
                loggedIn: true,
                loading: false,
                webId: webId
            }))
        } else {
            this.setState(prevState => (
                {...prevState, 
                    loading: false,
                }))
        }
    }

    render() {
        let content;
        if (this.state.currPage == AppStates.LogIn) {
            content = (<Login app={this}/>);
        } else if (this.state.currPage == AppStates.Home) {
            content = (<Home app={this}/>);
        } else if (this.state.currPage == AppStates.Profile) {
            content = (<ProfilePage app={this}/>);
        } else {
            this.setState(prevState => (
                {...prevState, 
                currPage: AppStates.LogIn,
                loggedIn: false,
            }))
            content = (<Login app={this}/>)
        }
                
        return (
            <MantineProvider
            withGlobalStyles 
            withNormalizeCSS
            theme={AppTheme}
            >
                <AppShell
                    padding = "md"
                    navbar = {<SideBar app={this}/>}
                    header={
                        <Header height={60} p="xs">
                            {<AppHeader app={this} />}
                        </Header>
                        }>
                    <LoadingOverlay visible={this.state.loading} overlayBlur={2} />
                    {content}
                </AppShell>
          </MantineProvider>
        
        );
    }
}

export default App;
