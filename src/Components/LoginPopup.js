import { useState } from 'react';
import { Modal, Button, Group } from '@mantine/core';

export default function LoginPopup(socialRootDirUrl) {
  const [opened, setOpened] = useState(true);

  return (
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={"Found valid social directory at " + socialRootDirUrl}
      >
        {/* Modal content */}
      </Modal>
  );
}