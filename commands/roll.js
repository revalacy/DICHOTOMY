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
    const [pt1, pt2, pt3] = await fn.getval(4, total, ["replace", "skillcheck","roll"]);
     var statcheck = await fn.getproperty(4, stat, "replace")
     var msg = ('**'+ name + '** '+ pt1 + " " + pt2 + statcheck +pt3);
     message.channel.send(msg)
   
     
 
 }
 
  resolve();
}