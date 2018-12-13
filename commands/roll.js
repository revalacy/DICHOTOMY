const async = require ('async');
const fn = require ('./../functions.js');
var efn = require ('./../effects.js');


//Command flow: /roll Name stat (optional)bonus
exports.run = (client, message, args) => {
    
  //get all base variables for the command
    var name = args[0];
    var stat = args[1];
    var bonus = args[2]|| "0";
    var bns = bonus.replace(/\+/g," + ").replace(/\-/g," + -").replace("0","");
    var user = message.author.id;//gets user ID for command author
    var roll = Math.floor(Math.random() *10)+1;
    var keya = "skillcheck";//first key for message string pull
    var keyb = "roll";//second string for message string pull

  
  if (!name) return message.channel.send('You must include your character\'s first name in your command. Please post a new command, as editing the previous will not resolve.');
  if (!stat) return message.channel.send('You must include the relevant stat in your command. Please post a new command, as editing the previous will not resolve.');
  
 
 async function resolve(){
   var owner = await fn.getproperty(2, name, 'userid'); 
   if (owner === "error") return message.channel.send('That character doesn\'t exist in the database, please submit the character before attempting further actions.');
   if (owner != user)return message.channel.send('You can\'t use commands for someone else\'s character!');
   var modifier = await fn.getproperty(2, name, stat);//stat modifier value for char
   if (!modifier) return message.channel.send('That stat doesn\'t exist, please use a valid stat!');
    var total = +roll + +modifier + +bonus;//total of roll, is often threshold
    if (total <= 1) fn.doom(name);
     var statcheck = await fn.getproperty(4, stat, "replace")
     var msg = await fn.getproperty(4, total, 'skillcheck');
     msg = msg.replace('#', name).replace('#', statcheck).replace('#', name);
     messagehandler([msg]);
 
 }
  
        async function messagehandler (a){
        var msgarray = a;
        var timeoutstack = []
        var urlarray = [];
        function doSetTimeout(i) {
        setTimeout(function() { 
          msgarray[i] = msgarray[i].replace('[','').replace(']','').replace('||','');
          var n = msgarray[i].indexOf('|');
          console.log('n = ' + n);
          if (n != -1) {var [replacemsg, url] = msgarray[i].split('|'); console.log(url); msgarray[i] = replacemsg; console.log(msgarray[i] + ';' + url); message.channel.send(msgarray[i], {files: [url]});};
          if (n === -1) message.channel.send(msgarray[i]);
        }, timeoutstack[i]);
        }
        for (var i = 0; i < msgarray.length; i++){
         timeoutstack[i] = 5000 * i;
         doSetTimeout(i);
        }}
 
  resolve();
}