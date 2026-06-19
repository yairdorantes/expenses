import { ToastContainer } from "react-toastify";
import Myrouter from "./router/MyRouter";
import { useEffect } from "react";
import { syncService } from "./offline/syncService";

const App = () => {
  useEffect(() => {
    void syncService.syncPending();
  }, []);

  return (
    <div className=''>
      <Myrouter />
      <ToastContainer />
    </div>
  );
};

export default App;
