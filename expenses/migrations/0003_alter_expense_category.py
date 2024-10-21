# Generated by Django 5.1.2 on 2024-10-21 02:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('expenses', '0002_alter_expense_category'),
    ]

    operations = [
        migrations.AlterField(
            model_name='expense',
            name='category',
            field=models.CharField(choices=[('1', 'Health'), ('2', 'Food'), ('3', 'Transportation'), ('4', 'Housing'), ('5', 'Utilities'), ('6', 'Entertainment'), ('7', 'Clothing'), ('8', 'Education'), ('9', 'Travel'), ('10', 'Personal Care'), ('11', 'Gifts'), ('12', 'Insurance'), ('13', 'Investments'), ('14', 'Lend money'), ('15', 'repayment'), ('16', 'paycheck'), ('17', 'Other')], max_length=2),
        ),
    ]
