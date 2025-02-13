## Build image :
build:
docker build -t ritesh089/yogis-karaoke-ui:latest .

## Run image :
run:	
docker run -p 3000:3000 ritesh089/yogis-karaoke-ui:latest

## Push image :
push:
docker push ritesh089/yogis-karaoke-ui:1.0.0

## tag image :
tag:
docker tag ritesh089/yogis-karaoke-ui:latest ritesh089/yogis-karaoke-ui:1.0.0