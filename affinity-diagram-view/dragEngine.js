let dragEngine = {};
window._listeners = [];
let lastActive; // set z-index
let groupMoveList = []; 
let moveInfo = {};

dragEngine = (target) => {
    //console.log("set DragEngine on: ", target);

    /*
    * for mousedown events & touchstart events
    */
    let startMoveHandler = (event) => {
        console.log("mousedown on snippet detected by ", webstrate.ADQDA.creatorId);
        
        if(event.cancelable){
            event.preventDefault();
            event.stopPropagation();
        }

        function init(target) {
            //for user indicator
            if(!target.classList.contains("moving")) target.classList.add("moving");
        
            //add user indicator
            let username = webstrate.user.username;
            if(username) target.setAttribute("moveby", username);
        
            let indicator = target.querySelectorAll('.userIndicator');
            if(indicator && indicator.length > 0){
                for(let i=0; i<indicator.length; i++){
                    target.removeChild(indicator[i].parentNode);
                }
            }
                
            //add is-pointer-down css effect
            if(dragEngine.getTargetRole(target) === "themeSnippet"){
                webstrate.ADQDA.cssEffects.addPointedBgEffect(target.id, "themeSnippet", "#3BB9FF");
            }
            if(dragEngine.getTargetRole(target) === "textSnippet"){
                console.log("here here");
                webstrate.ADQDA.cssEffects.addPointedBgEffect(target.id, "textSnippet", "#EAC117"); //-> "themeSnippet" in meta
            }
        
            let posX = dragEngine.getAbsoluteBoundingRect(target).left,
            posY = dragEngine.getAbsoluteBoundingRect(target).top;
            
            //check the cssRule on position
            webstrate.ADQDA.cssEffects.addCssRuleOnPosition(target, posX, posY);
        
            ///set up for moving as a group
            // if(dragEngine.getTargetRole(target) === "themeSnippet"){
            //     clusterID = target.id;
            // }else if (dragEngine.getTargetRole(target) === "textSnippet"){
            //     let tag = target.querySelector('span[creator="'+webstrate.creatorId+'"]');
            //     if(tag) clusterID = tag.getAttribute("clusterid");
            // }
        }; //END: init

        if( mouseOn(event) === "snippet" ){

            init(target);
            dragEngine.setActiveZIndex(target);
            if(dragEngine.getTargetRole(target) === "themeSnippet"){
                groupManager(event, target.id);
            }
            //parameters to check whether is longtouch
            let startX, startY, checkX, checkY;

            if(event.type === "mousedown"){
                startX = checkX = event.pageX;
                startY = checkY = event.pageY;
            }else if(event.type === "touchstart"){
                //console.log("---------start-------");
                //console.log(event.touches);
                if(event.touches.length == 1){
                    let touch = event.touches[0] || event.changedTouches[0];
                    startX = checkX = touch.pageX;
                    startY = checkY = touch.pageY;
                }else if(event.touches.length > 1){
                    for(let i=0; i<event.touches.length; i++){
                        let touchtarget = event.touches[i].target;
                        while(!touchtarget.classList.contains("note")){
                            touchtarget = touchtarget.parentNode;
                        }
                        if(touchtarget == target){
                            startX = checkX = event.touches[i].pageX;
                            startY = checkY = event.touches[i].pageY;
                        }
                    }
                }
            } 

            let onlongtouch = () => {
                console.log("onlongtouch");
                //console.log(startX, startY, checkX, checkY);
                if(startX && startY){
                    if( !checkX && !checkY){
                        //no move
                        if(dragEngine.getTargetRole(target) === "themeSnippet"){
                            activateInOutBoxes(target);
                        }
                    }else{
                        let moveDis = Math.sqrt((startX-checkX)*(startX-checkX)+(startY-checkY)*(startY-checkY));
                        console.log(moveDis);
                        if(moveDis < 5){
                            console.log("on really near spot");
                            if(dragEngine.getTargetRole(target) === "themeSnippet"){
                                activateInOutBoxes(target);
                            }
                            //if(type === roleOfSnippet) activateBringnGo();
                        }
                    }
                }
            };

            let touchduration = 1000;
            let timer = setTimeout(onlongtouch, touchduration);

            //use getAbsoluteBoundingRect!!!
            let shiftX = startX - dragEngine.getAbsoluteBoundingRect(target).left;
            let shiftY = startY - dragEngine.getAbsoluteBoundingRect(target).top;

            let moveHandler = (event) => {
                if(event.cancelable){
                    event.preventDefault();
                    event.stopPropagation();
                }
                //move as group if necessary
                if(dragEngine.getTargetRole(target) === "themeSnippet"){
                    groupManager(event, target.id);
                }

                if(event.type === "mousemove"){
                    checkX = event.pageX;
                    checkY = event.pageY;
                } else if(event.type === "touchmove"){
                    //console.log("---------move-------");
                    //console.log(event.touches);

                    if(event.touches.length == 1){
                        let touch = event.touches[0] || event.changedTouches[0];
                        checkX = touch.pageX;
                        checkY = touch.pageY;
                    }else if(event.touches.length > 1){
                        for(let i=0; i<event.touches.length; i++){
                            let touchtarget = event.touches[i].target;
                            while(!touchtarget.classList.contains("note")){
                                touchtarget = touchtarget.parentNode;
                            }
                            //console.log(touchtarget == target);
                            if(touchtarget == target){
                                //console.log(touchtarget);
                                checkX = event.touches[i].pageX;
                                checkY = event.touches[i].pageY;
                            }
                        }
                    }
                } 
            
                //move the snippet 
                webstrate.ADQDA.cssEffects.moveSnippet(target.id, (checkX-shiftX), (checkY-shiftY));
    
                //start clusterEngine
                if(dragEngine.getTargetRole(target) === "textSnippet"){
                    //if(dragEngine.getAbsoluteBoundingRect(target).left > 320){
                        webstrate.ADQDA.clusterEngine(target);
                    //} 
                }

            }; //END: moveHandler

            let underBody = webstrate.ADQDA.dbDoc.querySelector("body"); //for what?

            let endMoveHandler = (event) => {
                //console.log("mouseup detected by ", webstrate.webstrateId);

                if (timer) clearTimeout(timer);

                if(event.cancelable){
                    event.preventDefault();
                    event.stopPropagation();
                }

                if(dragEngine.getTargetRole(target) === "themeSnippet"){
                    groupManager(event, target.id);
                }
    
                target.classList.remove("moving");

                let selectorText = "#"+target.id + '.' + dragEngine.getTargetRole(target);
                webstrate.ADQDA.cssEffects.deleteCssRuleBySelector(selectorText);

                if(event.type === "touchend"){
                    removeListener(underBody, "touchmove");
                    removeListener(underBody, "touchend");

                }else if(event.type === "mouseup"){
                    //remove moveHandler
                    removeListener(underBody, "mousemove");
                    removeListener(underBody, "mouseup");

                }

            };  //END: endMoveHandler

            if(event.type === "touchstart"){
                //change to body
                underBody.addEventListener("touchmove", moveHandler);
                window._listeners.push({target: underBody, type: "touchmove", listener: moveHandler});
            
                underBody.addEventListener("touchend", endMoveHandler);
                window._listeners.push({target: underBody, type: "touchend", listener: endMoveHandler});

            }else if(event.type === "mousedown"){

                underBody.addEventListener("mousemove", moveHandler);
                window._listeners.push({target: underBody, type: "mousemove", listener: moveHandler});

                underBody.addEventListener("mouseup", endMoveHandler);
                window._listeners.push({target: underBody, type: "mouseup", listener: endMoveHandler});
            }
        }
    };  //END: startMoveHandler

    target.addEventListener("mousedown", startMoveHandler);
    window._listeners.push({target: target, type: "mousedown", listener: startMoveHandler});

    target.addEventListener("touchstart", startMoveHandler);
    window._listeners.push({target: target, type: "touchstart", listener: startMoveHandler});

}; //END dragEngine

