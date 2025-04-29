from django.contrib import admin

# Register your models here.
from .models import Expense, Category, Method, Account, Type,RecurringTransaction

admin.site.register([Expense,Category,Method,Account,Type,RecurringTransaction])