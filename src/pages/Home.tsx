import { useEffect, useState } from "react";
import axios from "axios";
import MovementCard from "../features/Home/Components/MovementCard";
const apiUrl = import.meta.env.VITE_API_URL;
import SlotCounter from "react-slot-counter";
import { Button, Progress } from "@mantine/core";
import { FaCirclePlus } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { PieChart } from "recharts";
import PieChartHome from "../features/Home/Components/PieChartHome";
import { BiReset } from "react-icons/bi";
import { BsCurrencyDollar } from "react-icons/bs";
import { toast } from "react-toastify";
import Drawer from "../components/ui/MenuDrawer";
import MenuDrawer from "../components/ui/MenuDrawer";

const budget = 7500;
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
        console.log(
          res.data.remaining.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        );
        console.log(res.data, "beeeyeyeyeeyy");
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
      <MenuDrawer></MenuDrawer>
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
            {/* <div>
              <Link to={"/add-expense"}>
                <FaCirclePlus color='white' size={35} />
              </Link>
            </div> */}
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
              color='green'
              value={(data.spent / budget) * 100}
            />
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
