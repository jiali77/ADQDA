//linkEngine, depends on generateEngine 
let linkEngine = {};
let _listeners = [];

linkEngine = () => {
    console.log("start linkEngine");
    let svg = document.querySelector('svg');
    if(!svg){
        let $svg = $('<svg id="svg-links" xmlns="http://www.w3.org/2000/svg"></svg>');
        $svg.css("z-index", "100");
        $svg.appendTo($(document.querySelector('body')));
    }

    let highlights = webstrate.Coding.transcriptDoc.querySelectorAll('span.highlight');
    if(highlights && highlights.length > 0){
        //console.log(highlights);
        highlights.forEach(highlight => {
            linkEngine.longtouchEvent(highlight);
            //linkEngine.highlightHandlers(highlight);
        });
    }

    webstrate.Coding.transcriptFrame.contentWindow.onscroll = e => {
        //console.log("transcriptFrame onscroll");
        updatelink();
    };

    webstrate.Coding.frameDB.contentWindow.onscroll = e => {
        //console.log("frameDB onscroll");
        updatelink();
    };
};

linkEngine.tagList =[];

linkEngine.highlightHandlers = function(highlight){
    let id = highlight.id.replace("highlight", "");

    let tooltipOnHighlight = (event) => {
        event.preventDefault();
        event. stopPropagation();

        let snippet = webstrate.Coding.dbDoc.querySelector("#snippet"+id);
        let tooltip = highlight.querySelector('.tooltip');
        let themeContent =[];

        if(snippet){
            let metaTags = snippet.querySelectorAll('span.metaTag');
            if(metaTags && metaTags.length > 0){
                metaTags.forEach(metaTag => {

                    let metaContent = metaTag.getAttribute("content");;
                    let tag = metaTag.querySelector('.tag');
                    let content = tag.getAttribute("content");
                    let creator = tag.getAttribute("creator");
                    if(creator === "") creator = "unknown";

                    themeContent.push({
                        content: creator + ": " + metaContent + ">" + content
                    });
                    linkEngine.tagList.push(tag);

                });
            }

            let tags = snippet.querySelectorAll('span.tag');
            if(tags && tags.length > 0){
                tags.forEach(tag => {
                    if(linkEngine.tagList.includes(tag)){
                        //console.log("already showed", tag);
                    }else{
                        let content = tag.getAttribute("content");
                        let creator = tag.getAttribute("creator");
                        if(creator === "") creator = "unknown";
                        
                        themeContent.push({
                            content: creator + ": " +content
                        });
                    }

                });

            }else{
                //there is no theme 
                if(tooltip) tooltip.parentNode.removeChild(tooltip);
            }
            

            //console.log(themeContent);
            if(themeContent.length > 0){
                let $ul = $('<ul></ul>');
                for(let i=0; i< themeContent.length; i++){
                    let $li = $('<li>'+ themeContent[i].content +'</li>');
                    $li.appendTo($ul);
                }
                if(!tooltip){
                    let $tooltip = $('<span class="tooltip"></span>');
                    $ul.appendTo($tooltip);
                    $tooltip.appendTo($(highlight));
                }else{
                    tooltip.removeChild(tooltip.querySelector('ul'));
                    $ul.appendTo($(tooltip));
                }
            }

        }
    };

    $(highlight).on("mouseover", tooltipOnHighlight);
    linkEngine.longtouchEvent(highlight);

};

linkEngine.currentMapId;

