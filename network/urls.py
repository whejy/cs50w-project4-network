
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path('<str:following>/', views.index, name="following"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    #API Routes
    path("post", views.posts, name="posts"),
    path("delete", views.delete, name="delete"),
    path("edit", views.edit, name="edit"),
    path("like", views.like, name="like"),
    path("follow", views.follow, name="follow"),
    path("following/<follow>", views.follow, name="followpage")
]
