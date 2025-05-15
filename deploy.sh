#!/bin/bash
set -e
source .env

./wait-for-it.sh $DB_HOST:3306  --strict

DOCKER_IMAGE_NAME="expenses_back"
DOCKER_CONTAINER_NAME="expenses_back"
DOCKER_PORT="8000"
GIT_BRANCH="back"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Deploying expenses backend..."
cd $SCRIPT_DIR
git pull origin $GIT_BRANCH
docker build -t $DOCKER_IMAGE_NAME .
docker rm -f $DOCKER_CONTAINER_NAME || true
docker run -d -p $DOCKER_PORT:$DOCKER_PORT --restart unless-stopped --name $DOCKER_CONTAINER_NAME $DOCKER_IMAGE_NAME

echo "Deploy done! :)"

# k