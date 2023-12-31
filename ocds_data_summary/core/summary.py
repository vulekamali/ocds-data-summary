from django.db import connection
from json import loads
from collections import defaultdict
from typing import Optional
import logging
from pprint import pprint
from constance import config

from ocds_data_summary.core.models import Entity, Category, OCDSSummary, FetchReport


logger = logging.getLogger(__name__)

summary_template = lambda: {
    "has_planning": 0,
    "has_tender": 0,
    "has_awards": 0,
    "has_contracts": 0,
    "total_count": 0,
}
month_template = lambda: defaultdict(summary_template)
buyer_template = defaultdict(month_template)


def earliest_date(release) -> Optional[str]:
    date = release.get("tender", {}).get("tenderPeriod", {}).get("startDate", None)
    if not date:
        award_dates = any(a.get("date", None) for a in release.get("awards", []))
        if award_dates:
            date = min(*award_dates)
    if not date:
        contract_dates = any(
            a.get("dateSigned", None) for a in release.get("contracts", [])
        )
        if contract_dates:
            date = min(*contract_dates)
    return date


def make_month_key(date: str) -> str:
    return date[:7]


def summarise():
    buyers = buyer_template
    total_releases = 0
    skipped = 0
    counted = 0
    no_buyer = 0
    no_date = 0

    with connection.cursor() as cursor:
        cursor.execute("select data from south_africa_national_treasury_api")
        for row in cursor.fetchall():
            release = loads(row[0])
            total_releases += 1

            date = earliest_date(release)
            if not date:
                logger.info(f'Dropping release with no date. ocid={release.get("ocid")}')
                no_date += 1
                skipped += 1
                continue
            month_key = make_month_key(date)

            buyer = release.get("buyer", {}).get("name", None)
            if not buyer:
                logger.info(f'Dropping release with no buyer. ocid={release.get("ocid")}')
                no_buyer += 1
                skipped += 1
                continue

            counted += 1

            buyers[buyer][month_key]["total_count"] += 1
            if release.get("tender", None):
                buyers[buyer][month_key]["has_tender"] += 1
            if release.get("planning", None):
                buyers[buyer][month_key]["has_planning"] += 1
            if release.get("contracts", None):
                buyers[buyer][month_key]["has_contracts"] += 1
            if release.get("awards", None):
                buyers[buyer][month_key]["has_awards"] += 1

    buyer_to_category = {
        buyer.label: buyer.category.label for buyer in Entity.objects.all()
    }

    summaries = []
    # Track ungrouped buyers to be able to log for admins to easily find and categorise uncategorised buyers
    ungrouped_buyers = set()
    for buyer_name, months in buyers.items():
        for month_key, summary in months.items():
            category_label = buyer_to_category.get(buyer_name, None)
            if category_label is None:
                ungrouped_buyers.add(buyer_name)
                category_label = config.DEFAULT_GROUP_NAME
            summary.update(
                {
                    "buyer_name": buyer_name,
                    "tender_year_month": month_key,
                    "category": category_label,
                }
            )
            summaries.append(summary)

    report = f"Total releases: {total_releases}, skipped: {skipped}, counted: {counted}\n\n"

    if no_buyer:
        report += f"Number of releases skipped because no buyer: {no_buyer}\n"
    if no_date:
        report += f"Number of releases skipped because no tender date: {no_date}\n"

    if ungrouped_buyers:
        report += "\nBuyers not in any group:\n------------------------\n"
        report += "\n".join(sorted(ungrouped_buyers))

    summary = {
        "last_fetched": FetchReport.objects.all().order_by("-created")[0].created.isoformat(),
        "months": summaries,
        # Array of category labels for ordering, with default group name at the end.
        "groups": [c.label for c in Category.objects.all()] + [config.DEFAULT_GROUP_NAME],
    }

    OCDSSummary.objects.create(data=summary, report=report)
