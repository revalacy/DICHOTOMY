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
    var stat = args[1];
    var target = args[2];
    var user = message.author.id;//gets user ID for command author
    var roll = Math.floor(Math.random() *10)+1;
    var namestring = ('**' + name + '**');

  
  if (!name) return message.channel.send('You must include your character\'s first name in your command. Please post a new command, as editing the previous will not resolve.');
  if (!stat) return message.channel.send('You must include the relevant stat in your command. Please post a new command, as editing the previous will not resolve.');
  if (name === target) return message.channel.send("Why are you attacking ***yourself***? Please choose a target other than you!");
  
 
 async function resolve(){
   var [owner, eventstatus, modifier, atk, dmg, bonus, eventcooldown] = await fn.getval(2, name, ['userid', 'inevent', stat, "atk", "dmg", 'bonus', 'eventcooldown']);
   if (!owner) return message.channel.send(' doesn\'t exist in the database, please submit the character before attempting further actions.');
   if (owner != user)return message.channel.send('You can\'t use commands for someone else\'s character!');//check ownership
   if (eventstatus === "0") return message.channel.send ('You are not currently in any events. Combat commands are only usable in active events. If you believe this message was received in error, please reach out to a GM or Admin.');
   if (stat === "wit" || stat === "res") return message.channel.send('That stat cannot be used for attack, please use one of the other available stats.');
  
   var [modtotal,newstat] = await fn.sumstring(modifier);
   var [attacktotal,newatk] = await fn.sumstring(atk);
   var [damagetotal,newdmg] = await fn.sumstring(dmg);
   var total = +roll + +modtotal + +bonus + +attacktotal;//get total of roll
   console.log('roll = ' +roll +'mod = ' +modtotal + 'bonus = ' +bonus + 'attacktotal = ' +attacktotal)
   var searchval = total.toString();
   var damage = await fn.getproperty(4, searchval, "dmgtarget");//get damage min for total
   var fulldmg = +damage + +damagetotal;
    if (+total <= 1) fn.doom(name);//if total = 1 run Doom
   var pendingattackstring = await fn.getproperty(2, target, "attacks");//get target's pending attack string
   var newstring = (name + " | " + total + " | " + fulldmg + ",")//create new attack string
   var setstring = (pendingattackstring + newstring);//add new string to the end of pending attack string
   if(+total > 4 ) fn.setval(2, target, ["attacks"],[setstring]);//set new attack string
    const [pt1, pt2, pt3] = await fn.getval(4, total, ["replace", "attacksetup","attack"]);//get string values for attack response
     var msg = (namestring + ' '+ pt2 + target + " and " + pt1 + pt3);
   fn.setval(2, name, ['atk','dmg','bonus',stat],[newatk,newdmg,0,newstat]);//reset name's attack and dmg minimums
   return message.channel.send(msg)

 }
 
  resolve();
}