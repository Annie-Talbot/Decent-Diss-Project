import React from 'react';
import './css/App.css';
import LoginPage from './Components/Login/LoginPage';
import SideBar from './Components/Core/Sidebar'
import { AppShell, Header, MantineProvider } from '@mantine/core';
import AppHeader from './Components/Core/Header';
import { PostsPage } from './Components/Posts/PostsPage';
import { AppStates } from './Components/Core/Constants/AppStates';
import { AppTheme } from './Components/Core/Constants/AppTheme';
import ProfilePage from './Components/Profile/ProfilePage';
import { NotificationsProvider } from '@mantine/notifications';
import { ConnectionsPage } from './Components/Connections/ConnectionsPage';
import { SocialDirectoryPage } from './Components/Login/SocialDirectoryPage';
import { FeedPage } from './Components/Feed/FeedPage';


/**
 * App Component represents the entire app, it uses it's 
 * state to control the content that is displayed.
 */
class App extends React.Component {
    constructor(props) {
        super(props);
        this.podRootDir = '';
        this.webId = '';
        this.state = {
            currPage: AppStates.LogIn,
            loggedIn: false,
        }
    }
    
    render() {
        let content = [];
        if (this.state.currPage === AppStates.LogIn) {
            content.push(<LoginPage app={this}/>);
        } else if (this.state.currPage === AppStates.FindSocialDirectory) {
            content.push(<SocialDirectoryPage app={this}/>);
        } else if (this.state.currPage === AppStates.Posts) {
            content.push(<PostsPage webId={this.webId} podRootDir={this.podRootDir}/>);
        } else if (this.state.currPage === AppStates.Profile) {
            content.push(<ProfilePage podRootDir={this.podRootDir} webId={this.webId}/>);
        } else if (this.state.currPage === AppStates.Connections) {
            content.push(<ConnectionsPage app={this}/>);
        } else if (this.state.currPage === AppStates.Feed) {
            content.push(<FeedPage podRootDir={this.podRootDir} webId={this.webId} />);
        } else {
            this.setState(prevState => (
                {...prevState, 
                currPage: AppStates.LogIn,
                loggedIn: false,
            }))
            content.push(<LoginPage app={this}/>)
        }
        
                
        return (
            <MantineProvider
            withGlobalStyles 
            withNormalizeCSS
            theme={AppTheme}
            >
                <NotificationsProvider>
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
