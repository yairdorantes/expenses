import {
  Button,
  Loader,
  NumberInput,
  Select,
  Textarea,
  Radio,
  SegmentedControl,
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
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { GiReceiveMoney } from "react-icons/gi";
import { FiTrendingDown, FiTrendingUp } from "react-icons/fi";
import { expenseRepository } from "../offline/expenseRepository";
import type { SelectOption } from "../offline/types";

const getDateValue = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const FormExpense = () => {
  const { expenseId } = useParams();
  const isEditing = Boolean(expenseId);
  const [loader, setLoader] = useState(false);
  const [categories, setCategories] = useState<SelectOption[]>([]);

  const navigate = useNavigate();
  const form = useForm({
    mode: "controlled",
    initialValues: {
      amount: "",
      category: "",
      type: "1",
      date: format(new Date(), "yyyy-MM-dd"),
      paymentMethod: "5",
      details: "",
      account: "7",
    },
  });

  const sendData = async (formData: typeof form.values) => {
    setLoader(true);
    try {
      if (isEditing && expenseId) {
        await expenseRepository.updateExpense(expenseId, formData);
      } else {
        await expenseRepository.createExpense(formData);
      }

      toast.success(
        isEditing
          ? "Expense updated locally. Sync will run automatically."
          : "Expense saved locally. Sync will run automatically.",
        { position: "bottom-center" },
      );
      form.reset();
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error("Could not save the expense locally.", {
        position: "bottom-center",
      });
    } finally {
      setLoader(false);
    }
  };

  const fetchInitialData = async () => {
    const options = await expenseRepository.getFormOptions();
    setCategories(options.categories);
  };

  const fetchExpense = async () => {
    if (!expenseId) return;

    try {
      const response = await expenseRepository.getExpense(expenseId);
      if (!response) {
        throw new Error("Expense not found locally.");
      }

      const formValues = expenseRepository.toFormValues(response);
      form.setValues({
        amount: String(formValues.amount),
        category: formValues.category,
        type: formValues.type,
        date: formValues.date.slice(0, 10),
        paymentMethod: formValues.paymentMethod,
        details: formValues.details || "",
        account: formValues.account,
      });
    } catch (error) {
      console.log(error);
      toast.error("Failed to load expense data from local storage.", {
        position: "bottom-center",
      });
      navigate("/");
    }
  };

  useEffect(() => {
    void fetchInitialData();
    if (isEditing) {
      void fetchExpense();
    }
  }, [expenseId]);

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        void sendData(values);
      })}
    >
      <div className='max-w-sm mx-auto p-4'>
        {/* expesne type */}
        <Radio.Group
          my={5}
          value={form.values.type}
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
            form.setFieldValue("category", value || "");
          }}
          value={form.values.category}
          description='Select the category that best fits your expense.'
          data={categories}
          inputWrapperOrder={["label", "error", "input", "description"]}
          //   key={form.key("category")}
          //   {...form.getInputProps("category")}
        />
        <div className='mt-2'>
          <Text size='sm' fw={500} mb={4}>
            Payment Method
          </Text>
          <SegmentedControl
            fullWidth
            value={form.values.paymentMethod}
            onChange={(value) => form.setFieldValue("paymentMethod", value)}
            aria-label='Payment Method'
            data={[
              { value: "1", label: "Cash" },
              { value: "3", label: "Debit" },
              { value: "5", label: "Credit" },
            ]}
          />
        </div>
        <Radio.Group
          my={5}
          value={form.values.account}
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
          value={form.values.date ? getDateValue(form.values.date) : null}
          //   onChange={setValue}
          label='Date of amount'
          //   defaultDate={new Date()}
          onChange={(date) => {
            if (date) {
              form.setFieldValue("date", format(date, "yyyy-MM-dd"));
            }
          }}
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
            {loader ? <Loader /> : isEditing ? "Update" : "Add"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default FormExpense;
