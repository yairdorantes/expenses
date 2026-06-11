import { useEffect, useState } from "react";
import axios from "axios";
import MovementCard from "../features/Home/Components/MovementCard";
const apiUrl = import.meta.env.VITE_API_URL;
import SlotCounter from "react-slot-counter";
import { ActionIcon, Progress } from "@mantine/core";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import PieChartHome from "../features/Home/Components/PieChartHome";
import { BsCurrencyDollar } from "react-icons/bs";
import { toast } from "react-toastify";
import { IoWalletOutline } from "react-icons/io5";
import { CiCalendar, CiCirclePlus } from "react-icons/ci";
const budget = 6900;

interface Movement {
  id: number;
  amount: number;
  date: string;
  type: string;
  category: string;
  categoryName?: string;
  details: string;
}

interface PeriodData {
  movements: Movement[];
  spent: number;
  remaining: number;
  previous_balance: number;
}

interface PiePiece {
  id: string;
}

const Home = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<PeriodData>({
    movements: [],
    spent: 0,
    remaining: 0,
    previous_balance: 0,
  });
  const [movements, setMovements] = useState<Movement[]>([]);
  const [activeMovement, setActiveMovement] = useState(0);
  const [toggleSummary, setToggleSummary] = useState(true);

  const getData = () => {
    const currentYear = new Date().getFullYear();
    const today = new Date();
    const day = today.getDate();
    const period = day <= 15 ? 1 : 2;
    const month = today.getMonth() + 1;
    axios
      .get(`${apiUrl}/api/period/${period}/${month}/${currentYear}`)
      .then((res) => {
        // console.log(res.data);
        setData(res.data);
        setMovements(res.data.movements);

        console.log(res.data.previous_remaining);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleClickPiece = (piece: PiePiece) => {
    const newData = data.movements.filter(
      (movement) => movement.category === piece.id
    );
    // console.log(newData);
    setMovements(newData);
  };
  const resetMovements = () => setMovements(data.movements);

  const clickCardMovement = (id: number) => {
    activeMovement === id ? setActiveMovement(0) : setActiveMovement(id);
  };
  const addComma = (number: number | string) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const getBarColor = (percentageSpent: number) => {
    if (percentageSpent <= 50) return "green";
    if (percentageSpent > 50 && percentageSpent <= 75) return "yellow";
    if (percentageSpent > 75 && percentageSpent <= 90) return "orange";
    if (percentageSpent > 90 && percentageSpent <= 100) return "red";
    return "darkred"; // optional: for values over 100%
  };

  const handleEditMovement = (id: number) => {
    navigate(`/edit-expense/${id}`);
  };

  const handleDeleteMovement = (id: number) => {
    const shouldDelete = window.confirm("Delete this expense?");
    if (!shouldDelete) return;

    axios
      .delete(`${apiUrl}/api/expenses/${id}`)
      .then(() => {
        toast.success("expense deleted successfully", {
          position: "bottom-center",
        });
        if (activeMovement === id) {
          setActiveMovement(0);
        }
        getData();
      })
      .catch((err) => {
        console.log(err);
        toast.error("something went wrong deleting the expense");
      });
  };

  useEffect(() => {
    getData();
    axios
      .post(`${apiUrl}/api/recurrent_txs`)
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
        toast.error(
          "something went wrong at processing recurrent transactions"
        );
      });
  }, []);

  return (
    <div className='w-full overflow-x-hidden'>
      {/* <MenuDrawer></MenuDrawer> */}
      <main className='w-full max-w-lg mx-auto p-3 sm:p-4 border border-gray-400 rounded-lg mb-5'>
        <div>
          <h4>Total</h4>
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
        <div className=''>
          <div className='flex justify-between'>
            <div>
              <span className='font-bold  text-sm'>Quincenal Budget</span>{" "}
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
        <div className='mt-2 '>
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
        {movements.map((movement, i) => (
          <MovementCard
            onClickCard={clickCardMovement}
            onDelete={handleDeleteMovement}
            onEdit={handleEditMovement}
            active={activeMovement}
            movement={movement}
            key={i}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
