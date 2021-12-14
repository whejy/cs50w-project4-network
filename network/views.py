import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseRedirect
from django.core.paginator import Paginator
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt


from .models import User, Posts, Likes


def index(request):
    posts = (Posts.objects.all().order_by("-timestamp"))
    # test = posts.values()
    paginator = Paginator(posts, 10)
    total_pages = paginator.num_pages
    page_number = request.GET.get('page')
    posts = paginator.get_page(page_number)

    lower_range = range(1, posts.number)
    upper_range = range(posts.number + 1, total_pages + 1)

    # liked = Likes.objects.get(liked_by=request.user, post=)

    # If all posts fit on one page exclude front-end pagination
    if total_pages == 1:
        lower_range = 1

    return render(request, "network/index.html", {'posts': posts, 'lower': lower_range, 'upper': upper_range})    


# Submit a 'like'
@csrf_exempt
@login_required
def like(request, post_id):
    liked = Likes(
        liked_by=User(id=request.user.id),
        post=Posts(id=post_id)
    )
    liked.save()
    return HttpResponseRedirect(reverse("index"))


@csrf_exempt
def posts(request):

    # User is creating a new post
    data = json.loads(request.body)
    post = data.get("post", "")
    new_post = Posts(
        user=request.user,
        post=post
    )
    new_post.save()
    posts = Posts.objects.all()
    return JsonResponse([post.serialize() for post in posts], safe=False)


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
