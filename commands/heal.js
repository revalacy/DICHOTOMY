const async = require ('async');
const GoogleSpreadsheet = require('google-spreadsheet');
    const creds = require('./../client_secret.json');
    const doc1 = new GoogleSpreadsheet('1kxcMdb0Gsyg9Oe3NbWMXx1vHopFjqLzneXehoURAN6M');//Character database
    const doc2 = new GoogleSpreadsheet('16bWQdKPv4elUPb8UKqD3NP-Ve5TwHGjQWBdAhbkOBLI');//objects and sets database
    const doc3 = new GoogleSpreadsheet('1fuXzJ1_rvlHIFRRwTZXfnDrxzyn2yrvukXe0Th_i8-8');//events database
    doc1.useServiceAccountAuth(creds, function (err) {
    if (err)
    console.log(err)});
    doc2.useServiceAccountAuth(creds, function (err) {
    if (err)
    console.log(err)});
    doc3.useServiceAccountAuth(creds, function (err) {
    if (err)
    console.log(err)});

var fn = require ('./../functions.js');

//command flow: name, stat, target
exports.run = (client, message, args) => {
    
  //get all base variables for the command
    var name = args[0];
    var namestring = ('**' + name + '** ');
    var target = args[1]||name;
    var bonus = args[3]||"0";
    var bns = bonus.replace(/\+/g," + ").replace(/\-/g," + -").replace("0","");
    var user = message.author.id;//gets user ID for command author
    var roll = Math.floor(Math.random() *10)+1;

  
  if (!name) return message.channel.send('You must include your character\'s first name in your command. Please post a new command, as editing the previous will not resolve.');
  
 
 async function resolve(){
     var [owner, eventstatus, locked] = await fn.getval(2, name, ['userid','inevent','editlock']);
   if (!owner) return message.channel.send(' doesn\'t exist in the database, please submit the character before attempting further actions.');
   if (owner != user)return message.channel.send('You can\'t use commands for someone else\'s character!');//check ownership
   if (eventstatus === "0") return message.channel.send ('You are not currently in any events. Combat commands are only usable in active events. If you believe this message was received in error, please reach out to a GM or Admin.');
   var announcementroom = client.channels.get('503634158308818954');
   var room = message.channel.id;
   var [int, bonus, heal] = await fn.getval(2, name, ['int','bonus','heal']);//get name's int modifier, bonus, and heal vals
   var [targethp, targetmax] = await fn.getval(2, target, ['hp','maxhp']);//get target's hp and maxhp
   var total = +roll + +int + +bonus + +heal;//get roll+modifiers total
   var [healval, string1, string2] = await fn.getval(4, total, ['healeffect', 'replace', 'heal']);
   fn.hpresolve(target,healval);
   var msg = (namestring + string1 + string2 + target);//create message string
   message.channel.send(msg);//send message
   var hasactedstring = await fn.eventproperty(room,'hasacted');
   var newstring = (hasactedstring + name +',');
 }
  resolve();
  
}