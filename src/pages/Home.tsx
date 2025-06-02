import { useEffect, useState } from "react";
import axios from "axios";
import MovementCard from "../features/Home/Components/MovementCard";
const apiUrl = import.meta.env.VITE_API_URL;
import SlotCounter from "react-slot-counter";
import { ActionIcon, Progress } from "@mantine/core";
import { FaCirclePlus, FaMinus, FaPlus } from "react-icons/fa6";
import { Link } from "react-router-dom";
import PieChartHome from "../features/Home/Components/PieChartHome";
import { BsCurrencyDollar } from "react-icons/bs";
import { toast } from "react-toastify";
import { IoWalletOutline } from "react-icons/io5";
import { CiCalendar, CiCirclePlus } from "react-icons/ci";
const budget = 6900;
const Home = () => {
  const [data, setData] = useState({ movements: [], spent: "" });
  const [movements, setMovements] = useState([]);
  const [activeMovement, setActiveMovement] = useState(0);
  const [pieceSelected, setPieceSelected] = useState({});
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

  const handleClickPiece = (piece: object) => {
    setPieceSelected(piece);
    const newData = data.movements.filter(
      (movement) => movement.category === piece.id
    );
    // console.log(newData);
    setMovements(newData);
  };
  const resetMovements = () => setMovements(data.movements);

  const clickCardMovement = (id: int) => {
    activeMovement === id ? setActiveMovement(0) : setActiveMovement(id);
  };
  const addComma = (number: number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const getBarColor = (percentageSpent) => {
    if (percentageSpent <= 50) return "green";
    if (percentageSpent > 50 && percentageSpent <= 75) return "yellow";
    if (percentageSpent > 75 && percentageSpent <= 90) return "orange";
    if (percentageSpent > 90 && percentageSpent <= 100) return "red";
    return "darkred"; // optional: for values over 100%
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
    <div>
      {/* <MenuDrawer></MenuDrawer> */}
      <main className='max-w-lg mx-auto p-4 border border-gray-400 rounded-lg mb-5'>
        <div className=''>
          <h4>Total</h4>
          <div className='flex justify-between'>
            <h1 className='font-bold  flex items-end gap-2'>
              <span
                onClick={() => setToggleSummary(!toggleSummary)}
                className='text-3xl text-white  font-extrabold flex items-center'
              >
                <BsCurrencyDollar />
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
              <small className='text-red-500 text-sm'>
                - ${data.spent.toLocaleString()}
              </small>
            </h1>
            <div className='flex gap-2'>
              <Link to={"/recurrent-txs"}>
                <ActionIcon color='gray' radius='xl' p={3} size={38}>
                  <CiCalendar size={35} />
                </ActionIcon>
              </Link>
              <Link to={"/add-expense"}>
                <ActionIcon color='gray' radius='xl' p={3} size={38}>
                  <CiCirclePlus size={35} />
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
          <div className='text-sm font-bold  flex items-center text-yellow-100'>
            <BsCurrencyDollar size={15} />
            {budget.toLocaleString()}
          </div>
          <div className=' w-[90%] '>
            <Progress
              radius='md'
              color={getBarColor((data.spent / budget) * 100)}
              value={(data.spent / budget) * 100}
            />
          </div>
        </div>
        <div className='mt-2 '>
          <div className='w-full mx-auto border border-gray-400'></div>
          <div className='flex items-center mt-2 justify-between'>
            <div className='text-sm flex gap-2 items-center'>
              <IoWalletOutline size={20} color='lightgreen' /> Previous balance
            </div>
            <div
              className={`${
                data.previous_balance > 0 ? "text-green-500" : "text-red-500"
              } font-bold text-lg flex items-center`}
            >
              {data.previous_balance > 0 ? <FaPlus /> : <FaMinus size={10} />}
              <BsCurrencyDollar size={15} />
              {data.previous_balance &&
                addComma(Math.abs(data.previous_balance).toFixed(2))}
            </div>
          </div>
        </div>
      </main>
      <div className='lg:max-w-lg rounded-lg flex justify-center mx-auto  border border-gray-400 '>
        <PieChartHome
          handleClickPiece={handleClickPiece}
          movements={data.movements}
          reset={resetMovements}
        />
      </div>

      <div className='max-w-lg h-fit max-h-[500px] overflow-y-auto overflow-hidden mx-auto border border-gray-400 rounded-lg px-2 pt-2  mt-5 '>
        {movements.map((movement, i) => (
          <MovementCard
            onClickCard={clickCardMovement}
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
