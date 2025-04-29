import {
  Button,
  Loader,
  NativeSelect,
  NumberInput,
  Select,
  Textarea,
  TextInput,
  Radio,
  Group,
  Text,
  Flex,
} from "@mantine/core";
import { TfiMoney } from "react-icons/tfi";
import {
  MdAccountBalance,
  MdCategory,
  MdOutlinePayments,
} from "react-icons/md";
import { DateInput } from "@mantine/dates";
import { CiTextAlignLeft } from "react-icons/ci";
import { BsFillCalendarDateFill } from "react-icons/bs";
import { FaMoneyBillTrendUp, FaPiggyBank } from "react-icons/fa6";
import { useForm } from "@mantine/form";
import { format } from "date-fns";
import axios from "axios";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCreditCard } from "react-icons/fa";
import { RiCoinsLine } from "react-icons/ri";
import { GiReceiveMoney } from "react-icons/gi";

const apiUrl = import.meta.env.VITE_API_URL;

const FormExpense = () => {
  const [loader, setLoader] = useState(false);
  const [checked, setChecked] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>("1");
  const [categories, setCategories] = useState([]);
  const [amountTypes, setAmountTypes] = useState([]);

  const navigate = useNavigate();
  const form = useForm({
    mode: "controlled",
    initialValues: {
      amount: "",
      category: "",
      type: "",
      date: format(new Date(), "yyyy-MM-dd"),
      paymentMethod: "3",
      details: "",
      account: "7",
    },
  });

  const sendData = (formData: object) => {
    console.log(formData);
    setLoader(true);
    axios
      .post(`${apiUrl}/api/expenses`, formData)
      .then((res) => {
        console.log(res.data);
        toast.success("info sent successfully", { position: "bottom-center" });
        form.reset();
        navigate("/");
      })
      .catch((err) => {
        console.log(err);
        toast.error("something went wrong at sending expense data");
      })
      .finally(() => setLoader(false));
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/form`);
        console.log(response.data);
        setCategories(response.data.categories);
        setAmountTypes(response.data.types);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchInitialData();
  }, []);

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        sendData(values);
        console.log(values);
      })}
    >
      <div className='max-w-sm mx-auto  p-4'>
        <NumberInput
          required
          leftSection={<TfiMoney color='green' />}
          label='Amount'
          placeholder='0.00 $'
          //   description="expense amount"
          key={form.key("amount")}
          description='Enter the expense amount in your local currency.'
          size='md'
          inputWrapperOrder={["label", "error", "input", "description"]}
          {...form.getInputProps("amount")}
        />
        <Select
          required
          size='md'
          searchable
          leftSection={<MdCategory />}
          label='Category'
          placeholder='Select a category'
          //   description="expense amount"
          onChange={(value) => {
            form.setFieldValue("category", value);
          }}
          description='Select the category that best fits your expense.'
          data={categories}
          inputWrapperOrder={["label", "error", "input", "description"]}
          //   key={form.key("category")}
          //   {...form.getInputProps("category")}
        />{" "}
        <Select
          size='md'
          // searchable
          required
          label='Type'
          placeholder='income or expense?'
          leftSection={<FaMoneyBillTrendUp />}
          //   description="expense amount"
          description='the type of the amount'
          data={amountTypes}
          onChange={(value) => {
            form.setFieldValue("type", value);
          }}
          inputWrapperOrder={["label", "error", "input", "description"]}
          //   key={form.key("category")}
          //   {...form.getInputProps("category")}
        />
        {/* <Select
          size='md'
          //   searchable
          label='Payment method'
          required
          placeholder="payment's method"
          onChange={(value) => {
            form.setFieldValue("paymentMethod", value);
          }}
          leftSection={<MdOutlinePayments />}
          //   description="expense amount"
          description='payment method of amount'
          data={paymentMethods}
          inputWrapperOrder={["label", "error", "input", "description"]}
          //   key={form.key("category")}
          //   {...form.getInputProps("category")}
        />{" "} */}
        <Radio.Group
          my={5}
          value={paymentMethod}
          onChange={(value) => form.setFieldValue("paymentMethod", value)}
          label='Payment Method'
          size='md'
          //   description='Choose a package that you will need in your application'
        >
          <Flex direction='row' gap='md'>
            <Radio.Card
              radius='md'
              value='3'
              style={{
                border:
                  form.values.paymentMethod === "3"
                    ? "1px solid #19a130"
                    : "1px solid #E2E8F0 ",
                padding: "10px",
                opacity: form.values.paymentMethod === "3" ? 1 : 0.5,
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
              value='1'
              style={{
                border:
                  form.values.paymentMethod === "1"
                    ? "1px solid #19a130"
                    : "1px solid #E2E8F0 ",
                padding: "10px",
                opacity: form.values.paymentMethod === "1" ? 1 : 0.5,
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
        <Radio.Group
          my={5}
          value={paymentMethod}
          onChange={(value) => {
            form.setFieldValue("account", value);
          }}
          label='Account'
          size='md'
          //   description='Choose a package that you will need in your application'
        >
          <Flex direction='row' gap='md'>
            <Radio.Card
              radius='md'
              value='7'
              style={{
                border:
                  form.values.account === "7"
                    ? "1px solid #19a130"
                    : "1px solid #E2E8F0 ",
                padding: "10px",
                opacity: form.values.account === "7" ? 1 : 0.5,
              }}
            >
              <Group wrap='nowrap' align='flex-center'>
                <Flex align='center' gap='xs'>
                  <div className='text-red-500'>
                    <GiReceiveMoney color='lightblue' />
                  </div>
                  <Text>Quincenal</Text>
                </Flex>
              </Group>
            </Radio.Card>

            <Radio.Card
              radius='md'
              value='6'
              style={{
                border:
                  form.values.account === "6"
                    ? "1px solid #19a130"
                    : "1px solid #E2E8F0 ",
                padding: "10px",
                opacity: form.values.account === "6" ? 1 : 0.5,
              }}
            >
              <Group wrap='nowrap' align='flex-center'>
                <Flex align='center' gap='xs'>
                  <div className='text-yellow-500'>
                    <FaPiggyBank color='green' />
                  </div>
                  <Text>Savings</Text>
                </Flex>
              </Group>
            </Radio.Card>
          </Flex>
        </Radio.Group>
        <DateInput
          size='md'
          //   value={value}
          //   onChange={setValue}
          label='Date of amount'
          //   defaultDate={new Date()}
          onChange={(date) =>
            form.setFieldValue("date", format(date, "yyyy-MM-dd"))
          }
          defaultValue={new Date()}
          leftSection={<BsFillCalendarDateFill />}
          placeholder='pick a date'
          description='The date when the expense occurred.'
          //   key={form.key("date")}
          //   {...form.getInputProps("date")}
          inputWrapperOrder={["label", "error", "input", "description"]}
        />
        <Textarea
          //   size="md"
          autosize
          size='md'
          leftSection={<CiTextAlignLeft />}
          label='Description'
          placeholder='Add any aditiona details of your amount'
          description='Optional: Provide more context about the amount.'
          key={form.key("details")}
          {...form.getInputProps("details")}
          inputWrapperOrder={["label", "error", "input", "description"]}
        />
        <div className='mb-2 mt-7'>
          <Button disabled={loader} color='green' fullWidth type='submit'>
            {loader ? <Loader /> : "Add"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default FormExpense;
