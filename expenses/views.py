from datetime import date, timedelta
import json
from django.views import View
# Create your views here.
from django.http import JsonResponse, HttpResponse
from .models import Expense
class Expenses(View):
    def get(self, request):
        
        # expenses = Expense.objects.all()
        # total=21000
        # remaining=0
        # spent=0
        # for money in expenses:
        #     if money.type=="1":
        #         spent+=money.amount
        #     elif money.type=="2" and money.category!="16":
        #         spent-=money.amount
        #     elif money.category=="16":
        #         total+=money.amount
        # remaining=total-spent
        return JsonResponse({})
    def post(self, request):
        jd = json.loads(request.body)
        print(jd)
        expense_data = {
            "amount": jd.get("amount"),
            "category": jd.get("category"),
            "type": jd.get("type"),
            "date": jd.get("date"),  # Assuming 'date' is a DateField in your model
            "payment_method": jd.get("paymentMethod"),
            "details": jd.get("details"),
            "account": jd.get("account"),
        }
        Expense.objects.create(**expense_data)
        return HttpResponse("okis")



class Summary(View):
    def get(self, request):
        expenses = Expense.objects.all()
        total=21000
        remaining=0
        spent=0
        for money in expenses:
            if money.type=="1":
                spent+=money.amount
            elif money.type=="2" and money.category!="16":
                spent-=money.amount
            elif money.category=="16":
                total+=money.amount
        remaining=total-spent
        return JsonResponse({"total": float(total), "remaining": float(remaining), "spent":float(spent)})
    
    
class PeriodSummary(View):
    # 15-day periods
    def get(self, request, period: int, month: int, year: int):
        if period == 1:
            # Primera quincena: del 1 al 15
            start_date = date(year, month, 1)
            end_date = date(year, month, 15)
        elif period == 2:
            # Segunda quincena: del 16 al último día del mes
            start_date = date(year, month, 16)
            # Calcular el último día del mes
            next_month = month % 12 + 1
            next_month_start = date(year + (month // 12), next_month, 1)
            end_date = next_month_start - timedelta(days=1)
        else:
            return JsonResponse({"error": "Periodo inválido"}, status=400)

        expenses = Expense.objects.filter(date__range=(start_date, end_date))
        
        total=15000
        remaining=0
        spent=0
        for money in expenses:
            if money.type=="1":
                spent+=money.amount
            elif money.type=="2" and money.category!="16":
                spent-=money.amount
           
        remaining = total - spent
        print("spent:",spent)
        print("remaining:",remaining)
        expenses_data = [
            {
                "amount": expense.amount,
                "type": expense.type,
                "category": expense.category,
                "date": expense.date
            }
            for expense in expenses 
        ]

        return JsonResponse({"spent": spent, "movements": expenses_data})
    