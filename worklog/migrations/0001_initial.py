# -*- coding: utf-8 -*-
# Generated by Django 1.11.10 on 2018-02-11 04:06
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('project', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Worklog',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('duration', models.IntegerField(default=1)),
                ('remarks', models.TextField()),
                ('project_id', models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.CASCADE, to='project.Project')),
            ],
        ),
    ]
