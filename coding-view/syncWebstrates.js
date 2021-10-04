//syncWebstrates

let syncWebstrates = () => {

    let textSnippets = webstrate.Coding.dbDoc.querySelectorAll(".textSnippet");
	if(textSnippets){
		for (snippet of textSnippets) {
            snippetAttributeChangeHandler(snippet);
			addWebstrateEvents(snippet, "nodeAdded*", tagAddedOnSnippet);
		}
    }
    
    let snippetDB = webstrate.Coding.dbDoc.querySelector('#snippetDB');
	if(snippetDB){
		addWebstrateEvents(snippetDB, "nodeAdded*", textSnippetAddedHandler);
	}

    // webstrate inspect on nodeAdded
    let themeDB = webstrate.Coding.dbDoc.querySelector('#themeDB');
    if(themeDB){
        addWebstrateEvents(themeDB, "nodeAdded", nodeAddedOnTheme);
        addWebstrateEvents(themeDB, "nodeRemoved", nodeRemovedOnTheme);
    }
}; // syncWebstrates()

function textSnippetAddedHandler(node){
    if($(node).hasClass("textSnippet")){
		//listen to attribute changed (whether pin or not)
        snippetAttributeChangeHandler(node);
		//listen to tag add on 
		addWebstrateEvents(node, "nodeAdded", tagAddedOnSnippet);
	}
};

let lastExamine;

function snippetAttributeChangeHandler(node){
    //console.log(node);

    let attrTriggered = (attributeName, oldValue, newValue, local) => {

        console.log("attrTriggered", attributeName);
        // An attribute was changed by another client.
            if (local) {
                //do nothing
                //console.log("attribute changed by me");
            } else {
                if(attributeName === "examine"){
                    //console.log(attributeName);
                    let examinesourceon = node.getAttribute("examinesourceon")
                    let name = examinesourceon.replace("ipad-", "");
                    if(webstrate.user.username.includes(name) || examinesourceon === "ipad-all"){
                        console.log(webstrate.Coding.checkID );
                        webstrate.Coding.checkID = node.id.replace("snippet", "highlight");
                        console.log(webstrate.Coding.checkID, node.id.replace("snippet", "highlight"));
                        
                        let sourceURL = node.getAttribute("url");
                        if(webstrate.Coding.transcriptFrame.src !== sourceURL){
                            //update content 
                            webstrate.Coding.transcriptFrame.src = sourceURL;
                        }else{
                            //console.log(lastExamine, checkID);
                            //still the same page, but different highlight
                            if((!lastExamine) || webstrate.Coding.checkID !== lastExamine.id){
                                showSource();
                            }
                        }
                    }
                }
            }
        };
    
    addWebstrateEvents(node, "attributeChanged*", attrTriggered);
}; // snippetAttributeChangeHandler();


function showSource(){
    console.log("show source", webstrate.Coding.checkID);

    let transcriptDoc = webstrate.Coding.transcriptDoc; 
    let transcriptWindow = webstrate.Coding.transcriptFrame.contentWindow;
    let transcriptBox = webstrate.Coding.transcriptFrame.getBoundingClientRect();
    let highlight = transcriptDoc.querySelector('#'+webstrate.Coding.checkID);

    console.log(highlight);
    if(highlight){
        let sourceBox = highlight.getBoundingClientRect();
        
        if(sourceBox.top > transcriptBox.bottom || sourceBox.bottom < transcriptBox.top){
            //need to scroll
            //console.log("scroll");
            transcriptWindow.scroll(0, highlight.offsetTop-transcriptBox.height/2);
            setTimeout(emphasize(highlight), 100);
        }else{
            //console.log("no scroll");
            emphasize(highlight);
        }
    }
};

function emphasize(sourceContent){
   // console.log(sourceContent);
    //first time transcluded a new transcript, lastExamine undefined
    //if stay in the same page, check whether examine same ssnippet

    if(lastExamine && (lastExamine !== sourceContent)){
        //remove the border in lastExamine
        lastExamine.setAttribute("transient-border", "false");
    }
    sourceContent.setAttribute("transient-border", "true");
    lastExamine = sourceContent;
};

