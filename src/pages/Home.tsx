import { useEffect, useState } from "react";
import axios from "axios";
import MovementCard from "../features/Home/Components/MovementCard";
const apiUrl = import.meta.env.VITE_API_URL;
import SlotCounter from "react-slot-counter";
import { Progress } from "@mantine/core";
import { FaCirclePlus } from "react-icons/fa6";
import { Link } from "react-router-dom";

const Home = () => {
  const getExpenses = (category: string, type: string) => {};
  const [data, setData] = useState({ movements: [], spent: "" });

  const getData = () => {
    axios
      .get(`${apiUrl}/api/period/2/10/2024`)
      .then((res) => {
        console.log(res.data);
        setData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div>
      <main className="max-w-lg mx-auto ">
        <div className="bg-teal-900 p-4  rounded-lg">
          <h4>Total</h4>
          <div className="flex justify-between">
            <h1 className="font-bold text-3xl">
              $<SlotCounter value={data.spent.toLocaleString()} />
            </h1>
            <div>
              <Link to={"/add-expense"}>
                <FaCirclePlus color="white" size={35} />
              </Link>
            </div>
          </div>
        </div>
        <div>
          <div>
            Quincenal Budget $7,500 %{((data.spent / 7500) * 100).toFixed(2)}
          </div>
          <Progress radius="md" value={(data.spent / 7500) * 100} />
        </div>
      </main>
      <div className="max-w-lg h-[500px] overflow-y-auto overflow-hidden mx-auto  mt-5 ">
        {data.movements.map((movement, i) => (
          <MovementCard movement={movement} key={i} />
        ))}
      </div>
    </div>
  );
};

export default Home;
