import React from 'react';
import './css/App.css';
import LoginPage from './Components/Login/LoginPage';
import SideBar from './Components/Core/Sidebar'
import { AppShell } from '@mantine/core';
import AppHeader from './Components/Core/Header';
import { PostsPage } from './Components/Posts/PostsPage';
import { AppStates } from './Components/Core/Constants/AppStates';
import { ProfilePage } from './Components/Profile/ProfilePage';
import { ConnectionsPage } from './Components/Connections/ConnectionsPage';
import { SocialDirectorySelector } from './Components/Login/SocialDirectorySelector';
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
            user: {},
            navOpened: false
        }
    }

    redirect(app, newState) {
        app.setState(prevState => (
            {...prevState, 
            currPage: newState,
        }));
    }

    setPod(app, pod) {
        let session = {...app.state.user}
        session.podRootDir = pod;
        app.setState(prevState => ({
            ...prevState,
            user: session,
        }))
    }
    
    render() {
        if (this.state.currPage === AppStates.LogIn) {
            return (
                <LoginPage 
                    setUser={(user) => this.setState(prevState => ({
                        ...prevState,
                        user: user
                    }))}
                    redirect={() => this.redirect(this, AppStates.Feed)}
                />
            );
        }
        // All other pages use the app shell
        let content = [];
        if (!this.state.user.podRootDir) {
            content.push(
                <SocialDirectorySelector
                    opened={!this.state.user.podRootDir}
                    user={this.state.user}
                    setPod={(pod) => this.setPod(this, pod)}
                />
            )
        }
        
        if (this.state.currPage === AppStates.Posts) {
            content.push(<PostsPage user={this.state.user}/>);
        } else if (this.state.currPage === AppStates.Profile) {
            content.push(<ProfilePage user={this.state.user}/>);
        } else if (this.state.currPage === AppStates.Connections) {
            content.push(<ConnectionsPage user={this.state.user}/>);
        } else if (this.state.currPage === AppStates.Feed) {
            content.push(<FeedPage user={this.state.user} />);
        }
        return (
            <AppShell
                padding = "md"
                navbar = {
                    <SideBar
                        opened={this.state.navOpened}
                        redirect={(state) => this.redirect(this, state)}
                    />
                }
                header={
                    <AppHeader
                            navOpened={this.state.navOpened}
                            setNavOpened={() => this.setState(prevState => ({
                                ...prevState,
                                navOpened: !this.state.navOpened
                            }))}
                            user={this.state.user}
                            logout={() => this.setState(prevState => ({
                                ...prevState,
                                user: {},
                                currPage: AppStates.LogIn
                            }))}
                    />
                }
            >
                {content}
            </AppShell>
        );
    }
}

export default App;
