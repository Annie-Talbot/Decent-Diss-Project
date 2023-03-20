import React from 'react';
import './css/App.css';
import LoginPage from './Components/Login/LoginPage';
import SideBar from './Components/Core/Sidebar'
import { AppShell, Modal } from '@mantine/core';
import AppHeader from './Components/Core/Header';
import { PostsPage } from './Components/Posts/PostsPage';
import { AppStates } from './Components/Core/Constants/AppStates';
import ProfilePage from './Components/Profile/ProfilePage';
import { ConnectionsPage } from './Components/Connections/ConnectionsPage';
import { SocialDirectoryPage, SocialDirectorySelector } from './Components/Login/SocialDirectorySelector';
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
            user: {}
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
            content.push(<PostsPage webId={this.webId} podRootDir={this.podRootDir}/>);
        } else if (this.state.currPage === AppStates.Profile) {
            content.push(<ProfilePage podRootDir={this.podRootDir} webId={this.webId}/>);
        } else if (this.state.currPage === AppStates.Connections) {
            content.push(<ConnectionsPage app={this}/>);
        } else if (this.state.currPage === AppStates.Feed) {
            content.push(<FeedPage podRootDir={this.podRootDir} webId={this.webId} />);
        }
        
        console.log(this.state.user)
        console.log(this.state.user.podRootDir)
        return (
            <AppShell
                padding = "md"
                navbar = {
                    <SideBar
                        redirect={(state) => this.redirect(this, state)}
                    />
                }
                header={
                    <AppHeader 
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
