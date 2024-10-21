from django.urls import path
from .views import Expenses
from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    path("expenses", csrf_exempt(Expenses.as_view()), name="expenses"),
   
]