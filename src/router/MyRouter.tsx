import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import FormExpense from "../components/FormExpense";

const Myrouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/add-expense" element={<FormExpense />} />
    </Routes>
  );
};

export default Myrouter;
