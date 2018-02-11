# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from project.models import Project
from django.utils import timezone
from django.contrib.auth.models import User
import datetime
# Create your models here.


class Worklog(models.Model):
    duration = models.IntegerField(default=1)
    user_id = models.ForeignKey(User)
    remarks = models.TextField()
    project_id = models.ForeignKey(Project, null=True, default=None, on_delete=models.SET_NULL)
    time_stamp = models.DateTimeField(default= datetime.datetime.now())

    def __str__(self):
        return self.remarks
