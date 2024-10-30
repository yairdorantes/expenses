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