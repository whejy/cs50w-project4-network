
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path('<str:following>/', views.index, name="following"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path('profile/<str:profile>/', views.index, name="profile"),
    path("register", views.register, name="register"),

    #API Routes
    path("post", views.posts, name="posts"),
    path("delete", views.delete, name="delete"),
    path("edit", views.edit, name="edit"),
    path("like", views.like, name="like"),
    path("follow", views.follow, name="follow"),
    path("following/<follow>", views.follow, name="followpage"),
    path("profile/<str:profile>/follow", views.follow, name="proffollow"),
    path("profile/<str:profile>/edit", views.edit, name="profedit"),
    path("profile/<str:profile>/delete", views.delete, name="profdelete"),
    path("profile/<str:profile>/like", views.like, name="proflike")
]
