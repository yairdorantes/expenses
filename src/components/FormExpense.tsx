import {
  Button,
  Loader,
  NativeSelect,
  NumberInput,
  Select,
  Textarea,
  TextInput,
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
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { useForm } from "@mantine/form";
import { format } from "date-fns";
import axios from "axios";
import { toast } from "react-toastify";
import { useState } from "react";
const apiUrl = import.meta.env.VITE_API_URL;

const FormExpense = () => {
  const [loader, setLoader] = useState(false);
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      amount: "",
      category: "",
      type: "",
      date: format(new Date(), "yyyy-MM-dd"),
      paymentMethod: "",
      details: "",
      account: "",
    },
  });
  const categories = [
    { value: "1", label: "Health" },
    { value: "2", label: "Food" },
    { value: "3", label: "Transportation" },
    { value: "4", label: "Housing" },
    { value: "5", label: "Utilities" },
    { value: "6", label: "Entertainment" },
    { value: "7", label: "Clothing" },
    { value: "8", label: "Education" },
    { value: "9", label: "Travel" },
    { value: "10", label: "Personal Care" },
    { value: "11", label: "Gifts" },
    { value: "12", label: "Insurance" },
    { value: "13", label: "Investments" },
    { value: "14", label: "Lend money" },
    { value: "15", label: "Repayment" },
    { value: "16", label: "Paycheck" },
    { value: "17", label: "Other" },
    { value: "18", label: "Bicycle" },
  ];

  const amountTypes = [
    { value: "1", label: "Expense" },
    { value: "2", label: "Income" },
  ];
  const paymentMethods = [
    { value: "1", label: "Cash" },
    { value: "2", label: "Credit Card" },
    { value: "3", label: "Debit Card" },
    { value: "4", label: "Bank Transfer" },
    { value: "8", label: "Check" },
  ];
  const accounts = [
    { value: "1", label: "Checking Account" },
    { value: "2", label: "Savings Account" },
    { value: "3", label: "Credit Account" },
    { value: "5", label: "Cash on Hand" },
  ];

  const sendData = (formData: object) => {
    console.log(formData);
    setLoader(true);
    axios
      .post(`${apiUrl}/api/expenses`, formData)
      .then((res) => {
        console.log(res.data);
        toast.success("info sent successfully");
        form.reset();
      })
      .catch((err) => {
        console.log(err);
        toast.error("something went wrong at sending expense data");
      })
      .finally(() => setLoader(false));
  };
  return (
    <form
      onSubmit={form.onSubmit((values) => {
        sendData(values);
        console.log(values);
      })}
    >
      <div className="max-w-sm mx-auto  p-4">
        <NumberInput
          required
          leftSection={<TfiMoney color="green" />}
          label="Amount"
          placeholder="0.00 $"
          //   description="expense amount"
          key={form.key("amount")}
          description="Enter the expense amount in your local currency."
          size="md"
          inputWrapperOrder={["label", "error", "input", "description"]}
          {...form.getInputProps("amount")}
        />
        <Select
          required
          size="md"
          searchable
          leftSection={<MdCategory />}
          label="Category"
          placeholder="Select a category"
          //   description="expense amount"
          onChange={(value) => {
            form.setFieldValue("category", value);
          }}
          description="Select the category that best fits your expense."
          data={categories}
          inputWrapperOrder={["label", "error", "input", "description"]}
          //   key={form.key("category")}
          //   {...form.getInputProps("category")}
        />{" "}
        <Select
          size="md"
          //   searchable
          required
          label="Type"
          placeholder="income or expense?"
          leftSection={<FaMoneyBillTrendUp />}
          //   description="expense amount"
          description="the type of the amount"
          data={amountTypes}
          onChange={(value) => {
            form.setFieldValue("type", value);
          }}
          inputWrapperOrder={["label", "error", "input", "description"]}
          //   key={form.key("category")}
          //   {...form.getInputProps("category")}
        />
        <Select
          size="md"
          //   searchable
          label="Payment method"
          required
          placeholder="payment's method"
          onChange={(value) => {
            form.setFieldValue("paymentMethod", value);
          }}
          leftSection={<MdOutlinePayments />}
          //   description="expense amount"
          description="payment method of amount"
          data={paymentMethods}
          inputWrapperOrder={["label", "error", "input", "description"]}
          //   key={form.key("category")}
          //   {...form.getInputProps("category")}
        />{" "}
        <Select
          size="md"
          required
          //   searchable
          label="Account"
          leftSection={<MdAccountBalance />}
          onChange={(value) => {
            form.setFieldValue("account", value);
          }}
          placeholder="select the account"
          //   description="expense amount"
          description="select the amount's origin account "
          data={accounts}
          inputWrapperOrder={["label", "error", "input", "description"]}
          //   key={form.key("category")}
          //   {...form.getInputProps("category")}
        />
        <DateInput
          size="md"
          //   value={value}
          //   onChange={setValue}
          label="Date of amount"
          //   defaultDate={new Date()}
          onChange={(date) =>
            form.setFieldValue("date", format(date, "yyyy-MM-dd"))
          }
          defaultValue={new Date()}
          leftSection={<BsFillCalendarDateFill />}
          placeholder="pick a date"
          description="The date when the expense occurred."
          //   key={form.key("date")}
          //   {...form.getInputProps("date")}
          inputWrapperOrder={["label", "error", "input", "description"]}
        />
        <Textarea
          //   size="md"
          autosize
          size="md"
          leftSection={<CiTextAlignLeft />}
          label="Description"
          placeholder="Add any aditiona details of your amount"
          description="Optional: Provide more context about the amount."
          key={form.key("details")}
          {...form.getInputProps("details")}
          inputWrapperOrder={["label", "error", "input", "description"]}
        />
        <div className="mb-2 mt-7">
          <Button disabled={loader} color="green" fullWidth type="submit">
            {loader ? <Loader /> : "Add"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default FormExpense;
