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
import { MdCategory } from "react-icons/md";
import { DateInput } from "@mantine/dates";
import { CiTextAlignLeft } from "react-icons/ci";
import { BsFillCalendarDateFill } from "react-icons/bs";
import { FaPiggyBank } from "react-icons/fa6";
import { useForm } from "@mantine/form";
import { format } from "date-fns";
import axios from "axios";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { GiReceiveMoney } from "react-icons/gi";
import { FiTrendingDown, FiTrendingUp } from "react-icons/fi";

const apiUrl = import.meta.env.VITE_API_URL;

const FormExpense = () => {
  const [loader, setLoader] = useState(false);
  const [checked, setChecked] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>("1");
  const [tsxType, setTsxType] = useState<number>(1);
  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([
    { value: "1", label: "Cash" },
    { value: "5", label: "Credit Card" },
    { value: "3", label: "Debit Card" },
  ]);
  const [amountTypes, setAmountTypes] = useState([
    { value: "1", label: "Expense" },
    { value: "2", label: "Income" },
  ]);

  const navigate = useNavigate();
  const form = useForm({
    mode: "controlled",
    initialValues: {
      amount: "",
      category: "",
      type: "1",
      date: format(new Date(), "yyyy-MM-dd"),
      paymentMethod: "3",
      details: "",
      account: "7",
    },
  });

  const sendData = (formData: object, sendingLocalData: boolean = false) => {
    console.log(formData);
    setLoader(true);
    axios
      .post(`${apiUrl}/api/expenses`, formData)
      .then((res) => {
        console.log(res.data);
        toast.success("info sent successfully", { position: "bottom-center" });
        form.reset();
        localStorage.removeItem("pendingExpenses");
        // navigate("/");
      })
      .catch((err) => {
        console.log(err);
        toast.error("something went wrong at sending expense data");
        console.log(sendingLocalData);

        if (!sendingLocalData) {
          // this logic only runs if the data is not being resent from local storage
          console.log("sending data to local storage");
          const pendingExpenses = localStorage.getItem("pendingExpenses");
          if (pendingExpenses) {
            const pendingData = JSON.parse(pendingExpenses);
            pendingData.push(formData);
            localStorage.setItem(
              "pendingExpenses",
              JSON.stringify(pendingData)
            );
          } else {
            localStorage.setItem("pendingExpenses", JSON.stringify([formData]));
          }
          toast.error("Expense saved locally, will retry later.", {
            position: "bottom-center",
            toastId: "localSaveToast",
          });
        }
      })
      .finally(() => setLoader(false));
  };

  const lookupPendingExpenses = () => {
    const pendingExpenses = localStorage.getItem("pendingExpenses");
    if (pendingExpenses) {
      const pendingData = JSON.parse(pendingExpenses);
      sendData(pendingData, true); // Send the pending data to the server
    }
  };

  const fetchInitialData = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/form`);
      console.log(response.data);
      setCategories(response.data.categories);
      setAmountTypes(response.data.types);
      // Save data locally for offline fallback (in case of no server connection)
      localStorage.setItem(
        "categories",
        JSON.stringify(response.data.categories)
      );
      localStorage.setItem("types", JSON.stringify(response.data.types));
    } catch (error) {
      console.log(error);
      // Fallback to local storage if the API call fails
      const localCategories = localStorage.getItem("categories");
      if (localCategories) {
        setCategories(JSON.parse(localCategories));
      }

      toast.error("Failed to fetch categories and types, using local data.", {
        position: "bottom-center",
        toastId: "uniqueToast",
      });
    }
  };
  useEffect(() => {
    fetchInitialData();
    lookupPendingExpenses();
  }, []);

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        sendData(values);
        console.log(values);
      })}
    >
      <div className='max-w-sm mx-auto p-4'>
        {/* expesne type */}
        <Radio.Group
          my={5}
          // value={tsxType.toString()}
          onChange={(value) => {
            form.setFieldValue("type", value);
            console.log(value);
          }}
          label='Transaction Type'
          size='md'
          //   description='Choose a package that you will need in your application'
        >
          <Flex direction='row' gap='md'>
            <Radio.Card
              radius='md'
              value='1'
              style={{
                border: "1px solid #d7d9dd",
                backgroundColor: "#151516",
                padding: "10px",
                opacity: form.values.type === "1" ? 1 : 0.5,
              }}
            >
              <Group wrap='nowrap' align='flex-center'>
                <Flex align='center' gap='xs'>
                  <div className='text-red-500'>
                    <FiTrendingDown />
                  </div>
                  <Text>Expense</Text>
                </Flex>
              </Group>
            </Radio.Card>

            <Radio.Card
              radius='md'
              value='2'
              style={{
                border: "1px solid #d7d9dd",
                backgroundColor: "#151516",
                padding: "10px",
                opacity: form.values.type === "2" ? 1 : 0.5,
              }}
            >
              <Group wrap='nowrap' align='flex-center'>
                <Flex align='center' gap='xs'>
                  <div className='text-teal-500'>
                    <FiTrendingUp />
                  </div>
                  <Text>Income</Text>
                </Flex>
              </Group>
            </Radio.Card>
          </Flex>
        </Radio.Group>
        {/* expesne type */}
        <NumberInput
          required
          leftSection={<TfiMoney color='green' />}
          label='Amount'
          placeholder='0.00 $'
          thousandSeparator=','
          //   description="expense amount"
          key={form.key("amount")}
          // description='Enter the expense amount in your local currency.'
          size='lg'
          inputWrapperOrder={["label", "error", "input", "description"]}
          {...form.getInputProps("amount")}
        />
        <Select
          required
          size='md'
          searchable
          leftSection={<MdCategory />}
          label='Category'
          clearable
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
        />
        <Select
          required
          size='md'
          searchable
          clearable
          leftSection={<MdCategory />}
          label='Payment Method'
          placeholder='Select a payment method'
          //   description="expense amount"
          onChange={(value) => {
            form.setFieldValue("paymentMethod", value);
          }}
          description='Select the payment method that best fits your expense.'
          data={paymentMethods}
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
