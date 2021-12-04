echo $#
if [ $# -eq 0 ]
then
   echo 'Missing odmchatbot docker image version number....'
   echo 'Usage: ./build.sh odmchatbot_docker_version , example: ./build.sh 0.1'
   exit
fi
docker build -t odmchatbot:$1 .
docker tag odmchatbot:$1 richardjl/odmchatbot:$1
if [ "$2" = "hub" ]
then
   docker push richardjl/odmchatbot:$1
fi

