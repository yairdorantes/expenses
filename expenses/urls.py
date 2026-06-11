from django.urls import path
from .views import (
    ExpenseDetail,
    Expenses,
    Summary,
    PeriodSummary,
    Form,
    RecurringTransactionsView,
)
from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    path("expenses", csrf_exempt(Expenses.as_view()), name="expenses"),
    path(
        "expenses/<int:expense_id>",
        csrf_exempt(ExpenseDetail.as_view()),
        name="expense detail",
    ),
    path(
        "recurrent_txs",
        csrf_exempt(RecurringTransactionsView.as_view()),
        name="expenses",
    ),
    path("form", csrf_exempt(Form.as_view()), name="form"),
    path("summary", csrf_exempt(Summary.as_view()), name="expenses"),
    path(
        "period/<int:period>/<int:month>/<int:year>",
        csrf_exempt(PeriodSummary.as_view()),
        name="period summary",
    ),
]
