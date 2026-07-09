from datetime import date, timedelta
import json
import uuid
from django.views import View
import traceback
from loguru import logger
from django.http import JsonResponse
from django.shortcuts import get_object_or_404

from expenses.tasks import process_recurring_transactions
from .models import Expense, Category, Method, Account, Type, Config
from django.utils import timezone
import calendar
from calendar import monthrange

EXPENSE_TRANSACTION_ID = 1  # THIS IS FOR EXPENSES
LEND_MONEY_CATEGORY_ID = 14
def get_config_values():
    config = Config.objects.first()
    return {
        "total_savings": config.total_savings if config else 0,
        "fortnightly_budget": config.fortnightly_budget if config else 7500,
    }


def serialize_form_payload(config):
    categories = Category.objects.all()
    types = Type.objects.all()
    categories_data = [
        {"value": str(category.id), "label": category.name}
        for category in categories
    ]
    types_data = [{"value": str(type.id), "label": type.name} for type in types]

    return {
        "categories": categories_data,
        "types": types_data,
        "config": {
            "totalSavings": config.total_savings if config else 0,
            "fortnightlyBudget": (
                config.fortnightly_budget if config else 7500
            ),
        },
    }


class Expenses(View):
    def get(self, request):

        return JsonResponse({})

    def post(self, request):
        try:
            jd = json.loads(request.body)
            # Normalize into a list
            if isinstance(jd, dict):
                jd = [jd]

            created_expenses = []
            for item in jd:
                client_id = get_client_id(item)
                if client_id:
                    existing = Expense.objects.filter(client_id=client_id).first()
                    if existing:
                        created_expenses.append(existing)
                        continue

                created_expenses.append(
                    Expense.objects.create(**get_expense_data(item), client_id=client_id)
                )

            data = [serialize_expense(expense) for expense in created_expenses]
            if len(data) == 1:
                return JsonResponse(data[0], status=201)
            return JsonResponse(data, safe=False, status=201)
        except (
            ValueError,
            TypeError,
            Category.DoesNotExist,
            Type.DoesNotExist,
            Method.DoesNotExist,
            Account.DoesNotExist,
        ) as e:
            return JsonResponse({"error": str(e)}, status=400)


def serialize_expense(expense):
    return {
        "id": expense.id,
        "clientId": str(expense.client_id) if expense.client_id else None,
        "amount": float(expense.amount),
        "type": str(expense.type.id),
        "category": str(expense.category.id),
        "categoryName": expense.category.name,
        "date": expense.date,
        "paymentMethod": str(expense.payment_method.id),
        "details": expense.details,
        "account": str(expense.account.id),
    }


def get_expense_data(item):
    return {
        "amount": item.get("amount"),
        "category": Category.objects.get(id=int(item.get("category"))),
        "type": Type.objects.get(id=int(item.get("type"))),
        "date": item.get("date"),
        "payment_method": Method.objects.get(id=int(item.get("paymentMethod"))),
        "details": item.get("details"),
        "account": Account.objects.get(id=int(item.get("account"))),
    }


def get_client_id(item):
    raw_client_id = item.get("clientId") or item.get("client_id")
    if not raw_client_id:
        return None
    return uuid.UUID(str(raw_client_id))


class ExpenseDetail(View):
    def get(self, request, expense_id):
        expense = get_object_or_404(Expense, id=expense_id)
        return JsonResponse(serialize_expense(expense))

    def put(self, request, expense_id):
        try:
            expense = get_object_or_404(Expense, id=expense_id)
            body = json.loads(request.body)
            expense_data = get_expense_data(body)
            for field, value in expense_data.items():
                setattr(expense, field, value)
            client_id = get_client_id(body)
            if client_id:
                expense.client_id = client_id
            expense.save()
            return JsonResponse(serialize_expense(expense))
        except Exception as e:
            print("Error:", e)
            traceback.print_exc()
            return JsonResponse({"error": "Ocurrió un error"}, status=400)

    def delete(self, request, expense_id):
        expense = get_object_or_404(Expense, id=expense_id)
        expense.delete()
        return JsonResponse({"message": "Expense deleted successfully."})


class Form(View):
    def get(self, request):
        config = Config.objects.first()
        return JsonResponse(serialize_form_payload(config))

    def post(self, request):
        try:
            body = json.loads(request.body)
            config = Config.objects.first() or Config()

            if "totalSavings" in body:
                config.total_savings = int(body.get("totalSavings") or 0)
            if "fortnightlyBudget" in body:
                config.fortnightly_budget = int(body.get("fortnightlyBudget") or 0)

            config.save()
            return JsonResponse(serialize_form_payload(config))
        except (TypeError, ValueError) as e:
            return JsonResponse({"error": str(e)}, status=400)


class Summary(View):
    def get(self, request):
        target_date = date(2025, 5, 1)
        expenses = Expense.objects.filter(date__gte=target_date)

        total = 44791.39
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
    target_date = date(2026, 6, 1)
    expenses = Expense.objects.filter(date__gte=target_date)
    config = get_config_values()

    total = config["total_savings"]
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
            ).order_by("-date",'-created_at')
            config = get_config_values()

            total = config["fortnightly_budget"]
            remaining = 0
            spent = 0
            for money in expenses:
                if money.type.id == 1 and money.category.id != 14:
                    spent += money.amount

            remaining = total - spent
            print("spent:", spent)
            print("remaining:", remaining)
            expenses_data = [
                serialize_expense(expense)
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
                    "previous_balance": float(
                        config["fortnightly_budget"] - prev_spent
                    ),
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
