from django.contrib import admin
from adminsortable2.admin import SortableAdminMixin
from import_export import fields, resources
from import_export.admin import ImportExportModelAdmin
from import_export.widgets import ForeignKeyWidget

from ocds_data_summary.core import models


class EntityInline(admin.TabularInline):
    model = models.Entity


@admin.register(models.Category)
class CategoryAdmin(SortableAdminMixin, admin.ModelAdmin):
    inlines = [EntityInline]


class EntityResource(resources.ModelResource):
    category = fields.Field(
        column_name='category',
        attribute='category',
        widget=ForeignKeyWidget(models.Category, field='label'))
    class Meta:
        model = models.Entity
        fields = ('label', 'category',)
        import_id_fields = ('label',)


@admin.register(models.Entity)
class EntityAdmin(ImportExportModelAdmin):
    resource_classes = [EntityResource]
    list_display = ["label", "category"]
    list_filter = ["category"]


@admin.display(description="Report summary")
def report_summary(obj):
    first_line = obj.report.split("\n", 1)[0]
    return f'{first_line}...'


class ReadOnlyModelAdmin(admin.ModelAdmin):
    # https://gist.github.com/aaugustin/1388243/0cc96495e8ca944ba1157d72364076bdc1160f9c
    actions = None

    def get_readonly_fields(self, request, obj=None):
        return self.fields or [f.name for f in self.model._meta.fields]

    def has_add_permission(self, request):
        return False

    # Allow viewing objects but not actually changing them
    def has_change_permission(self, request, obj=None):
        if request.method not in ('GET', 'HEAD'):
            return False
        return super(admin.ModelAdmin, self).has_change_permission(request, obj)

    def has_delete_permission(self, request, obj=None):
        return False



@admin.register(models.OCDSSummary)
class SummaryAdmin(ReadOnlyModelAdmin):
    fields = ["created", "report", "data"]
    list_display = ["created", report_summary]


@admin.register(models.FetchReport)
class FetchReportAdmin(ReadOnlyModelAdmin):
    fields = ["created", "stats"]
    list_display = ["created"]

