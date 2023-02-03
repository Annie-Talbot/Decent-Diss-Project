import { Image, Text } from "@mantine/core"
import logo from './../assets/logo_w_text.png'

/**
 * Returns a react Image component with the company logo enclosed.
 * @returns React Image Component.
 */
export function Logo() {
    return (
            <Image
                radius="md"
                fit="contain"
                height="100%"
                width="130px"
                src={logo}
                withPlaceholder
                placeholder={<Text align="center">Decent logo image</Text>}
            />
    );
}