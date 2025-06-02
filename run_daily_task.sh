#!/bin/bash

# Activate virtual environment
source /mnt/SSD240-DRIVE/projects/expenses/expenses/env/bin/activate

# Run the Django management command
/mnt/SSD240-DRIVE/projects/expenses/expenses/env/bin/python3.11 /mnt/SSD240-DRIVE/projects/expenses/expenses/manage.py run_daily_task
