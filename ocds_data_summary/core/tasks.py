from scrapy.crawler import CrawlerProcess

from kingfisher_scrapy.spiders.south_africa_national_treasury_api import (
    SouthAfricaNationalTreasuryAPI,
)
from kingfisher_scrapy import settings as kingfisher_settings
from datetime import datetime
from typing import Dict, Any
from constance import config
from django.conf import settings

from ocds_data_summary.core.models import FetchReport
from ocds_data_summary.core.summary import summarise


def get_settings():
    # https://stackoverflow.com/a/46263657
    settings_dict = {}
    for setting in dir(kingfisher_settings):
        if setting.isupper():
            settings_dict[setting] = getattr(kingfisher_settings, setting)
    settings_dict.update(
        {
            "DATABASE_URL": settings.DATABASE_URL,
        }
    )
    return settings_dict


def fetch(from_date=None, until_date=None):
    process = CrawlerProcess(get_settings())
    args = {
        "crawl_time": settings.INITIAL_CRAWL_TIME,
        "compile_releases": "true",
    }
    if from_date:
        args["from_date"] = from_date
    if until_date:
        args["until_date"] = until_date
    crawler = process.create_crawler(SouthAfricaNationalTreasuryAPI)
    process.crawl(crawler, **args)
    process.start()
    stats = crawler.stats.get_stats()
    stats_str = ""
    for key in sorted(stats.keys()):
        stats_str += f"{key}: {str(stats[key])}\n"
    FetchReport.objects.create(stats=stats_str)


def full_update():
    """Fetch latest data and then summarise, ensuring the latest changes are
    included in the summary."""
    fetch()
    summarise()