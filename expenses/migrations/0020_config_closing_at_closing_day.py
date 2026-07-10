from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("expenses", "0019_alter_config_closing_date"),
    ]

    operations = [
        migrations.RenameField(
            model_name="config",
            old_name="closing_date",
            new_name="closing_at",
        ),
        migrations.AddField(
            model_name="config",
            name="closing_day",
            field=models.DateField(blank=True, null=True),
        ),
    ]
