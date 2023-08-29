from django.views import generic
from django.http import JsonResponse

from ocds_data_summary.core.models import OCDSSummary

class Index(generic.TemplateView):
    template_name = "core/index.html"


def latest_summary(request):
    summary = OCDSSummary.objects.all().order_by("-created")[0]
    return JsonResponse(summary.data)