from django.contrib.auth import authenticate, login, get_user_model
from django.http import HttpResponse
from django.shortcuts import render,redirect
from django.utils.http import is_safe_url
from .forms import ContactForm, LoginForm, RegisterForm

def home_page(request):
    context = {
        "title":"Hello World!",
        "content":" Welcome to the homepage.",

    }
    if request.user.is_authenticated():
        context["premium_content"] = "YEAHHHHHH"
    return render(request, "home_page.html", context)

def about_page(request):
    context = {
        "title":"About Page",
        "content":" Welcome to the about page."
    }
    return render(request, "home_page.html", context)

def contact_page(request):
    contact_form = ContactForm(request.POST or None)
    context = {
        "title":"Contact",
        "content":" Welcome to the contact page.",
        "form": contact_form,
    }
    if contact_form.is_valid():
        print(contact_form.cleaned_data)
    # if request.method == "POST":
    #     #print(request.POST)
    #     print(request.POST.get('fullname'))
    #     print(request.POST.get('email'))
    #     print(request.POST.get('content'))
    return render(request, "contact/view.html", context)


def login_page(request):
    form = LoginForm(request.POST or None)
    context = {
        "form": form
    }
    next_ = request.GET.get('next')
    next_post = request.POST.get('next')
    redirect_path = next_ or next_post or None
    if form.is_valid():
        print(form.cleaned_data)
        username  = form.cleaned_data.get("username")
        password  = form.cleaned_data.get("password")
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            if is_safe_url(redirect_path, request.get_host()):
                return redirect(redirect_path)
            else:
                return redirect("/")
        else:
            # Return an 'invalid login' error message.
            print("Error")

    return render(request, "accounts/login.html", context)


User = get_user_model()
def register_page(request):
    form = RegisterForm(request.POST or None)
    context = {
        "form": form
    }
    if form.is_valid():
        print(form.cleaned_data)
        username  = form.cleaned_data.get("username")
        email  = form.cleaned_data.get("email")
        password  = form.cleaned_data.get("password")
        new_user  = User.objects.create_user(username, email, password)
        print(new_user)

    return render(request, "accounts/register.html", context)
