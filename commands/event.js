const async = require ('async');
const fn = require ('./../functions.js');
var efn = require ('./../effects.js');

exports.run = (client, message, [name, action, ...args]) => {
  
   
  if (!name) return message.channel.send('You must include the event\'s label in your command!');
  if (!action) return message.channel.send('You must include the event action you wish to undertake!');
  var announcementroom; //the room where the event announcement will go when using /event label open
  

  //Arguments: Event name, action, additional conditions
  //Event actions: open, start, advance, send, end


async function resolve(){
  
    if (action === 'open'){
      //action flow: take the event's label and pull all entered values. Place then in the database index sheet at the next open slot. Set the state to registration. Announce the event in the announcements channel, get the announcement ID and store it to db

      //run eventreadycheck, store as variable. If v < 0 return event is not ready, if v === none return the event couldn't be found
      //run eventsetup
      //on core db set state to registration
      //pull title, starttime, gms, room, set, platform, and blurb
      //pull friendly name of set
      //clear the new event from the creation table
      //build announcement message
      //send announcement to announcementroom

    };
    if (action === 'start'){
      //action flow: get event's title, state, starttime, room, set, platform, blurb, npcs, startmsg, endmsg, and round messages; if any are empty, return an error that the field must be filled out (starttime cannot be TBD, roundmessages and npcs can be 'none'); set round and stage to 1, set event status to active, send start message, send new round message, check for round 1 message and send if it exists.

      //run event start check, if v < 0 return event is not ready, if v === nome return event couldn't be found
      //pull title, set, startmsg, room, and registered
      //run room query, if more than one result is found return 'only one event in a room at a time'
      //set status to active
      //cut brackets from room, set remaining string as room channel
      //pull set's friendly name
      //create opening message
      //create round 1 start message
      //send opening message
      //add event label to each registered inevent key
      //set registered as participants
      //return send round start

    };
    if (action === 'advance'){
      //get event's current round, stage, participants, and roundmessages; increment round and stage by one. If stage = 4 reset it to 1, run hp resolve for all participants, set new round and stage; check for matching round message and send it into the channel; send new stage/round alert

      //pull round, stage, registered, roundmessages, room, npcs, gms
      //if 'round === none' return event doesn't exist
      //split brackets from room, set as channel id
      //add +1 to stage
      //if stage === 4, change newstage to 1 and add +1 to round
      //pull stage # message from table 4
      //check roundmessages for an existing message for the round. If none exists, move on
      //if new round, send round message and clear event cooldown from each registered
      //send new stage message
      //set newstage and newround
      //if stage === 2 get gm's id, send formatted list of NPCs that need to act and list of actions they can take, as well as formatting for the string arguments
    };
    if (action === 'send'){
      //take args, join with space, format for room, send into room

      //get room
      //if room is 'none' the event doesn't exist
      //remove brackets from room, set as channel id
      //join args together
      //add ``` and args and ``` together for message
      //send message to roomid
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
    if (action === 'modify'){
      //must include key of field to modify and the value to modify it to. Modify changes the value in that field completely. 
        
      //args 0 is key, args 1 is value
      //run setval with index as 7, searchval as event label, key as key and value as value
      //return message 'modification complete!'
    };
    if (action === 'add'){
      //must include key of field to add to and the value to add to it. Add appends the new value to the end of the existing string.

      //get the value of the existing key as a property
      //add new value to the end of the existing string
      //set new string to key
      //send message 'added to event'
    };
    if (action === 'npcs'){
      //acts for the specified NPCs. Allows for attack, defense, cover. Command flow: /event label npcs actions targetnames; actions, npcnames and targetnames must have no spaces and must be separated by only a comma, if there is no target for that NPC in line use 'none'; split npcnames and target names, for each in the index run the specified command, resolve all damage

      //
    };
    if (action != 'open' && action != 'start' && action != 'advance' && action != 'send' && action != 'end' && action != 'modify' && action != 'npcs'){
        message.channel.send('That event action is not registered. Supported actions are: open, start, advance, send, or end.')

    };
}
  

  resolve();
  
}