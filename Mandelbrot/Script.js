// Javascript/Mandelbrot/index.js - April 21, 2011

// **** Global Variable Declarations ****

var canvasWidthInPixels = 512;
var canvasHeightInPixels = 512;
var defaultViewLeft = -2.25;
var defaultViewTop = 1.5;
var defaultViewWidth = 3.0;
var defaultViewHeight = 3.0;
var viewLeft = 0.0;
var viewTop = 0.0;
var viewWidth = 0.0;
var viewHeight = 0.0;
var currentCanvasLeftInPixels = 0;
var currentCanvasTopInPixels = 0;
var currentCanvasWidthInPixels = 0;
var currentWidth = 0.0;
var palette = null;
var maxRendersPerCall = 32;
var nextCallDelay = 5; // Milliseconds
var globalRenderNumber = 0;
var zoomExponent = 0;

// **** jQuery Function Declarations ****

$(document).ready(function () {
    $("#myCanvas").click(function (e) {
        var offset = $("#myCanvas").offset();
        var x = parseInt(e.pageX - offset.left, 10);
        var y = parseInt(e.pageY - offset.top, 10);

        onCanvasClick(x, y);
    });

    generatePageFooter(false);     // No canvas support in IE9.
    onPageLoad();
});

// **** Other Function Declarations ****

function displayZoomExponent() {
    $("#zoomExponent").html(zoomExponent);
}

function fillSquare(cxt, left, top, width, colourString)
{
    cxt.fillStyle = colourString;
    cxt.fillRect(left, top, width, width);
}

function calculateAndFillSquare(cxt, cr, ci, canvasSquareLeft, canvasSquareTop, canvasSquareWidth)
{
    var maxNumIterations = palette.length - 1;
    var zr = cr;
    var zi = ci;
    var i = 0;

    for (; i < maxNumIterations; ++i)
    {
        var zr2 = zr * zr;
        var zi2 = zi * zi;

        if (zr2 + zi2 >= 4.0)
        {
            break;
        }

        var tempzr = zr2 - zi2 + cr;

        zi = 2.0 * zr * zi + ci;
        zr = tempzr;
    }

    fillSquare(cxt, canvasSquareLeft, canvasSquareTop, canvasSquareWidth, palette[i]);
}

function renderLoop(localRenderNumber) {

    if (localRenderNumber != globalRenderNumber) {
        return;
    }

    var cxt = $("#myCanvas")[0].getContext("2d");
    var nextCanvasWidthInPixels = currentCanvasWidthInPixels / 2;
    var nextWidth = currentWidth / 2.0;

    for (var renderNum = 0; renderNum < maxRendersPerCall; ++renderNum)
    {
        var cr = currentCanvasLeftInPixels * viewWidth / canvasWidthInPixels + viewLeft;
        var ci = viewTop - currentCanvasTopInPixels * viewHeight / canvasHeightInPixels;

        /*
        // TAW 2011/05/30 : This next call should be unnecessary if the "progressive scan" algorithm is working properly.
        calculateAndFillSquare(cxt, cr, ci,
            currentCanvasLeftInPixels, currentCanvasTopInPixels,
            nextCanvasWidthInPixels);
         */

        calculateAndFillSquare(cxt, cr + nextWidth, ci,
            currentCanvasLeftInPixels + nextCanvasWidthInPixels, currentCanvasTopInPixels,
            nextCanvasWidthInPixels);
        calculateAndFillSquare(cxt, cr, ci - nextWidth,
            currentCanvasLeftInPixels, currentCanvasTopInPixels + nextCanvasWidthInPixels,
            nextCanvasWidthInPixels);
        calculateAndFillSquare(cxt, cr + nextWidth, ci - nextWidth,
            currentCanvasLeftInPixels + nextCanvasWidthInPixels, currentCanvasTopInPixels + nextCanvasWidthInPixels,
            nextCanvasWidthInPixels);

        currentCanvasLeftInPixels += currentCanvasWidthInPixels;

        if (currentCanvasLeftInPixels >= canvasWidthInPixels)
        {
            currentCanvasLeftInPixels = 0;
            currentCanvasTopInPixels += currentCanvasWidthInPixels;

            if (currentCanvasTopInPixels >= canvasHeightInPixels)
            {
                currentCanvasTopInPixels = 0;
                currentCanvasWidthInPixels = nextCanvasWidthInPixels;
                currentWidth = nextWidth;

                if (currentCanvasWidthInPixels <= 1)
                {
                    // Rendering is complete.
                    return;
                }

                nextCanvasWidthInPixels /= 2;
                nextWidth /= 2.0;
                break;  // Allow the display of the rendered image at this level of chunkiness.
            }
        }
    }

    // Set the timer for the next call.
    setTimeout("renderLoop(" + localRenderNumber + ")", nextCallDelay);
}