linkEngine.ref = function(target){
    //console.log("here here");
    removeAllLinks();
    removeAllEmphasize();
    
    let mapId, highlight, snippet;
    //let ID = () => {return '_' + Math.random().toString(36).substr(2, 9);}

    if(target.classList.contains("textSnippet")){
        snippet = target;
        mapId = target.id.replace("snippet", '');
        highlight = webstrate.Coding.transcriptDoc.getElementById('highlight'+mapId);

        let url = snippet.getAttribute("url");
        if(webstrate.Coding.transcriptFrame.src !== url){
            console.log("need to change transctiption");
            webstrate.Coding.transcriptFrame.src = url;
            //add indicator 
        }
    }else if(target.classList.contains("highlight")){
        highlight = target;
        mapId = target.id.replace("highlight", '');
        snippet = webstrate.Coding.dbDoc.getElementById('snippet'+mapId);
    }

    linkEngine.currentMapId = mapId;

    if(!highlight || !snippet){
        alert("Sorry, can not find reference anymore!");
    }else{

        addEmphasize(highlight, snippet);

        let transcriptBox = webstrate.Coding.transcriptFrame.getBoundingClientRect();
        let dbBox = webstrate.Coding.frameDB.getBoundingClientRect();
        let snippetBox = snippet.getBoundingClientRect();
        let highlightBox = highlight.getBoundingClientRect();

        if(target === snippet ){
            console.log(highlightBox.bottom, transcriptBox.bottom);

            if(highlightBox.bottom > (transcriptBox.bottom-transcriptBox.top-10) || highlightBox.top < 5){
                //need to scroll
                webstrate.Coding.transcriptFrame.contentWindow.scroll(0, highlight.offsetTop-transcriptBox.height/2);
                //scrollStop(drawlink);
                setTimeout(drawlink(highlight.getBoundingClientRect(), snippetBox, mapId),100);
                //setTimeout(drawlink, 300);
            }else{
                drawlink(highlightBox, snippetBox, mapId);
            }
        }else if(target === highlight){
            console.log(snippetBox.top);
            if(snippetBox.bottom > (dbBox.bottom-dbBox.top-10) ||  snippetBox.top < 5){
                webstrate.Coding.frameDB.contentWindow.scroll(0, snippet.offsetTop-dbBox.height/2);
                setTimeout(drawlink(highlightBox, snippet.getBoundingClientRect(), mapId),100);
            }else{
                drawlink(highlightBox, snippetBox, mapId);
            }
        }
    }
};

function drawlink(highlightBox, snippetBox, mapId) {
    let svglinks = document.getElementById("svg-links");
    let transcriptBox = webstrate.Coding.transcriptFrame.getBoundingClientRect();
    let dbBox = webstrate.Coding.frameDB.getBoundingClientRect();
            
    let startX, startY, endX, endY;

    //start from highlight content
    startX = highlightBox.left + highlightBox.width/2 + transcriptBox.left;
    startY = transcriptBox.top + highlightBox.bottom;

    //end in snippet
    endX = dbBox.left + snippetBox.left + 10;
    endY = dbBox.top + snippetBox.top + snippetBox.width/2 + 10;

    let link = document.getElementById('link'+mapId);
    // //if link (bezier curve) not exist, build bezier curve(link)
    if(!link){
        let gapW = Math.ceil((endX-startX)/2) + startX;

        let link = document.createElementNS("http://www.w3.org/2000/svg","path");
        link.id = 'link'+mapId;
        link.className = "link";
        link.style.fill = "none";
        link.style.stroke = "blue";
        $(link).css("stroke-width", "2px");

        if(endY >= startY){
            var gapH = Math.ceil((endY-startY)/4);

            var curve = 'M'+ startX + ' ' + startY + ' Q' + gapW +' ' + (startY+gapH) + ', '
            + gapW + ' ' + (startY+2*gapH) +' T' + endX + ' ' + endY;
            //console.log("curve "+curve);
        }else{
            var gapH = Math.ceil((startY - endY)/3);

            var curve = 'M'+ startX + ' ' + startY + ' Q' + gapW +' ' + (startY-gapH) + ', '
            + gapW + ' ' + (startY-2*gapH) +' T' + endX + ' ' + endY;
            //console.log("curve "+curve);
        }

        link.setAttribute("d", curve);

        //if(svglinks && svglinks.querySelector('transient')){
        //     $(link).appendTo($(svglinks.querySelector('transient')));
        // }
        
        svglinks.appendChild(link);
        //console.log(link);
    }
}; //END drawlink

