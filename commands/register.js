const async = require ('async');
const fn = require ('./../functions.js');
var efn = require ('./../effects.js');

exports.run = (client, message, [name, eventlabel, ...npcs]) => {
  

  async function resolve() {
    var [registration, state, title, room, npclist] = await fn.getval(7, eventlabel, ['registered','state','title', 'room', 'npcs']); //pull event's registration and state
    if (registration === 'none') return message.channel.send('That event is not currently available for reistration, please rach out to a GM if you are having trouble registering.');//if state is inactive or event doesn't exist, return 'that event isn't available for registration, please check with a GM if you are having trouble registering.
    if (name === 'npc'|| name === 'NPC') {
      if(!message.member.roles.find(x => x.name === "GM")) return message.channel.send('You must be a GM to use that command. Please contact an admin if you believe this message was sent in error.');
        newnpcs = npcs.join(',');
        var newnpcs = (npclist + newnpcs + ',');
        fn.setval(7, eventlabel,['tointroduce'],[newnpcs]);
        return message.channel.send('NPC(s) added to event pending introduction.');
    };
    if (name === 'Name' || name === 'name') return message.channel.send('You need to use your actual character\'s name, not the word \'Name\'. Try again.');
    
    if (npcs[0] === 'remove'){
      var r = registration.indexOf(name);
      var namestring = name + ',';
      var removalstring = registration.replace(namestring, '');
      if (r === -1) return message.channel.send('That character is not registered for this event.');
      if (r != -1) fn.setval(7, eventlabel, ['registered'], [removalstring]);
      var neweventstring = await fn.getproperty(2, name, 'inevent');
      var replacestring = neweventstring.replace((eventlabel+','),'');
      if (replacestring === '') replacestring = 0;
      if (state === 'active') fn.setval(2, name, ['inevent'], [replacestring]);
      return message.channel.send(name + ' has been unregistered from ' + title);
    };
    var n = registration.indexOf(name);//get registration index of name. If it exists, return 'you're already registered for this event'
    if (n != -1) return message.channel.send(name + ' is already registered for this event!');
    var newregistration = (registration + name + ',');//add name to registration
    await fn.setval(7, eventlabel, ['registered'],[newregistration]);
    message.channel.send('You have successfully registered ' + name + ' for the event ' + title + '. Details of the Discord room and in-game location (if applicable) may be updated periodically so please check back!');//return message 'you have successfully registered for the event name, you will be sent details of the room or game location when the event is ready to begin'
    
    if (state === 'active'){
      var [eventstring, actionpoints] = await fn.getval(2, name, ['inevent', 'actionpoints']);
      if (eventstring === '0') eventstring = '';
      var newstring = (eventstring + eventlabel + ',');
      var pointsstring = (eventlabel + ';' + 10 + '|');
      var newactionpoints = (actionpoints + pointsstring);
      fn.setval(2, name, ['inevent', 'actionpoints'], [newstring, newactionpoints]);
    };
  }
  
    
  
  resolve();
  
}

