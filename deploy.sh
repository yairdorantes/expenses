#!/bin/bash
set -e
source .env

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd $SCRIPT_DIR

# ./wait-for-it.sh $DB_HOST:3306  --strict

DOCKER_IMAGE_NAME="expenses_back"
DOCKER_CONTAINER_NAME="expenses_back"
DOCKER_PORT="8000"
GIT_BRANCH="back"

echo "Deploying expenses backend..."

git pull origin $GIT_BRANCH
docker build -t $DOCKER_IMAGE_NAME .
docker rm -f $DOCKER_CONTAINER_NAME || true
docker run -d --add-host=host.docker.internal:host-gateway  -p $DOCKER_PORT:$DOCKER_PORT --restart unless-stopped --name $DOCKER_CONTAINER_NAME $DOCKER_IMAGE_NAME

echo "Deploy done! :)"

#
