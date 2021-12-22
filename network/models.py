from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass


class Follow(models.Model):
    followee = models.ForeignKey("User", on_delete=models.CASCADE, related_name="followee")
    follower = models.ForeignKey("User", on_delete=models.CASCADE, related_name="follower")


class Likes(models.Model):
    post = models.ForeignKey("Posts", on_delete=models.CASCADE)
    liked_by = models.ForeignKey("User", on_delete=models.CASCADE)


class Posts(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE)
    post = models.TextField(blank=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.username,
            "post": self.post,
            "timestamp": self.timestamp
        }

    def liked(self):
        return Likes.objects.filter(
            post=Posts(id=self.id)).values_list('liked_by', flat=True)

    def like_count(self):
        return Likes.objects.filter(
            post=Posts(id=self.id)).count()

    def followed(self):
        return Follow.objects.filter(
            followee=User(id=self.user.id)).values_list('follower', flat=True)