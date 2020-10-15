//A TtB bot needs:
//character sheets
//Fate Deck
//Twist Deck

//Fate deck needs:
//basic deck commands: shuffle, draw(1-4), reshuffle

const defaultSuits  = ["masks","rams","crows","tomes"]
const defaultValues = [1,2,3,4,5,6,7,8,9,10,11,12,13]

function findSuit(string) {
  char = string.charAt(0).toLowerCase();
  suit = "";
  switch (char) {
    case "m":
      suit = "masks";
      break;
    case "r":
      suit = "rams";
      break;
    case "c":
      suit = "crows";
      break;
    case "t":
      suit = "tomes";
      break;
    default:
      suit = "unknown"
      break;
  }
    return suit
}

function initializeDeck(suits,values){
  var deck = new Array();
  if (arguments.length == 4) {
    
  }
  
  for (var i = 0; i < suits.length; i++){
    for(var j = 0; j < values.length; j++){
      var card = {value: values[j], suit: suits[i]};
      deck.push(card);
    }
  }
  console.log(deck.length);
  return deck;
}

fateDeck = initializeDeck(defaultSuits, defaultValues);
console.log(fateDeck)