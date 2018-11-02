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
exports.run = (client, message, [name, target, stat]) => {
    
  //get all base variables for the command
    var user = message.author.id;//gets user ID for command author
    var roll = Math.floor(Math.random() *10)+1;
    if (stat === 'attack') stat = 'atk';
    if (stat === 'defense') stat = 'def';
    if (stat === 'damage') stat = 'dmg';
    var namestring = ('**' + name + '** ');
    
    
  if (!name) return message.channel.send('You must include your character\'s first name in your command. Please post a new command, as editing the previous will not resolve.');
  
 
 async function resolve(){
   var [owner, eventstatus, locked] = await fn.getval(2, name, ['userid','inevent','editlock']);
   if (!owner) return message.channel.send(' doesn\'t exist in the database, please submit the character before attempting further actions.');
   if (owner != user)return message.channel.send('You can\'t use commands for someone else\'s character!');//check ownership
   if (eventstatus === "0") return message.channel.send ('You are not currently in any events. Combat commands are only usable in active events. If you believe this message was received in error, please reach out to a GM or Admin.');
  if (stat != 'atk' && stat != 'def' && stat!= 'damage' && stat != 'heal' && stat != 'cover') return message.channel.send('That stat isn\'t a valid stat to apply a buff to. You may buff: attack, defense, damage, heal, or cover to buff for your target.');
  var announcementroom = client.channels.get('503634158308818954');
   var room = message.channel.id;
   var z = await fn.eventcdcheck(name, room);//if not in an event, return
   if (z === 'none') return message.channel.send('There isn\'t an ongoing event in this room! Please check ' + announcementroom +'for details on active events.');
   if (z === 0) return message.channel.send(namestring + ' cannot use an action at this time. Either you have already acted, or the action window has ended. Please wait for the next action round or consult a GM.');
   var [buff, bonus] = await fn.getval(2, name, ['buff', 'bonus']);//pull name's buff, bonus
   console.log('roll = ' + roll + 'buff = ' + buff + 'bonus = ' + bonus);
   var total = +roll + +buff + +bonus;
   var totalstring = total.toString();
   var [buffval, response, rollreplace] = await fn.getval(4, totalstring, ['buffval','buff','replace']);//pull buff response and value
   if (+buffval > 0) {//if buff value is > 0 pull target's stat string and apply the buff
     var targetstat = await fn.getproperty(2, target, stat);
     var newstat = (targetstat + ',' + buffval);
    fn.setval(2, target, [stat],[newstat]);
   };
   var msg = (namestring + rollreplace + response + target + '.');
   message.channel.send(msg);
   fn.setval(2, name, ['bonus'],[0]);
   var hasactedstring = await fn.eventproperty(room,'hasacted');
   var newstring = (hasactedstring + name +',');
   fn.eventmodifyval(room,['hasacted'],[newstring]);
 }
  
  resolve();
}