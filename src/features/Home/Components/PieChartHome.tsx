import { useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, LabelList } from "recharts";

const COLORS = [
  "#FF6F61", // Health (coral)
  "#FFC107", // Food (amber)
  "#D50057", // Transportation (deep pink)
  "#C2185B", // Housing (pink)
  "#E91E63", // Utilities (deep pink)
  "#00BFFF", // Entertainment (dodger blue)
  "#FF5722", // Clothing (deep orange)
  "#9C27B0", // Education (purple)
  "#4CAF50", // Travel (green)
  "#F44336", // Personal Care (red)
  "#FF9800", // Gifts (orange)
  "#673AB7", // Insurance (deep purple)
  "#3F51B5", // Investments (indigo)
  "#2196F3", // Lend money (blue)
  "#FFEB3B", // Repayment (yellow)
  "#8D6E63", // Paycheck (brown)
  "#B0BEC5", // Other (light gray)
  "#1c7e1f", // Other (light gray)
];
const CATEGORY_CHOICES = [
  ["1", "Health"],
  ["2", "Food"],
  ["3", "Transportation"],
  ["4", "Housing"],
  ["5", "Utilities"],
  ["6", "Entertainment"],
  ["7", "Clothing"],
  ["8", "Education"],
  ["9", "Travel"],
  ["10", "Personal Care"],
  ["11", "Gifts"],
  ["12", "Insurance"],
  ["13", "Investments"],
  ["14", "Lend money"],
  ["15", "Repayment"],
  ["16", "Paycheck"],
  ["17", "Other"],
  ["18", "Bicycle"],
];

// const movements = [
//   { amount: "401.00", type: "1", category: "6", date: "2024-10-16" },
//   { amount: "573.00", type: "1", category: "14", date: "2024-10-16" },
//   { amount: "400.00", type: "1", category: "1", date: "2024-10-19" },
//   { amount: "500.00", type: "1", category: "11", date: "2024-10-18" },
//   { amount: "1500.00", type: "1", category: "14", date: "2024-10-19" },
// ];

const PieChartHome = ({ movements = [], handleClickPiece }) => {
  function getCategoryDataWithPercentage(movements) {
    const categoryTotals = {};

    movements.forEach((movement) => {
      if (movement.type === "1" && movement.category !== "14") {
        const { category, amount } = movement;
        const amountValue = parseFloat(amount);

        // Add amount to the category total
        if (categoryTotals[category]) {
          categoryTotals[category] += amountValue;
        } else {
          categoryTotals[category] = amountValue;
        }
      }
    });

    // Calculate the total sum of all values
    const totalSum = Object.values(categoryTotals).reduce(
      (sum, value) => sum + value,
      0
    );

    // Convert the totals into the desired array format with percentages
    const data = CATEGORY_CHOICES.map(([id, name]) => {
      const value = categoryTotals[id] || 0;
      const percentage =
        totalSum > 0 ? ((value / totalSum) * 100).toFixed(2) : 0;
      return { id, name, value, percentage: `${percentage}%` };
    }).filter((item) => item.value > 0);

    return data;
  }

  useEffect(() => {}, [movements]);

  return (
    <PieChart width={400} height={400}>
      <Pie
        data={getCategoryDataWithPercentage(movements)}
        cx="50%"
        cy="50%"
        outerRadius={120}
        fill="#8884d8"
        dataKey="value"
        // label={"category"}
        label
        stroke="none"
      >
        {getCategoryDataWithPercentage(movements).map((entry, index) => (
          <Cell
            onClick={() => handleClickPiece(entry)}
            key={`cell-${index}`}
            fill={COLORS[parseInt(entry.id) - 1]}
          />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
};

export default PieChartHome;
