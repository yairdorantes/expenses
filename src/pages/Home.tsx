import { useEffect, useState } from "react";
import axios from "axios";
import MovementCard from "../features/Home/Components/MovementCard";
const apiUrl = import.meta.env.VITE_API_URL;
import SlotCounter from "react-slot-counter";
import { Progress } from "@mantine/core";
import { FaCirclePlus } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { PieChart } from "recharts";
import PieChartHome from "../features/Home/Components/PieChartHome";

const budget = 7500;
const Home = () => {
  const [data, setData] = useState({ movements: [], spent: "" });
  const [movements, setMovements] = useState([]);
  const [activeMovement, setActiveMovement] = useState(0);
  const getData = () => {
    const today = new Date();
    const day = today.getDate();
    const period = day <= 15 ? 1 : 2;
    const month = today.getMonth() + 1;
    axios
      .get(`${apiUrl}/api/period/${period}/${month}/2024`)
      .then((res) => {
        console.log(res.data);
        setData(res.data);
        setMovements(res.data.movements);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleClickPiece = (piece: object) => {
    const newData = data.movements.filter(
      (movement) => movement.category === piece.id
    );
    // console.log(newData);
    setMovements(newData);
    console.log(newData);
  };

  const clickCardMovement = (id: int) => {
    activeMovement === id ? setActiveMovement(0) : setActiveMovement(id);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div>
      <main className="max-w-lg mx-auto ">
        <div className=" p-4  rounded-lg">
          <h4>Total</h4>
          <div className="flex justify-between">
            <h1 className="font-bold  flex flex-col">
              <span className="text-3xl">
                $<SlotCounter value={(budget - data.spent).toFixed(2)} />
              </span>
              <small className="text-red-500">
                - ${data.spent.toLocaleString()}
              </small>
            </h1>
            <div>
              <Link to={"/add-expense"}>
                <FaCirclePlus color="white" size={35} />
              </Link>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="flex justify-between">
            <div>
              <span className="font-bold text-sm">Quincenal Budget</span>{" "}
              <span className="text-sm font-bold text-gray-400">
                ${budget.toLocaleString()}
              </span>{" "}
            </div>
            <div>
              <span className="font-bold text-white">
                {((data.spent / budget) * 100).toFixed(2)}%
              </span>
            </div>
          </div>
          <Progress
            radius="md"
            color="teal"
            value={(data.spent / budget) * 100}
          />
        </div>
      </main>
      <div className="flex justify-center">
        <PieChartHome
          handleClickPiece={handleClickPiece}
          movements={data.movements}
        />{" "}
      </div>

      <div className="max-w-lg h-[500px] overflow-y-auto overflow-hidden mx-auto  mt-5 ">
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
