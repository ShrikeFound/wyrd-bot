module.exports = {
  name: 'flip',
  description: "this should flip some cards",
  execute(message,args){
    var numFlips = Math.abs(parseInt(args.shift(),10));
    if (!numFlips > 0) numFlips = 1;
    
    var cards = [];
    for (var i = 0; i < numFlips; i++) {
      var card = deck.shift();
      cards.push(card);
      if(deck.length <= 0){
        bot.commands.get('shuffle').execute(message,args);
      }
    }

    cards.sort((a,b) =>{
      return a.value - b.value;
    });

    function renderCard(card){
      description = `${card.value} of ${card.suit} `; 
      return description
    }

    message.channel.send("cards flipped: "+ cards.map(renderCard));

    cards.forEach(card =>{
      discard.push(card);
    });
    console.log(discard.length);
    console.log(deck.length);
  }
}