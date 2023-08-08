from django.views import generic


class Index(generic.TemplateView):
    template_name = "core/index.html"
