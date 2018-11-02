const async = require ('async');
const GoogleSpreadsheet = require('google-spreadsheet');
    const creds = require('./../client_secret.json');
    const doc = new GoogleSpreadsheet('1kxcMdb0Gsyg9Oe3NbWMXx1vHopFjqLzneXehoURAN6M');//Character database
    const eventdoc = new GoogleSpreadsheet('1fuXzJ1_rvlHIFRRwTZXfnDrxzyn2yrvukXe0Th_i8-8');//events database
    doc.useServiceAccountAuth(creds, function (err) {
    if (err)
    console.log(err)});
    eventdoc.useServiceAccountAuth(creds, function (err) {
    if (err)
    console.log(err)});

const fn = require ('./../functions.js');
var efn = require ('./../effects.js');

exports.run = (client, message, [name, eventindex]) => {
  

  async function resolve() {
    var indexstring = eventindex.toString();
    var room = await fn.eventgetval(eventindex,['room']);
   var [registration, state, title] = await fn.eventgetval(eventindex, ['registered','state','title']); //pull event's registration and state
    if (state === 'inactive' || !state) return message.channel.send('That event is not currently available for reistration, please rach out to a GM if you are having trouble registering.');//if state is inactive or event doesn't exist, return 'that event isn't available for registration, please check with a GM if you are having trouble registering.
    var n = registration.indexOf(name);//get registration index of name. If it exists, return 'you're already registered for this event'
    if (n != -1) return message.channel.send(name + ' is already registered for this event!');
    var newregistration = (registration + name + ',');//add name to registration
    await fn.eventsetval(eventindex, ['registered'],[newregistration]);
    if (state === 'active')await fn.eventmodifyvalue(room, ['registered'],[newregistration]);
    message.channel.send('You have successfully registered ' + name + ' for the event ' + title + '. Details of the Discord room and in-game location may be updated periodically so please check back!');//return message 'you have successfully registered for the event name, you will be sent details of the room or game location when the event is ready to begin'
    
  }
  
    
  
  resolve();
  
}

