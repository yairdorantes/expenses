import { useState } from "react";
import { Radio, Group, Text, Flex } from "@mantine/core";
import { FaCreditCard } from "react-icons/fa";
import { RiCoinsLine } from "react-icons/ri";

function Test() {
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);

  return (
    <Radio.Group
      value={paymentMethod}
      onChange={setPaymentMethod}
      label='Payment Method'
      size='md'
      //   description='Choose a package that you will need in your application'
    >
      <Flex direction='row' gap='md'>
        <Radio.Card
          radius='md'
          value='1'
          style={{
            border:
              paymentMethod === "1"
                ? "1px solid #19a130"
                : "1px solid #E2E8F0 ",
            padding: "10px",
            opacity: paymentMethod === "1" ? 1 : 0.3,
          }}
        >
          <Group wrap='nowrap' align='flex-center'>
            <Flex align='center' gap='xs'>
              <div className='text-red-500'>
                <FaCreditCard />
              </div>
              <Text>Debit card</Text>
            </Flex>
          </Group>
        </Radio.Card>

        <Radio.Card
          radius='md'
          value='2'
          style={{
            border:
              paymentMethod === "2"
                ? "1px solid #19a130"
                : "1px solid #E2E8F0 ",
            padding: "10px",
            opacity: paymentMethod === "2" ? 1 : 0.3,
          }}
        >
          <Group wrap='nowrap' align='flex-center'>
            <Flex align='center' gap='xs'>
              <div className='text-yellow-500'>
                <RiCoinsLine />
              </div>
              <Text>Cash</Text>
            </Flex>
          </Group>
        </Radio.Card>
      </Flex>
    </Radio.Group>
  );
}

export default Test;
