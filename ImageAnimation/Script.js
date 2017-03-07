// ImageAnimation/Script.js - Javascript - February 22, 2011

// **** Global Variable Declarations ****

var nGridWidth = 4;
var nGridHeight = 3;

var astrImageDescriptions = [
    "Auto Equalize",        // 0
    "Gaussian Blur",        // 1
    "Psychedelic",          // 2
    "Plastic",              // 3
    "Pastel",               // 4
    "Lighting Effects",     // 5
    "Bilinear Distortion",  // 6
    "Stained Glass",        // 7
    "Wet Paint",            // 8
    "Swirl",                // 9
    "Pinch/Punch",          // 10
    "Hue Shift"             // 11
    ];

// **** jQuery Function Declarations ****

$(document).ready(function () {
    constructTable();
    generatePageFooter();
    $("#mainContent img").mouseover(function () {
        $("#pImageDescription").html("Effect: " + $(this).prop("alt")); // Use the attr() function to read the value of the img tag's "alt" attribute.
        $(this).animate({ width: 300, height: 300 }, "slow");
    });
    $("#mainContent img").mouseout(function () {
        $("#pImageDescription").html("No image");
        $(this).animate({ width: 200, height: 200 }, "slow");
    });
});

// **** Other Function Declarations ****

function constructTable() {
    var i = 0;

    $("#imageTable").html("");

    for (var row = 0; row < nGridHeight; ++row) {
        $("<tr></tr>").appendTo("#imageTable");

        for (var col = 0; col < nGridWidth; ++col) {
            var strImgSrc = "Images/head" + i + ".jpg";
            var strText = astrImageDescriptions[i];

            $("<td><img src='" + strImgSrc + "' alt='" + strText + "' title='" + strText + "' /></td>").appendTo("#imageTable tr:last");
            i++;
        }
    }
}

// **** End of File ****