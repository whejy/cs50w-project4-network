from django.urls import path

from . import views

app_name="wiki"
urlpatterns = [
    path("", views.index, name="index"),
    path("search", views.search, name="search"),
    path("new", views.new, name="new"),
    path("edit", views.edit, name="edit"),
    path("random", views.randomChoice, name="random"),
    path("wiki/<str:title>", views.entry, name="entry")
]
