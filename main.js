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

//function for creating fate or twist deck
function createDeck(suits,values,center,descendant){
  var deck = {};
  deck.cards = new Array();
  deck.discard = new Array();
  if (arguments.length == 4) {
    //create defining cards
    definining_values = [1, 5, 9, 13];
    ascendant_values  = [4,8,12];
    center_values     = [3,7,11];
    descendant_values = [2, 6, 10];
    
    function add_twist_set(values, suit) {
      suit = findSuit(suit)
      values.forEach(value => {
        var card = { value: value, suit: suit}
        deck.cards.push(card);        
      });
    };

    add_twist_set(definining_values, suits);
    add_twist_set(ascendant_values, values);
    add_twist_set(center_values, center);
    add_twist_set(descendant_values, descendant);


  } else {
    for (var i = 0; i < suits.length; i++){
    for(var j = 0; j < values.length; j++){
      var card = {value: values[j], suit: suits[i]};
      deck.cards.push(card);
    }
  }
    
  }
  
  return deck;
}

//function for shuffling deck w/numberphile
function shuffle(deck) {

  for (var i = 0; i < 1000; i++){
    var randomLocation = Math.floor(Math.random() * deck.cards.length);
    var temp = deck.cards[0];    
    deck.cards[0] = deck.cards[randomLocation];
    deck.cards[randomLocation] = temp;
    
  }

}

//function for flipping cards
function flip(deck, numflips) {
  var flippedCards = []
  for (var i = 0; i < numflips; i++){
    if (deck.cards.length <= 0) {
      deck.cards = deck.discard;
      shuffle(deck);
    }
    var pulledCard = deck.cards.shift();
    flippedCards.unshift(pulledCard);
  }
  flippedCards.sort((a,b) =>{
    return a.value - b.value;
  });
  deck.discard = deck.discard.concat(flippedCards);
  return flippedCards;
}


fateDeck  = createDeck(defaultSuits, defaultValues);
twistDeck = createDeck("rams", "tomes", "crows", "masks");
