from django.core.management.base import BaseCommand, CommandError
from ocds_data_summary.tasks import fetch


class Command(BaseCommand):
    help = "Fetches data from the OCDS API and updates the collection of compiled releases."

    def handle(self, *args, **options):
        fetch()