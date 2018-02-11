# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.utils import timezone
from django.http import HttpResponse
from project.models import Project
from django.db.models import Sum

from worklog.models import Worklog
from pprint import pprint
import json
from helpers import convert_timestamp_to_date
import datetime
# Create your views here.

def index(request):
    request.title = 'Work Log'
    request.page_title = 'Work Log'
    request.active_tab = 'worklog'
    projects = Project.objects.all()
    user = User.objects.get(id=request.user.id)
    total_hrs = Worklog.objects.filter(user_id = user).aggregate(total_hrs = Sum('duration'))

    args = {
        'total_hrs': total_hrs['total_hrs'],
        'projects': projects
    }
    return render(request, "worklog/index.html", args)


@csrf_exempt
def add_worklog(request):
    try:
        project = Project.objects.get(id=request.POST.get('project_id'))
        user = User.objects.get(id=request.user.id)
        worklog = Worklog.objects.create(
            duration=request.POST.get('duration'),
            user_id = user,
            remarks = request.POST.get('remarks'),
            project_id  = project
        )
        worklog.save()
        args = {
            "result":0
        }
        return HttpResponse(json.dumps(args), content_type='application/json')
    except:
        args= {
            "result":"error"
        }
        return HttpResponse(json.dumps(args), content_type='application/json')


@csrf_exempt
def get_worklog(request):
    if request.POST.get('datetime_input'):
        datetime_input = request.POST.get('datetime_input')
    else:
        datetime_input = timezone.now
    user = User.objects.get(id=request.user.id)
    worklog = Worklog.objects.filter(
        user_id = user
    ).values()
    list_result = []

    for row in worklog:
        tmp_dict = {}
        for k, v in row.iteritems():
            print type(v)
            if type(v) in (datetime, datetime.date, datetime.datetime, datetime.time):
                v = convert_timestamp_to_date(v)
            if k is "project_id_id":
                k.title

            # if type(v) is ""
            tmp_dict[k]=v

        list_result.append(tmp_dict)

    final_dt_result = {
        "draw":1,
        "recordsTotal":len(list_result),
        "recordsFiltered":len(list_result),
        "data": list_result
    }
    pprint(list_result)
    return HttpResponse(json.dumps(final_dt_result), content_type='application/json')

@csrf_exempt
def delete_worklog(request):
    worklog_id = request.POST.get('worklog_id')
    Worklog.objects.get(id=worklog_id).delete()
    args = {
        "result":0
    }
    return HttpResponse(json.dumps(args), content_type='application/json')
