import { ProfilePic } from "./ProfilePic";
import { Username } from "./Username";
import { useState, useEffect } from "react";
import { Description } from "./Description"
import { Button, Center, Group, Skeleton, Stack } from "@mantine/core";
import {getProfile, updateProfile} from "../../SOLID/ProfileFetcher";
import { ProfileAdditions } from "./ProfileAdditions";
import { Birthday } from "./Birthday";
import { createErrorNotification } from "../Core/Notifications/ErrorNotification";
import { createPlainNotification } from "../Core/Notifications/PlainNotification";



async function saveProfileChanges(podRootUrl, newProfile) {
    const [success, errors] = await updateProfile(podRootUrl, newProfile);
    errors.forEach(error => {
        createErrorNotification(error);
    });
    if (success) {
        createPlainNotification({title: "Success!", description: "Profile updated."})
    }
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
            <Stack style={{ marginLeft: "2%", padding: "10px"}}>
                {props.editing &&
                    <Group>
                        <ProfileAdditions 
                            profile={profile}
                            appendToProfile={(attribute, startingValue) => {
                                let copy = {...profile};
                                copy[attribute] = startingValue;
                                setProfile(copy);
                            }}
                        />
                        
                    </Group>
                    
                }
                {dataDisplay}
                {props.editing &&
                    <Center>
                        <Button onClick={() => saveProfileChanges(props.userPod, profile)}>
                            Save
                        </Button>
                    </Center>
                }
            </Stack>
        </Skeleton>
    );
}