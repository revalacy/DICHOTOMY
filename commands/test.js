const async = require ('async');
const GoogleSpreadsheet = require('google-spreadsheet');
    const creds = require('./../client_secret.json');
    const doc = new GoogleSpreadsheet('1kxcMdb0Gsyg9Oe3NbWMXx1vHopFjqLzneXehoURAN6M');//Character database
    const eventdoc = new GoogleSpreadsheet('1fuXzJ1_rvlHIFRRwTZXfnDrxzyn2yrvukXe0Th_i8-8');//events database
    const devdoc = new GoogleSpreadsheet('1gttI85xdLuZZmWedz7nemrfBSlotJGD6n_qdcDSgHV0');//DEV Database
    doc.useServiceAccountAuth(creds, function (err) {
    if (err)
    console.log(err)});
    eventdoc.useServiceAccountAuth(creds, function (err) {
    if (err)
    console.log(err)});
    devdoc.useServiceAccountAuth(creds, function (err) {
    if (err)
      console.log(err)});

var fn = require ('./../functions.js');
var efn = require ('./../effects.js');

exports.run = (client, message, [...args]) => {//change args to whatever arg variables need to be defined up-front.
  
  var announcementroom = client.channels.get('390953758944788482'); //the room where the event announcement will go when using /event label open; outside of testing this should be 503634158308818954
  var registrationroom = client.channels.get('469569953553448961'); //this will be the room people are told to register in. It will be the bot room when the command goes live
  var cmdgen = "event";

  
  async function resolve(){
    var search = 'label = "Enambris" | label = "rosepin"';
    var [firstname, lastname, nickname, label, title, divisions, job, description, str, dex, sta, per, int, cha, hp, wp, wits, soak, resolve, martial, protection, stealth, healing, support, comprehension] = ['Name', 'lastname', 'nickname', 'label', 'title', 'divisions', 'job', 'description', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var [Enambris, rosepin] = await rowpull(search);
    console.log('firstname: ' + firstname);
    console.log('nickname: ' + rosepin.nickname);
    }
  
  async function rowpull(a){
   var searchvals = a;
   var returnvals = [];
   return new Promise(resolve =>{

       devdoc.getRows(1, {'query': searchvals}, function(err,row){
         resolve(row);
       });
   });
  };

  
async function messagehandler (a){
var msgarray = a;
var timeoutstack = []
function doSetTimeout(i) {
setTimeout(function() { 
  msgarray[i] = msgarray[i].replace('[','').replace(']','').replace('<>','');
  var n = msgarray[i].indexOf('<');
  console.log('n = ' + n);
  if (n != -1) {var [replacemsg, url] = msgarray[i].split('<'); console.log(url); msgarray[i] = replacemsg; url = url.replace('>', ''); console.log(msgarray[i] + ';' + url); message.channel.send(msgarray[i], {files: [url]});};
  if (n === -1) message.channel.send(msgarray[i]);
}, timeoutstack[i]);
}
for (var i = 0; i < msgarray.length; i++){
 timeoutstack[i] = 5000 * i;
 doSetTimeout(i);
}}
  
    resolve();
}