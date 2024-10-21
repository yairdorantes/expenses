import FormExpense from "./components/FormExpense";
import { ToastContainer } from "react-toastify";
import Summary from "./components/Summary";

const App = () => {
  return (
    <div className="">
      <ToastContainer />
      <Summary />
      {/* <FormExpense /> */}
    </div>
  );
};

export default App;
