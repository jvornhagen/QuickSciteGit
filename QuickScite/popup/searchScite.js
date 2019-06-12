/*
 * This file sets up the popup-buttons
 * The doi is collected via message from the active tab when the popup loads
 */

/*Variables*/
var btn;
var bar;
var btnSearchTerm

/*FUNCTIONS*/
/*This function gets the manual input and searches for it on Scite*/
function sendToPage()
{
    var input = document.getElementById("search").value;
    var searchstring = "https://scite.ai/reports/" + input;
    browser.tabs.create({
        "url": searchstring
    });
    window.close();
    return;
}

/*This function searches for the found doi on Scite*/
function searchScite()
{
    browser.tabs.create({
        "url": btnSearchTerm
    });
    window.close();
    return;
}

function checkDoi(doi) {
    var cd = doi.search("doi:");
    //console.log("cd: " + cd);

    var ndoi = doi;
    if (cd != -1)
    {
        ndoi = ndoi.replace("doi:", "");
    }
    cd = doi.search("info:doi/");
    if (cd != -1) {
        ndoi = ndoi.replace("info:doi/", "");
    }


    //console.log("doi: " + doi);
    return ndoi;
}

function setButtons(searchTerm) {
    //console.log("setButtons called with: " + searchTerm);
    btn = document.getElementById("SearchButton");
    bar = document.getElementById("Bar");
    bar.onclick = sendToPage;

    if (searchTerm === "X")
    {
        btn.innerHTML = "No DOI found. Please use manual search.";
    }
    else
    {
        btn.innerHTML = "Search for: " + "\n" + searchTerm;
        btnSearchTerm = "https://scite.ai/reports/" + searchTerm
        btn.onclick = searchScite;
    }
    //console.log("Buttons set!");
    return;
}

function getTally(doi) {
    var tally = fetch("https://api.scite.ai/tallies/" + doi)
        .then(function (response) { return response.json(); })
        .then(function (tally) {
            supp = document.getElementById("supporting");
            supp.innerHTML = tally.supporting;
            ment = document.getElementById("mentioning");
            ment.innerHTML = tally.mentioning;
            cont = document.getElementById("contradicting");
            cont.innerHTML = tally.contradicting;
            unclass = document.getElementById("unclassified");
            unclass.innerHTML = tally.unclassified;
        });
    //console.log(tally);
    //debug
    /*
    console.log(tally.contradicting);
    console.log(tally.mentioning);
    console.log(tally.supporting);
    console.log(tally.unclassified);
    */
}

//Sets the Information Section.
function setInfo(message) {
    title = document.getElementById("title");
    title.innerHTML = message.title;
    year = document.getElementById("year");
    year.innerHTML = message.year;
    authors = document.getElementById("authors");
    authors.innerHTML = message.authors;
    journal = document.getElementById("journal");
    journal.innerHTML = message.journal;
    aiDoi = document.getElementById("aiDoi");
    aiDoi.innerHTML = message.doi;
}

//functions to handle the listener response.
function handleResponse(message) {
    //console.log("Message: " + message.value);
    doi = checkDoi(message.doi);
    setButtons(doi);
    setInfo(message);
    getTally(doi);
    return;
}
function handleError() {
    console.log("Error");
    return;
}

//When the popup is loaded it will ask the content script of the active tab if it has found a doi.
window.onload = function () {
    browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        //console.log("TryToCall");
        browser.tabs.sendMessage(tabs[0].id, { type: "getDoi" }).then(handleResponse, handleError);
    })
    return;
}

