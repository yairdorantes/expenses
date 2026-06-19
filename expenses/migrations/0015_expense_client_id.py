from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("expenses", "0014_config"),
    ]

    operations = [
        migrations.AddField(
            model_name="expense",
            name="client_id",
            field=models.UUIDField(blank=True, null=True, unique=True),
        ),
    ]
