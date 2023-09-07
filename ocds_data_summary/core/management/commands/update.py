from django.core.management.base import BaseCommand, CommandError
from ocds_data_summary.core.tasks import full_update

class Command(BaseCommand):
    help = "Fetches data then summarises the data based on the newly-fetched data."

    def handle(self, *args, **options):
        full_update()
        