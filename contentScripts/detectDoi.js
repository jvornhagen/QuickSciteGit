/*
 * This file searches for DOIs on the current tab
 * The first doi found is loaded into the quickScite button
 */

/*Variables*/
var doi;
var title;
var year;
var authors;
var journal;

/*FUNCTIONS*/

//This function sets the searchTerm to either whatever doi (x) is found or to "X" should no DOI be found (y).
function setSearch(x,y) {

    if (y)
    {
        doi = x;
        //console.log("DOI set! " + searchTerm);
    }
    if (!y)
    {
        doi = "X";
        //console.log("DOI set! " + searchTerm);
    }

}

//Listener that answers the popup when that trys to setup it's buttons.
function listener(message, sender, sendResponse) {
    //console.log("called!");
    switch (message.type) {
        case "getDoi":
            console.log(doi, title, year, authors, journal);
            sendResponse({ doi: doi, title: title, year: year, authors: authors, journal: journal });
        default:
            //console.error("Unrecognised message: " + message);
            sendResponse({ error: "Error" });
    }
}

//If a doi is found, this function adds further info
function addinfo(m) {
    //console.log("Search Other Info");
    var tf = false;
    var yf = false;
    var af = false;
    var jf = false;
    //Search for Title:
    for (var i = 0; i < m.length; i++) {
        if (m[i].getAttribute("name") === null) {
            continue;
        }
        if (tf == false) {
            if (m[i].getAttribute("name").includes('citation_title') == true ||
                m[i].getAttribute("name").includes('dc.Title') == true) {
                console.log("Title found!: " + m[i].getAttribute('content'))
                title = m[i].getAttribute('content');
                tf = true;
                continue;
            }
        }
        //Search for Year
        if (yf == false) {
            if (m[i].getAttribute("name").includes("citation_publication_date") == true ||
                m[i].getAttribute("name").includes("dc.Date")) {
                console.log("Year found!: " + m[i].getAttribute('content'))
                year = m[i].getAttribute('content');
                yf = true;
                continue;
            }
        }

        //Search for journal
        if (jf == false) {
            if (m[i].getAttribute("name").includes('dc.journal') == true ||
                m[i].getAttribute("name").includes('citation_journal_title') == true) {
                console.log("Journal found!: " + m[i].getAttribute('content'))
                journal = m[i].getAttribute('content');
                jf = true;
                continue;
            }
        }

        //search for authors
        if (af == false) {
            if (m[i].getAttribute("name").includes('citation_author') == true ||
                m[i].getAttribute("name").includes('dc.Author') == true ||
                m[i].getAttribute("name").includes('citation_creator') == true ||
                m[i].getAttribute("name").includes('dc.Creator') == true) {
                if (m[i].getAttribute("name").endsWith('institution') == false) {
                    console.log("Author found!: " + m[i].getAttribute('content'))
                    authors = m[i].getAttribute('content');
                    af = true;
                    continue;
                }
                else { continue; }
            }
        }
        if (af == true) {
            if (m[i].getAttribute("name").includes('citation_author') == true ||
                m[i].getAttribute("name").includes('dc.Author') == true ||
                m[i].getAttribute("name").includes('citation_creator') == true ||
                m[i].getAttribute("name").includes('dc.Creator') == true) {
                if (m[i].getAttribute("name").endsWith('institution') == false) {
                    console.log("Author found!: " + m[i].getAttribute('content'))
                    authors = authors.concat(", " + m[i].getAttribute('content'));
                    continue;
                }
                else { continue; }
            }
        }
    }
}
    




//This function crawls through the metas found by getKeywords() for doi, title, year, authors and journal
function crawlMetas(m) {
    var df = false;

    for (var i = 0; i < m.length; i++) {
        if (m[i].getAttribute("name") === null) {
            continue;
        }
        //Search for Doi
        if (df == false) {
            if (m[i].getAttribute("name").includes('doi') == true ||
            m[i].getAttribute("name").includes('DC.Identifier') == true ||
            m[i].getAttribute("name").includes('dc.Identifier') == true ||
            m[i].getAttribute("name").includes('dc.identifier') == true ||
            m[i].getAttribute("name").includes('DC.identifier') == true) {
                if (m[i].getAttribute("content").search("/") == -1) {
                    //console.log("Skipped what coudnt be a doi: " + metas[i].getAttribute("content"))
                    continue;
                }
                console.log("DOI found!: " + m[i].getAttribute('content'))
                df = true;
                doi = m[i].getAttribute('content');
                continue;
                }
            }
        }

        //If doi was found: Look for other information.
        if (df == true) {
            addinfo(m);
        }

        //Search for alternatives if no doi was found!

        //console.log("Alternative called");


        //in some cases metas are defined with property instead of name:
        for (var i = 0; i < m.length; i++) {
            if (m[i].getAttribute("property") === null) {
                continue;
            }
            //Search for Doi
            if (m[i].getAttribute("property").includes('doi') == true ||
                m[i].getAttribute("property").includes('Identifier') == true ||
                m[i].getAttribute("property").includes('identifier') == true) {
                if (m[i].getAttribute("content").search("/") == -1) {
                    //console.log("Skipped what coudnt be a doi: " + metas[i].getAttribute("content"))
                    continue;
                }
                //console.log("DOI found!")
                doi = m[i].getAttribute('content');
                break;
            }
        }

        //more tba
        //current main probelm: psycnet.apa.org
    }
