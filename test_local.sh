# usage: ./test.sh [version] example: ./test.sh 0.4
docker run \
   -u nobody \
   --env-file env.list  \
   -v "/Users/jianglei/Documents/GitHub/odmchatbot/cache":/app/cache \
   -p 8080:8080 \
   -it odmchatbot:$1 \
