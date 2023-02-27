import { Button, Menu } from "@mantine/core";
import sample_pic from '../../assets/sample_profile_pic.svg'


export function ProfileAdditions(props) {
    return (
        <Menu shadow="md" width={200}>
            <Menu.Target>
                <Button style={{width:"18%", marginLeft: "80%"}}>
                    Add new attributes
                </Button>
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