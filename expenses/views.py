from datetime import date, timedelta
import json
from django.views import View
import traceback
from loguru import logger
from django.http import JsonResponse, HttpResponse

from expenses.tasks import process_recurring_transactions
from .models import Expense, Category, Method, Account, Type, RecurringTransaction
from django.utils import timezone
import calendar
from calendar import monthrange

# if money.type.id == 1 and money.category.id != 14:
EXPENSE_TRANSACTION_ID = 1  # THIS IS FOR EXPENSES
LEND_MONEY_CATEGORY_ID = 14
FORTNIGHTLY_BUDGET = 7500
TOTAL_SAVINGS = 70928


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
        target_date = date(2025, 5, 1)
        expenses = Expense.objects.filter(date__gte=target_date)

        total = 71948
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
    target_date = date(2025, 5, 24)
    expenses = Expense.objects.filter(date__gte=target_date)

    total = TOTAL_SAVINGS
    remaining = 0
    spent = 0
    for money in expenses:

        if money.type.id == 1:
            spent += money.amount
        elif money.type.id == 2 and money.category.id != 16:
            spent -= money.amount
        elif money.category.id == 16:
            total += money.amount
    remaining = total - spent

    return remaining


def get_previous_period(year, month, period):
    if period == 1:
        # Go to second half of previous month
        if month == 1:
            prev_year = year - 1
            prev_month = 12
        else:
            prev_year = year
            prev_month = month - 1
        start_date = date(prev_year, prev_month, 15)
        last_day = monthrange(prev_year, prev_month)[1]
        end_date = date(prev_year, prev_month, last_day)
    elif period == 2:
        # Go to first half of current month
        start_date = date(year, month, 1)
        end_date = date(year, month, 14)
    else:
        return None, None

    return start_date, end_date


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
            prev_start, prev_end = get_previous_period(year, month, period)
            # --------------------------------------------------------------
            # Fetch previous period's expenses
            prev_expenses = Expense.objects.filter(date__range=(prev_start, prev_end))
            prev_spent = 0
            for money in prev_expenses:
                if (
                    money.type.id == EXPENSE_TRANSACTION_ID
                    and money.category.id != LEND_MONEY_CATEGORY_ID
                ):
                    prev_spent += money.amount
            #   --------------------------------------------------
            return JsonResponse(
                {
                    "spent": float(spent),
                    "movements": expenses_data,
                    "remaining": float(get_summary()),
                    "previous_balance": float(FORTNIGHTLY_BUDGET - prev_spent),
                }
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
