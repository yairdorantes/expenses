import FormExpense from "./components/FormExpense";
import { ToastContainer } from "react-toastify";
import Summary from "./components/Summary";
import Myrouter from "./router/MyRouter";

const App = () => {
  return (
    <div className="">
      <Myrouter />
      <ToastContainer />
      {/* <Summary /> */}
      {/* <FormExpense /> */}
    </div>
  );
};

export default App;
