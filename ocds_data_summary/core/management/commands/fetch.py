from django.core.management.base import BaseCommand, CommandError
from ocds_data_summary.core.tasks import fetch


class Command(BaseCommand):
    help = "Fetches data from the OCDS API and updates the collection of compiled releases."

    def add_arguments(self, parser):
        parser.add_argument("--from-date", )
        parser.add_argument("--until-date")

    def handle(self, *args, **options):
        fetch_args = {}
        
        from_date = options.pop("from_date")
        if from_date:
            fetch_args["from_date"] = from_date
        until_date = options.pop("until_date")
        if until_date:
            fetch_args["until_date"] = until_date

        fetch(**fetch_args)