const async = require ('async');
const fn = require ('./../functions.js');
var efn = require ('./../effects.js');

exports.run = (client, message, [targetname, ...msgvals]) => {
  
var msg = msgvals.join(' ');
  //Arguments: Name, Object

async function resolve(){
    //types - user, channel
  var index = await fn.indexpull(targetname);
  if (index === 'none') return message.channel.send(targetname + ' doesn\'t exist in the database. Check your spelling');
  var id = await fn.getproperty(index, targetname, 'userid');
  var target = client.channels.get(id);
  if (index === '2') target = client.users.get(id);
  msg = ('```' + msg + '```');
  target.send(msg);

}
  
  resolve();
}