from django.core.management.base import BaseCommand
from expenses.tasks import process_recurring_transactions


class Command(BaseCommand):
    help = "Process recurring transactions"

    def handle(self, *args, **kwargs):
        process_recurring_transactions()