function constructPalette()
{
    palette = [];

    for (var i = 0; i <= 255; i += 5)
    {
        palette.push("rgb(255," + i + ",0)");   // Red to Yellow
        palette.push("rgb(0,255," + i + ")");   // Green to Cyan/Aqua
        palette.push("rgb(" + i + ",0,255)");   // Blue to Magenta/Fuchsia
    }

    palette.push("rgb(0,0,0)");     // Pixels within the Mandelbrot Set are coloured Black.
}

function renderView()
{
    var cxt = $("#myCanvas")[0].getContext("2d");

    calculateAndFillSquare(cxt, viewLeft, viewTop, 0, 0, canvasWidthInPixels);  // Fill the entire canvas with the colour for the top left pixel.
    displayZoomExponent();

    currentCanvasLeftInPixels = 0;
    currentCanvasTopInPixels = 0;
    currentCanvasWidthInPixels = canvasWidthInPixels;
    currentWidth = viewWidth;
    ++globalRenderNumber;
    setTimeout("renderLoop(" + globalRenderNumber + ")", nextCallDelay);
}

function renderDefaultView() {
    viewLeft = defaultViewLeft;
    viewTop = defaultViewTop;
    viewWidth = defaultViewWidth;
    viewHeight = defaultViewHeight;
    zoomExponent = 0;

    renderView();
}

function onPageLoad() {
    constructPalette();
    renderDefaultView();
}

function constrainView(newViewLeft, newViewTop, newViewWidth, newViewHeight, newZoomExponent) {

    if (newViewWidth > defaultViewWidth) {
        newViewWidth = defaultViewWidth;
    }

    if (newViewHeight > defaultViewHeight) {
        newViewHeight = defaultViewHeight;
    }

    if (newViewLeft < defaultViewLeft) {
        newViewLeft = defaultViewLeft;
    }

    var newViewRight = newViewLeft + newViewWidth;
    var defaultViewRight = defaultViewLeft + defaultViewWidth;

    if (newViewRight > defaultViewRight) {
        newViewLeft = defaultViewRight - newViewWidth;
    }

    if (newViewTop > defaultViewTop) {
        newViewTop = defaultViewTop;
    }

    var newViewBottom = newViewTop - newViewHeight;
    var defaultViewBottom = defaultViewTop - defaultViewHeight;

    if (newViewBottom < defaultViewBottom) {
        newViewTop = defaultViewBottom + newViewHeight;
    }

    if (newViewLeft == viewLeft && newViewTop == viewTop && newViewWidth == viewWidth && newViewHeight == viewHeight) {
        return false;
    }

    if (newZoomExponent < 0) {
        newZoomExponent = 0;
    }

    viewLeft = newViewLeft;
    viewTop = newViewTop;
    viewWidth = newViewWidth;
    viewHeight = newViewHeight;
    zoomExponent = newZoomExponent;

    return true;
}

function onCanvasClick(x, y) {
    var cr = x * viewWidth / canvasWidthInPixels + viewLeft;
    var ci = viewTop - y * viewHeight / canvasHeightInPixels;

    var newViewWidth = viewWidth / 2.0;
    var newViewHeight = viewHeight / 2.0

    if (newViewWidth <= 0.0 || newViewHeight <= 0.0) {
        alert("The floating-point precision limit has been reached.");
        return;
    }

    var newViewLeft = cr - newViewWidth / 2.0;
    var newViewTop = ci + newViewHeight / 2.0;

    if (constrainView(newViewLeft, newViewTop, newViewWidth, newViewHeight, zoomExponent + 1)) {
        renderView();
    }
}

function zoomOut() {
    var cr = viewLeft + viewWidth / 2.0;
    var ci = viewTop - viewHeight / 2.0;

    var newViewWidth = viewWidth * 2.0;
    var newViewHeight = viewHeight * 2.0
    var newViewLeft = cr - newViewWidth / 2.0;
    var newViewTop = ci + newViewHeight / 2.0;

    if (constrainView(newViewLeft, newViewTop, newViewWidth, newViewHeight, zoomExponent - 1)) {
        renderView();
    }
}

// **** End of File ****