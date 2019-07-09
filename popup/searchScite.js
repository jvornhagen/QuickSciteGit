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
    var searchstring = "https://scite.ai/search?page=1&q=" + input;
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
            console.log(JSON.stringify(tally));
            tt = document.getElementsByClassName("tally");
            supp = document.getElementById("supporting");
            ment = document.getElementById("mentioning");
            cont = document.getElementById("contradicting");
            unclass = document.getElementById("unclassified");
            if (tally.message == "Internal server error") {
                //console.log("ISE!");
                for (i = 0; i < tt.length; i++)
                { tt[i].style.display = "none";}
                document.getElementById("errorTally").style.display = "block";
            }
            if (tally.message != "Internal server error")
            {
                for (i = 0; i < tt.length; i++)
                { tt[i].style.display = "block"; }
                document.getElementById("errorTally").style.display = "none";
                if (tally.supporting != undefined) {
                    supp.innerHTML = tally.supporting;
                }
                if (tally.supporting == undefined) {
                    supp.innerHTML = "No supporting citations";
                }
                if (tally.mentioning != undefined) {
                    ment.innerHTML = tally.mentioning;
                }
                if (tally.mentioning == undefined) {
                    ment.innerHTML = "No mentioning citations";
                }
                if (tally.contradicting != undefined) {
                    cont.innerHTML = tally.contradicting;
                }
                if (tally.contradicting == undefined) {
                    cont.innerHTML = "No contradicting citations";
                }
                if (tally.unclassified != undefined) {
                    unclass.innerHTML = tally.unclassified;
                }
                if (tally.unclassified == undefined) {
                    unclass.innerHTML = "No unclassified citations";
                }
            }

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
    year = document.getElementById("year");
    authors = document.getElementById("authors");
    journal = document.getElementById("journal");
    aiDoi = document.getElementById("aiDoi");

    if (message.title != undefined) {
        title.innerHTML = message.title;
    }
    if (message.title == undefined) {
        title.innerHTML = "No title found";
    }
    if (message.year != undefined) {
        year.innerHTML = message.year;
    }
    if (message.year == undefined) {
        year.innerHTML = "No publication date found";
    }
    if (message.authors != undefined) {
        authors.innerHTML = message.authors;
    }
    if (message.authors == undefined) {
        authors.innerHTML = "No author(s) found";
    }
    if (message.journal != undefined) {
        journal.innerHTML = message.journal;
    }
    if (message.journal == undefined) {
        journal.innerHTML = "No journal found";
    }
    if (message.doi != undefined) {
        aiDoi.innerHTML = message.doi;
    }
    if (message.doi == undefined) {
        aiDoi.innerHTML = "No doi found";
    }
}

//functions to handle the listener response.
function handleResponse(message) {
    doidivs = document.getElementsByClassName("doiDiv");
    if (message.doi != "X")
    {
        for (i = 0; i < doidivs.length; i++)
        { doidivs[i].style.display = "block"; }
        document.getElementById("noDOI").style.display = "none";
        //console.log("Message: " + message.value);
        doi = checkDoi(message.doi);
        setButtons(doi);
        setInfo(message);
        getTally(doi);
        //Replace Loading Screen with content
        document.getElementById("popup-content").style.display = "inherit";
        document.getElementById("loading").style.display = "none";
        return;
    }
    else
    {
        for (i = 0; i < doidivs.length; i++)
        { doidivs[i].style.display = "none"; }
        document.getElementById("noDOI").style.display = "initial";

        //Replace loading Screen with content
        document.getElementById("popup-content").style.display = "inherit";
        document.getElementById("loading").style.display = "none";
        return;
    }

}
function handleError() {
    console.log("Error");
    return;
}





//When the popup is loaded it will ask the content script of the active tab if it has found a doi.
window.onload = function () {
    bar = document.getElementById("Bar");
    bar.onclick = sendToPage;
    //Replace content with loading screen
    document.getElementById("popup-content").style.display = "none";
    document.getElementById("loading").style.display = "initial";
    browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        //console.log("TryToCall");
        browser.tabs.sendMessage(tabs[0].id, { type: "getDoi" }).then(handleResponse, handleError);
    })
    return;
}

