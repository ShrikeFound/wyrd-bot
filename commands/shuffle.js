module.exports = {
  name: 'shuffle',
  description: "this should flip some cards",
  execute(message,args){
    
    while(discard.length > 0){
      var card = discard.shift()
      deck.push(card);
    }

    for(var i = 0; i < 10000; i++){
      var location1 = Math.floor(Math.random()*deck.length);
      var location2 = Math.floor(Math.random()*deck.length);
      
      var placeHolder = deck[location1];
      deck[location1] = deck[location2];
      deck[location2] = placeHolder;

    }
    message.channel.send("deck shuffled!")
  }
}