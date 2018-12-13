var fn = require ('./../functions.js');

//Command flow: /roll Name stat (optional)bonus
exports.run = (client, message, [name]) => {
    
  //get all base variables for the command
    var user = message.author.id;//gets user ID for command author
    var dateObj = new Date();
          var month = dateObj.getUTCMonth() + 1; //months from 1-12
          var day = dateObj.getUTCDate();
          var year = dateObj.getUTCFullYear();

          let newdate = month + "/" + day + "/" + year;
  var namestring = ('**'+name+'** ');

  
  if (!name) return message.channel.send('You must include your character\'s first name in your command. Please post a new command, as editing the previous will not resolve.');
  
 
 async function resolve(){
   var [owner, will] = await fn.getval(2, name, ['userid', 'wp']); //pull owner's id
   if (owner === "error") return message.channel.send('That character doesn\'t exist in the database, please submit the character before attempting further actions.');
   if (owner != user) return message.channel.send('You can\'t use commands for someone else\'s character!');//if id's match, execute codeblock
   var newwp = +will - 1;
   await fn.setval(2, name, ['wp'],[newwp]);
   var msg = (namestring+'has chosen to spend 1 point of Willpower to reverse a failed roll!');
   message.channel.send(msg);
 }
  
  resolve();
}