dragEngine.getAbsoluteBoundingRect = (el) => {

    var doc  = webstrate.ADQDA.dbDoc,
        win  = webstrate.ADQDA.dbWin,
        body = doc.body,

        // pageXOffset and pageYOffset work everywhere except IE <9.
        offsetX = win.pageXOffset !== undefined ? win.pageXOffset :
            (doc.documentElement || body.parentNode || body).scrollLeft,
        offsetY = win.pageYOffset !== undefined ? win.pageYOffset :
            (doc.documentElement || body.parentNode || body).scrollTop,

        rect = el.getBoundingClientRect();

    if (el !== body) {
        var parent = el.parentNode;

        // The element's rect will be affected by the scroll positions of
        // *all* of its scrollable parents, not just the window, so we have
        // to walk up the tree and collect every scroll offset. Good times.
        while (parent !== body) {
            offsetX += parent.scrollLeft;
            offsetY += parent.scrollTop;
            parent   = parent.parentNode;
        }
    }

    return {
        bottom: rect.bottom + offsetY,
        height: rect.height,
        left  : rect.left + offsetX,
        right : rect.right + offsetX,
        top   : rect.top + offsetY,
        width : rect.width
    };
};

function mouseOn(event) {
    if(event.cancelable){
        event.preventDefault();
        event.stopPropagation();
    }

    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();

    let onNode = "";

    if(event.target.nodeName == "I"){
        if(event.target.classList.contains("close")){
            onNode = "close";
            tapOnClose(event.target);
        } else if(event.target.classList.contains("lockGroup")){
            onNode = "lockGroup";
            tapOnLockGroup(event.target);
        } else if (event.target.classList.contains("checkSource")){
            onNode = "checkSource";
            tapOnCheckSource(event.target);
        }else if(event.target.classList.contains("dropin")){
            //console.log("+++++++++++++ dropin ++++++++++++++++");
            tapOnDropIn(event.target);
        }
    }else if(event.target.nodeName === "H3" && event.target.classList.contains("note_title")){
            event.target.focus();
            //SetCaretAtEnd(event.target);
            //setCaretPosition(event.target, event.target.childNodes[0].length);
            onNode = "title";
    }else{
        onNode = "snippet";
    }
    //console.log("on: ", onNode);
    return onNode;
};

