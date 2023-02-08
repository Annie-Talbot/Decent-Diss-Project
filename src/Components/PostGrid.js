import { SimpleGrid } from "@mantine/core";



export function PostGrid(postComponents) {
    return (
        <SimpleGrid 
            cols={3}
            
            breakpoints={[
                { maxWidth: 1600, cols: 2, spacing: 'sm' },
                { maxWidth: 1200, cols: 1, spacing: 'sm' },
        ]}>
            {postComponents}
        </SimpleGrid>
    );
}