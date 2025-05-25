import FormExpense from "./components/FormExpense";
import { ToastContainer } from "react-toastify";
import Summary from "./components/Summary";
import Myrouter from "./router/MyRouter";
import { useEffect } from "react";

const App = () => {
  const sendNotification = () => {
    if (Notification.permission === "granted") {
      new Notification("Weather Update 🌤", {
        body: "Icoming next expense: Amazon prime",
        icon: "/expenses.png", // optional
      });
    }
  };

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        console.log("Notification permission:", permission);
        sendNotification();
      });
    }
  }, []);

  return (
    <div className=''>
      <Myrouter />
      <ToastContainer />
      {/* <Summary /> */}
      {/* <FormExpense /> */}
    </div>
  );
};

export default App;
