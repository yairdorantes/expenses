from django.db import models
import uuid


class Config(models.Model):
    total_savings = models.PositiveIntegerField(default=0)
    fortnightly_budget = models.PositiveIntegerField(default=7500)
    closing_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return (
            f"Total Savings: {self.total_savings}, "
            f"Fortnightly Budget: {self.fortnightly_budget}, "
            f"Closing Date: {self.closing_date}"
        )


class Category(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Method(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Account(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Type(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Expense(models.Model):

    client_id = models.UUIDField(default=uuid.uuid4, unique=True, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    type = models.ForeignKey(Type, on_delete=models.CASCADE)
    payment_method = models.ForeignKey(Method, on_delete=models.CASCADE)
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    # An expense happens on a calendar day; storing a time creates avoidable
    # timezone conversions in clients.
    date = models.DateField()
    details = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    def __str__(self):
        return f"{self.type.name} | {self.amount}$ | {self.category.name} | {self.account.name} | {self.payment_method.name} | {self.date}"


class RecurringTransaction(models.Model):

    FREQUENCY_CHOICES = [
        ("daily", "Daily"),
        ("weekly", "Weekly"),
        ("fortnightly", "Fortnightly"),
        ("monthly", "Monthly"),
        ("yearly", "Yearly"),
    ]

    # expense = models.ForeignKey(Expense, on_delete=models.CASCADE)
    frequency = models.CharField(
        max_length=100, choices=FREQUENCY_CHOICES
    )  # e.g., 'monthly', 'weekly'
    next_date = models.DateField()
    end_date = models.DateTimeField(blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    type = models.ForeignKey(Type, on_delete=models.CASCADE)
    payment_method = models.ForeignKey(Method, on_delete=models.CASCADE)
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    details = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"  {self.frequency} | Next Date: {self.next_date} |  {self.details} "


#
