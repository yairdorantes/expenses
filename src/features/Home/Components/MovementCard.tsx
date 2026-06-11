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

interface Movement {
  id: number;
  amount: number;
  date: string;
  type: string;
  category: string;
  categoryName?: string;
  details: string;
}
interface Props {
  movement: Movement;
  onClickCard: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
  active: number;
}

const MovementCard = ({
  movement,
  onClickCard,
  onDelete,
  onEdit,
  active,
}: Props) => {
  const handleEdit = (event: MouseEvent) => {
    event.stopPropagation();
    onEdit(movement.id);
  };

  const handleDelete = (event: MouseEvent) => {
    event.stopPropagation();
    onDelete(movement.id);
  };

  return (
    <div
      className='rounded-lg mb-2  bg-neutral-700'
      onClick={() => onClickCard(movement.id)}
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
            <small>{format(new Date(movement.date), "MMM d, yyyy")}</small>
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

      {active === movement.id && (
        <div className='text-center text-sm border-t p-2 border-gray-200 border-opacity-50'>
          {movement.details}
        </div>
      )}
    </div>
  );
};

export default MovementCard;
