from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout, get_user_model
from django.contrib import messages
from .forms import RegistrationForm

User = get_user_model()

def home(request):
    return render(request, 'JRShop/home.html')

def user_login(request):
    if request.user.is_authenticated:
        return redirect('home')
    
    if request.method == "POST":
        email = (request.POST.get('email') or '').strip()
        password = request.POST.get('password')

        if not email or not password:
            messages.error(request, "Please enter both email and password.")
            return render(request, 'JRShop/login.html')

        user_lookup = User.objects.filter(email__iexact=email).order_by('date_joined').first()
        user = None

        if user_lookup:
            user = authenticate(request, username=user_lookup.username, password=password)

        if user is not None:
            auth_login(request, user)
            messages.success(request, f"Welcome back, {user.username}!")
            return redirect('home')
        else:
            messages.error(request, "Invalid username or password!")
    
    return render(request, 'JRShop/login.html')

def register(request):
    if request.user.is_authenticated:
        return redirect('home')
    
    if request.method == "POST":
        form = RegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            auth_login(request, user)
            messages.success(request, "Registration Successful! Welcome to JR E-Shop!")
            return redirect('home')
    else:
        form = RegistrationForm()
    
    return render(request, 'JRShop/register.html', {'form': form})

def user_logout(request):
    auth_logout(request)
    messages.success(request, "You have been logged out successfully!")
    return redirect('home')