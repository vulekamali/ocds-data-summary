from django.urls import path
from django.contrib import admin

from . import views


urlpatterns = [
    path("", views.Index.as_view(), name="index"),
    path("api/summary/latest", views.latest_summary, name="latest-summary"),
    path("admin/", admin.site.urls),
]
