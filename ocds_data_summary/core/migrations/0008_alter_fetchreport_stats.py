# Generated by Django 4.2.4 on 2023-08-29 06:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0007_fetchreport_rename_summary_ocdssummary_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='fetchreport',
            name='stats',
            field=models.TextField(),
        ),
    ]
