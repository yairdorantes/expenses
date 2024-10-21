# Generated by Django 5.1.2 on 2024-10-21 03:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('expenses', '0005_alter_expense_account_alter_expense_category_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='expense',
            name='account',
            field=models.CharField(choices=[('1', 'Checking Account'), ('2', 'Savings Account'), ('3', 'Credit Account'), ('4', 'Cash on Hand')], max_length=2),
        ),
        migrations.AlterField(
            model_name='expense',
            name='category',
            field=models.CharField(choices=[('1', 'Health'), ('2', 'Food'), ('3', 'Transportation'), ('4', 'Housing'), ('5', 'Utilities'), ('6', 'Entertainment'), ('7', 'Clothing'), ('8', 'Education'), ('9', 'Travel'), ('10', 'Personal Care'), ('11', 'Gifts'), ('12', 'Insurance'), ('13', 'Investments'), ('14', 'Lend money'), ('15', 'repayment'), ('16', 'paycheck'), ('17', 'Other')], max_length=2),
        ),
        migrations.AlterField(
            model_name='expense',
            name='payment_method',
            field=models.CharField(choices=[('1', 'Cash'), ('2', 'Credit Card'), ('3', 'Debit Card'), ('4', 'Bank Transfer'), ('5', 'Check')], max_length=2),
        ),
        migrations.AlterField(
            model_name='expense',
            name='type',
            field=models.CharField(choices=[('1', 'Expense'), ('2', 'Income')], max_length=2),
        ),
    ]
