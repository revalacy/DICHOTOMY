exports.run = (client, message, args) => {
 var roll = Math.floor(Math.random() *10)+1;
 message.channel.send(`${message.author} rolled a **` +roll+`**.`)
}