function setCaretPosition(elem, caretPos) {
    console.log(elem, caretPos);
    if(elem != null) {
        if(elem.createTextRange) {
            var range = elem.createTextRange();
            range.move('character', caretPos);
            range.select();
        }
        else {
            if(elem.selectionStart) {
                elem.focus();
                elem.setSelectionRange(caretPos, caretPos);
            }
            else
                elem.focus();
        }
    }
};

dragEngine.getTargetRole = (target) => {
    //console.log(target);
    let type = "";

    if(target){
        if(target.hasAttribute('themelevel')){
            type = "themeSnippet";
        } else if (target.classList.contains("textSnippet")) {
            type = "textSnippet";
        }
    }

    return type;
};

function activateInOutBoxes(target){
    let themeid = target.id;
    let inoutBoxes = webstrate.ADQDA.dbDoc.querySelector('.inoutboxes[themeid="'+ themeid +'"]');

    if(inoutBoxes){
        let showstatus = inoutBoxes.getAttribute("transient-display");
        if(inoutBoxes.getAttribute("transient-display") === "show"){
            //switch to hide
            inoutBoxes.setAttribute("transient-display", "hide");
            console.log("hide");
        }else if( !showstatus || inoutBoxes.getAttribute("transient-display") === "hide"){
            //switch to show
            inoutBoxes.setAttribute("transient-display", "show");
            console.log("show");
        }
    }else{
        webstrate.ADQDA.addInOutBoxes(themeid, target);
    }

    //addInOutItems(target);
};


//TODO!!!!
function addInOutItems(target){
    let themeid = target.id;
    let theme = webstrate.ADQDA.dbDoc.querySelector("#"+themeid);
    let inoutBoxes = webstrate.ADQDA.dbDoc.querySelector('transient[themeid="'+ themeid +'"]');
    let inbox, outbox;
    
    if(inoutBoxes && theme){
        inbox = inoutBoxes.querySelector('.inbox');
        outbox = inoutBoxes.querySelector('.outbox');

        //what's the logic for inbox?

        //for outbox
        let removedOnes = theme.querySelectorAll('li[status="removed"]');

        if (outbox.hasChildNodes()) {
            outbox.childNodes.forEach(item => {
                if(item.classList.contains('outBoxItem')) outbox.removeChild(item);
            });
        }

        for(li of removedOnes){
            let snippetid = li.getAttribute("snippetid");
            let outBoxItem = inoutBoxes.querySelector('.outBoxItem[snippetid="'+snippetid+'"]');
            if(!outBoxItem){
                let content = snippetid.replace('snippet', '');
                let $outBoxItem = $('<div class="outBoxItem" snippetid="'+snippetid+'">'+ content +'</div>');
                $outBoxItem .appendTo($(outbox));
            }
        }
    }
};

let shiftList = {};
function groupManager(event, clusterID){

    if(clusterID && groupMoveList.includes(clusterID)){

        //console.log("grouping moving", clusterID);
        //get all textSnippets with the tag of this clusterID
        let group = webstrate.ADQDA.dbDoc.querySelectorAll('.tag[clusterid="'+ clusterID +'"]');

        //console.log(group);
        for(tag of group){
            let snippet;
            if(tag.parentNode.classList.contains("metaTag")){
                snippet = tag.parentNode.parentNode;
            }else if(tag.parentNode.classList.contains("autocomplete")){
                snippet = tag.parentNode.parentNode;
            }else{
                snippet = tag.parentNode;
            }

            if(snippet !== event.currentTarget){
                groupMove(event, clusterID, snippet);
            }
        }
    }
}; // groupManager()