function tagAddedOnSnippet(node, local){
    // if(node.classList.contains('tag')){
    //     databaseEngine.addTooltip(node);
    // }
    if(local){

    }else{
        console.log(node, "added not locally");
        if(node.classList.contains("autocomplete")){
            let tag = node.querySelector(".tag");
            //tag.setAttribute("contenteditable", "true");
            webstrate.Coding.databaseEngine.setAutocompleteHandler(node);
        }
    }
};

function nodeAddedOnTheme(node){
    console.log("nodeAdded", node, "heard in " + webstrate.webstrateId);

    if($(node).hasClass("themeSnippet")){
        //let themeContent = node.innerText;
        //if(!databaseEngine.themes.includes(themeContent)){
        let found = webstrate.Coding.databaseEngine.themes.filter(dict => dict.themeID === node.id).length;
        if(found === 0){
            let dictionary = {
                themeID: node.id,
                creator: node.getAttribute("creator"),
                themeContent: node.innerText
            }
            webstrate.Coding.databaseEngine.themes.push(dictionary);
            syncWebstrates.realtimeUpdate(node);
        }
        console.log(webstrate.Coding.databaseEngine.themes);
    }
};

function nodeRemovedOnTheme(node){
    console.log("nodeRemoved", node, "heard in " + webstrate.webstrateId);

    if($(node).hasClass("themeSnippet")){
        let dictionary = webstrate.Coding.databaseEngine.themes.find(x => x.themeID === node.id);
        if(dictionary){
            webstrate.Coding.databaseEngine.themes.splice(webstrate.Coding.databaseEngine.themes.findIndex((i) => {
                return i.themeID === node.id;
            }), 1);
        }
        console.log(webstrate.Coding.databaseEngine.themes);
    }
};

syncWebstrates.realtimeUpdate = (themeSnippet) => {
    //console.log("realtimeUpdate");
    // Options for the observer (which mutations to observe)
    const config = {  characterData: true, childList: true, subtree: true };

    // Callback function to execute when mutations are observed
    const callback = function(mutationsList, observer) {
        
        // Use traditional 'for loops' for IE 11
        for(let mutation of mutationsList) {
            //console.log(mutation.type);

            if (mutation.type === 'childList') {
                //console.log('A child node has been added or removed.');
                let textNode = mutation.target.childNodes[0];
                if(textNode){
                    if(textNode.length === 1){
                        //insert the first character will add a new textNode
                        updateThemeDictionary(themeSnippet.id, textNode.data);
                    }
                    observer.observe(textNode, config);
                }

            }else if(mutation.type === 'characterData'){
                //console.log("character change");
                //console.log(mutation.target.nodeType);

                if(mutation.target.nodeType === 3){
                    if(!mutation.target.parentNode){ 
                        //delete last character will delete the textNode
                        updateThemeDictionary(themeSnippet.id, '');
                    }else{
                        if(mutation.target.parentNode.parentNode === themeSnippet){
                            let clusterID = themeSnippet.id;
                            let newContent = mutation.target.data;
                            updateThemeDictionary(clusterID, newContent);
                        }
                    }
                }
                
            }
        }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    let title = themeSnippet.querySelector('.note_title');
    // Start observing the target node for configured mutations
    observer.observe(title, config);
};

function updateThemeDictionary(themeID, newContent){  
    let dictionary = webstrate.Coding.databaseEngine.themes.find(x => x.themeID === themeID);
    //console.log(dictionary);
    if(dictionary){
        //console.log("oldContent ", dictionary.themeContent);
        dictionary.themeContent = newContent;
        //console.log("newContent ", dictionary.themeContent );
    }
}

// function tagAddedOnSnippet(node){

// }


function addWebstrateEvents(target, type, listener){
	//call corresponding webstarte events
	target.webstrate.on(type, listener);

	//register to the _webstrateEvents list 
	//window._webstrateEvents.push({target: target, type: type, listener: listener});
}

exports.syncWebstrates = syncWebstrates;