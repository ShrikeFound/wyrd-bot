module.exports = {
  test: function test() {
    console.log("hello from twist_functions.js")
  },
  cheatCard: function cheatCard(deck, value) {
  cheated_card = deck.filter((card) => card.value == value);
  remaining_deck = deck.filter((card) => card.value != value);
  if (cheated_card.length <= 0) {
    return false;
  }
  return {
    cheated_card,
    remaining_deck,
  };
  },
  draw: function draw(deck, numflips) {
  var drawnCards = [];
  for (var i = 0; i < numflips; i++) {
    if (deck.deck.length <= 0) {
      deck.deck = deck.discard;
      shuffle(deck);
    }
    var drawnCard = deck.cards.shift();
    drawnCards.unshift(drawnCard);
  }

  drawnCards.sort((a, b) => {
    return a.value - b.value;
  });

  deck.discard = deck.discard.concat(drawnCards);
  return flippedCards;
  },
  shuffle: function shuffle(deck) {
  for (var i = 0; i < 1000; i++) {
    var randomLocation = Math.floor(Math.random() * deck.cards.length);
    var temp = deck.cards[0];
    deck.cards[0] = deck.cards[randomLocation];
    deck.cards[randomLocation] = temp;
  }
  },
  findSuit: function findSuit(string) {
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
      suit = "unknown";
      break;
  }
  return suit;
  },
  flip: function flip(deck, numflips, sorted) {
  var flippedCards = [];
  for (var i = 0; i < numflips; i++) {
    if (deck.cards.length <= 0) {
      deck.cards = deck.discard;
      shuffle(deck);
    }
    var pulledCard = deck.cards.shift();
    flippedCards.unshift(pulledCard);
  }
  if (sorted == "unsorted") {
  } else {
    flippedCards.sort((a, b) => {
      return a.value - b.value;
    });
  }
  deck.discard = deck.discard.concat(flippedCards);
  return flippedCards;
  },
  createDeck: function createDeck(suits, values, center, descendant) {
  var deck = {};
  deck.cards = new Array();
  deck.discard = new Array();
  deck.hand = new Array();
  if (arguments.length == 4) {
    //create defining cards
    definining_values = [1, 5, 9, 13];
    ascendant_values = [4, 8, 12];
    center_values = [3, 7, 11];
    descendant_values = [2, 6, 10];

    function add_twist_set(values, suit) {
      suit = findSuit(suit);
      values.forEach((value) => {
        var card = { value: value, suit: suit };
        deck.cards.push(card);
      });
    }

    add_twist_set(definining_values, suits);
    add_twist_set(ascendant_values, values);
    add_twist_set(center_values, center);
    add_twist_set(descendant_values, descendant);
  } else {
    for (var i = 0; i < suits.length; i++) {
      for (var j = 0; j < values.length; j++) {
        var card = { value: values[j], suit: suits[i] };
        deck.cards.push(card);
      }
    }
  }

  return deck;
}













}