window._webstrateEvents = [];

let syncWebstrates = () => {
    // webstrate inspect on nodeAdded/nodeRemoved
	let themeDB = webstrate.ADQDA.dbDoc.querySelector('#themeDB');
	if(themeDB){
		addWebstrateEvents(themeDB, "nodeAdded*", themeAddedHandler);
		addWebstrateEvents(themeDB, "nodeRemoved*", themeRemovedHandler);
	}

	let snippetDB = webstrate.ADQDA.dbDoc.querySelector('#snippetDB');
	if(snippetDB){
		addWebstrateEvents(snippetDB, "nodeAdded*", textSnippetAddedHandler);
		addWebstrateEvents(snippetDB, "nodeRemoved*", textSnippetRemovedHandler);
	}

	let posList = webstrate.ADQDA.diagramDBDoc.getElementById('posList');
	if(posList){
		addWebstrateEvents(posList, "nodeAdded*", posAddedHandler);
	} 

	//inspect on tags added/removed
	let textSnippets = webstrate.ADQDA.dbDoc.querySelectorAll(".textSnippet");
	if(textSnippets){
		for (snippet of textSnippets) {
			addWebstrateEvents(snippet, "nodeAdded*", tagAddedOnSnippet);
			addWebstrateEvents(snippet, "nodeRemoved*", tagRemovedOnSnippet);
			snippetAttributeChangeHandler(snippet);
		}
	}

	//let tags = webstrate.dbDoc.querySelectorAll(".tag");


	//inspect on theme content change
	// let themeSnippets = webstrate.dbDoc.querySelectorAll('.themeSnippet[creator="'+webstrate.creatorId+'"]');
	// if(themeSnippets){
	// 	for (snippet of themeSnippets) {
	// 		let title = snippet.querySelector('.note_title');
	// 		let textNode = title.childNodes[0];
	// 		if(textNode && textNode.nodeType === 3){
	// 			textNode = title.childNodes[0];
	// 			console.log(textNode);
	// 			addWebstrateEvents(textNode, "insertText*", titleChangeHandler);
	// 			addWebstrateEvents(textNode, "deleteText*", titleChangeHandler);
	// 		}		
	// 	}
	// }

	//set listeners for sychonizing position
	let posElements = webstrate.ADQDA.diagramDBDoc.querySelectorAll("pos");
	if(posElements) {
		for(pos of posElements){
			addPositionSyc(pos);
		}
	}
};

function addWebstrateEvents(target, type, listener){
	//call corresponding webstarte events
	target.webstrate.on(type, listener);

	//register to the _webstrateEvents list 
	window._webstrateEvents.push({target: target, type: type, listener: listener});
}

function textSnippetAddedHandler(node, local){
	console.log("nodeAdded", node, "heard in " + webstrate.webstrateId);
	//console.log(local);
	if($(node).hasClass("textSnippet")){

		webstrate.ADQDA.cssEffects.insertToPile(node);

		//addListeners
        //listen to drag 
        webstrate.ADQDA.dragEngine(node);
		//listen to attribute changed (whether pin or not)
        snippetAttributeChangeHandler(node);
        //whether show or hide
        //snippetAttributeChangeHandler(node, "display");
		//listen to tag add on 
		addWebstrateEvents(node, "nodeAdded*", tagAddedOnSnippet);
		addWebstrateEvents(node, "nodeRemoved*", tagRemovedOnSnippet);
	}
}

function textSnippetRemovedHandler(node, local){
	console.log("nodeRemoved", node, "heard in " + webstrate.ADQDA.creatorId);
	//textSnippet removed from another client, remove the pos element too 
	if(!local){
		let pos = webstrate.ADQDA.diagramDBDoc.getElementById(node.id);
		if(pos) pos.parentNode.removeChild(pos);
	}
}

function tagAddedOnSnippet(node, local){
	console.log("a tag has been added", node);
	//console.log(node);
	if(local){

	}else{
		if(node.classList.contains('metaTag')){
			let tag = node.querySelector('.tag');
			if(tag.getAttribute("creator") !== webstrate.ADQDA.creatorId){
				let metaClusterId = node.getAttribute("metathemeid");
				if(!webstrate.ADQDA.hideMetaTagList.includes(metaClusterId)){
					//hide tags added from other ADs
					webstrate.ADQDA.cssEffects.hideMetaTagByClusterId(metaClusterId);
					webstrate.ADQDA.hideMetaTagList.push(metaClusterId);
				}
			}
		}
	
		if(node.classList.contains('autocomplete')){
			let tag = node.querySelector('.tag');
			if(tag){
				if(tag.getAttribute("creator") !== webstrate.ADQDA.creatorId){
					let clusterid = tag.getAttribute("clusterid");
					if(!webstrate.ADQDA.hideTagList.includes(clusterid)){
						//hide tags added from other ADs
						webstrate.ADQDA.cssEffects.hideTagByClusterId(clusterid);
						webstrate.ADQDA.hideTagList.push(clusterid);
					}
				}
				attributeChangeHandler(tag);
			}
		}
	}
};

