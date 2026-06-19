from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ("expenses", "0015_expense_client_id"),
    ]

    operations = [
        migrations.AlterField(
            model_name="expense",
            name="client_id",
            field=models.UUIDField(
                blank=True, default=uuid.uuid4, null=True, unique=True
            ),
        ),
    ]
