import { Image, Text } from "@mantine/core"

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
                src={'/Decent/logo_w_text.png'}
                withPlaceholder
                placeholder={<Text align="center">Decent logo image</Text>}
            />
    );
}