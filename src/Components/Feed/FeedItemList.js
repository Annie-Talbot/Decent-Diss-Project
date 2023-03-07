import { Center, Paper, Skeleton, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconBeach } from "@tabler/icons";
import { useState, useEffect } from "react";
import { FEED_ITEM_TYPES, fetchFeedItems } from "../../SOLID/FeedHandler";
import { createErrorNotification } from "../Core/Notifications/ErrorNotification";
import { PostLoader } from "./PostLoader";

function EmptyFeed() {
    return (
        <Stack align="center" justify="center">
            <ThemeIcon 
            variant="light"
            size="xl">
                <IconBeach />
            </ThemeIcon>
            <Text size={"lg"}>No new posts to see...</Text>
        </Stack>
    );
}

export function FeedItemList(props) {
    const [loading, setLoading] = useState(true);
    const [feedItems, setFeedItems] = useState([]);

    useEffect(() => {
        fetchFeedItems(props.podRootDir).then(([fetchedItems, errors]) => {
            errors.forEach(e => createErrorNotification(e));
            setFeedItems(fetchedItems);
            setLoading(false);
        })
    }, [props.podRootDir]);

    return (
        <Skeleton visible={loading}>
            {feedItems.length > 0?
                <Stack>
                    {feedItems.map((feedItem, index) => {
                        if (feedItem.type === FEED_ITEM_TYPES.PostAlert) {
                            return (<PostLoader
                                key={index}
                                feedItem={feedItem}
                                podRootDir={props.podRootDir}
                            />);
                        } else {
                            return (<Paper shadow="sm" withBorder>
                                <Center>
                                    <Text>Unknown item in your feed directory.</Text>
                                </Center>
                            </Paper>);
                        }
                        })}
                </Stack>
            :
                <EmptyFeed />
            }
        </Skeleton>
    );
}