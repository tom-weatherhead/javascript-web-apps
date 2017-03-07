// Javascript/CardGames/SharedCode/DeckOfCards.js - March 3, 2011

var suits = new Array(4);

suits[0] = "Clubs";
suits[1] = "Diamonds";
suits[2] = "Hearts";
suits[3] = "Spades";

var cardFaces = new Array(13);

cardFaces[0] = "Ace";
cardFaces[1] = "2";
cardFaces[2] = "3";
cardFaces[3] = "4";
cardFaces[4] = "5";
cardFaces[5] = "6";
cardFaces[6] = "7";
cardFaces[7] = "8";
cardFaces[8] = "9";
cardFaces[9] = "10";
cardFaces[10] = "Jack";
cardFaces[11] = "Queen";
cardFaces[12] = "King";

// **** Class Card ****

function Card(index) {
    // ? Should we make all of these data members except faceNumber and suitNumber into (static?) functions?
    this.faceNumber = index % 13;
    this.face = cardFaces[this.faceNumber];
    this.suitNumber = parseInt(index / 13, 10);       // The / operator yields a float, so we need to use parseInt() to convert the quotient to an int.
    this.suit = suits[this.suitNumber];
    this.value = Math.min(this.faceNumber + 1, 10);

    this.isRed = function () {
        return this.suit == "Diamonds" || this.suit == "Hearts";
    };

    this.isAce = function () {
        return this.faceNumber == 0;
    };

    this.isFaceCard = function () {
        return this.faceNumber >= 10;
    };

    // toString() : Colour the string with #7F0000 if isRed, with #000000 otherwise.

    this.toString = function () {
        return this.face + " of " + this.suit;
        //return this.face + " of " + this.suit + " (" + this.value + ")"
    };
}

// **** Class Deck ****

function Deck() {
    this.cards = constructDeck();
    this.topIndex = 0;

    this.shuffle = shuffleDeck;

    this.dealCard = function () {
        return this.cards[this.topIndex++];
    };

    this.isDeckEmpty = function () {
        return this.topIndex >= this.cards.length;
    };
}

function constructDeck() {
    var tempCardArray = new Array(52);

    for (var i = 0; i < 52; i++) {
        tempCardArray[i] = new Card(i);
    }

    return tempCardArray;
}

function shuffleDeck() {

    for (var i = 0; i < 51; i++) {
        j = parseInt(Math.random() * (52 - i), 10) + i;       // 0 <= i <= j < 52

        var temp = this.cards[i];

        this.cards[i] = this.cards[j];
        this.cards[j] = temp;
    }

    this.topIndex = 0;
}

// **** End of File ****