import sys
import json
sys.path.append('/Users/jianglei/Library/Python/3.7/lib/python/site-packages')
from cloudant import cloudant
import os
user = os.environ['CLOUDANT_USER']
password = os.environ['CLOUDANT_PASSWORD']
root_url = os.environ['CLOUDANT_URL_ROOT_PUBLIC']
import requests

#base_uri = f'https://{user}:{password}@{user}{root_url}'
base_uri = f'https://{user}{root_url}'
print(base_uri)
print(user)
print(password)

headers = { 'Content-Type':'application/json' }
auth = (user, password)
# get the all databases
endpoint = '/_all_dbs'
uri = f'{base_uri}{endpoint}'
r = requests.get(uri, headers = headers, auth = auth)
print(r.text)
dbs = json.loads(r.text)
# get database details
def list_db(db):
    print('printing   ' + '*' * 20 + f' {db} ' + '*' * 20)
    endpoint = '/' + db
    uri = f'{base_uri}{endpoint}'
    r = requests.get(uri, headers = headers, auth = auth)
    parsed = json.loads(r.text)
    print(json.dumps(parsed, indent=4, sort_keys=True))
    print('\n')


#list(map(list_db, dbs))

endpoint= '/rz2/_all_docs'
#print(uri)
uri = f'{base_uri}{endpoint}'
data = '{ "include_docs": true, "limit": 2}'
r = requests.post(uri, headers = headers, data = data, auth = auth)
parsed = json.loads(r.text)
print(json.dumps(parsed, indent=4, sort_keys=True))


endpoint = '/busi_def/_find'
uri = f'{base_uri}{endpoint}'
keyword = 'RCNUM'
data = {
        "selector": {
            "_id": keyword
            }
        }
data = json.dumps(data)

print(uri)
r = requests.post(uri, headers = headers, data = data, auth = auth)
print(r)
parsed = json.loads(r.text)['docs']
#print(json.dumps(parsed, indent=4, sort_keys=True))
list(map(lambda row: list(map(lambda x: print(f'{x[0]}: {x[1]}\n'), row.items())), parsed))

