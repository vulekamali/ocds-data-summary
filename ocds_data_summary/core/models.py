from django.db import models
from django_extensions.db.models import TimeStampedModel


class OCDSSummary(TimeStampedModel):
    data = models.JSONField()
    report = models.TextField(blank=True)

    class Meta:
        ordering = ["-created"]
        verbose_name = "OCDS Summary"
        verbose_name_plural = "OCDS Summaries"

    def __str__(self):
        return f"Summary generated at {self.created.isoformat()[:19]}"


class FetchReport(TimeStampedModel):
    stats = models.TextField()

    class Meta:
        ordering = ["-created"]
        verbose_name_plural = "Fetch Reports"


class Category(TimeStampedModel):
    label = models.CharField(max_length=255, unique=True)
    ordering = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["ordering"]
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.label


class Entity(TimeStampedModel):
    label = models.CharField(max_length=255, unique=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)

    class Meta:
        ordering = ["label"]
        verbose_name_plural = "Entities"

    def __str__(self):
        return self.label