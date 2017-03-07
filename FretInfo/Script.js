// FretInfo Script.js - Javascript - January 29, 2011

// **** jQuery Function Declarations ****

$(document).ready(function () {
    generatePageFooter();
    onPageLoad();
});

// **** Function Declarations ****

function getNoteFrequency(octaveNumber, noteNumber) {
    // The frequency of the note A4 is 440 Hertz.
    var noteAFreq = [27.5, 55.0, 110.0, 220.0, 440.0, 880.0, 1760.0];

    var freq = noteAFreq[octaveNumber];

    if (noteNumber < 9) {
        freq /= Math.pow(2.0, (9.0 - noteNumber) / 12.0);
    } else if (noteNumber > 9) {
        freq *= Math.pow(2.0, (noteNumber - 9.0) / 12.0);
    }

    return parseInt(freq * 10.0, 10) / 10.0;
}

function clearTextBoxes() {
    $("#fretInfo :text").each(function () {
        $(this).val("");
    });
}

function calculate() {
    var noteNames = ["C", "C# / Db", "D", "D# / Eb", "E", "F", "F# / Gb", "G", "G# / Ab", "A", "A# / Bb", "B"];

    var fretNumber = $("#ddlFretNumber").val();

    if (fretNumber === "") {
        clearTextBoxes();
        return;
    }

    fretNumber = parseInt(fretNumber, 10);

    var octaveNumber = 4;
    var noteNumber = fretNumber + 4;

    while (noteNumber >= 12) {
        octaveNumber++;
        noteNumber -= 12;
    }

    for (var stringIndex = 0; stringIndex < 6; ++stringIndex) {
        $("[name='txtNoteName']").eq(stringIndex).val(noteNames[noteNumber] + " " + octaveNumber);

        $("[name='txtNoteFreq']").eq(stringIndex).val(getNoteFrequency(octaveNumber, noteNumber) + " Hz");

        if (stringIndex == 1) {
            noteNumber -= 4;      // The second string (B3) is tuned to be four semitones above the third string (G3).
        } else {
            noteNumber -= 5;
        }

        if (noteNumber < 0) {
            --octaveNumber;
            noteNumber += 12;
        }
    }
}

function constructTable() {
    var stringNames = ["First string (E)", "Second string (B)", "Third string (G)", "Fourth string (D)", "Fifth string (A)", "Sixth string (E)"];

    $("#fretInfo").html("");
    $("<tr><th>String</th><th>Note Name</th><th>Note Frequency</th></tr>").appendTo("#fretInfo");

    for (var i = 0; i < 6; ++i) {
        $("<tr></tr>").appendTo("#fretInfo");
        $("<td>" + stringNames[i] + "</td>").appendTo("#fretInfo tr:last");
        $("<td><input type='text' name='txtNoteName' size='10' /></td>").appendTo("#fretInfo tr:last");
        $("<td><input type='text' name='txtNoteFreq' size='10' /></td>").appendTo("#fretInfo tr:last");
    }
}

function onPageLoad() {
    constructTable();

    $("#ddlFretNumber").html("<option></option>");

    for (var i = 0; i <= 24; ++i) {
        $("<option>" + i + "</option>").appendTo("#ddlFretNumber");
    }

    $("#ddlFretNumber").val("");     // Select the empty (first) option.

    clearTextBoxes();
}
