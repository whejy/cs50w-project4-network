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

from .models import User, Posts, Likes, Follow


@csrf_exempt
def index(request, following=None, profile=None):

    posts = (Posts.objects.all().order_by("-timestamp"))
    followers = ''
    hide_post_form = False
    profile_page = False
    is_following = False

    # If displaying 'following' page
    if following:

        followed = Follow.objects.filter(
            follower=request.user.id
            ).values_list('followee')

        posts = Posts.objects.filter(
            user__in=followed
            ).order_by("-timestamp")

        hide_post_form = True
    
    # If displaying a user's profile
    if profile:
        user_profile = User.objects.get(username=profile)

        followers = Follow.objects.filter(
                followee = user_profile
            ).count()

        following = Follow.objects.filter(
                follower = user_profile
            ).count()

        posts = Posts.objects.filter(
            user=user_profile
        ).order_by('-timestamp')

        # Check if logged-in user is following the currently visited profile
        following_check = Follow.objects.filter(
            followee=user_profile,
            follower=request.user.id
            )

        if following_check:
            is_following = True

        hide_post_form = True
        profile_page = True

    # Generate pagination
    paginator = Paginator(posts, 10)
    total_pages = paginator.num_pages
    page_number = request.GET.get('page')
    posts = paginator.get_page(page_number)

    # Calculations for highlighted 'current' page number
    lower_range = range(1, posts.number)
    upper_range = range(posts.number + 1, total_pages + 1)

    # If all posts fit on one page exclude pagination
    if total_pages == 1:
        lower_range = 1

    return render(request, "network/index.html", {
        'posts': posts,
        'lower': lower_range,
        'upper': upper_range,
        'username': profile,
        'profilePage': profile_page,
        'following': following,
        'followers': followers,
        'isFollowing': is_following,
        'hideForm': hide_post_form
        })    


# Submit a 'like' or 'unlike'
@csrf_exempt
@login_required
def like(request, profile=None):
    data = json.loads(request.body)
    post_id = data.get("post", "")
    action = data.get("action", "")
    if action == "like":
        liked = Likes(
            liked_by=User(id=request.user.id),
            post=Posts(id=post_id)
        )
        liked.save()  
    else:
        # delete like
        unliked = Likes.objects.get(
            liked_by=User(id=request.user.id),
            post=Posts(id=post_id)
        )
        unliked.delete()

    count = Likes.objects.filter(
                post=Posts(id=post_id)
            ).count()

    return JsonResponse({"post": post_id, "action": action, "count": count})


# Follow/ unfollow a user
@csrf_exempt
@login_required
def follow(request, follow=None, profile=None):
    
    # If unfollowing from 'following' page, prepare to reload following page
    follow_page = follow

    # If submitting a like from 'following' page, call 'like' function
    if follow_page == 'like':
        return like(request)

    data = json.loads(request.body)

    # If submitting a follow from a profile page
    if profile:
        author = profile
    else: 
        author = data.get("author", "")
    
    action = data.get("action", "")
    followee = User.objects.get(username=author)
    follower = User.objects.get(username=request.user)
    
    if action == "follow":
        follow = Follow.objects.create(
            followee=followee,
            follower=follower
        )          
        follow.save()
    else:
        unfollow = Follow.objects.get(
            followee=followee,
            follower=follower
        )
        unfollow.delete()

    return JsonResponse({"author": author, "action": action, "follow_page": follow_page})


# Delete a post
@csrf_exempt
def delete(request, profile=None):
    data = json.loads(request.body)
    post_id = data.get("post", "")

    post = Posts.objects.get(
        id=post_id
    )
    post.delete()
    return JsonResponse({"post": post_id})


# Edit a post
@csrf_exempt
def edit(request, profile=None):
    data = json.loads(request.body)
    updated = data.get("updated", "")
    post_id = data.get("post", "")

    post = Posts.objects.get(
        id=post_id
    )
    
    post.post = updated
    post.save()

    return JsonResponse("", safe=False)


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
