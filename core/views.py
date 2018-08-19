from django.shortcuts import render


def index(request):
    c = {

    }
    return render(request, 'base.html', c)
