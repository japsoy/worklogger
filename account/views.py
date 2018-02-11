# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from account.forms import (
    RegistrationForm,
    EditProfileForm,
)
from django.contrib.auth import logout
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserChangeForm, PasswordChangeForm
from django.contrib.auth import update_session_auth_hash
from pprint import pprint
from django.contrib.auth.decorators import login_required
from django.urls import reverse


# Create your views here.
def register(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            user = User.objects.create_user(
            username=form.cleaned_data['username'],
            password=form.cleaned_data['password1'],
            email=form.cleaned_data['email']
            )
            form.save()
            return redirect('/register/success/')
        else:
            args = {'form':form}
            pprint(args)
            return render(request, 'account/register.html', args)
    else:        
        form = RegistrationForm()
        args = {'form':form}
        return render(request, 'account/register.html', args)

def register_success(request):
    return render(request, 'registration/success.html',)


def change_password(request):
    if request.method=='POST':
        form = PasswordChangeForm(data=request.POST, user=request.user)
        if form.is_valid():
            form.save()
            update_session_auth_hash(request, form.user)
            return redirect(reverse('account:view_profile'))
        else:
            args = {'form':form}
            return render(request, 'account/change_password.html', args)
    else:
        form = PasswordChangeForm(user=request.user)
        args = {'form':form}
        return render(request, 'account/change_password.html', args)

def logout_page(request):
    logout(request)
    return redirect('/account')
