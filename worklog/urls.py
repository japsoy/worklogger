from django.conf.urls import url
from worklog.views import index, add_worklog, get_worklog, delete_worklog

urlpatterns = [
    url(r'^$', index, name='index'),
    url(r'^add_worklog/$', add_worklog, name='add_worklog'),
    url(r'^get_worklog/$', get_worklog, name='get_worklog'),
    url(r'^delete_worklog/$', delete_worklog, name='delete_worklog'),
]
