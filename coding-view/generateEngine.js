//generateEngine, depends on linkEngine databaseEngine 

let generateEngine = {};

let counterElm = document.querySelector("#counter");
let counter = 0;

if(!counterElm){
    let $counterElement = $('<div id="counter" number="0" style="display:none"></div>');
    $counterElement.appendTo($('body'));
}else{
    counter = parseInt(counterElm.getAttribute("number"));
}

generateEngine = () => {
    console.log("start generateEngine");
    
    webstrate.Coding.transcriptDoc.addEventListener("keypress", function(event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
          // Cancel the default action, if needed
          event.preventDefault();
          // Trigger
          showSelectedText();
        }
      });
};

let showSelectedText = function () {
    let ifm_window = webstrate.Coding.transcriptFrame.contentWindow;
    let text = '';
    if (ifm_window.getSelection) {
        text = ifm_window.getSelection();
    } else if (ifm_document.getSelection) {
        text = ifm_document.getSelection();
    } else if (ifm_document.selection) {
        text = ifm_document.selection.createRange().text;
    }

    if(text.toString().trim().length > 0){

        //set snippet id by using cookie
        //let elements = document.cookie.split('=');
        //let id = elements[1];
        let id = counter;
        console.log("id: ", id);
        let url = webstrate.Coding.transcriptFrame.src;
        let participant = url.replace("https://demo.webstrates.net/transcript-", "");
        let content = text.toString();

        new Note_text({
            id: 'snippet'+id,
            participant: participant,
            url: url,
            content: content
        });

        generateEngine.highlightSelection('highlight'+id);
        let newNote = webstrate.Coding.dbDoc.querySelector('#snippet'+id);
        if(newNote) webstrate.Coding.databaseEngine.snippetHandlers(newNote);

        webstrate.Coding.linkEngine.highlightHandlers(webstrate.Coding.transcriptDoc.querySelector("#highlight"+id));

        let nextID = ++id;
        //document.cookie = "id=" + nextID;
        counterElm.setAttribute("number", nextID);
        counter = nextID;
    }
};

generateEngine.highlightSelection = (id) => {
    let sel, range;

    if (webstrate.Coding.transcriptFrame.contentWindow.getSelection) {
        sel = webstrate.Coding.transcriptFrame.contentWindow.getSelection();
        selText = sel.toString();
          if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();

            newNode = document.createElement("span");
            newNode.id = id;
            newNode.setAttribute("class", "highlight");
            newNode.setAttribute("style", "background-color: yellow; display: inline;");
            newNode.setAttribute("transient-border", "false");

            newNode.appendChild(document.createTextNode(selText));
            range.insertNode(newNode);
            WPMv2.stripProtection(newNode);

        }
    } else if (document.selection && document.selection.type != "Control") {
        document.selection.createRange().pasteHTML(html);
    }
};

generateEngine.deleteHighlight = (id) => {
    let hightid = 'highlight' + id.replace('snippet','');
    let doc = webstrate.Coding.transcriptDoc;
    if(doc){
        console.log("delete highlight ", doc.getElementById(hightid));
        let span = doc.getElementById(hightid);
        if(span){
            //console.log(span, span.querySelector('.tooltip'));
            if(span.querySelector('.tooltip')) span.removeChild(span.querySelector('.tooltip'));
            let text = span.textContent || span.innerText;
            let node = document.createTextNode(text);
            span.parentNode.replaceChild(node, span);
        }
    }
};

// function linkHighlight(id){
//     let highlight = webstrate.transcriptDoc.querySelector("#highlight"+id);
//     if(highlight){
//         highlight.addEventListener("mouseover", () => {
//             let snippet = webstrate.dbDoc.querySelector("#snippet"+id);
//             if(snippet){
//                 let themes = snippet.querySelectorAll('span.tag');
//                 if(themes && themes.length > 0){
//                     themes.forEach(theme => {
//                         let $tooltip = $('<span class="tooltip">'+ theme.getAttribute("content")+'</span>');
//                         $tooltip.appendTo($(highlight));
//                     });
//                 }
                
//             }
//         });
//     }
// }

/*
* Note_text to create textSnippet
*/

let ID = () => { return '_' + Math.random().toString(36).substr(2, 9); };

class Note_text{
	constructor({id, participant, url, content}){
	    console.log("construct a text");

		let tmpl = document.getElementById('tmpl_text').content.cloneNode(true);
		let textElm = tmpl.querySelector('.textSnippet');
		textElm.id = id;

		if(participant === undefined){
			textElm.setAttribute("participant", "");
		} else {
			textElm.setAttribute("participant", participant);
		}

		if(url === undefined){
			textElm.setAttribute("url", "");
		} else {
			textElm.setAttribute("url", url);
		}

		if(content === undefined){
			textElm.querySelector('p').innerText = "";
		} else {
			textElm.querySelector('p').innerText = content;
		}

		this.appendToDOM(textElm);
		this.setHeader();
	}

 	appendToDOM(elm) {
		if(webstrate.Coding.dbDoc){
			if(!webstrate.Coding.dbDoc.getElementById(elm.id)){
				webstrate.Coding.dbDoc.querySelector('#snippetDB').appendChild(elm);
                WPMv2.stripProtection(elm);
				this.element = elm;
			}
		}
	}

	setHeader() {
		if(this.element){
            let shortId = this.element.id.replace('snippet','');
            this.element.querySelector('h3').innerText = shortId + ' ' + this.element.getAttribute("participant");
        } 
	}
	getDOMNode() {
	    return this.element;
	}

};

exports.generateEngine = generateEngine;