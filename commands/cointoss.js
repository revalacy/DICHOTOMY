exports.run = (client, message, args) => {

    var flip = Math.floor(Math.random() *10)+1;
         if(flip>5){
           message.channel.send(`${message.author} flipped a coin! It came up **tails**.`)
         }
         if(flip<6){
           message.channel.send(`${message.author} flipped a coin! It came up **heads**.`)
         }
    }