function groupMove(event, clusterID, snippet){
    if(event.type === "mousedown" || event.type === "touchstart"){

        if(dragEngine.getTargetRole(snippet) === "textSnippet"){
            webstrate.ADQDA.cssEffects.addPointedBgEffect(snippet.id, "textSnippet", "#EAC117");
        }
                    
        //caculate the relative positions 
        let startX, startY;
        if(event.type === "mousedown"){

            startX = event.pageX;
            startY = event.pageY;
            
        }else if(event.type === "touchstart"){
            if(event.touches.length == 1){
                let touch = event.touches[0] || event.changedTouches[0];
                startX = touch.pageX;
                startY = touch.pageY;
            }else if(event.touches.length > 1){
                
                for(let i=0; i<event.touches.length; i++){
                    let touchtarget = event.touches[i].target;
                    while(!touchtarget.classList.contains("note")){
                        touchtarget = touchtarget.parentNode;
                    }
                    if(dragEngine.getTargetRole(touchtarget) === "themeSnippet"){
                        if(touchtarget.id === clusterID){
                            startX = event.touches[i].pageX;
                            startY = event.touches[i].pageY;
                        }
                    }
                }

            }  
        }
        //!! getBoundingClientRect bug when scrolled 
        //use getAbsoluteBoundingRect(elm)!!!!!!
        let shiftX = startX - dragEngine.getAbsoluteBoundingRect(snippet).left;
        let shiftY = startY - dragEngine.getAbsoluteBoundingRect(snippet).top;

        shiftList[snippet.id] = {shiftX: shiftX, shiftY: shiftY};

    } else if (event.type === "mouseup" || event.type === "touchend") {

        let selector = "#" + snippet.id + '.' + dragEngine.getTargetRole(snippet);
        webstrate.ADQDA.cssEffects.deleteCssRuleBySelector(selector);

    } else if (event.type === "mousemove" || event.type === "touchmove") {

        let checkX, checkY;
        if(event.type === "mousemove"){
            checkX = event.pageX;
            checkY = event.pageY;
        }else if(event.type === "touchmove"){
            if(event.touches.length == 1){
                let touch = event.touches[0] || event.changedTouches[0];
                checkX = touch.pageX;
                checkY = touch.pageY;
            }else if(event.touches.length > 1){
                // move multiple group in the same time 
                for(let i=0; i<event.touches.length; i++){
                    let touchtarget = event.touches[i].target;
                    while(!touchtarget.classList.contains("note")){
                        touchtarget = touchtarget.parentNode;
                    }
                    if(dragEngine.getTargetRole(touchtarget) === "themeSnippet"){
                        if(touchtarget.id === clusterID){
                            checkX = event.touches[i].pageX;
                            checkY = event.touches[i].pageY;
                        }
                    }
                }

            }
        } 

        let newX = checkX - shiftList[snippet.id].shiftX;
        let newY = checkY - shiftList[snippet.id].shiftY;
        webstrate.ADQDA.cssEffects.moveSnippet(snippet.id, newX, newY);
    }
}; //groupMove


function tapOnDropIn(elm){
    //get inbox 
    let inbox = elm.parentNode;
    let right = dragEngine.getAbsoluteBoundingRect(inbox).right;
    let bottom = dragEngine.getAbsoluteBoundingRect(inbox).bottom;
    let gapX = 30;
    let gapY = 200; 

    let inboxItems = inbox.querySelectorAll(".inBoxItem");
    console.log(inboxItems.length + " in InBox");

    inboxItems.forEach( (item) => {
        let snippetid = item.getAttribute("snippetid");
        if(snippetid){
            let snippet = webstrate.ADQDA.dbDoc.getElementById(snippetid);
            if(snippet){
                console.log(snippet);
                webstrate.ADQDA.cssEffects.moveSnippet(snippetid, right+gapX, bottom+gapY);
				webstrate.ADQDA.cssEffects.appearSnippetById(snippetid);
				webstrate.ADQDA.dragEngine.setActiveZIndex(snippet);
				//(id, newX, newY)

				//delte the thumbnail in in/out box
				item.parentNode.removeChild(item);

                gapY = 400;
				
				//let pos = webstrate.ADQDA.diagramDBDoc.querySelector("#"+snippetid);
				//if(pos) pos.setAttribute("display", "show");
            }
        }
    });

}

