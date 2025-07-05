from django.urls import path
from django.views.decorators.csrf import csrf_exempt

from shopping.views import Shopping

urlpatterns = [
    path("items", csrf_exempt(Shopping.as_view()), name="shopping"),
]
