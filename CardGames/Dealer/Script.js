// Card Dealer - Script.js - Javascript - February 4, 2011

var suits = new Array(4)

suits[0] = "Clubs"
suits[1] = "Diamonds"
suits[2] = "Hearts"
suits[3] = "Spades"

var cardFaces = new Array(13)

cardFaces[0] = "Ace"
cardFaces[1] = "2"
cardFaces[2] = "3"
cardFaces[3] = "4"
cardFaces[4] = "5"
cardFaces[5] = "6"
cardFaces[6] = "7"
cardFaces[7] = "8"
cardFaces[8] = "9"
cardFaces[9] = "10"
cardFaces[10] = "Jack"
cardFaces[11] = "Queen"
cardFaces[12] = "King"

// **** Class Card ****

function Card(index) {
    this.face = cardFaces[index % 13]
    this.suit = suits[parseInt(index / 13, 10)]     // The / operator yields a float, so we need to use parseInt() to convert the quotient to an int.
    this.value = Math.min((index % 13) + 1, 10)

    this.toString = function() {
        //return this.face + " of " + this.suit
        return this.face + " of " + this.suit + " (" + this.value + ")"
    } 
}

// **** Class Deck ****

function Deck() {
    this.cards = constructDeck()
    this.topIndex = 0

    this.shuffle = shuffleDeck

    this.dealCard = function() {
        return this.cards[this.topIndex++]
    }

    this.isDeckEmpty = function() {
        return this.topIndex >= this.cards.length
    }
}

function constructDeck() {
    var tempCardArray = new Array(52)

    for (var i = 0; i < 52; i++) {
        tempCardArray[i] = new Card(i)
    }

    return tempCardArray
}

function shuffleDeck() {

    for (var i = 0; i < 51; i++) {
        j = parseInt(Math.random() * (52 - i), 10) + i      // 0 <= i <= j < 52

        var temp = this.cards[i]

        this.cards[i] = this.cards[j]
        this.cards[j] = temp
    }

    this.topIndex = 0
}

// **** Event Handlers ****

function dealCards() {
    var deck = new Deck()

    deck.shuffle()

    var card = deck.dealCard()
    //var atbCards = document.getElementsByName("txtCard")
    var tbCard = document.getElementById("txtCard1")

    tbCard.value = card.toString()
}

// **** End of File ****