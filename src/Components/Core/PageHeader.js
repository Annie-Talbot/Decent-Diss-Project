import { ActionIcon, Group, Title } from "@mantine/core";
import { IconArrowBack } from "@tabler/icons";

export function PageHeader(props) {

    return (
        <Group position="apart" 
            style={{
                height: "24px", 
                marginBottom: "20px", 
                paddingRight: 20,
                paddingLeft: 20,
            }}
        >
            <Group spacing='md'>
                {props.back &&
                    <ActionIcon
                        size='lg'
                        variant="transparent"
                        disabled={props.backDisabled}
                        onClick={props.back}
                    >
                        <IconArrowBack />
                    </ActionIcon>
                }
                <Title>{props.title}</Title>
            </Group>
            {props.actionButton && !props.actionDisabled?
                props.actionButton
            :
                <></>
            }
        </Group>
    );
}