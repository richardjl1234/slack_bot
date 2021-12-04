1. create the function in the cloudant_cloud_function.py , the main function should be place in the main(parms)
2. once done, please run the following command:
 python3 cloudant_cloud_function.py

3. once tested, please go to the following link
https://cloud.ibm.com/functions/details/action/jianglei%2540cn.ibm.com_dev/odmmeta-action-python/location/code
copy and paste the main function into the code

4. setup the parameters in the parameters page.  (only fixed parameter should be placed there'

5. confirm the endpoint and userid/password
6. use the curl given in the page to test in your local machine.

7. once tested, go the the chatbot, option -> webhook
copy the url , please remember to add the parameter "blocking=true" in the end of the url
copy the authorization (userid and password)

8. go to the chatbot dialog node, capture the parameter from the question and then set it in the parameter
9. in the chatbot dialogure node, remember to select "customzied" option

10. get result from the context variable webhook_result_1.result.body.results
11. set up the web widget , copy paste the intergration into html
12. open the test.html to make sure the web chat works in html page.



 :



