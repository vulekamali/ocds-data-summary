from django.contrib import admin
from adminsortable2.admin import SortableAdminMixin

from ocds_data_summary.core import models


class EntityInline(admin.TabularInline):
    model = models.Entity


@admin.register(models.Category)
class CategoryAdmin(SortableAdminMixin, admin.ModelAdmin):
    inlines = [EntityInline]


@admin.register(models.Entity)
class EntityAdmin(admin.ModelAdmin):
    pass


@admin.register(models.Summary)
class SummaryAdmin(admin.ModelAdmin):
    list_display = ["created"]


