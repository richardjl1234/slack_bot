import sys
import json
sys.path.append('/Users/jianglei/Library/Python/3.7/lib/python/site-packages')
#from cloudant import cloudant
import os
import requests

parms = {}
parms['user'] = os.environ['CLOUDANT_USER']
parms['password'] = os.environ['CLOUDANT_PASSWORD']
root_url = os.environ['CLOUDANT_URL_ROOT_PUBLIC']
parms['base_uri'] = 'https://{}{}'.format(parms['user'], root_url)
parms['endpoint'] = '/ddl/_find'
parms['keyword'] = 'ODMV_SUCCESS_FACT'

#print(parms)


def remove_rev(result, items):
    for x in items:
        if x in result.keys():
            del result[x]
    return result


def main(parms):
    # different query for different requests
    headers = { 'Content-Type':'application/json' }
    auth = (parms['user'], parms['password'])
    uri = '{}{}'.format(parms['base_uri'], parms['endpoint'])
    if 'ddl' in parms['endpoint'].split('/'):  # for ddl check
        data = { "selector": { "$or": [{"_id": parms['keyword'] }, {"table_id": parms['keyword'] } ]} }
    else:
        data = { "selector": { "_id": parms['keyword'] } }
    data = json.dumps(data)

    r = requests.post(uri, headers = headers, data = data, auth = auth)
    if r.status_code != 200:
        return {
                'statusCode': r.status_code,
                'headers': { 'Content-Type': 'application/json'},
                'body': {'results': 'Error processing your request'}
                }
    else:
        results = json.loads(r.text)['docs']
        items = parms.get('ignore', '').split(',')
        items = [x.strip() for x in items]
        items.append('_rev')

        results = [remove_rev(result, items)  for result in results]
        text = '<BR>'.join( [ ''.join(['<B>{}:</B> <I>{}</I> <BR>'.format(k, v) for k, v in result.items()]) for result in results ])
        return {
                'statusCode': 200,
                'headers': { 'Content-Type': 'application/json'},
                'body': {'results': text}
                }

x = main(parms)
print(x['body']['results'])

