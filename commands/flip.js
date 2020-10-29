module.exports = {
  name: 'flip',
  description: 'command for flipping x number of cards from the fate deck',
  execute(message, args) {
    message.channel.send('flipping!');
    if (args.length != 0) {
      if (args[0][0] == "-") {
      message.channel.send("Negative Flip: "+args[0].slice(1));                    
      } else if (args[0][0] == "+") {
      message.channel.send("Positive Flip: "+args.slice(1));           
      } else {
        message.channel.send("Positive Flip: "+args);           
      }
   
    } else {
      message.channel.send("(" + 1 + ")");
      test();
    }
  }
}