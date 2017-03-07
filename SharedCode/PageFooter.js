// PageFooter.js - February 22, 2011

function generateCompatibilityNotice(ie, rekonq) {
    $("<div id='compatibilityNotice' class='box'></div>").appendTo("body");
    $("<p>This page has been tested in the following browsers:</p>").appendTo("div:last");
    $("<ul></ul>").appendTo("div:last");
    $("<li>Mozilla Firefox 10.0.2 (WinXPPro, Win7HP, Kubuntu)</li>").appendTo("ul:last");

    if (ie) {
        $("<li>Microsoft Internet Explorer 9 (Win7HP)</li>").appendTo("ul:last");
    }

    $("<li>Apple Safari 5.1.2 (WinXPPro, Win7HP)</li>").appendTo("ul:last");
    $("<li>Google Chrome 17.0.963.66 (WinXPPro, Win7HP, Kubuntu)</li>").appendTo("ul:last");
    $("<li>Opera 11.61 (WinXPPro, Win7HP, Kubuntu)</li>").appendTo("ul:last");

    if (rekonq) {
        $("<li>rekonq 0.8.0 (Kubuntu)</li>").appendTo("ul:last");
    }

    $("<p>(WinXPPro = Microsoft Windows XP Professional; Win7HP = Microsoft Windows 7 Home Premium; Kubuntu = Kubuntu Linux 11.10)</p>").appendTo("div:last");
}

function generateValidIcons() {
    $("<div id='validIcons' class='box'></div>").appendTo("body");
    $("<p class='centreText'></p>").appendTo("div:last");
    $("<a href='http://validator.w3.org/check?uri=referer'></a>").appendTo("p:last");
    $("<img src='http://www3.sympatico.ca/tom.weatherhead/Javascript/SharedImages/HTML5.png' alt='Valid HTML 5' title='Valid HTML 5' />").appendTo("a:last");
    //$("<img src='http://www.w3.org/Icons/valid-xhtml11' alt='Valid XHTML 1.1' title='Valid XHTML 1.1' />").appendTo("a:last");
    $("<a href='http://jigsaw.w3.org/css-validator/check/referer'></a>").appendTo("p:last");
    $("<img src='http://jigsaw.w3.org/css-validator/images/vcss' alt='Valid CSS' title='Valid CSS' />").appendTo("a:last");
}

function generatePageFooter(ie, rekonq) {

    if (typeof ie === "undefined") {
        ie = true;
    }

    if (typeof rekonq === "undefined") {
        rekonq = true;
    }

    generateCompatibilityNotice(ie, rekonq);
    generateValidIcons();
}

// **** End of File ****