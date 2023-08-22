from django.db import models
from django_extensions.db.models import TimeStampedModel


class Summary(TimeStampedModel):
    data = models.JSONField()


class Category(TimeStampedModel):
    label = models.CharField(max_length=255)
    ordering = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["ordering"]
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.label


class Entity(TimeStampedModel):
    label = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)

    class Meta:
        ordering = ["label"]
        verbose_name_plural = "Entities"

    def __str__(self):
        return self.label