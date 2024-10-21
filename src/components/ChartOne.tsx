import {
  XAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  YAxis,
  CartesianGrid,
} from "recharts";
const data = [
  { name: "Page A", uv: 400, pv: 2400, amt: 2400 },
  { name: "Page B", uv: 300, pv: 2200, amt: 2200 },
  { name: "Page C", uv: 500, pv: 2500, amt: 2500 },
  { name: "Page D", uv: 450, pv: 2100, amt: 2100 },
  { name: "Page E", uv: 600, pv: 2700, amt: 2700 },
  { name: "Page F", uv: 350, pv: 2300, amt: 2300 },
  { name: "Page G", uv: 700, pv: 2900, amt: 2900 },
];

const ChartOne = () => {
  return (
    <div>
      {" "}
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="3%" stopColor={"#00FF00"} stopOpacity={0.8} />
              <stop offset="90%" stopColor="#567fee" stopOpacity={0} />
            </linearGradient>
          </defs>

          <XAxis dataKey="name" fontSize={14} tick={{ fill: "white" }} />
          <YAxis tick={{ fill: "white" }} />
          <CartesianGrid
            vertical={false}
            horizontal={true}
            strokeDasharray="0"
            opacity={0.2}
          />
          <Tooltip contentStyle={{ color: "black" }} />
          {/* <Legend verticalAlign="top" align="center" layout="vertical" /> */}

          <Area
            type="basis"
            dataKey="uv"
            fill="url(#colorUv)"
            stroke={"#0db45b"}
            // strokeLinecap="round"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartOne;
