import { ProfilePic } from "./ProfilePic";
import { Username } from "./Username";
import { useState, useEffect } from "react";
import { Description } from "./Description"
import { ActionIcon, Button, Center, Group, Skeleton, Stack } from "@mantine/core";
import {getProfile, updateProfile} from "../../SOLID/ProfileHandler";
import { ProfileAdditions } from "./ProfileAdditions";
import { Birthday } from "./Birthday";
import { createErrorNotification } from "../Core/Notifications/ErrorNotification";
import { createPlainNotification } from "../Core/Notifications/PlainNotification";
import { IconSquareRoundedCheckFilled } from "@tabler/icons-react";
import { createLoadingNotification } from "../Core/Notifications/LoadingNotification";



async function saveProfileChanges(podRootDir, newProfile, update, close) {
    createLoadingNotification("save-profile", "Saving profile...", "",
        () => updateProfile(podRootDir, newProfile), update)
    close();
}

export function Profile(props)  {
    // Create a copy of the profile data
    const [profile, setProfile] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getProfile(props.userPod).then(([profile, error]) => {
            setProfile(profile);
            setLoading(false);
            if (error) createErrorNotification(error);
        });
        
    }, [props.userPod]);

    let dataDisplay = [];
    // Profile Picture
    dataDisplay.push((
        <ProfilePic 
            key="profilePic"
            pic={profile.profilePic} 
            editing={props.editing}
            update={(newPic) => setProfile(profile => (
                {...profile,
                profilePic: newPic}
            ))}
            delete={() => setProfile(profile => (
                {...profile,
                profilePic: null}
            ))}
        />
    ));
    // Username
    dataDisplay.push((
        <Username 
            key="username"
            name={profile.name} 
            editing={props.editing} 
            update={(newName) => setProfile(profile => (
                {...profile,
                name: newName}
            ))}
        />
    ));
    // Description
    dataDisplay.push((
        <Description 
            key="description"
            description={profile.description} 
            editing={props.editing}
            update={(newDescription) => setProfile(profile => (
                {...profile,
                description: newDescription}
            ))}
            delete={() => setProfile(profile => (
                {...profile,
                description: null}
            ))}
        />
    ));
    dataDisplay.push((
        <Birthday 
            key="birthday"
            birthday={profile.birthday} 
            editing={props.editing}
            update={(newBirthday) => setProfile(profile => (
                {...profile,
                birthday: newBirthday}
            ))}
            delete={() => setProfile(profile => (
                {...profile,
                birthday: null}
            ))}
        />
    ));
    return (
        <Skeleton visible={loading}>
            <Stack style={{ marginLeft: "2%", padding: "20px"}}>
                {dataDisplay}
                {props.editing &&
                    <Center>
                        <Group spacing='lg'>
                            <ProfileAdditions 
                                profile={profile}
                                appendToProfile={(attribute, startingValue) => {
                                    let copy = {...profile};
                                    copy[attribute] = startingValue;
                                    setProfile(copy);
                                }}
                            />
                            <ActionIcon
                                size="xl"
                                color="sage"
                                onClick={() => saveProfileChanges(props.userPod, profile, props.update, props.stopEditing)}
                            >
                                <IconSquareRoundedCheckFilled size={57}/>
                            </ActionIcon>
                        </Group>
                    </Center>
                }
            </Stack>
        </Skeleton>
    );
}