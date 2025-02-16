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
  }, []);

  return (
    <div>
      <main className='max-w-lg mx-auto '>
        <div className=' p-4  rounded-lg'>
          <h4>Total</h4>
          <div className='flex justify-between'>
            <h1 className='font-bold  flex flex-col'>
              <span
                onClick={() => setToggleSummary(!toggleSummary)}
                className='text-3xl  flex items-center'
              >
                <BsCurrencyDollar />
                {toggleSummary ? (
                  <SlotCounter
                    value={addComma((budget - data.spent).toFixed(2))}
                  />
                ) : (
                  <SlotCounter
                    containerClassName='text-teal-600'
                    value={addComma(data.remaining)}
                  />
                )}
              </span>
              <small className='text-red-500'>
                - ${data.spent.toLocaleString()}
              </small>
            </h1>
            <div>
              <Link to={"/add-expense"}>
                <FaCirclePlus color='white' size={35} />
              </Link>
            </div>
          </div>
        </div>
        <div className='p-4'>
          <div className='flex justify-between'>
            <div>
              <span className='font-bold text-sm'>Quincenal Budget</span>{" "}
              <span className='text-sm font-bold flex items-center text-gray-400'>
                <BsCurrencyDollar size={15} />
                {budget.toLocaleString()}
              </span>{" "}
            </div>
            <div>
              <span className='font-bold text-white'>
                {((data.spent / budget) * 100).toFixed(2)}%
              </span>
            </div>
          </div>
          <Progress
            radius='md'
            color='teal'
            value={(data.spent / budget) * 100}
          />
        </div>
      </main>
      <div className='flex justify-center relative'>
        <PieChartHome
          handleClickPiece={handleClickPiece}
          movements={data.movements}
        />
      </div>

      <div className='flex justify-center'>
        <Button onClick={resetMovements}>
          <BiReset size={24} />
        </Button>
      </div>
      <div className='max-w-lg h-[500px] overflow-y-auto overflow-hidden mx-auto  mt-5 '>
        <h2 className=''>
          Expent percentaje:
          <span className='font-bold'> {pieceSelected.percentage}</span>
        </h2>
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
