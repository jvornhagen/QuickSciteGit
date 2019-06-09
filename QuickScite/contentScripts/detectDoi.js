/*
 * This file searches for DOIs on the current tab
 * The first doi found is loaded into the quickScite button
 */

/*Variables*/
var searchTerm;

/*FUNCTIONS*/

//This function sets the searchTerm to either whatever doi (x) is found or to "X" should no DOI be found (y).
function setSearch(x,y) {

    if (y)
    {
        searchTerm = x;
        //console.log("DOI set! " + searchTerm);
    }
    if (!y)
    {
        searchTerm = "X";
        //console.log("DOI set! " + searchTerm);
    }

}

//Listener that answers the popup when that trys to setup it's buttons.
function listener(message, sender, sendResponse) {
        switch (message.type) {
            case "getDoi":
                sendResponse ({ value: searchTerm });
            default:
                //console.error("Unrecognised message: " + message);
                sendResponse({value: "Error"});
        }    
}

//This function searches through the metas of a webpage for a doi and sends it to the setSearch function.
function getKeywords() {
    
    var q = "Start";
    setSearch(q, false);
    var metas = document.getElementsByTagName("meta");
    //Debug
    /*
    for (var i = 0; i < metas.length; i++) {
        console.log("Meta: " + i + ": Name: " + metas[i].getAttribute("name") + ". Content: " + metas[i].getAttribute("content"));
    }
    */

    //goes through metas. If any meta contains "doi" the content of that meta is taken for the popup!
    for (var i = 0; i < metas.length; i++) {
        if (metas[i].getAttribute("name") === null)
        {
            continue;
        }
        //Search for Doi
        if (metas[i].getAttribute("name").includes('doi') == true ||
            metas[i].getAttribute("name").includes('Identifier') == true ||
            metas[i].getAttribute("name").includes('identifier') == true)
        {
            if(metas[i].getAttribute("content").search("/") == -1)
            {
                //console.log("Skipped what coudnt be a doi: " + metas[i].getAttribute("content"))
                continue;
            }
            //console.log("DOI found!")
            setSearch(metas[i].getAttribute('content'), true);
            return metas[i].getAttribute('content');
        }
    }
    //Search for alternatives if no doi was found!
    //tba
}


//actual code
browser.runtime.onMessage.addListener(listener);

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
