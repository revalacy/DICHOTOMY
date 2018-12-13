const async = require ('async');
const fn = require ('./../functions.js');
var efn = require ('./../effects.js');

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
    if (+rolltotal < 7) {
       var randomsearch = Math.floor(Math.random()*30);
       var randomsymptom = await fn.getproperty(4, randomsearch,'punishrand');
      if (acceptance === 'TRUE') {
        var randomsearchagain = Math.floor(Math.random()*30);
        var randomsymptomagain = await fn.getproperty(4, randomsearchagain, 'punishrand');
        randomsymptom = (randomsymptomagain + "** and **" + randomsymptom);
      };
      if (rolltotal === '1') {
        var randomthirdsearch = Math.floor(Math.random()*30);
        var randomsymptomthree = await fn.getproperty(4, randomthirdsearch, 'punishrand');
        randomsymptom = (randomsymptomthree + ', ' + randomsymptom);
        randomsymptom = randomsymptom.replace(randomsymptomagain, randomsymptomagain + ',');
      };
   };
   var msg = await fn.getproperty(4, searchtotal, 'disobey');
   msg = msg.replace('#', name).replace('#', randomsymptom)
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