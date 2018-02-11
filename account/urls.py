from django.conf.urls import url, include
from account.views import logout_page, register, register_success, change_password
from django.contrib.auth.views import (
    login,
    logout,
    password_reset,
    password_reset_done,
    password_reset_confirm,
    password_reset_complete,
)


urlpatterns = [
    url(r'^$', login, {'template_name': 'account/login.html'}, name='login'),
    url(r'^logout/$', logout_page, name='logout_page'),
    url(r'^register/$', register, name='register'),
    url(r'^register/success/$', register_success, name="success"),
    url(r'^change-password/$', change_password, name='change_password'),
    url(r'^reset-password/$', password_reset,
        {
            'template_name': 'account/reset_password.html',
            'post_reset_redirect':'account:password_reset_done',
            'email_template_name':'account/reset_password_email.html'
        },
        name='reset_password'),
    url(r'^reset-password/done/$', password_reset_done,
        {
            'template_name': "account/reset_password_done.html"
        },
        name='password_reset_done'),
    url(r'^reset-password/confirm/(?P<uidb64>[0-9A-Za-z]+)-(?P<token>.+)/$', password_reset_confirm,
        {
            'template_name':'account/reset_password_confirm.html',
            'post_reset_redirect':'account:password_reset_complete'
        },
        name='password_reset_confirm'),
    url(r'^reset-password/complete/$', password_reset_complete,
        {
            'template_name':'account/reset_password_complete.html'
        },
        name='password_reset_complete'),


]
