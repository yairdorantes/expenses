from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("expenses", "0018_config_closing_date"),
    ]

    operations = [
        migrations.AlterField(
            model_name="config",
            name="closing_date",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
