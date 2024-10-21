from django.db import models

class Expense(models.Model):
    CATEGORY_CHOICES = [
        ("1", "Health"),
        ("2", "Food"),
        ("3", "Transportation"),
        ("4", "Housing"),
        ("5", "Utilities"),
        ("6", "Entertainment"),
        ("7", "Clothing"),
        ("8", "Education"),
        ("9", "Travel"),
        ("10", "Personal Care"),
        ("11", "Gifts"),
        ("12", "Insurance"),
        ("13", "Investments"),
        ("14", "Lend money"),
        ("15", "repayment"),
        ("16", "paycheck"),
        ("17", "Other"),
    ]

    AMOUNT_TYPE_CHOICES = [
        ("1", "Expense"),
        ("2", "Income"),
    ]

    PAYMENT_METHOD_CHOICES = [
        ("1", "Cash"),
        ("2", "Credit Card"),
        ("3", "Debit Card"),
        ("4", "Bank Transfer"),
        ("5", "Check"),
    ]

    ACCOUNT_CHOICES = [
        ("1", "Checking Account"),
        ("2", "Savings Account"),
        ("3", "Credit Account"),
        ("4", "Cash on Hand"),
    ]

    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=2, choices=CATEGORY_CHOICES)
    type = models.CharField(max_length=2, choices=AMOUNT_TYPE_CHOICES)
    date = models.DateField()
    payment_method = models.CharField(max_length=2, choices=PAYMENT_METHOD_CHOICES)
    details = models.TextField(blank=True, null=True)
    account = models.CharField(max_length=2, choices=ACCOUNT_CHOICES)

    def __str__(self):
        return f"{self.get_type_display()} | {self.amount}$ | {self.get_category_display()} | {self.date}"
    
    def get_type_display(self):
        return dict(self.AMOUNT_TYPE_CHOICES).get(self.type, "Unknown")
    
    def get_category_display(self):
        return dict(self.CATEGORY_CHOICES).get(self.category, "Unknown")