function tapOnClose(elm){
    let node = elm.parentNode;
    let id = node.id;

    let pos = webstrate.ADQDA.diagramDBDoc.getElementById(id);
    
    if(dragEngine.getTargetRole(node) === "textSnippet"){
        if(pos){
            pos.setAttribute("display", "hide");
            webstrate.ADQDA.cssEffects.hideSnippetById(id);
        }
        //remove the tags if has any, for coding-tool
        let tag = node.querySelector('span.tag[creator='+ webstrate.ADQDA.creatorId +']');
        if(tag) node.removeChild(tag);

    }else if (dragEngine.getTargetRole(node) === "themeSnippet") {
        removeTagsByClusterID(id);
        $(elm).parent().remove();
        if(pos) pos.parentNode.removeChild(pos);
    }
};

function tapOnLockGroup(elm){
    console.log("lockGroup");
    $(elm).toggleClass("far fas");
    let group = $(elm).hasClass("fas");

    if(group){
        groupMoveList.push(elm.parentNode.id);
    }else{
     let index = groupMoveList.indexOf(elm.parentNode.id);
     if (index > -1) {
         groupMoveList.splice(index, 1);
     }
    }
    console.log(groupMoveList);
};

function tapOnCheckSource(elm){
    console.log("checkSource");
    let snippet = elm.parentNode;
    let userlist = snippet.querySelector('.userList');

    let closeList = () => {
        elm.classList.remove("checking");
        if(userlist && userlist.parentNode.tagName === "TRANSIENT"){
            snippet.removeChild(userlist.parentNode);
        }
    }

    let openSource = (e) => {
        e.preventDefault();
        e.stopPropagation();
        let user = e.currentTarget.getAttribute("user");
        let examineSourceOn = "ipad-"+user;
        console.log(examineSourceOn);
        //just change something to inform the click to ipads
        let ID = () => {return '_' + Math.random().toString(36).substr(2, 9);}
        snippet.setAttribute("examine", ID());

        snippet.setAttribute("examineSourceOn", examineSourceOn);
        
        closeList();
    }

    if(!elm.classList.contains("checking")){
        elm.classList.add("checking");

        if(!userlist){
            //create
            let $transient = $('<transient></transient>');
            let $list = $('<div class="userList"></div>');
            $list.appendTo($transient);
    
            let $userA = $('<a class="userItem" user="jiali">Jiali</a>');
            let $userB = $('<a class="userItem" user="james">James</a>');
            //let $userC = $('<a class="userItem" user="zhuoming" >Zhuoming</a>');
            let $all = $('<a class="userItem" user="all">All</a>');

            $userA.on("touch click", openSource);
            $userB.on("touch click", openSource);
            //$userC.on("touch click", openSource);
            $all.on("touch click", openSource);

            $userA.appendTo($list);
            $userB.appendTo($list);
            //$userC.appendTo($list);
            $all.appendTo($list);
    
            $transient.appendTo($(snippet));
            userlist = $list[0];
        }else{
            //set lisners
            let users = userlist.querySelectorAll('.userItem');
            users.forEach(user => {
                console.log(user);
                user.on("touch click", openSource);
            });
        }

        dragEngine.setActiveZIndex(userlist);

    }else{
        closeList();
    }
};

function removeTagsByClusterID(id){
    let tags = webstrate.ADQDA.dbDoc.querySelectorAll('span.tag[clusterid="'+id+'"]');
	if(tags){
		for(tag of tags){
            if(tag.parentNode.classList.contains('metaTag')){
                tag.parentNode.parentNode.removeChild(tag.parentNode);
            }else if(tag.parentNode.classList.contains('autocomplete')){
                //console.log(tag);
                tag.parentNode.parentNode.removeChild(tag.parentNode);
            }else if(tag.parentNode.classList.contains('textSnippet')){
                tag.parentNode.removeChild(tag);
            }
		}
	}
};

function removeListener(target, removeType){
	if(window._listeners){
		for(let index = 0; index < window._listeners.length; index++){
			let item = window._listeners[index];
			let listentarget = item.target;
			let listentype = item.type;
			let listener = item.listener;
			if(listentarget === target && listentype === removeType){
				target.removeEventListener(listentype, listener);
				window._listeners.splice(index,1);
			}
		}
	}
};

dragEngine.setActiveZIndex = (elem) => {
    if (lastActive != elem) {
        $(lastActive).css('z-index', $(lastActive).css('z-index') - 1);
    }
    lastActive = elem;
    $(elem).css('z-index', 999);
};

exports.dragEngine = dragEngine;