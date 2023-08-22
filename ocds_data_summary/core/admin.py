from django.contrib import admin
from adminsortable2.admin import SortableAdminMixin

from ocds_data_summary.core.models import Category, Entity


class EntityInline(admin.TabularInline):
    model = Entity


@admin.register(Category)
class CategoryAdmin(SortableAdminMixin, admin.ModelAdmin):
    inlines = [EntityInline]


@admin.register(Entity)
class EntityAdmin(admin.ModelAdmin):
    pass


