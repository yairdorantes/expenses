import axios from "axios";
import { useEffect, useState } from "react";
const apiUrl = import.meta.env.VITE_API_URL;
import SlotCounter from "react-slot-counter";
import ChartOne from "./ChartOne";

const Summary = () => {
  const [total, setTotal] = useState(0);
  const [spent, setSpent] = useState(0);
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    axios
      .get(`${apiUrl}/api/expenses`)
      .then((res) => {
        console.log(res.data);
        setTotal(res.data.total);
        setSpent(res.data.spent);
        setRemaining(res.data.remaining);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <div className="max-w-lg bg-teal-900 mx-auto rounded-lg p-4">
      {/* <SlotCounter value={total} /> */}
      <div className="flex justify-center  flex-col items-center">
        <div className="font-semibold">Total balance</div>
        <div className="font-extrabold  font-sans  text-2xl">
          $<SlotCounter value={remaining.toLocaleString()} />
        </div>
      </div>
      <div className="bg-white w-fit rounded-md px-3 py-2 mx-auto">
        <div className="font-semibold text-red-500">
          -$
          <SlotCounter value={spent} />
        </div>
      </div>
      <ChartOne></ChartOne>
    </div>
  );
};

export default Summary;
