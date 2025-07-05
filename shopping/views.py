import json
from os import name
from MySQLdb import IntegrityError
from django.forms import ValidationError
from django.http import JsonResponse
from django.views import View

from shopping.models import Item

from loguru import logger

# Create your views here.


class Shopping(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format."}, status=400)

        items = data.get("items")
        if not isinstance(items, list):
            return JsonResponse({"error": "`items` must be a list."}, status=400)

        errors = []
        for idx, item in enumerate(items):
            try:
                print(item)
                item = {
                    "name": item.get("name"),
                    "price": round(item.get("price", 0), 2),
                    "quantity": item.get("quantity"),
                    "notes": item.get("notes"),
                    "creation_date": item.get("creationDate"),
                }
                Item.objects.create(**item)
            except (TypeError, ValidationError, IntegrityError) as e:
                logger.error(f"Failed to create item at index {idx}: {e}")
                errors.append({"index": idx, "error": str(e)})

        if errors:
            return JsonResponse(
                {"message": "Some items failed to process.", "errors": errors},
                status=207,
            )  # 207 Multi-Status for partial success

        return JsonResponse(
            {"message": "All shopping items processed successfully."},
            status=201,
        )
