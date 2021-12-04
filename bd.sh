echo $#
if [ $# -eq 1 ]
then
   echo 'Missing dsr docker image version number....' 
   echo 'Usage: ./bd.sh dev 0.1 , example: ./bd.sh dev  0.1'
   exit
fi

./build.sh $2
./deploy.sh $1 $2 

cat readme.txt