function updatelink(){
    let mapId = linkEngine.currentMapId;
    let snippet = webstrate.Coding.dbDoc.querySelector("#snippet"+mapId);
    let highlight = webstrate.Coding.transcriptDoc.querySelector("#highlight"+mapId);
    let link = document.getElementById('link'+mapId);

    if(link && snippet && highlight){
        link.parentNode.removeChild(link);
        let highlightBox = highlight.getBoundingClientRect();
        let snippetBox = snippet.getBoundingClientRect();
        drawlink(highlightBox, snippetBox, mapId);
    }
};

linkEngine.deRef = function(target){
    let mapId, highlight, snippet; 
    //let ID = () => {return '_' + Math.random().toString(36).substr(2, 9);}
    if(target.classList.contains("textSnippet")){
        snippet = target;
        mapId = target.id.replace("snippet", '');
        highlight = webstrate.Coding.transcriptDoc.getElementById('highlight'+mapId);
    }else if(target.classList.contains("highlight")){
        highlight = target;
        mapId = target.id.replace("highlight", '');
        snippet = webstrate.Coding.dbDoc.getElementById('snippet'+mapId);
    }

    if(highlight && snippet){
        //sourceContent.classList.remove("border");
        let borderStatus = highlight.getAttribute("transient-border");
        if(!borderStatus || borderStatus === "true"){
            highlight.setAttribute("transient-border", "false");
        }
        //snippet.setAttribute("examine", ID());
        snippet.setAttribute("onExamine", "false");
        changeBgColor(snippet.id, "#FFF380");
    }

    let link = document.getElementById('link'+mapId);
    if(link){
        link.parentNode.removeChild(link);
    }

};

linkEngine.longtouchEvent = (target) => {
    //console.log("longtouchEvent");
    let longtouch = false;

    let mousedownHandler = (event) => {
        //console.log("mousedown detected");

        if(event.cancelable){
            event.preventDefault();
            event.stopPropagation();
        }
        let node =  mouseOn(event);

        if( node === "snippet" ||  node === "highlight"){
            //parameters to check whether is longtouch
            let startX, startY, checkX, checkY;
            if(event.type === "touchstart"){
                let touch = event.touches[0] || event.changedTouches[0];
                startX = checkX = touch.pageX;
                startY = checkY = touch.pageY;
            }else if(event.type === "mousedown"){
                startX = checkX = event.pageX;
                startY = checkY = event.pageY;
            }

            let onlongtouch = () => {
                console.log("onlongtouch");
                //console.log(startX, startY, checkX, checkY);
                if(startX && startY && checkX && checkY){
                    //allow slightly touchmove on the wall
                    let moveDis = Math.sqrt((startX-checkX)*(startX-checkX)+(startY-checkY)*(startY-checkY));
                    //console.log(moveDis);
                    if(moveDis < 5){
                        //console.log("on really near spot");
                        longtouch = true;
                        let linkId, link;
                        if(node === "snippet") linkId = target.id.replace("snippet", "link");
                        if(node === "highlight") linkId = target.id.replace("highlight", "link");
                        link = document.querySelector("#"+linkId);
                        if(link){
                            webstrate.Coding.linkEngine.deRef(target);
                        }else{
                            webstrate.Coding.linkEngine.ref(target);
                        }
                        
                    }
                }
            };

            let touchduration = 500;
            let timer = setTimeout(onlongtouch, touchduration);

            let mouseupHandler = (event) => {
                //console.log("mouseup detected by ", webstrate.webstrateId);
                if(event.cancelable){
                    event.preventDefault();
                    event.stopPropagation();
                }
                if (timer) clearTimeout(timer);

                //if(longtouch) webstrate.linkEngine.deRef(target);
                
                if(event.type === "touchend"){
                    removeListener(target, "touchend");
                }else if(event.type === "mouseup"){
                    //remove mousemoveHandler
                    removeListener(target, "mouseout");
                    removeListener(target, "mouseup");
                }
            };  //END: mouseupHandler

             //mousedown triggers the mousemoveHandler
             if(event.type === "touchstart"){
                target.addEventListener("touchend", mouseupHandler);
                _listeners.push({target: target, type: "touchend", listener: mouseupHandler});
            }else if(event.type === "mousedown"){
                //both mouseout & mouseup trigger the mouseupHandler
                target.addEventListener("mouseout", mouseupHandler);
                _listeners.push({target: target, type: "mouseout", listener: mouseupHandler});
                target.addEventListener("mouseup", mouseupHandler);
                _listeners.push({target: target, type: "mouseup", listener: mouseupHandler});
            }
        }
    }; //END: mousedownHandler

    target.addEventListener("touchstart", mousedownHandler);
    _listeners.push({target: target, type: "mousedown", listener: mousedownHandler});

    target.addEventListener("mousedown", mousedownHandler);
    _listeners.push({target: target, type: "mousedown", listener: mousedownHandler});
};

