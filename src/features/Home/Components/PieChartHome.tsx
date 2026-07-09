import { useEffect, useState } from "react";
import {
  Cell,
  Legend,
  Label,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  fallbackCategories,
  getCategoryColor,
  getCategoryLabel,
  type CategoryOption,
} from "../../categories";
import { expenseRepository } from "../../../offline/expenseRepository";

interface Movement {
  amount: number | string;
  type: string;
  category: string;
  categoryName?: string;
}

interface CategoryChartEntry {
  id: string;
  name: string;
  value: number;
  percentage: string;
}

interface Props {
  movements?: Movement[];
  handleClickPiece: (entry: CategoryChartEntry) => void;
  reset: () => void;
}

// const movements = [
//   { amount: "401.00", type: "1", category: "6", date: "2024-10-16" },
//   { amount: "573.00", type: "1", category: "14", date: "2024-10-16" },
//   { amount: "400.00", type: "1", category: "1", date: "2024-10-19" },
//   { amount: "500.00", type: "1", category: "11", date: "2024-10-18" },
//   { amount: "1500.00", type: "1", category: "14", date: "2024-10-19" },
// ];

const PieChartHome = ({ movements = [], handleClickPiece, reset }: Props) => {
  const [sliceSelected, setSliceSelected] =
    useState<CategoryChartEntry | null>(null);
  const [categories, setCategories] =
    useState<CategoryOption[]>(fallbackCategories);

  function getCategoryDataWithPercentage(movements: Movement[]) {
    const categoryTotals: Record<string, number> = {};

    movements.forEach((movement) => {
      if (movement.type === "1" && movement.category !== "14") {
        const { category, amount } = movement;
        const amountValue = Number(amount);

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
    const categoryMap = new Map(
      categories.map((category) => [category.value, category])
    );

    movements.forEach((movement) => {
      if (!categoryMap.has(movement.category)) {
        categoryMap.set(movement.category, {
          value: movement.category,
          label: movement.categoryName || getCategoryLabel(movement.category),
        });
      }
    });

    const data = Array.from(categoryMap.values()).map((category) => {
      const value = categoryTotals[category.value] || 0;
      const percentage =
        totalSum > 0 ? ((value / totalSum) * 100).toFixed(2) : 0;
      return {
        id: category.value,
        name: category.label,
        value,
        percentage: `${percentage}%`,
      };
    }).filter((item) => item.value > 0);

    return data;
  }

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await expenseRepository.getFormOptions();
      setCategories(data.categories || fallbackCategories);
    };

    void fetchCategories();
  }, []);
  useEffect(() => {
    if (movements.length > 0) {
      const categoryData = getCategoryDataWithPercentage(movements);
      if (categoryData.length > 0) {
        const maxSpentObj = categoryData.reduce((max, item) =>
          item.value > max.value ? item : max
        );
        setSliceSelected(maxSpentObj);
      } else {
        setSliceSelected(null); // Reset if no data
      }
    } else {
      setSliceSelected(null); // Reset if no movements
    }
  }, [movements, categories]);
  const chartData = getCategoryDataWithPercentage(movements);

  return (
    <div className='h-[300px] w-full min-w-0 sm:h-[360px]'>
      <ResponsiveContainer width='100%' height='100%'>
        <PieChart margin={{ top: 0, right: 4, bottom: 12, left: 4 }}>
          <Pie
            data={chartData}
            cx='50%'
            cy='42%'
            innerRadius={58}
            outerRadius={92}
            fill='#8884d8'
            dataKey='value'
            labelLine={false}
            stroke='none'
          >
            <Label
              position='center'
              content={({ viewBox }) => {
                if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) {
                  return null;
                }

                const { cx, cy } = viewBox;
                return (
                  <text
                    x={cx}
                    y={cy}
                    fill='#fff'
                    textAnchor='middle'
                    dominantBaseline='middle'
                    fontSize='11px'
                  >
                    <tspan x={cx} dy='-1.7em'>
                      {sliceSelected && `% Spent`}
                    </tspan>
                    <tspan x={cx} dy='1.2em'>
                      {sliceSelected && sliceSelected.name}
                    </tspan>
                    <tspan fontWeight='bold' fontSize={22} x={cx} dy='1.2em'>
                      {sliceSelected && sliceSelected.percentage}
                    </tspan>
                  </text>
                );
              }}
            />
            {chartData.map((entry, index) => (
              <Cell
                onClick={() => {
                  const isSameSlice = sliceSelected?.id === entry.id;

                  if (isSameSlice) {
                    setSliceSelected(null);
                    reset();
                    return;
                  }

                  setSliceSelected(entry);
                  handleClickPiece(entry);
                }}
                key={`cell-${index}`}
                fill={getCategoryColor(entry.id, entry.name)}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ color: "black" }}
            formatter={(value, name) => [`$${Number(value).toLocaleString()}`, name]}
          />
          <Legend
            verticalAlign='bottom'
            iconSize={8}
            wrapperStyle={{
              fontSize: 11,
              lineHeight: "16px",
              maxWidth: "100%",
              paddingInline: 8,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChartHome;
