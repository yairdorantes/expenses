import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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

interface TooltipPayload {
  payload: CategoryChartEntry;
}

interface CategoryTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

interface Props {
  movements?: Movement[];
  handleClickPiece: (entry: CategoryChartEntry) => void;
  reset: () => void;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

const formatCurrency = (value: number) => currencyFormatter.format(value);
const formatCompactCurrency = (value: number) =>
  compactCurrencyFormatter.format(value);

const truncateLabel = (label: string) =>
  label.length > 16 ? `${label.slice(0, 15)}...` : label;

const CategoryTooltip = ({ active, payload }: CategoryTooltipProps) => {
  if (!active || !payload?.length) return null;

  const entry = payload[0].payload;

  return (
    <div className='rounded-md border border-gray-500 bg-zinc-950 px-3 py-2 shadow-lg'>
      <div className='text-sm font-semibold text-white'>{entry.name}</div>
      <div className='text-xs text-gray-300'>{formatCurrency(entry.value)}</div>
    </div>
  );
};

const getCategoryData = (
  movements: Movement[],
  categories: CategoryOption[],
) => {
  const categoryTotals: Record<string, number> = {};

  movements.forEach((movement) => {
    if (movement.type === "1" && movement.category !== "14") {
      const amountValue = Number(movement.amount);
      if (!Number.isFinite(amountValue) || amountValue <= 0) return;

      categoryTotals[movement.category] =
        (categoryTotals[movement.category] || 0) + amountValue;
    }
  });

  const totalSum = Object.values(categoryTotals).reduce(
    (sum, value) => sum + value,
    0,
  );

  const categoryMap = new Map(
    categories.map((category) => [category.value, category]),
  );

  movements.forEach((movement) => {
    if (!categoryMap.has(movement.category)) {
      categoryMap.set(movement.category, {
        value: movement.category,
        label: movement.categoryName || getCategoryLabel(movement.category),
      });
    }
  });

  return Array.from(categoryMap.values())
    .map((category) => {
      const value = categoryTotals[category.value] || 0;
      const percentage = totalSum > 0 ? ((value / totalSum) * 100).toFixed(2) : 0;

      return {
        id: category.value,
        name: category.label,
        value,
        percentage: `${percentage}%`,
      };
    })
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);
};

const CategoryExpenseBarChart = ({
  movements = [],
  handleClickPiece,
  reset,
}: Props) => {
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryChartEntry | null>(null);
  const [categories, setCategories] =
    useState<CategoryOption[]>(fallbackCategories);

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await expenseRepository.getFormOptions();
      setCategories(data.categories || fallbackCategories);
    };

    void fetchCategories();
  }, []);

  const chartData = useMemo(
    () => getCategoryData(movements, categories),
    [movements, categories],
  );
  const chartHeight = Math.max(220, chartData.length * 44 + 56);

  useEffect(() => {
    if (
      selectedCategory &&
      !chartData.some((entry) => entry.id === selectedCategory.id)
    ) {
      setSelectedCategory(null);
      reset();
    }
  }, [chartData, reset, selectedCategory]);

  if (chartData.length === 0) {
    return (
      <div className='flex min-h-[220px] w-full items-center justify-center px-4 text-center'>
        <div>
          <div className='text-sm font-semibold text-white'>
            No expenses available
          </div>
          <div className='mt-1 text-xs text-gray-400'>
            Category totals will appear here once expenses are recorded.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full min-w-0 px-1 py-2'>
      <div className='mb-2 flex items-center justify-between gap-2 px-2'>
        <div>
          <h2 className='text-sm font-semibold text-white'>
            Expenses by category
          </h2>
          <p className='text-xs text-gray-400'>
            Sorted by highest total expense
          </p>
        </div>
        {selectedCategory && (
          <button
            className='shrink-0 rounded border border-gray-500 px-2 py-1 text-xs text-gray-200'
            onClick={() => {
              setSelectedCategory(null);
              reset();
            }}
            type='button'
          >
            Show all
          </button>
        )}
      </div>
      <div className='max-h-[460px] overflow-y-auto overflow-x-hidden pr-1'>
        <div style={{ height: chartHeight }}>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={chartData}
              layout='vertical'
              margin={{ top: 8, right: 76, bottom: 12, left: 8 }}
              barCategoryGap={12}
            >
              <CartesianGrid
                horizontal={false}
                stroke='#ffffff'
                strokeOpacity={0.12}
              />
              <XAxis
                type='number'
                tick={{ fill: "#D1D5DB", fontSize: 11 }}
                tickFormatter={formatCompactCurrency}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type='category'
                dataKey='name'
                width={112}
                tick={{ fill: "#F9FAFB", fontSize: 12 }}
                tickFormatter={truncateLabel}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<CategoryTooltip />}
                cursor={{ fill: "rgba(255, 255, 255, 0.06)" }}
              />
              <Bar dataKey='value' radius={[0, 8, 8, 0]} maxBarSize={28}>
                {chartData.map((entry) => {
                  const isSelected = selectedCategory?.id === entry.id;

                  return (
                    <Cell
                      cursor='pointer'
                      fill={getCategoryColor(entry.id, entry.name)}
                      fillOpacity={selectedCategory && !isSelected ? 0.42 : 1}
                      key={entry.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedCategory(null);
                          reset();
                          return;
                        }

                        setSelectedCategory(entry);
                        handleClickPiece(entry);
                      }}
                    />
                  );
                })}
                <LabelList
                  dataKey='value'
                  position='right'
                  formatter={(value: number) => formatCompactCurrency(value)}
                  fill='#E5E7EB'
                  fontSize={11}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CategoryExpenseBarChart;
