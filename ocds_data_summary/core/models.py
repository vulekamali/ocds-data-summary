from django.db import models
from django_extensions.db.models import TimeStampedModel


class Summary(TimeStampedModel):
    data = models.JSONField()
    report = models.TextField(blank=True)

    class Meta:
        ordering = ["-created"]
        verbose_name_plural = "Summaries"


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