import { useEffect, useState } from "react";
import ChartOne from "../features/Home/Components/ChartOne";
import { expenseRepository } from "../offline/expenseRepository";

const Summary = () => {
  const [total, setTotal] = useState(0);
  const [spent, setSpent] = useState(0);
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const today = new Date();
    const period = today.getDate() <= 15 ? 1 : 2;
    const month = today.getMonth() + 1;
    const applyData = (data: { remaining: number; spent: number }) => {
      setTotal(data.remaining + data.spent);
      setSpent(data.spent);
      setRemaining(data.remaining);
    };

    void expenseRepository
      .getLocalPeriodSummary(period, month, currentYear)
      .then(applyData);

    void expenseRepository
      .getPeriodSummary(period, month, currentYear)
      .then(applyData);
  }, []);

  return (
    <div className='max-w-lg bg-teal-900 mx-auto rounded-lg p-4'>
      {/* <SlotCounter value={total} /> */}
      <div className='flex justify-center  flex-col items-center'>
        <div className='font-semibold'>Total balance</div>
        <div className='font-extrabold  font-sans  text-2xl'>
          {/* $<SlotCounter value={remaining && remaining} /> */}
        </div>
      </div>
      <div className='bg-white w-fit rounded-md px-3 py-2 mx-auto'>
        <div className='font-semibold text-red-500'>
          -$
          {/* <SlotCounter value={spent && spent} /> */}
        </div>
      </div>
      <ChartOne />
    </div>
  );
};

export default Summary;
