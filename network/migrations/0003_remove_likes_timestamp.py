# Generated by Django 3.2.5 on 2021-12-14 03:40

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0002_likes_posts'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='likes',
            name='timestamp',
        ),
    ]