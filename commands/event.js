const async = require ('async');
const fn = require ('./../functions.js');
var efn = require ('./../effects.js');

exports.run = (client, message, [name, action, ...args]) => {
  
   
  if (!name) return message.channel.send('You must include the event\'s label in your command!');
  if (!action) return message.channel.send('You must include the event action you wish to undertake!');
  var announcementroom = client.channels.get('390953758944788482'); //the room where the event announcement will go when using /event label open; outside of testing this should be 503634158308818954
  var registrationroom; //this will be the room people are told to register in. It will be the bot room when the command goes live

  //Arguments: Event name, action, additional conditions
  //Event actions: open, start, advance, send, end


async function resolve(){
  
    if (action === 'open'){
                //action flow: take the event's label and pull all entered values. Place then in the database index sheet at the next open slot. Set the state to registration. Announce the event in the announcements channel, get the announcement ID and store it to db

                //run eventreadycheck, store as variable. If v < 0 return event is not ready, if v === none return the event couldn't be found
                var v = await fn.eventopencheck(name);
                if (v < 0) return message.channel.send('This event is not ready to be opened! If there are some fields that you don\'t yet have ready, fill the field in with TBD and update it prior to starting your event. Please note that an event will not let you begin if your starttime is listed as TBD!');
                //run eventsetup; pull title, starttime, gms, room, set, platform, and blurb
                var [state, label, title, starttime, gms, room, set, platform, blurb, meetup] = await fn.eventsetup(name);
                await fn.setval(7, 'open',['state', 'label', 'title', 'starttime', 'gms', 'room', 'set', 'platform', 'blurb', 'meetup'], [state, label, title, starttime, gms, room, set, platform, blurb, meetup]);
                var roomid = room.replace('[','').replace(']','');
                var rproom = client.channels.get(roomid);
                if (meetup === 'room') meetup = rproom;
                //pull friendly name of set
                var location = set;
                if (set != 'TBD')location = await fn.getproperty(8, set, 'friendlyname');
                //clear the new event from the creation table
                await fn.eventcreationclear(name);
                //build announcement message
                var announcement = ('**Event Name:** ' + title + '\n**GM(s):** ' + gms + '\n**Status:** Open for registration' + '\n**Discord Room:** ' + rproom + '\n**Platform:** ' + platform + '\n**IC Event Location:** ' + location + '\n**Meetup Location:** ' + meetup + '\n**Event Date:** ' + starttime + '\n**Registration Command:** ' + '`/register Name ' + name + '`' + '\n**Details:** ' + blurb + `\n\n<@&506871102610604034> This event is now open for registration! Use the above registration command in ` + registrationroom + '.');
                //send announcement to announcementroom and save the announcement message's ID 

                return announcementroom.send(announcement).then((newMessage) => {fn.setval(7, name, ['announcementid'],['[' + newMessage.id + ']']);});


    };
    if (action === 'start'){
                //action flow: get event's title, state, starttime, room, set, platform, blurb, npcs, startmsg, endmsg, and round messages; if any are empty, return an error that the field must be filled out (starttime cannot be TBD, roundmessages and npcs can be 'none'); set round and stage to 1, set event status to active, send start message, send new round message, check for round 1 message and send if it exists.
                var roundmsg;
                if (args[0]) roundmsg = args.join(' ');
                if (!args[0]) roundmsg = '';
                //run event start check, if v < 0 return event is not ready, if v === none return event couldn't be found
                var v = await fn.eventstartcheck(name);
                if (v === 'none') return message.channel.send('That event couldn\'t be located in the database. Do you have the name spelled correctly? You can check the event\'s label in the Creation Database.');
                if (v < 0) return message.channel.send('One or more fields required for event start is missing!');
                //pull title, set, startmsg, room, and registered
                var [title, set, startmsg, room, registered, npcs] = await fn.getval(7, name, ['title', 'set', 'startmsg', 'room', 'registered','npcs']);
                //cut brackets from room, set remaining string as room channel
                var roomstring = room.replace('[','').replace(']','');
                var roomchannel = client.channels.get(roomstring);
                //run room query, if more than one result is found return 'only one event in a room at a time'
                var p = await fn.roomquery(room);
                if (p === 1) return message.channel.send('Only one event may take place in a channel at a given time. An event is already ongoing in' + roomchannel +', please choose another one!');
                //set status to active, set registered as participants
                await fn.setval(7, name, ['state', 'round','stage'],['active', 1, 1]);
                //pull set's friendly name
                var location = await fn.getproperty(8, set, 'friendlyname');
                //create opening message
                var eventopenmsg = ('Welcome to the event ' + title + '!');
                //create round 1 start message array
                var setting = await fn.getproperty(8, set, 'description');
                var settingentry = ('You enter ' + location + ', ' + setting);
                var round1start = ('The event has now begun! All participants should now enter ' + location + 'by utilizing the command: /move Name ' + set + '\n\n\nRound 1 BEGIN!');
                var messagesarray = [eventopenmsg, startmsg, settingentry, roundmsg, round1start];
                  messagesarray = messagesarray.filter(message => message != '')
                  messagehandler(messagesarray, eventchannel);
                //add event label to each registered inevent key
                if (npcs != 'none')registered = (registered + npcs);
                var participants = registered.split(',');
                for (var u = 0; u < participants.length; u++){
                    var participant = participants[u];
                    if (participant === '') continue;
                    var ineventstring = await fn.getproperty(2, participant, 'inevent');
                    if (ineventstring === '0') ineventstring = '';
                    var newstring = (ineventstring + name + ',');
                    await fn.setval(2, participant, ['inevent'],[newstring]);
                };
                //run message send for message array
                messagehandler(messagesarray, roomchannel);
    };
    if (action === 'advance'){
                    //get event's current round, stage, participants, and roundmessages; increment round and stage by one. If stage = 4 reset it to 1, run hp resolve for all participants, set new round and stage; check for matching round message and send it into the channel; send new stage/round alert
                    var roundmsg;
                    if (args[0]) roundmsg = args.join(' ');
                    if (!args[0]) roundmsg = '';
                    //pull round, stage, registered, room, npcs, gms
                    var [round, stage, registered, room, npcs, gms, platform] = await fn.getval(7, name, ['round', 'stage', 'registered', 'room', 'npcs', 'gms', 'platform']);
                    //if 'round === none' return event doesn't exist
                    if (round === 'none') return message.channel.send('That event doesn\'t exist in the database! Please check your spelling or ensure the event has been started.');
                    //split brackets from room, set as channel id
                    var roomid = room.replace('[','').replace(']','');
                    var eventchannel = client.channels.get(roomid);
                    //add +1 to stage
                    var newstage = +stage + 1;
                    //if stage === 4, change newstage to 1 and add +1 to round
                    if (newstage === 4) newstage = 1;
                    if (newstage === 1) round = +round + 1;
                    //pull stage # message from table 4
                    var stagemsg = await fn.getproperty(4, newstage, 'stagemsg');
                    stagemsg = stagemsg.replace('#', round);
                      console.log(stagemsg);
                    var messagesarray = [roundmsg, stagemsg];
                    messagesarray = messagesarray.filter(message => message != '')
                    messagehandler(messagesarray, eventchannel);
                    //if new round, clear event cooldown from each registered
                    var participants = registered.split(',');
                    for (var ii = 0; ii < participants.length; ii++){
                        var participant = participants[ii];
                        if (participant === '') continue;
                        var cooldowns = await fn.getproperty(2, participant, 'eventcooldown');
                        var labelstring = (name + ',');
                        var replacestring = cooldowns.replace(labelstring, '');
                        fn.setval(2, participant, ['eventcooldown'],[replacestring]);
                    };
                    //send new stage message
                    //set newstage and newround
                    fn.setval(7, name, ['round', 'stage'],[round, newstage]);
                };
    if (action === 'send'){
                  //take args, join with space, format for room, send into room
                  var newmessage = [args.join(' ')];
                  //get room
                  var room = await fn.getproperty(7, name, 'room');
                  //if room is 'none' the event doesn't exist
                  if (room === 'none') return message.channel.send('Cannot find that event! Please try again!');
                  var roomid = room.replace('[','').replace(']','');
                  var eventchannel = client.channels.get(roomid);
                  //remove brackets from room, set as channel id
                  //join args together
                  //add ``` and args and ``` together for message
                  //send message to roomid
                  messagehandler(newmessage, eventchannel);
                };
    if (action === 'end'){
                  //get event's end message, send into channel, copy event data and enter into historical sheet, set all fields in core database to blank and set label to open.

                  // pull endmsg, room
                  //pull key names: title, gms, set, registered, startmsg, roundmessages, endmsg
                  //set all row values to '', set label to 'open'
                  //log historical data in creation database
                  //create ending message
                  //send ending message
                };
    if (action === 'change'){
      //must include key of field to modify and the value to modify it to. Change changes the value in that field completely. 
      //args 0 is key, args 1 is value
      var key = args[0];
      var start = 1;
      var end = args.length;
      var value = args.slice(start, end).join(' ');
      if (key === 'state' || key === 'registered' || key === 'participants' || key === 'npcs' || key === 'round' || key === 'stage') return message.channel.send('That value cannot be manually modified, and can only be edited by other event commands. Please use the appropriate command to modify that field. For adding NPCs, use /event Label add npcs name1 name2 name3 ...etc. Round, stage, registered and participants are each managed by the bot.');    
  
      fn.setval(7, name, [key],[value]);
      message.channel.send('The value of ' + key + ' has been successfully changed to: [' + value + '].');
      
      if (key === 'blurb' || key === 'title' ||  key === 'starttime' || key === 'room' || key === 'set' || key === 'gms' || key === 'meetup' || key === 'platform'){
        var [state, label, title, starttime, gms, room, set, platform, blurb, meetup, announcementid] = await fn.getval(7, name, ['state', 'label', 'title', 'starttime', 'gms', 'room', 'set', 'platform', 'blurb', 'meetup', 'announcementid']);
        var messageid = announcementid.replace('[','').replace(']','');
        var roomid = room.replace('[','').replace(']','');
        var rproom = client.channels.get(roomid);
        var gmsplitstring = gms.split(',');
        var indexval = gmsplitstring.length - 1;
        var joindelimit = ', ';
        if (gmsplitstring.length === 2) joindelimit = ' ';
        gmsplitstring[indexval] = 'and ' + gmsplitstring[indexval];
        gms = gmsplitstring.join(joindelimit);
        if (meetup === 'room') meetup = rproom;
        var location = set;
        if (set != 'TBD') location = await fn.getproperty(8, set, 'friendlyname');
        var newannouncement = ('**Event Name:** ' + title + '\n**GM(s):** ' + gms + '\n**Status:** Open for registration' + '\n**Discord Room:** ' + rproom + '\n**Platform:** ' + platform + '\n**IC Event Location:** ' + location + '\n**Meetup Location:** ' + meetup + '\n**Event Date:** ' + starttime + '\n**Registration Command:** ' + '`/register Name ' + name + '`' + '\n**Details:** ' + blurb + `\n\n<@&506871102610604034> This event is now open for registration! Use the above registration command in ` + registrationroom + '.');
        announcementroom.fetchMessage(messageid)
  .then(message => message.edit(newannouncement));
      };
      //run setval with index as 7, searchval as event label, key as key and value as value
      //return message 'modification complete!'
    };
    if (action === 'add'){
      //must include key of field to add to and the value to add to it. Add appends the new value to the end of the existing string.
      var key = args[0];
        var start = 1;
        var end = args.length;
        var value = args.slice(start, end).join(' ');
        var state = await fn.getproperty(7, name, 'state');
    
        if (key != 'gms' && key != 'npcs') return message.channel.send('Only GMs and NPCs can be added to using that command.');
    
        var existing = await fn.getproperty(7, name, key);
        if (existing === 'TBD') existing = '';
        if (existing != 'TBD'){
          var endchar = existing.charAt(existing.length - 1);
          if (endchar != ',') existing = (existing + ',');
        };
        var newval = (existing + value);
        await fn.setval(7, name, [key],[newval]);
        message.channel.send('Value added to ' + key + ' field.');

              if (key === 'gms'){
                      var state = await fn.getproperty(7, name, 'state');
                      if (state === 'active') return;
                      var [label, title, starttime, room, set, platform, blurb, meetup, announcementid, gms] = await fn.getval(7, name, ['label', 'title', 'starttime', 'room', 'set', 'platform', 'blurb', 'meetup', 'announcementid', 'gms']);
                      var messageid = announcementid.replace('[','').replace(']','');
                      var roomid = room.replace('[','').replace(']','');
                      var rproom = client.channels.get(roomid);
                      var gmsplitstring = newval.split(',');
                      var indexval = gmsplitstring.length - 1;
                      var joindelimit = ', ';
                      if (gmsplitstring.length === 2) joindelimit = ' ';
                      gmsplitstring[indexval] = 'and ' + gmsplitstring[indexval];
                      gms = gmsplitstring.join(joindelimit);
                      if (meetup === 'room') meetup = rproom;
                      var location = set;
                      if (set != 'TBD') location = await fn.getproperty(8, set, 'friendlyname');
                      var newannouncement = ('**Event Name:** ' + title + '\n**GM(s):** ' + gms + '\n**Status:** Open for registration' + '\n**Discord Room:** ' + rproom + '\n**Platform:** ' + platform + '\n**IC Event Location:** ' + location + '\n**Meetup Location:** ' + meetup + '\n**Event Date:** ' + starttime + '\n**Registration Command:** ' + '`/register Name ' + name + '`' + '\n**Details:** ' + blurb + `\n\n<@&506871102610604034> This event is now open for registration! Use the above registration command in ` + registrationroom + '.');
                      announcementroom.fetchMessage(messageid)
                .then(message => message.edit(newannouncement));
                    };
                  console.log('Addition complete.');
                    //get the value of the existing key as a property
                    //add new value to the end of the existing string
                    //set new string to key
                    //send message 'added to event'
    };

    if (action === 'npcs'){
        
    };
    if (action != 'open' && action != 'start' && action != 'advance' && action != 'send' && action != 'end' && action != 'change' && action != 'add' && action != 'npcs'){
        message.channel.send('That event action is not registered. Supported actions are: open, start, advance, add, change, send, or end.')

    };
}
async function messagehandler (a, b){
  var msgarray = a;
  var chnlid = b;
  var timeoutstack = []
  function doSetTimeout(i) {
  setTimeout(function() { chnlid.send('```' + msgarray[i] + '```'); }, timeoutstack[i]);
  }
  for (var i = 0; i < msgarray.length; i++){
   timeoutstack[i] = 10000 * i;
   doSetTimeout(i);
  }}

  resolve();
  
}
