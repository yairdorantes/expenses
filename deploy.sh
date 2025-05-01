#!/bin/bash


echo "Deploying expenses backend..."

cd /home/yair/projects/expenses/expenses

git pull origin back
docker rm -f expenses_back || true
docker build -t expenses_back .
docker run -d -p 8000:8000 --restart unless-stopped --name expenses_back expenses_back

echo "Deploy done!"