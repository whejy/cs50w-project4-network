from django.shortcuts import render, redirect
from django.contrib import messages
from django import forms
from markdown2 import Markdown

from . import util

import random


class NewEntryForm(forms.Form):
    title = forms.CharField(widget=forms.TextInput(attrs={
        'required': True, 'placeholder': 'Title', 'class': 'title'
        }), label='')
    content = forms.CharField(widget=forms.Textarea, label='')


class EditEntryForm(forms.Form):
    title = forms.CharField(widget=forms.HiddenInput())
    content = forms.CharField(widget=forms.Textarea, label='')


def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })


def entry(request, title):
    entry = util.get_entry(title)
    if entry:
        entry = Markdown().convert(util.get_entry(title))
        form = EditEntryForm(initial={'title': title})
        return render(request, "encyclopedia/entry.html", {
            "form": form,
            "entry": entry,
        })
    else:
        return render(request, "encyclopedia/error.html")


def edit(request):
    if request.method == "GET":
        title = request.GET['title']
        entry = util.get_entry(title)
        form = EditEntryForm(initial={'content': entry, 'title': title})
        return render(request, "encyclopedia/edit.html", {
            "form": form,
            "title": title
        })
    else:
        form = EditEntryForm(request.POST)
        if form.is_valid():
            title = form.cleaned_data['title']
            entry = form.cleaned_data['content']
            util.save_entry(title, entry)
            messages.success(request, f"'{title}' updated.")
            return redirect("wiki:entry", title)


def new(request):
    if request.method == "GET":
        return render(request, "encyclopedia/new.html", {
            "form": NewEntryForm()
        })
    else:
        form = NewEntryForm(request.POST)
        if form.is_valid():
            content = form.cleaned_data['content']
            title = form.cleaned_data['title']
            if util.get_entry(title):
                messages.error(request, "Entry already exists.")
                return render(request, "encyclopedia/new.html", {
                    "form": form
                })
            else:
                util.save_entry(title, content)
                messages.success(request, f"New entry '{title}' created.")
                return redirect("wiki:entry", title)
        else:
            return render(request, "encyclopedia/new.html", {
                "form": form
            })
    

def search(request):
    title = request.POST.get("q")
    entry = util.get_entry(title)
    entries = util.list_entries()    
    if request.method == "GET" or not title:
        return redirect("wiki:index")
    else:
        entrieslower = []
        for i in range(len(entries)):
            entrieslower.append(entries[i].lower())
        #If query matches an entry, take user to that page
        if title.lower() in entrieslower:
            return redirect("wiki:entry", title)
        else:
        # Otherwise present user with search results, ensuring that if user
        # queries a single character, search returns only entries that begin
        # with that character.
            results = []
            for string in entries:
                if title.lower() in string.lower():
                    results.append(string)
            if len(title) < 2:
                temp = []
                for i in range(len(results)):
                    if title[0].lower() == results[i][0].lower():
                        temp.append(results[i])
                results = temp
            if not results:
                results.append("No results.")
            return render(request, "encyclopedia/search.html", {
                "entries": results
            })


def randomChoice(request):
    page = random.choices(util.list_entries())[0]
    return redirect("wiki:entry", page)

   