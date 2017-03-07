// Blackjack/Script.js - March 3, 2011

// Game rules:
// - The dealer stands when his hand's value is higher than 17.
//   If the dealer's hand is a "soft" 17, there is a 50% chance that the dealer will stand.
//   See http://en.wikipedia.org/wiki/Blackjack .

// **** Global Variables ****

var maxNumCardsPerPlayer = 11;    // Four Aces + four 2s + three 3s == value of 21.

var playerTextBoxName = "playerTextBoxes";
var dealerTextBoxName = "dealerTextBoxes";
var playerHandValueID = "playerHandValueID";
var dealerHandValueID = "dealerHandValueID";
var gameMessageID = "gameMessageID";
var winsLossesTiesID = "winsLossesTies";

var deck = new Deck();

// Note: These variables are also reset in newGame().
var playerHand = [];
var dealerHand = [];
var playerHandValue = 0;
var dealerHandValue = 0;
var playerStands = false;
var dealerStands = false;
var gameOver = false;

var playerWins = 0;
var dealerWins = 0;
var tieGames = 0;

var htmlTwoSpaces = "&nbsp; ";

// **** jQuery Function Declarations ****

$(document).ready(function () {
    generatePageFooter(true, false);    // The player's CSS box doesn't resize in rekonq.
    onPageLoad();
});

// **** Functions ****

function createPlayerTable(tableID, textBoxName) {

    for (var row = 0; row < maxNumCardsPerPlayer; row++) {
        $("<tr><td><input type='text' name='" + textBoxName + "' id='" + textBoxName + row + "' size='20' value='' /></td></tr>").appendTo("#" + tableID);
    }
}

function setGameMessage(gameMessage) {
    $("#" + gameMessageID).html(gameMessage);
}

function setWinsLossesTiesMessage() {
    $("#" + winsLossesTiesID).html("Player wins: " + playerWins + "; Dealer wins: " + dealerWins + "; Tie games: " + tieGames);
}

function calculateHandValue(hand, handValueID) {
    var handValue = 0;
    var aceDetected = false;

    for (var i = 0; i < hand.length; i++) {
        var card = hand[i];
        handValue += card.value;

        if (card.isAce()) {
            aceDetected = true;
        }
    }

    if (handValue <= 11 && aceDetected) {
        // This hand is a "soft" hand
        handValue += 10;
    }

    $("#" + handValueID).html(handValue);
    return handValue;
}

function dealerHasSoft17() {
    var handValue = 0;
    var aceDetected = false;

    for (var i = 0; i < dealerHand.length; i++) {
        var card = dealerHand[i];
        handValue += card.value;

        if (card.isAce()) {
            aceDetected = true;
        }
    }

    return handValue == 7 && aceDetected;
}

function isBlackjack(hand, handValue) {

    if (hand.length != 2 || handValue != 21) {
        return false;
    }

    var i = (hand[0].value == 10) ? 0 : 1;

    return (!hand[i].isRed() && hand[i].faceNumber == 10);    // I.e. hand[i] is a black jack
}

function calculateHandValues() {
    playerHandValue = calculateHandValue(playerHand, playerHandValueID);
    dealerHandValue = calculateHandValue(dealerHand, dealerHandValueID);
    // Now determine if there is a winner or a loser.

    var blackjackMessage = "";
    var gameMessage = null;

    if (isBlackjack(playerHand, playerHandValue)) {
        blackjackMessage = "Blackjack!" + htmlTwoSpaces;
    } else if (isBlackjack(dealerHand, dealerHandValue)) {
        blackjackMessage = "Blackjack." + htmlTwoSpaces;
    }

    if (dealerHandValue > 21) {
        gameMessage = blackjackMessage + "The dealer busts." + htmlTwoSpaces + "You win!";
        playerWins++;
    } else if (playerHandValue > 21) {
        gameMessage = blackjackMessage + "You bust." + htmlTwoSpaces + "The dealer wins.";
        dealerWins++;
    }

    if (gameMessage != null) {
        setGameMessage(gameMessage);
        setWinsLossesTiesMessage();
        gameOver = true;
    }
}

function dealCardToPlayer(hand, textBoxName) {
    var card = deck.dealCard();

    // Set the text box's value to the card's toString() value, and colour the text box red or black
    $("[name='" + textBoxName + "']").eq(hand.length).val(card.toString()).css("color", card.isRed() ? "red" : "black");

    hand.push(card);
    calculateHandValues();
}

function dealCardToDealer() {

    if (dealerHandValue > playerHandValue && playerStands) {
        dealerStands = true;
    }

    if (dealerStands) {
        return;
    }

    dealCardToPlayer(dealerHand, dealerTextBoxName);

    // The code below may stand even if the player has not stood yet, in order to try to prevent a dealer bust.
    // But, in such a case, if the dealer stands, the player may still win or tie the game.

    if (dealerHandValue < playerHandValue) {
        // Do not stand if we are losing.
    } else if (dealerHasSoft17()) {
    
        if (Math.random() >= 0.5) {
            dealerStands = true;
        } // else the dealer does not stand.
    } else if (dealerHandValue >= 17) { // Includes "hard" 17s.
        dealerStands = true;
    }
}

function initializeTextBoxes() {
    $(":text").each(function () {
        $(this).val("").css("color", "black");
    });
}

// **** Event Handlers ****

function hitMe() {

    if (gameOver) {
        return;
    }

    dealCardToPlayer(playerHand, playerTextBoxName);

    if (gameOver) {
        return;
    }

    dealCardToDealer();

    if (playerHandValue == 21 || (dealerStands && playerHandValue > dealerHandValue)) {
        stand();
    }
}

function stand() {

    if (gameOver || playerStands) {
        return;
    }

    playerStands = true;

    // Allow the dealer to finish playing.

    while (!dealerStands && !gameOver) {
        dealCardToDealer();
    }

    var gameMessage = "";

    if (gameOver) {
        // Do nothing; the game message has already been displayed elsewhere.
        return;
    }

    if (isBlackjack(playerHand, playerHandValue)) {
        gameMessage = "Blackjack!" + htmlTwoSpaces;
    } else if (isBlackjack(dealerHand, dealerHandValue)) {
        gameMessage = "Blackjack." + htmlTwoSpaces;
    }

    if (playerHandValue > dealerHandValue) {
        gameMessage = gameMessage + "You win!";
        playerWins++;
    } else if (playerHandValue < dealerHandValue) {
        gameMessage = gameMessage + "The dealer wins.";
        dealerWins++;
    } else {
        gameMessage = gameMessage + "Tie game.";
        tieGames++;
    }

    setGameMessage(gameMessage);
    setWinsLossesTiesMessage();
    gameOver = true;
}

function newGame() {
    deck.shuffle();
    playerHand = [];
    dealerHand = [];
    playerHandValue = 0;
    dealerHandValue = 0;
    playerStands = false;
    dealerStands = false;
    gameOver = false;
    setGameMessage("");
    initializeTextBoxes();
    hitMe();
    hitMe();
}

function onPageLoad() {
    createPlayerTable("playerTable", playerTextBoxName);
    createPlayerTable("dealerTable", dealerTextBoxName);
    setWinsLossesTiesMessage();
    newGame();
}

// **** End of File ****