from datetime import date, timedelta
import traceback
from loguru import logger
from .models import Expense, RecurringTransaction
from django.utils import timezone
import calendar


def get_next_weekly_transaction_date(target_weekday: int, date: date) -> date:
    if date is None:
        return None
    days_ahead = target_weekday - date.weekday()
    if days_ahead <= 0:
        days_ahead += 7
    return date + timedelta(days=days_ahead)


def get_next_monthly_transaction_date(
    start_day: int, transaction_date: date = None
) -> date:
    if transaction_date is None:
        return None

    # If the day already passed this month, move to next month
    if transaction_date.day >= start_day:
        if transaction_date.month == 12:  # December, next month is January next year
            next_month = 1
            next_year = transaction_date.year + 1
        else:
            next_month = transaction_date.month + 1
            next_year = transaction_date.year
    else:
        next_month = transaction_date.month
        next_year = transaction_date.year

    # Handle months with fewer days (e.g., Feb 30 -> Feb 28/29)
    # Clamp day to last day of month if needed
    try:
        return date(next_year, next_month, start_day)
    except ValueError:
        # The day is out of range for the month, so pick the last day
        from calendar import monthrange

        last_day = monthrange(next_year, next_month)[1]
        return date(next_year, next_month, last_day)


def get_next_fortnightly_pay_date(current_date: date):
    if current_date.month == 12:
        next_month = 1
        next_year = current_date.year + 1
    else:
        next_month = current_date.month + 1
        next_year = current_date.year

    if current_date.day <= 15:
        last_business_day = max(
            calendar.monthcalendar(current_date.year, current_date.month)[-1][:5]
        )
        return date(current_date.year, current_date.month, last_business_day)
    else:
        return date(next_year, next_month, 15)


def process_recurring_transactions():
    try:

        today = timezone.now().date()
        logger.info(f"today: {today}")
        recurring_transactions = RecurringTransaction.objects.filter(
            next_date__lte=today, is_active=True
        )
        for transaction in recurring_transactions:
            expense_exists = Expense.objects.filter(
                category=transaction.category,
                type=transaction.type,
                date=transaction.next_date,
            ).exists()

            if not expense_exists:

                if transaction.frequency == "weekly":
                    while transaction.next_date <= today:
                        expense = Expense.objects.create(
                            category=transaction.category,
                            type=transaction.type,
                            amount=transaction.amount,
                            date=transaction.next_date,
                            payment_method=transaction.payment_method,
                            account=transaction.account,
                            details=transaction.details,
                        )
                        expense.save()
                        transaction.next_date = get_next_weekly_transaction_date(
                            transaction.next_date.weekday(), transaction.next_date
                        )
                        if transaction.next_date > today:
                            transaction.save()
                            break
                elif transaction.frequency == "monthly":
                    logger.debug(f"{transaction.next_date} {today}")
                    while transaction.next_date <= today:
                        expense = Expense.objects.create(
                            category=transaction.category,
                            type=transaction.type,
                            amount=transaction.amount,
                            date=transaction.next_date,
                            payment_method=transaction.payment_method,
                            account=transaction.account,
                            details=transaction.details,
                        )

                        expense.save()
                        transaction.next_date = get_next_monthly_transaction_date(
                            transaction.next_date.day, transaction.next_date
                        )
                        if transaction.next_date > today:
                            transaction.save()
                            break
                elif transaction.frequency == "fortnightly":
                    # this handles my jobs fortnightly payments  (icarus and class)
                    while transaction.next_date <= today:
                        expense = Expense.objects.create(
                            category=transaction.category,
                            type=transaction.type,
                            amount=transaction.amount,
                            date=transaction.next_date,
                            payment_method=transaction.payment_method,
                            account=transaction.account,
                            details=transaction.details,
                        )
                        expense.save()
                        transaction.next_date = get_next_fortnightly_pay_date(
                            transaction.next_date
                        )
                        if transaction.next_date > today:
                            transaction.save()
                            break
            else:
                print(
                    f"Expense for {transaction.details,"next date: ",transaction.next_date} already recorded."
                )
        logger.info(f"{len(recurring_transactions)} recurring transactions processed.")
    except Exception as e:
        print("Error processing recurring transactions:", e)
        traceback.print_exc()
