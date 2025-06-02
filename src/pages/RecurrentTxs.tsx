import { useState } from "react";
import { Button, FloatingIndicator, Tabs } from "@mantine/core";
import {
  LeadingActions,
  SwipeableList,
  SwipeableListItem,
  SwipeAction,
  TrailingActions,
} from "react-swipeable-list";
import "react-swipeable-list/dist/styles.css";

const RecurrentTxs = () => {
  const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null);
  const [value, setValue] = useState<string | null>("1");
  const [controlsRefs, setControlsRefs] = useState<
    Record<string, HTMLButtonElement | null>
  >({});
  const setControlRef = (val: string) => (node: HTMLButtonElement) => {
    controlsRefs[val] = node;
    setControlsRefs(controlsRefs);
  };

  const sendNotification = () => {
    if (Notification.permission === "granted") {
      new Notification("Weather Update 🌤", {
        body: "Icoming next expense: Amazon prime",
        icon: "/expenses.png", // optional
      });
    }
  };
  const leadingActions = () => (
    <LeadingActions>
      <SwipeAction onClick={() => console.info("swipe action triggered")}>
        Action name
      </SwipeAction>
    </LeadingActions>
  );

  const trailingActions = () => (
    <TrailingActions>
      <SwipeAction onClick={() => console.info("delete")}>
        <div className=' bg-red-500'>Delete</div>
      </SwipeAction>
    </TrailingActions>
  );
  return (
    <div>
      <Tabs variant='none' value={value} onChange={setValue}>
        <Tabs.List ref={setRootRef}>
          <Tabs.Tab value='1' ref={setControlRef("1")}>
            First tab
          </Tabs.Tab>
          <Tabs.Tab value='2' ref={setControlRef("2")}>
            Second tab
          </Tabs.Tab>
          <Tabs.Tab value='3' ref={setControlRef("3")}>
            Third tab
          </Tabs.Tab>
          <FloatingIndicator
            target={value ? controlsRefs[value] : null}
            parent={rootRef}
            // className={classes.indicator}
          />
        </Tabs.List>
        <Tabs.Panel value='1'>First tab content</Tabs.Panel>
        <Tabs.Panel value='2'>Second tab content</Tabs.Panel>
        <Tabs.Panel value='3'>Third tab content</Tabs.Panel>
      </Tabs>
      <Button onClick={sendNotification}>noti</Button>
      <SwipeableList>
        <SwipeableListItem
          threshold={0.25}
          fullSwipe={false}
          // leadingActions={leadingActions()}
          trailingActions={trailingActions()}
          onSwipeEnd={() => {
            console.log("swipe end");
          }}
          scrollStartThreshold={5}
          swipeStartThreshold={5}
          // scrollEndThreshold={5}

          onSwipeStart={() => console.info("swipe start")}
          maxSwipe={0.5}
        >
          <div className='w-full bg-slate-500'>Item content</div>
        </SwipeableListItem>
      </SwipeableList>
    </div>
  );
};

export default RecurrentTxs;