function attributeChangeHandler(node){
	let triggered = (attributeName, oldValue, newValue, local) => {
		if(attributeName === "creator"){
			if(newValue === webstrate.ADQDA.creatorId){
				//reappear
				webstrate.ADQDA.cssEffects.appearAutocomplete();
			}
		} 
		if(attributeName === "clusterid"){
			//console.log(newValue);
			if(node.getAttribute("creator") === webstrate.ADQDA.creatorId){
				let themeSnippet = webstrate.ADQDA.dbDoc.querySelector("#"+newValue);
				let snippet = node.parentNode;
				while(!snippet.classList.contains("textSnippet")){
					snippet = snippet.parentNode;
				}
				console.log(snippet);
				if(themeSnippet){
					//let box = dragEngine.getAbsoluteBoundingRect(themeSnippet);
					//cssEffects.moveSnippet(snippet.id, box.left, box.bottom+10);
					//add to inbox
					addToInBox(newValue, snippet.id);
					let pos = webstrate.ADQDA.diagramDBDoc.getElementById(snippet.id);
					if(pos){
						pos.setAttribute("display", "hide");
						webstrate.ADQDA.cssEffects.hideSnippetById(snippet.id);
					}
				}
			}
		}
	};
	addWebstrateEvents(node, "attributeChanged*", triggered);
};

//TODO: add 1. add in time 2. who?
function addToInBox(themeid, snippetid){
	//put into inbox 
	console.log("snippet "+snippetid+" add to inbox of: ", themeid);

    let dbDoc = webstrate.ADQDA.dbDoc;
	let theme = dbDoc.querySelector("#"+themeid);
	let inoutBoxes = dbDoc.querySelector('.inoutboxes[themeid="'+ themeid +'"]');

	if(inoutBoxes && theme){
		let inbox = inoutBoxes.querySelector('.inbox');
		let inBoxItem = inoutBoxes.querySelector('.inBoxItem[snippetid="'+snippetid+'"]');
		if(!inBoxItem){
			let content = snippetid.replace('snippet', '');
			var today = new Date();
			var date = today.getDate()+'/'+(today.getMonth()+1)+'/'+today.getFullYear();
			var time = today.getHours() + ":" + today.getMinutes();
			var dateTime = date+' '+time;

			let $inBoxItem = $('<div class="inBoxItem" snippetid="'+snippetid+'">'+ content + ' '+dateTime+ ' Alice' + '</div>');
			$inBoxItem.appendTo($(inbox));
			WPMv2.stripProtection($inBoxItem[0]);

			//handle doubeltap event
			syncWebstrates.inOutItemHandler($inBoxItem[0]);
		}
	}
};

function tagRemovedOnSnippet(node, local){
	if(local){

	}else{
		console.log("tagRemoved: ", node);
		//put into outbox 
		let tag = node.querySelector(".tag");
		if(tag){
			let themeid = tag.getAttribute("clusterid");
			let snippetid = tag.getAttribute("onsnippet");
			if(themeid && snippetid){
				addToOutBox(themeid, snippetid);
			} 
		}
	}
};

function addToOutBox(themeid, snippetid){
    let dbDoc = webstrate.ADQDA.dbDoc;
	let theme = dbDoc.querySelector("#"+themeid);
	let inoutBoxes = dbDoc.querySelector('.inoutboxes[themeid="'+ themeid +'"]');

	if(inoutBoxes && theme){
		let outbox = inoutBoxes.querySelector('.outbox');
		let outBoxItem = inoutBoxes.querySelector('.outBoxItem[snippetid="'+snippetid+'"]');
		if(!outBoxItem){
			let content = snippetid.replace('snippet', '');
			let $outBoxItem = $('<div class="outBoxItem" snippetid="'+snippetid+'">'+ content +'</div>');
			$outBoxItem.appendTo($(outbox));
			syncWebstrates.inOutItemHandler($outBoxItem[0]);
		}
	}
};

//doubletap the thumbnail will bring out the note to nomal form 
//TODO: drop into cluster 
syncWebstrates.inOutItemHandler = (item) => {
	console.log("inOutItemHandler", item);

	if(item){
		$(item).on("dblclick doubletap", e => {
			console.log("dblclick");
			let snippet;
			let snippetid = e.currentTarget.getAttribute("snippetid");
			if(snippetid) snippet = webstrate.ADQDA.dbDoc.querySelector("#"+snippetid);
			console.log(snippet);
			if(snippet){
				//if(!item.classList.contains("spand")) item.classList.add("spand");
				webstrate.ADQDA.cssEffects.moveSnippet(snippetid, e.pageX-30, e.pageY-30);
				webstrate.ADQDA.cssEffects.appearSnippetById(snippetid);
				webstrate.ADQDA.dragEngine.setActiveZIndex(snippet);
				//(id, newX, newY)

				//delte the thumbnail in in/out box
				item.parentNode.removeChild(item);
				//
				let pos = webstrate.ADQDA.diagramDBDoc.querySelector("#"+snippetid);
				if(pos) pos.setAttribute("display", "show");
			}

		});
	}
};

