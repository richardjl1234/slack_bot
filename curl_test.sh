echo ---- TESTING -----
echo $TEXT
curl -u "apikey:$ODMCHATBOT_APIKEY" -X POST -H "Content-Type:application/json" -d "{\"input\": {\"text\": \"$TEXT\"}}" "https://gateway.watsonplatform.net/assistant/api/v1/workspaces/$ODMCHATBOT_WORKSPACE_ID/message?version=2019-02-28"|jq