function crawlClasses(m) {
    var df = false;
    var tf = false;
    var yf = false;
    var af = false;
    var jf = false;
    console.log("crawlClasses called!");
    for (var i = 0; i < m.length; i++) {
        //Search for Doi
        if (df == false) {
            console.log("looking for DOI!");
            if(m[i].innerHTML.includes("DOI:"))
            {
                console.log("Doi found! " + m[i].innerHTML)
                var start = m[i].innerHTML.search("<value>");
                var end = m[i].innerHTML.search("</value>");
                console.log("Start: " + start + "; End: " + end);
                doi = m[i].innerHTML.slice(start+7, end);
                console.log("Doi: " + doi);
                df = true;
                continue;
            }
        }
        if (tf == false) {
            /*
            console.log("looking for Title!");
            if (m[i].innerHTML.includes("DOI:")) {
                console.log("Doi found! " + m[i].innerHTML)
                var start = m[i].innerHTML.search("<value>");
                var end = m[i].innerHTML.search("</value>");
                console.log("Start: " + start + "; End: " + end);
                title = m[i].innerHTML.slice(start + 7, end);
                console.log("Title: " + title);
                df = true;
                continue;
            }
            */
        }
        if (yf == false) {
            console.log("looking for Year!");
            if (m[i].innerHTML.includes("Published:")) {
                console.log("Year found! " + m[i].innerHTML)
                var start = m[i].innerHTML.search("<value>");
                var end = m[i].innerHTML.search("</value>");
                console.log("Start: " + start + "; End: " + end);
                year = m[i].innerHTML.slice(start + 7, end);
                console.log("Year: " + year);
                yf = true;
                continue;
            }
        }

        if (jf == false) {
            /*
            console.log("looking for Journal!");
            if (m[i].innerHTML.includes("DOI:")) {
                console.log("Doi found! " + m[i].innerHTML)
                var start = m[i].innerHTML.search("<value>");
                var end = m[i].innerHTML.search("</value>");
                console.log("Start: " + start + "; End: " + end);
                doi = m[i].innerHTML.slice(start + 7, end);
                console.log("Doi: " + doi);
                jf = true;
                continue;
            }
            */
        }

        /*else {
            console.log("looking for Author(s)");
            if (m[i].innerHTML.includes("<display_name>")) {
                console.log("Author(s) found! " + m[i].innerHTML)
                var start = m[i].innerHTML.search("<display_name>");
                var end = m[i].innerHTML.search("</display_name>");
                console.log("Start: " + start + "; End: " + end);
                if (af == false) {
                    var authors = m[i].innerHTML.slice(start + 7, end);
                    af = true;
                    continue;
                }
                if (af == true)
                {
                    authors = authors.concat(", " + m[i].innerHTML.slice(start + 7, end))
                    continue;
                }
                continue;
            }
            
        }*/

    }
}

//This function searches through the metas of a webpage for a doi and sends it to the setSearch function.
function getKeywords() {
    var q = "Start";
    setSearch(q, false);
    var metas = document.getElementsByTagName("meta");
    var url = document.URL;
    //console.log("Url is: " + url);
    //Debug
    /*
    for (var i = 0; i < metas.length; i++) {
        console.log("Meta: " + i + ": Name: " + metas[i].getAttribute("name") + ". Content: " + metas[i].getAttribute("content"));
    }
    */

 //Exception for the Web of Science Database   
    if (url.includes("appswebofknowledge") == true)
    {
        //console.log("This is the web of Science: Searching for doi differently!");
        var wok_classes = document.getElementsByClassName("FR_field");
        crawlClasses(wok_classes);
        //Debug
        /*
        for (var i = 0; i < wok_classes.length; i++) {
            console.log("wok_classes: " + wok_classes[i].innerHTML);
        }
        */
        return;
    }
//General Case
    else
    {
        //goes through metas. If any meta contains "doi" the content of that meta is taken for the popup!
        crawlMetas(metas);
        return;
    }
}


//actual code
browser.runtime.onMessage.addListener(listener);

window.onload = function () {
    var popup = document.getElementById("popup-content")
    if (popup === null) {
        getKeywords();
        return;
    }
    else { return; }
}

//When a window is set active (and is not the popup) the doi is searched for.
window.onfocus = function () {
    var popup = document.getElementById("popup-content")
    if (popup === null)
    {
        getKeywords();
        return;
    }
    else { return;}
}
