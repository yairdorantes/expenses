from datetime import date, timedelta
import json
from django.views import View
import traceback
from datetime import timedelta
from loguru import logger
from django.http import JsonResponse, HttpResponse
from .models import Expense, Category, Method, Account, Type, RecurringTransaction
from django.utils import timezone
import calendar


class Expenses(View):
    def get(self, request):

        return JsonResponse({})

    def post(self, request):
        jd = json.loads(request.body)
        print(jd)
        expense_data = {
            "amount": jd.get("amount"),
            "category": Category.objects.get(id=int(jd.get("category"))),
            "type": Type.objects.get(id=int(jd.get("type"))),
            "date": jd.get("date"),  # Assuming 'date' is a DateField in your model
            "payment_method": Method.objects.get(id=int(jd.get("paymentMethod"))),
            "details": jd.get("details"),
            "account": Account.objects.get(id=int(jd.get("account"))),
        }
        Expense.objects.create(**expense_data)
        return HttpResponse("okis")


class Form(View):
    def get(self, request):
        categories = Category.objects.all()

        types = Type.objects.all()
        categories_data = [
            {"value": str(category.id), "label": category.name}
            for category in categories
        ]
        types_data = [{"value": str(type.id), "label": type.name} for type in types]

        return JsonResponse(
            {
                "categories": categories_data,
                "types": types_data,
            }
        )


class Summary(View):
    def get(self, request):
        target_date = date(2025, 2, 28)
        expenses = Expense.objects.filter(date__gte=target_date)

        total = 73130
        remaining = 0
        spent = 0
        for money in expenses:
            if money.type == "1":
                spent += money.amount
            elif money.type == "2" and money.category != "16":
                spent -= money.amount
            elif money.category == "16":
                total += money.amount
        remaining = total - spent
        return JsonResponse(
            {
                "total": float(total),
                "remaining": float(remaining),
                "spent": float(spent),
            }
        )


def get_summary():
    target_date = date(2025, 3, 1)
    expenses = Expense.objects.filter(date__gte=target_date)

    total = 73130
    remaining = 0
    spent = 0
    for money in expenses:
        if money.type == "1":
            spent += money.amount
        elif money.type == "2" and money.category != "16":
            spent -= money.amount
        elif money.category == "16":
            total += money.amount
    remaining = total - spent
    return remaining


class PeriodSummary(View):
    # 15-day periods
    def get(self, request, period: int, month: int, year: int):
        try:
            if period == 1:
                # Primera quincena: del 1 al 14
                start_date = date(year, month, 1)
                end_date = date(year, month, 14)
            elif period == 2:
                # Segunda quincena: del 15 al último día del mes
                start_date = date(year, month, 15)
                # Calcular el último día del mes
                next_month = month % 12 + 1
                next_month_start = date(year + (month // 12), next_month, 1)
                end_date = next_month_start - timedelta(days=1)
            else:
                return JsonResponse({"error": "Periodo inválido"}, status=400)

            expenses = Expense.objects.filter(
                date__range=(start_date, end_date)
            ).order_by("-date")

            total = 15000
            remaining = 0
            spent = 0
            for money in expenses:
                if money.type.id == 1 and money.category.id != 14:
                    spent += money.amount
                elif money.type.id == 2 and money.category.id != 16:
                    spent -= money.amount

            remaining = total - spent
            print("spent:", spent)
            print("remaining:", remaining)
            expenses_data = [
                {
                    "id": expense.id,
                    "amount": expense.amount,
                    "type": str(expense.type.id),
                    "category": str(expense.category.id),
                    "date": expense.date,
                    "details": expense.details,
                }
                for expense in expenses
            ]

            return JsonResponse(
                {"spent": spent, "movements": expenses_data, "remaining": get_summary()}
            )
        except Exception as e:
            print("Error:", e)
            traceback.print_exc()
            return JsonResponse({"error": "Ocurrió un error"}, status=500)


# with open("expenses/json.json", "r") as file:
#     data = json.load(file)

# data = data["expenses_expense"]
# data = data[::-1]

# for expense in data:
#     try:
#         account = expense["account"]
#         if account == "4":
#             account = 5
#             logger.info("account converted")

#         new_expense = Expense(
#             amount=expense["amount"],
#             category=Category.objects.get(id=int(expense["category"])),
#             type=Type.objects.get(id=int(expense["type"])),
#             date=expense["date"],
#             payment_method=Method.objects.get(id=int(expense["payment_method"])),
#             details=expense["details"],
#             account=Account.objects.get(id=int(account)),
#         )
#         new_expense.save()

#     except Exception as e:
#         print(e, expense)


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
                print(f"Expense for {transaction.next_date} already recorded.")
    except Exception as e:
        print("Error processing recurring transactions:", e)
        traceback.print_exc()


class RecurringTransactionsView(View):
    def post(self, request):
        try:
            process_recurring_transactions()
            return JsonResponse(
                {
                    "message": "Recurring transactions processed successfully.",
                },
                status=200,
            )
        except Exception as e:
            print("Error:", e)
            traceback.print_exc()
            return JsonResponse(
                {"error": "An error ocurred handling recurring transactions"},
                status=500,
            )
