import { ActionIcon, Button, Menu } from "@mantine/core";
import { IconSquareRoundedPlusFilled } from "@tabler/icons-react";


export function ProfileAdditions(props) {
    return (
        <Menu 
            shadow="md" 
            width={200}
            trigger='hover'
            position="top" 
            offset={2} 
            withArrow
        >
            <Menu.Target>
                <ActionIcon
                    size="xl"
                    color="sage"
                >
                    <IconSquareRoundedPlusFilled size={57}/>
                </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
                {props.profile.description == null && 
                    <Menu.Item onClick={()=> props.appendToProfile("description", "")}>
                        Description
                    </Menu.Item>
                }
                {props.profile.birthday == null && 
                    <Menu.Item onClick={()=> props.appendToProfile("birthday", new Date(Date.now()))}>
                        Birthday
                    </Menu.Item>
                }
                {props.profile.profilePic == null && 
                    <Menu.Item onClick={()=> props.appendToProfile("profilePic", new File([""], "filename"))}>
                        Profile Picture
                    </Menu.Item>
                }
            </Menu.Dropdown>
        </Menu>
        
    );
}