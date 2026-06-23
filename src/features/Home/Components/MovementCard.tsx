import { format } from "date-fns";
import { FaChevronDown } from "react-icons/fa";
import { ActionIcon } from "@mantine/core";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import type { MouseEvent } from "react";
import {
  getCategoryColor,
  getCategoryIcon,
  getCategoryLabel,
} from "../../categories";
import type { LocalExpense, SyncState } from "../../../offline/types";

// Expense dates are calendar dates, not instants. Parsing `YYYY-MM-DD` with
// `new Date(value)` treats it as UTC midnight and can move it to the previous
// day when rendered in a timezone west of UTC.
const parseExpenseDate = (value: string) => {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
};

interface Props {
  movement: LocalExpense;
  onClickCard: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  active: string;
}

const syncLabels: Record<SyncState, { label: string; className: string }> = {
  synced: { label: "", className: "" },
  pending: { label: "Pending Sync", className: "text-yellow-300" },
  failed: { label: "Sync Failed", className: "text-red-300" },
};

const MovementCard = ({
  movement,
  onClickCard,
  onDelete,
  onEdit,
  active,
}: Props) => {
  const handleEdit = (event: MouseEvent) => {
    event.stopPropagation();
    onEdit(movement.localId);
  };

  const handleDelete = (event: MouseEvent) => {
    event.stopPropagation();
    onDelete(movement.localId);
  };

  const syncLabel = syncLabels[movement.syncState];

  return (
    <div
      className='rounded-lg mb-2  bg-neutral-700'
      onClick={() => onClickCard(movement.localId)}
    >
      <div className='flex   border-opacity-20 p-4   justify-between'>
        <div className='flex gap-2'>
          <div
            style={{
              backgroundColor: getCategoryColor(
                movement.category,
                movement.categoryName
              ),
            }}
            className='w-10 h-10 flex items-center justify-center rounded-full text-white'
          >
            {getCategoryIcon(movement.category, movement.categoryName)}
          </div>
          <div>
            <div className='font-bold'>
              {getCategoryLabel(movement.category, [
                {
                  value: movement.category,
                  label: movement.categoryName || "",
                },
              ])}{" "}
            </div>
            <div className='flex flex-wrap items-center gap-x-2 gap-y-1'>
              <small>{format(parseExpenseDate(movement.date), "MMM d, yyyy")}</small>
              {movement.syncState !== "synced" && (
                <small className={`font-semibold ${syncLabel.className}`}>
                  {syncLabel.label}
                </small>
              )}
            </div>
          </div>
        </div>
        <div className='flex flex-col justify-between'>
          <div className='font-extrabold'> -${movement.amount}</div>
          <div className='flex justify-end gap-1'>
            <ActionIcon
              aria-label='Edit expense'
              color='blue'
              size='sm'
              variant='subtle'
              onClick={handleEdit}
            >
              <FiEdit2 />
            </ActionIcon>
            <ActionIcon
              aria-label='Delete expense'
              color='red'
              size='sm'
              variant='subtle'
              onClick={handleDelete}
            >
              <FiTrash2 />
            </ActionIcon>
            <ActionIcon
              aria-label='Show expense details'
              color='gray'
              size='sm'
              variant='subtle'
            >
              <FaChevronDown />
            </ActionIcon>
          </div>
        </div>
      </div>

      {active === movement.localId && (
        <div className='text-center text-sm border-t p-2 border-gray-200 border-opacity-50'>
          <div>{movement.details}</div>
          {movement.syncError && (
            <div className='mt-1 text-red-300'>{movement.syncError}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default MovementCard;
