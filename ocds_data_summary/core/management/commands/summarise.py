from django.core.management.base import BaseCommand, CommandError
from ocds_data_summary.core.summary import summarise


class Command(BaseCommand):
    help = "Summarises the collection of compiled releases and stores the updated summary in the database."

    def handle(self, *args, **options):
        summarise()
        