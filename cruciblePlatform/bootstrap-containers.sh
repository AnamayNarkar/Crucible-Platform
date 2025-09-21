#!/usr/bin/env bash

docker stop $(docker ps -aq --filter "name=crucible-") && docker rm $(docker ps -aq --filter "name=crucible-")

export $(cat .env | xargs)

# --- Launch PostgreSQL ---
docker run -d \
    --name crucible-pg \
    -e POSTGRES_PASSWORD=${SPRING_R2DBC_PASSWORD:-secret} \
    -e POSTGRES_USER=${SPRING_R2DBC_USERNAME:-crucible_user} \
    -e POSTGRES_DB=${POSTGRES_DB:-crucible} \
    -p 5432:5432 \
    postgres:latest

echo "PostgreSQL container started on port 5432"

# --- Launch Redis ---
docker run -d \
    --name crucible-redis \
    -p ${SPRING_REDIS_PORT:-6379}:6379 \
    redis:8 \
    redis-server $( [ -n "$REDIS_PASSWORD" ] && echo "--requirepass $REDIS_PASSWORD" )

echo "Redis container started on port ${SPRING_REDIS_PORT:-6379}"

echo "All services are up!"
