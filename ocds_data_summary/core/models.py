from django.db import models
from django_extensions.db.models import TimeStampedModel


class Summary(TimeStampedModel):
    data = models.JSONField()


class Category(TimeStampedModel):
    label = models.CharField(max_length=255)

    my_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["my_order"]


class Entity(TimeStampedModel):
    label = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
