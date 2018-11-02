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
exports.run = (client, message, [name, ...actionlog]) => {
    
  //get all base variables for the command
  
  var action = actionlog.join(' ');
  
  var namestring = ('**' + name + '**')
      
  if (!name) return message.channel.send('You must include your character\'s first name in your command. Please post a new command, as editing the previous will not resolve.');
  var user = message.author.id;
 
 async function resolve(){
       var [owner, res, acceptance] = await fn.getval(2, name, ['userid','res','accepted']);
       if (!owner) return message.channel.send(' doesn\'t exist in the database, please submit the character before attempting further actions.');
       if (owner != user)return message.channel.send('You can\'t use commands for someone else\'s character!');//check ownership
       if(message.channel.type !== "dm") return message.channel.send('You probably want to take that to DMs!');
     
   
   var mom = client.users.get('453297386119233557');
   var dad = client.users.get('133350100264157195');
   
   //command flow: /disobey Name attempted action
   var roll = Math.floor(Math.random()*10)+1;
   //get roll, add resolve for total
   var rolltotal = +roll + +res;
   //if total is less than 7, run random symptom pull
   var searchtotal = rolltotal.toString();
   //get message string
   var [rollstring, disobeystring] = await fn.getval(4, searchtotal, ['replace','disobey']);
    if (+rolltotal < 7) {
       var randomsearch = Math.floor(Math.random()*30);
       var randomsymptom = await fn.getproperty(4, randomsearch,'punishrand');
       disobeystring = (disobeystring + randomsymptom);
      if (acceptance === 'TRUE') {
        var randomsearchagain = Math.floor(Math.random()*30);
        var randomsymptomagain = await fn.getproperty(4, randomsearch, 'punishrand');
        disobeystring = (disobeystring + randomsymptomagain);
      };
   };
   var msg = (namestring + ' has attempted to disobey and ' + rollstring + disobeystring);
   message.channel.send(msg);//send message
   
   //if total is less than 5, message mom/dad
   if (+rolltotal < 5) {
     var disobeymsg = (namestring + ' has disobeyed! Such an unruly child. The attempt: ' + action + '; The Punishment: ' + randomsymptom );
     mom.send(disobeymsg);
     dad.send(disobeymsg);
   };
   if (+rolltotal <2) fn.doom(name);
 }
  resolve();
}