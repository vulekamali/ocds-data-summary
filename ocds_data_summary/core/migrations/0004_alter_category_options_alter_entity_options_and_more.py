# Generated by Django 4.2.4 on 2023-08-22 11:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_alter_entity_options'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='category',
            options={'ordering': ['ordering'], 'verbose_name_plural': 'Categories'},
        ),
        migrations.AlterModelOptions(
            name='entity',
            options={'ordering': ['label'], 'verbose_name_plural': 'Entities'},
        ),
        migrations.AddField(
            model_name='summary',
            name='report',
            field=models.TextField(blank=True),
        ),
    ]
