from django.contrib import admin
from django.urls import include, path

from . import views


urlpatterns = [
    path("", views.Index.as_view(), name="index"),
    path("core", include("ocds_data_summary.core.urls"),),
    path("admin/", admin.site.urls),
]
