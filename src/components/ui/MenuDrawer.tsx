import { Button, Drawer } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

const MenuDrawer = () => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <div>
      <Drawer opened={opened} onClose={close} title='Menu'>
        {/* Drawer content */}
        <Button>Recurring Transaction</Button>
      </Drawer>
      <Button variant='default' onClick={open}>
        Open Drawer
      </Button>
    </div>
  );
};

export default MenuDrawer;
