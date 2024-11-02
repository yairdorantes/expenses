from django.urls import path
from .views import Expenses,Summary,PeriodSummary
from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    path("expenses", csrf_exempt(Expenses.as_view()), name="expenses"),
    path("summary", csrf_exempt(Summary.as_view()), name="expenses"),   
    path("period/<int:period>/<int:month>/<int:year>", csrf_exempt(PeriodSummary.as_view()), name="period summary"),   
    
]