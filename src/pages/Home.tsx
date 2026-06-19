import { useEffect, useState } from "react";
import MovementCard from "../features/Home/Components/MovementCard";
import SlotCounter from "react-slot-counter";
import { ActionIcon, Progress } from "@mantine/core";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import PieChartHome from "../features/Home/Components/PieChartHome";
import { BsCurrencyDollar } from "react-icons/bs";
import { toast } from "react-toastify";
import { IoWalletOutline } from "react-icons/io5";
import { CiCalendar, CiCirclePlus } from "react-icons/ci";
import { expenseRepository } from "../offline/expenseRepository";
import type { ClassifiedError, LocalExpense, PeriodData } from "../offline/types";

interface PiePiece {
  id: string;
}

type PeriodDataWithError = PeriodData & { error?: ClassifiedError };

const emptyPeriodData: PeriodDataWithError = {
  movements: [],
  spent: 0,
  remaining: 0,
  previous_balance: 0,
  config: {
    totalSavings: 0,
    fortnightlyBudget: 7500,
  },
  source: "local",
};

const Home = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<PeriodDataWithError>(emptyPeriodData);
  const [movements, setMovements] = useState<LocalExpense[]>([]);
  const [activeMovement, setActiveMovement] = useState("");
  const [toggleSummary, setToggleSummary] = useState(true);

  const getData = async () => {
    const currentYear = new Date().getFullYear();
    const today = new Date();
    const day = today.getDate();
    const period = day <= 15 ? 1 : 2;
    const month = today.getMonth() + 1;
    const nextData = await expenseRepository.getPeriodSummary(
      period,
      month,
      currentYear
    );

    setData(nextData);
    setMovements(nextData.movements);

    if (nextData.error) {
      toast.info(nextData.error.message, {
        position: "bottom-center",
        toastId: "period-local-fallback",
      });
    }
  };

  const handleClickPiece = (piece: PiePiece) => {
    const newData = data.movements.filter(
      (movement) => movement.category === piece.id
    );
    setMovements(newData);
  };

  const resetMovements = () => setMovements(data.movements);

  const clickCardMovement = (id: string) => {
    activeMovement === id ? setActiveMovement("") : setActiveMovement(id);
  };

  const addComma = (number: number | string) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const getBarColor = (percentageSpent: number) => {
    if (percentageSpent <= 50) return "green";
    if (percentageSpent > 50 && percentageSpent <= 75) return "yellow";
    if (percentageSpent > 75 && percentageSpent <= 90) return "orange";
    if (percentageSpent > 90 && percentageSpent <= 100) return "red";
    return "darkred";
  };

  const handleEditMovement = (id: string) => {
    navigate(`/edit-expense/${id}`);
  };

  const handleDeleteMovement = async (id: string) => {
    const shouldDelete = window.confirm("Delete this expense?");
    if (!shouldDelete) return;

    try {
      await expenseRepository.deleteExpense(id);
      toast.success("Expense deleted locally. Sync will run automatically.", {
        position: "bottom-center",
      });

      if (activeMovement === id) {
        setActiveMovement("");
      }

      void getData();
    } catch (error) {
      console.error(error);
      toast.error("Could not delete this expense locally.");
    }
  };

  useEffect(() => {
    void getData();

    const handleLocalChange = () => {
      void getData();
    };

    window.addEventListener("expenses:local-change", handleLocalChange);

    void expenseRepository.processRecurringTransactions().then((error) => {
      if (error) {
        toast.info(error.message, {
          position: "bottom-center",
          toastId: "recurring-local-fallback",
        });
      }
    });

    return () => {
      window.removeEventListener("expenses:local-change", handleLocalChange);
    };
  }, []);

  const pendingCount = data.movements.filter(
    (movement) => movement.syncState !== "synced"
  ).length;
  const networkLabel = !navigator.onLine
    ? "Offline"
    : pendingCount > 0
    ? `${pendingCount} pending`
    : "Synced";
  const networkColor =
    !navigator.onLine || pendingCount > 0 ? "text-yellow-300" : "text-green-300";
  const budget = data.config.fortnightlyBudget;

  return (
    <div className='w-full overflow-x-hidden'>
      <main className='w-full max-w-lg mx-auto p-3 sm:p-4 border border-gray-400 rounded-lg mb-5'>
        <div>
          <div className='flex items-center justify-between'>
            <h4>Total</h4>
            <small className={`font-semibold ${networkColor}`}>
              {networkLabel}
            </small>
          </div>
          <div className='flex items-start justify-between gap-2'>
            <h1 className='font-bold flex min-w-0 flex-wrap items-end gap-x-2 gap-y-1'>
              <span
                onClick={() => setToggleSummary(!toggleSummary)}
                className='text-2xl sm:text-3xl text-white font-extrabold flex min-w-0 items-center'
              >
                <BsCurrencyDollar className='shrink-0' />
                {toggleSummary ? (
                  <SlotCounter
                    value={addComma((budget - data.spent).toFixed(2))}
                  />
                ) : (
                  <SlotCounter
                    containerClassName='text-teal-500'
                    value={addComma(data.remaining.toFixed(2))}
                  />
                )}
              </span>
              <small className='text-red-500 text-xs sm:text-sm whitespace-nowrap'>
                - ${data.spent.toLocaleString()}
              </small>
            </h1>
            <div className='flex shrink-0 gap-2'>
              <Link to={"/recurrent-txs"}>
                <ActionIcon color='gray' radius='xl' p={3} size={34}>
                  <CiCalendar size={30} />
                </ActionIcon>
              </Link>
              <Link to={"/add-expense"}>
                <ActionIcon color='gray' radius='xl' p={3} size={34}>
                  <CiCirclePlus size={30} />
                </ActionIcon>
              </Link>
            </div>
          </div>
        </div>
        <div>
          <div className='flex justify-between'>
            <div>
              <span className='font-bold text-sm'>Quincenal Budget</span>{" "}
            </div>
            <div>
              <span className='font-bold text-white'>
                {((data.spent / budget) * 100).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <div className='text-sm font-bold flex shrink-0 items-center text-yellow-100'>
            <BsCurrencyDollar size={15} />
            {budget.toLocaleString()}
          </div>
          <div className='min-w-0 flex-1'>
            <Progress
              radius='md'
              color={getBarColor((data.spent / budget) * 100)}
              value={(data.spent / budget) * 100}
            />
          </div>
        </div>
        <div className='mt-2'>
          <div className='w-full mx-auto border border-gray-400'></div>
          <div className='flex items-center mt-2 justify-between gap-2'>
            <div className='text-sm flex min-w-0 gap-2 items-center'>
              <IoWalletOutline size={20} color='lightgreen' /> Previous balance
            </div>
            <div
              className={`${
                data.previous_balance > 0 ? "text-green-500" : "text-red-500"
              } font-bold text-base sm:text-lg flex shrink-0 items-center`}
            >
              {data.previous_balance > 0 ? <FaPlus /> : <FaMinus size={10} />}
              <BsCurrencyDollar size={15} />
              {data.previous_balance &&
                addComma(Math.abs(data.previous_balance).toFixed(2))}
            </div>
          </div>
        </div>
      </main>
      <div className='w-full max-w-lg rounded-lg flex justify-center mx-auto border border-gray-400 overflow-hidden px-1 py-2'>
        <PieChartHome
          handleClickPiece={handleClickPiece}
          movements={data.movements}
          reset={resetMovements}
        />
      </div>

      <div className='w-full max-w-lg h-fit max-h-[500px] overflow-y-auto overflow-x-hidden mx-auto border border-gray-400 rounded-lg px-2 pt-2 mt-5'>
        {movements.map((movement) => (
          <MovementCard
            onClickCard={clickCardMovement}
            onDelete={handleDeleteMovement}
            onEdit={handleEditMovement}
            active={activeMovement}
            movement={movement}
            key={movement.localId}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
