var http = require('http');
var url = require('url') ;
var fs = require('fs');
var router = require('./routes/routers') ; // The api feedback function is given here
var common_func = require('./common_func') ; // contains the functions addDocument and postPriChannel
var request = require('request');
const { htmlToText } = require('html-to-text');

n = 0;
http.createServer(function(request, response) {
   if(request.url!=="/favicon.ico"){
      n = n+1
      console.log('####### The web server is hit  ' + String(n) + ' times since last restart!') ;
      let pathname = url.parse(request.url).pathname;
      let para = url.parse(request.url).query;
      console.log(para) ;
      console.log(pathname);
      pathname = pathname.replace(/\//, '') ;
      switch(pathname) {
         case '' :
            response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            let data = fs.readFileSync('index.html','utf-8');
            response.write(data);
            break;
            //case 'feedback': try {router[pathname](request,response); } catch(err){console.log(err, " router failed!"); }; break ;
         case 'showimg':
            try {router.showimg(request,response,para); }
            catch(err){console.log(err, " router failed!"); };
            break ;
         default:
            try {router[pathname](request,response); }
            catch(err){console.log(err, " router failed!"); };
            break ;
      };
      response.end('');
   };
}).listen(8080);
console.log("Listening on port 8080.....");

var me = process.env.CLOUDANT_USER;
var password = process.env.CLOUDANT_PASSWORD;
// Initialize the library with my account.

var feedback_button = {
   "text": "",
   "attachments": [
      {
         "text": "How do you like the answer given by me? \n *Please input your comments in the following format:* \n`feedback: your-comments` \n or\n*Simply type your feedback as:*  `SAT` or `UNSAT` or :thumbsup: or :thumbsdown: \n",
         "fallback": "Feedback is not able to be provided in your device...",
         "callback_id": "feedback_callback",
         "color": "#3AA3E3",
         "attachment_type": "default"
      }
   ]
}

// add conversation service and slackbot
var Botkit = require('./node_modules/botkit/lib/Botkit.js');
var controller = Botkit.slackbot({
   debug: false,
   stale_connection_timeout: 1200000
});
var bot = controller.spawn({
   token: process.env.SLACK_BOT_TOKEN
}).startRTM();

contexts = [] ;//contexts is a array, in which it will hold all the context for every user who is using chatbot
msg_cnt = 0; // this is the message counter
controller.hears(['.*'], ['direct_message', 'direct_mention'], (bot, message) => {
   userid = message.user ;
   if (typeof(contexts[userid]) == 'undefined') {   // for the first time. Initialize the context for the given userid
      contexts[userid] = {} ;
      contexts[userid].context = {}  ; // contexts.context will carry the context which comes from the watson service
      contexts[userid].context.curr_q = '' ;
      contexts[userid].context.curr_a = '' ;
      contexts[userid].username = '' ;
      common_func.restapi_get_json_auth('https://####/api/users.info?user='+message.user+'&pretty=1', // the slack url for ####
         (result)=>{ contexts[userid].username = result; })
   };
   message.text = message.text.replace(/\n/g, ' ') ; // enable chatbot to handle question with multiple lines.
   console.log("#####################\nmessage counter is : ", msg_cnt+=1) ;
   conversation.sendMessage(String(message.text), contexts[userid].context) // at first message the context is still undefined
      .then(response => {
         controller.log('Response from Watson received');
         //console.log(JSON.stringify(response));
         fs.writeFile('cache/context_runtime.json', JSON.stringify(contexts[userid],null,2) , 'utf8', ()=>{console.log('the contexts file is sent to context_runtime.json!')})
         fs.writeFile('cache/response_runtime.json', JSON.stringify(response,null,2) , 'utf8', ()=>{console.log('the response file is sent to context_runtime.json!')})
         contexts[userid].t_stamp = Date.now();
         contexts[userid].context = response.context;
         contexts[userid].context.prev_q = contexts[userid].context.curr_q; // to carry the prev question and answer in the context
         contexts[userid].context.prev_a = contexts[userid].context.curr_a;
         contexts[userid].context.curr_q = String(message.text);
         switch(response.output.action) {
            case 'un-known-questions':  unknown_action(message,response,blank_action); break;
            case 'feedback': feedback_action(message, response, 'CMT') ; break;
            case 'feedback_sat': feedback_action(message, response, 'SAT') ; break;
            case 'feedback_unsat': feedback_action(message, response, 'UNSAT') ; break;
            default: blank_action(message, response);
         }
      })
      .catch(err => {
         console.log('error to retrieve response from watson assistant service!');
         let obj = JSON.parse(JSON.stringify(err)) ;
         console.log(err);
         bot.reply(message,"*Error:* " + JSON.parse(obj.message).input.text[0]) ;
         console.error(JSON.stringify(err, null, 2));
      });
});


const ConversationV1 = require('watson-developer-cloud/conversation/v1');
const conversation = new ConversationV1({
   username: process.env.CONVERSATION_USERNAME,
   password: process.env.CONVERSATION_PASSWORD,
   version_date: ConversationV1.VERSION_DATE_2017_02_03
});
/**
 * Call to Conversation API: send message
 * @param {string} text
 * @param {object} context
 * @returns {promise}
 */
conversation.sendMessage = (text, context) => {
   const payload = {
      workspace_id: process.env.WORKSPACE_ID,
      input: { text },
      context
   };
   return new Promise((resolve, reject) => conversation.message(payload, function(err, response) {
      if (err) {
         reject(err);
      } else {
         resolve(response);
      }
   }));
};


unknown_action = (msg, resp,callback) =>
{
   var useridlink = "<https://#####/messages/"+msg.user+"|"+msg.user+">"; // the slack url for #####
   postData = {'userid':useridlink, 'username':contexts[msg.user].username, 'timestamp': Date.now(), 'question': msg.text} ;
   var postStr = '' ;
   JSON.parse(JSON.stringify(postData), (key,value) => {if(key!=='') {postStr = postStr+"*"+key+":* "+value+"\n";}})
   common_func.postToChannel(process.env.UNKNOWN_QUESTION_CHANNEL, {"text":postStr}) ;
   callback(msg,resp);
};

feedback_action = (msg, resp, fdbk) =>
{
   //console.log(msg) ;
   var postData = {
      'userid': msg.user,
      'username':contexts[msg.user].username,
      'timestamp': Date.now(),
      'question': resp.context.prev_q,
      'answer': resp.context.prev_a,
      'reviewed': 'to_be_reviewed'
   }
   fdbk == 'CMT'? postData.feedback =msg.text: postData.feedback = fdbk;

   common_func.addDocument(process.env.DB_FEEDBACK, postData, (result_rec_id) => {
      bot.reply(msg, '_Your valuable feedback is received, thank you very much! The feedback record id is:_\n' + '_'+ result_rec_id + '_') ;
   }) ; // xxxx to be replaced by the json contents
   var postStr = '' ;
   var useridlink = "<https://#####/messages/"+msg.user+"|"+msg.user+">"; //the slack workspace url for #####
   postData.userid = useridlink;
   JSON.parse(JSON.stringify(postData), (key,value) => {if(key!=='') {postStr = postStr+"*"+key+":* "+value+"\n";}})
   if (fdbk !== 'SAT')  {common_func.postToChannel(process.env.FEEDBACK_CHANNEL, {"text": postStr})} ;//SAT feedback will not be posted in channel
   contexts[msg.user].context.curr_q = contexts[msg.user].context.prev_q;
   contexts[msg.user].context.prev_q = resp.context.prev_q;
   contexts[msg.user].context.prev_a = resp.context.prev_a;
};

// when action is set as blank, the normal processing
blank_action = (msg, resp) =>
{
   plain_text = htmlToText(resp.output.text.join('\n'), {worldwrap: 100}) ;
   //contexts[msg.user].context.curr_a = resp.output.text.join('\n').replace(/<[bB][rR]>/g, '\n').replace(/<[Aa]\s+[Hh][Rr][Ee][Ff].*?>/g, '').replace(/<\/[Aa].*?>/g, '') ;
   contexts[msg.user].context.curr_a = plain_text;
   feedback_button.text = contexts[msg.user].context.curr_a ;
   bot.reply(msg, feedback_button);
} ;

