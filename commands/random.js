exports.run = (client, message, args) => {
    var roll = Math.floor(Math.random() *1000);
    message.channel.send(`Random! ${message.author} rolls a **` +roll+`**.`)
   }