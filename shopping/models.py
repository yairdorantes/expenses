from django.db import models


# Create your models here.
class Item(models.Model):
    name = models.CharField(max_length=255)
    illustration = models.CharField(max_length=100)
    notes = models.TextField(null=True, blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    quantity = models.IntegerField(null=True)
    creation_date = models.DateTimeField()

    def __str__(self):
        return self.name
