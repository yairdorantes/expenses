from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("expenses", "0017_alter_expense_date_to_date_field"),
    ]

    operations = [
        migrations.AddField(
            model_name="config",
            name="closing_date",
            field=models.DateField(blank=True, null=True),
        ),
    ]
