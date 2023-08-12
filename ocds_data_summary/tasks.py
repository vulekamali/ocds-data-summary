from scrapy.crawler import CrawlerProcess

from kingfisher_scrapy.spiders.south_africa_national_treasury_api import SouthAfricaNationalTreasuryAPI
from kingfisher_scrapy import settings as kingfisher_settings
from datetime import datetime
from typing import Dict, Any

from ocds_data_summary import settings


def get_settings():
    # https://stackoverflow.com/a/46263657
    settings_dict = {}
    for setting in dir(kingfisher_settings):
        if setting.isupper() and setting.isalpha():
            settings_dict[setting] = getattr(kingfisher_settings, setting)    
    settings_dict.update({
        "DATABASE_URL": settings.DATABASE_URL,
        "LOG_LEVEL": "INFO",
    })
    return settings_dict


def fetch():
    process = CrawlerProcess(get_settings())
    args = {
        "crawl_time": datetime.now().isoformat()[:18] # 2023-08-12T12:11:03
    }
    process.crawl(SouthAfricaNationalTreasuryAPI, **args)
    process.start()