function snippetAttributeChangeHandler(node){

let attrTriggered = (attributeName, oldValue, newValue, local) => {
	//console.log(attributeName);
    // An attribute was changed by another client.
        if (local) {
            //do nothing
			//console.log("attribute changed by me");
        } else {
            //change color of the pinned snippet
            if(attributeName === "onexamine"){
                console.log("onExamine get changed");
                if(oldValue === "false" && newValue === "true"){
                    webstrate.ADQDA.cssEffects.changeBgColor(node.id, "textSnippet", "orange");
                }else if (oldValue === "true" && newValue === "false") {
					let selector = '#' + node.id +'.textSnippet';
					webstrate.ADQDA.cssEffects.changeBgColor(node.id, "textSnippet", "#FFF380");
                }
            }
        }
    };

    addWebstrateEvents(node, "attributeChanged*", attrTriggered);
    window._webstrateEvents.push({target: node, type: "attributeChanged*", listener: attrTriggered});
}

function themeAddedHandler(node, local){
	//console.log("nodeAdded", node, "heard in " + webstrate.creatorId);

	if($(node).hasClass("themeSnippet")){
		if(node.getAttribute("creator") !== webstrate.ADQDA.creatorId){
			//hide the themeSnippet added through other ADs or meta ADs
            webstrate.ADQDA.cssEffects.hideSnippetById(node.id);
		}else {
			if(local){
				//do nothing
			}else {
				console.log("nodeAdded", node, "heard in " + webstrate.ADQDA.creatorId);

				//sychonize on another webstrate client (same webstrateId)
				let id = node.id;
				let pos = webstrate.ADQDA.diagramDBDoc.getElementById(id);
				if(pos){
					//theme added in diagram by another clinet 
					webstrate.ADQDA.cssEffects.addCssRuleOnPosition(node, pos.getAttribute("x"), pos.getAttribute("y"));
				}else{
					//theme added in the coding view
					webstrate.ADQDA.cssEffects.insertToPile(node);
				}
                //listen to drag and move
				webstrate.ADQDA.dragEngine(node);
				webstrate.ADQDA.clusterEngine.realtimeUpdate(node);
			}
		}
	}
}

function themeRemovedHandler(node, local){
	console.log("nodeRemoved", node, "heard in " + webstrate.ADQDA.creatorId);
	//console.log(local);
	if(!local){
		let pos = document.getElementById(node.id);
		if(pos) pos.parentNode.removeChild(pos);
	}
}

function titleChangeHandler(position, value, local){
	console.log(position, value, local);
}

function posAddedHandler(node, local){
	console.log("posNodeAdded", node);
	if(node.getAttribute('x') && node.getAttribute('y')){
		addPositionSyc(node);
	}
}

function addPositionSyc(target){

	let posChangeHandler = (attributeName, oldValue, newValue, local) => {
		if(attributeName === "x" || attributeName === "y"){
			if (local) {
				//console.log("local pos change");
				//do nothing
			} else {
				//console.log("another webstrate client change");
				let pos = webstrate.ADQDA.diagramDBDoc.getElementById(target.id);
				//console.log(pos);
				if(pos){
					let CSSRuleList = webstrate.ADQDA.dbDoc.styleSheets[0].cssRules;
					for(const rule of CSSRuleList){
						if(rule.selectorText === "#"+target.id){
							rule.style.left = pos.getAttribute("x") + "px";
							rule.style.top = pos.getAttribute("y") + "px";
						}
					}

					//add tooltip to indicate user who moves it
					let snippet = webstrate.ADQDA.dbDoc.querySelector("#" + target.id);
					let username = snippet.getAttribute("moveby");
					console.log(username);
					if(username){
						let $transient = $('<transient></transient>');
						let $tooltip =  $('<span class="userIndicator">'+ username +'</span>');
						$tooltip.appendTo($transient);

						if(!snippet.querySelector('transient')){
							$transient.appendTo($(snippet));
						}
					}
				}
			}
		}else if(attributeName === "display"){
			console.log("display get changed");
			if(newValue === "hide"){
				webstrate.ADQDA.cssEffects.hideSnippetById(target.id);
			}
		}
	};

	target.webstrate.on("attributeChanged*",posChangeHandler);
	window._webstrateEvents.push({target: target, type: "attributeChanged*", listener: posChangeHandler});
}

exports.syncWebstrates = syncWebstrates;