exports.run = (client, message) => {
    var roll = Math.floor(Math.random() *10)+1;
    message.channel.send(`${message.author} rolled a **` +roll+`**.`)
   }