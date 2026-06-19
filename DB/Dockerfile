# Dockerfile
FROM mysql:latest

ENV MYSQL_ROOT_PASSWORD=1
ENV MYSQL_DATABASE=expenses

COPY *.sql /docker-entrypoint-initdb.d/

EXPOSE 3306