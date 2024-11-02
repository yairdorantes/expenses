import { MdDirectionsBike } from "react-icons/md";
import { FiMinus } from "react-icons/fi";
import {
  MdHealthAndSafety,
  MdFastfood,
  MdCommute,
  MdHome,
  MdLocalGasStation,
  MdTheaterComedy,
  MdCheckroom,
  MdSchool,
  MdFlight,
  MdSelfImprovement,
  MdCardGiftcard,
  // MdInsurance,
  MdAttachMoney,
  MdAccountBalance,
  MdMoneyOff,
  MdPayment,
  MdMore,
} from "react-icons/md"; // Add your desired icons
import { format } from "date-fns";

interface Movement {
  amount: number;
  date: string;
  type: string;
  category: string;
}
interface Props {
  movement: Movement;
}

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
];
const categoryIcons = {
  "1": <MdHealthAndSafety color="white" />,
  "2": <MdFastfood color="white" />,
  "3": <MdCommute color="white" />,
  "4": <MdHome color="white" />,
  "5": <MdLocalGasStation color="white" />,
  "6": <MdTheaterComedy color="white" />,
  "7": <MdCheckroom color="white" />,
  "8": <MdSchool color="white" />,
  "9": <MdFlight color="white" />,
  "10": <MdSelfImprovement color="white" />,
  "11": <MdCardGiftcard color="white" />,
  // "12": <MdInsurance color="white" />, // Uncomment if you have an icon for insurance
  "13": <MdAttachMoney color="white" />,
  "14": <MdAccountBalance color="white" />,
  "15": <MdMoneyOff color="white" />,
  "16": <MdPayment color="white" />,
  "17": <MdMore color="white" />,
};

const categoryColors = {
  "1": "#FF6F61", // Health (coral)
  "2": "#FFC107", // Food (amber)
  "3": "#D50057", // Transportation (deep pink)
  "4": "#C2185B", // Housing (pink)
  "5": "#E91E63", // Utilities (deep pink)
  "6": "#00BFFF", // Entertainment (dodger blue)
  "7": "#FF5722", // Clothing (deep orange)
  "8": "#9C27B0", // Education (purple)
  "9": "#4CAF50", // Travel (green)
  "10": "#F44336", // Personal Care (red)
  "11": "#FF9800", // Gifts (orange)
  "12": "#673AB7", // Insurance (deep purple)
  "13": "#3F51B5", // Investments (indigo)
  "14": "#2196F3", // Lend money (blue)
  "15": "#FFEB3B", // Repayment (yellow)
  "16": "#8D6E63", // Paycheck (brown)
  "17": "#B0BEC5", // Other (light gray)
};

function getCategoryName(categoryNumber: string) {
  const category = CATEGORY_CHOICES.find(
    ([number]) => number === categoryNumber
  );
  return category ? category[1] : "Unknown Category";
}
function getCategoryIcon(categoryNumber: string) {
  return categoryIcons[categoryNumber] || <MdMore />; // Default icon if not found
}
function getCategoryColor(categoryNumber: string) {
  return categoryColors[categoryNumber] || "#000000"; // Default color if not found
}

const MovementCard = ({ movement }: Props) => {
  return (
    <div className="flex border-t-[1px] border-white  border-opacity-20 p-4 justify-between">
      <div className="flex gap-2">
        <div
          style={{ backgroundColor: getCategoryColor(movement.category) }}
          className={`w-10 h-10 flex items-center bg-[${getCategoryColor(
            movement.category
          )}] justify-center  rounded-full`}
        >
          {getCategoryIcon(movement.category)}
        </div>
        <div>
          <div className="font-bold">{getCategoryName(movement.category)} </div>
          <small>{format(new Date(movement.date), "MMM d, yyyy")}</small>
        </div>
      </div>
      <div className="font-bold flex items-center gap-1">
        {" "}
        <FiMinus size={12} /> ${movement.amount}
      </div>
    </div>
  );
};

export default MovementCard;
