_=require('ramda');
var request = require('request');
var Cloudant = require('cloudant');
var CLOUDANT_USER = process.env.CLOUDANT_USER; // Set this to your own account
var CLOUDANT_PASSWORD = process.env.CLOUDANT_PASSWORD;
var CLOUDANT_URL_ROOT_PUBLIC= process.env.CLOUDANT_URL_ROOT_PUBLIC;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
// refactoring for odmchatbot v108
// for cloudant database query
// v1.08 the cloudant query template for IGC database, key is given and the field list is given here
// v1.08 the common query
var curried_query_cloudant = _.curry( function(dbname, query) {
   return new Promise(function(resolve, reject) {
      request({
         method: 'POST',
         uri: 'https://' + CLOUDANT_USER + ':' + CLOUDANT_PASSWORD + '@' + CLOUDANT_USER + CLOUDANT_URL_ROOT_PUBLIC + '/' + dbname + '/_find',
         json: true,
         body: query
      }, function(error, response, body) {
         if (!error && response.statusCode == 200) {
            resolve(body.docs);
         } else {
            reject({
               'ErrorMsg': 'Error get result from  ' + dbname + '  database!'
            });
         };
         console.log("response.statusCode" + response.statusCode);
      });
   });
});

module.exports = {
   cloudant_query: curried_query_cloudant, // this is general query function , which take 2 parameters, dbname, json format query. ,

   postToChannel:function(priChannel,postData){
      var clientServerOptions = {
         uri: '#######' + priChannel,  //slack webhook need to be filled here
         body: JSON.stringify(postData),
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         }
      }
      request(clientServerOptions, function (error, response) {
         console.log(error,response.body + " Message forwarded to Slack private Channel");
         return response.body;
      });
   },

   addDocument:function(dbname,postData, callback){
      var clientServerOptions = {
         uri: 'https://' + CLOUDANT_USER + ':' + CLOUDANT_PASSWORD + '@' + CLOUDANT_USER + CLOUDANT_URL_ROOT_PUBLIC + '/'  + dbname,
         body: JSON.stringify(postData),
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         }
      }
      console.log(clientServerOptions);
      request(clientServerOptions, function (error, response) {
         console.log(response);
         console.log(error,response.body + " document added to database" + dbname );
         callback(JSON.parse(response.body).id);
      });
   },

   //// restapi_post_json is a common function which can POST json data to a given url

   restapi_post_json:function(your_uri,postData){
      var clientServerOptions = {
         uri: your_uri,
         body: JSON.stringify(postData),
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         }
      }
      request(clientServerOptions,function (error,response) {
         console.log(error,response.body + " the message posted on your url! ") ;
      }) ;

   },

   // restapi POST for call which need auth, put the SLACK_BOT_TOKEN in the header of the rest api call.
   // we can not put the Token in the JSON (the data body.

   restapi_post_json_auth :function(your_uri,postData){
      var clientServerOptions = {
         uri: your_uri,
         body: JSON.stringify(postData),
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '+ process.env.SLACK_BOT_TOKEN
         }
      }
      request(clientServerOptions,function (error,response) {
         console.log(error,response.body + " the message posted on your url! ") ;
      }) ;

   },

   // restful api to send GET request
   restapi_get_json_auth :function(your_uri,callback){
      var clientServerOptions = {
         uri: your_uri,
         method: 'GET',
         headers: {
            'Content-Type': 'application/json' ,
            'Authorization': 'Bearer '+ process.env.SLACK_BOT_TOKEN
         }
      }
      request(clientServerOptions,function (error,response) {
         //console.log(error,response.body + " the information is retrieved from the url! ") ;
         var resBody = JSON.parse(response.body);
         console.log('user name inside function:', resBody.user.name) ;
         //return resBody;
         callback(resBody.user.name);
      }) ;

   }
}