function removeListener(target, removeType){
	if(_listeners){
		for(let index = 0; index < _listeners.length; index++){
			let item = _listeners[index];
			let listentarget = item.target;
			let listentype = item.type;
			let listener = item.listener;
			if(listentarget === target && listentype === removeType){
				target.removeEventListener(listentype, listener);
				_listeners.splice(index,1);
			}
		}
	}
};

function mouseOn(event) {
    let onNode = "";
    let target = event.target;
    if (document.activeElement instanceof HTMLElement){
        document.activeElement.blur();
    } 

    if(target.nodeName == "I"){
        if(target.classList.contains("close")){
            let id = target.parentNode.id;
            webstrate.Coding.generateEngine.deleteHighlight(id);
            $(target).parent().remove();
            onNode = "close";
        } 
    }else if(target.nodeName == "DIV" && target.classList.contains("textSnippet")){
        onNode = "snippet";
    }else if(target.nodeName == "SPAN" && target.classList.contains("highlight")){
        onNode = "highlight";
    }

    console.log("on: ", onNode);
    return onNode;
};

function addEmphasize(highlight, snippet){

    let borderStatus = highlight.getAttribute("transient-border");
    if(!borderStatus || borderStatus === "false"){
        highlight.setAttribute("transient-border", "true");
    }
    changeBgColor(snippet.id, "orange");
    snippet.setAttribute("onExamine", "true");
};

function removeAllLinks() {
    let svglinks = document.getElementById("svg-links");
    while(svglinks.firstChild){
        svglinks.removeChild(svglinks.firstChild);
    }
};

function removeAllEmphasize(){
    let borders = webstrate.Coding.transcriptDoc.querySelectorAll('.highlight[transient-border="true"]');
    if(borders && borders.length>0){
        for(border of borders){
            border.setAttribute("transient-border", false);
        }
    }
    let emphasiezeSnippets = webstrate.Coding.dbDoc.querySelectorAll('.textSnippet[onexamine="true"]');
    if(emphasiezeSnippets && emphasiezeSnippets.length>0){
        for(snippet of emphasiezeSnippets){
            changeBgColor(snippet.id, "#FFF380");
            snippet.setAttribute("onExamine", "false");
        }
    }

};

function changeBgColor(selectorTextId, color) {
    console.log(color);
    let already = false;
    let styleSheet = webstrate.Coding.dbDoc.styleSheets[0];
    let CSSRuleList = styleSheet.cssRules;
    for(const rule of CSSRuleList){
        if(rule.selectorText === "#"+selectorTextId){
            //already exists
            already = true;
            rule.style.background = color;
            console.log(rule);
        }
    }
    if(!already){
        let colorRule = '#' + selectorTextId + ' { background: '+ color + '}';
        console.log(colorRule);
        styleSheet.insertRule(colorRule, 0);
    }
};

exports.linkEngine = linkEngine;
