# wyrd-bot
a Discord bot used to simulate a fate deck and player twist decks for the Through the Breach RPG

# Getting Started
1. Install Node.js v12.3.0 or newer
2. Clone the repo

#C onfiguration
1. Create a `config.json` file and fill out the values (you can copy and paste the below as a template). The "fatemaster_id" is used to grant shuffle permission for the fate deck.
      ```JSON
      {
        "prefix"          :"!",
        "token"           :"",
        "suits"           : ["masks","rams","crows","tomes"],
        "values"          : [1,2,3,4,5,6,7,8,9,10,11,12,13],
        "definingValues"  : [1,5,9,13],
        "ascendantValues" : [4,8,12],
        "centerValues"    : [3,7,11],
        "descendantValues": [2,6,10],
        "fatemaster_id"   : "[Use your ID]"
        }
    ```


2. Run the bot using `Node .`

# Features & Commands
`!flip` flips a card from the fate deck. You can add a number after the flip for multiple. `!flip 2` will flip over 2 cards, for example. Wyrd Bot reshuffles the discard pile back into the deck when there are no more cards.

`!shuffle` shuffles the fate deck. This is limited to fatemasters.

`!create [Definine Suit] [Ascendant Suit] [Center Suit] [Descendant Suit]` creates a twist deck for the player using the suits. The command takes abbreviations, so `!create t c r m` will create a deck using Tomes,Crows,Rams, and Masks in that order.

`!show` will send the player a message with their current hand and discard pile. you can add `hand` or `discard` to the end to limit the message to one or the other.

`!cheat [card value]` will cheat the card with the value you chose. For example, `!cheat 4` will cheat the appropriate card with a value of 4, no matter the suit.

`!discard` will discard a card from your control hand.

`!draw` will draw a card from your twist deck into your contorl hand. `!draw 3` will draw 3 cards into your hand.

