import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import FormExpense from "../components/FormExpense";
import RecurrentTxs from "../pages/RecurrentTxs";

const Myrouter = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/add-expense' element={<FormExpense />} />
      <Route path='/recurrent-txs' element={<RecurrentTxs />} />
    </Routes>
  );
};

export default Myrouter;
