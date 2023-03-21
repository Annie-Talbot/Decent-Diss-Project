import { ActionIcon, Menu } from "@mantine/core";
import { IconSquareRoundedPlusFilled } from "@tabler/icons-react";


export function PostAdditionsMenu(props) {
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
                {props.post.text == null && 
                    <Menu.Item onClick={()=> props.add("text", "")}>
                        Some Text
                    </Menu.Item>
                }
                {props.post.image == null && 
                    <Menu.Item onClick={()=> props.add("image", new File([""], "filename"))}>
                        Image
                    </Menu.Item>
                }
            </Menu.Dropdown>
        </Menu>
        
    );
}