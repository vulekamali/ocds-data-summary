from django.urls import path

from . import views


urlpatterns = [
    path("", views.Index.as_view(), name="index"),
    path("api/summary/latest", views.latest_summary, name="latest-summary")
]
