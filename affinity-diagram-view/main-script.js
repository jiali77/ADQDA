await wpm.requireExternal("https://code.jquery.com/jquery-3.4.1.slim.min.js"); 

await wpm.requireExternal("https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js"); 

var bootstrap = cQuery('<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">');
cQuery(document.head).append(bootstrap);

var fontawesome = cQuery('<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.2/css/all.css" integrity="sha384-oS3vJWv+0UjzBfQzYUhtDYW+Pj2yciDJxpsK1OYPAYjqT085Qq/1cq5FLXAZQ7Ay" crossorigin="anonymous">');
cQuery(document.head).append(fontawesome);


let diagramDBDoc, dbWin, dbDoc, creatorId;

webstrate.on("loaded", function(webstrateId, clientId, user) {
    //console.log("loaded: ", webstrateId);
    
    webstrate.ADQDA = {
        diagramDBDoc: undefined,
        dbWin: undefined,
        dbDoc: undefined,
        creatorId: undefined,

        hideTagList: [],
        hideMetaTagList: [],

        cssEffects: undefined,
        dragEngine: undefined,
        clusterEngine: undefined,
        snippetCreation: undefined,
        syncWebstrates: undefined,
    };

    initAffinity(); //setup the database and <pos> list
    
    let diagramDB = document.querySelector('#source');

    if(diagramDB){
        diagramDB.webstrate.on("transcluded", function(webstrateId, clientId, user) {
        //when database finish loading 
        console.log("affinity-diagram-view transcluded: ", webstrateId);
        // get the document of the database 
        diagramDBDoc = diagramDB.contentWindow.document; 
        webstrate.ADQDA.diagramDBDoc = diagramDBDoc;

        creatorId = webstrateId;
        webstrate.ADQDA.creatorId = creatorId;

        let pileInfo = diagramDBDoc.querySelector('#pileInfo');
        if(!pileInfo){
            let $pileInfo = $('<div id="pileInfo" pileSnippetNum="0" pileThemeNum="0"></div>');
            $pileInfo.appendTo($(diagramDBDoc.querySelector('body')));
        }else{
            //update when loaded
            let pileSnippetNum = 0;
            let posNodes = diagramDBDoc.querySelectorAll('pos');

            for (let i = 0; i < posNodes.length; i++) {
                let pos = posNodes[i];
                if(pos.id.includes("snippet")){

                    if(pos.getAttribute("display") === "hide") continue;
                    if(parseInt(pos.getAttribute("x")) > 320) continue;

                    pileSnippetNum++;
                }
            }

            //console.log(pileSnippetNum);
            pileInfo.setAttribute("pileSnippetNum", pileSnippetNum);
        }

        let dbIframe = diagramDBDoc.getElementById('source');
        if(dbIframe){
            dbIframe.webstrate.on("transcluded", function(webstrateId, clientId, user) {
                dbWin = dbIframe.contentWindow;
                dbDoc = dbWin.document; 
                webstrate.ADQDA.dbWin = dbWin;
                webstrate.ADQDA.dbDoc = dbDoc;

                /*
                *  Step1: insert the css rules to db
                */
                initStyle();

                /*
                *  Step2: set drag listeners to all the snippets in db
                *       & set double click listener on body for creating themes
                */
                initLiseners();

                /*
                *  Step3: use webstrate events to handle dynamic changes after the Initialization
                */
                initWebstratesSync();

            });
        }

        });
    }

});

function initAffinity(){
    //active search bar 
    let searchBar = document.querySelector("#searchBar");
    let input = searchBar.querySelector("input");
    if(searchBar && input){
        input.addEventListener("keydown", function(e) {
            if (e.keyCode == 13) { //ENTER key
                e.preventDefault();
                doSearch(input.value);
            }
        });
    }

}

function doSearch(query) {
    let matches = query.match(/".*?"|\S+/g);
    
    let searchTerms = [];
    let tagTerms = [];
    
    if(matches != null) {
        matches.forEach((match)=>{
            if(match.indexOf("#") == 0) {
                tagTerms.push(match.replace("#", "").toLowerCase());
            } else {
                searchTerms.push(match.replace(/\"/g, "").toLowerCase());
            }
        });
    }
    
};

function initLiseners(){
    setLisenersOnNote();
    setLisenersOnBody();
};

async function setLisenersOnNote(){
    let dragEngineFrag = await Fragment.one("#dragEngine").require();
    let dragEngine = dragEngineFrag.dragEngine;
    webstrate.ADQDA.dragEngine = dragEngine;

    let clusterEngineFrag = await Fragment.one("#clusterEngine").require();
    let clusterEngine = clusterEngineFrag.clusterEngine;
    webstrate.ADQDA.clusterEngine = clusterEngine;

    let themeSnippets = dbDoc.querySelectorAll('.themeSnippet[creator="'+ creatorId +'"]');
    themeSnippets.forEach((theme) => {

        dragEngine(theme);
        clusterEngine.realtimeUpdate(theme);
        // let inBoxItems = theme.querySelectorAll(".inBoxItem");
        // for(inBoxItem of inBoxItems){
        //     syncWebstrates.inOutItemHandler(inBoxItem);
        // }
        // let outBoxItems = theme.querySelectorAll(".outBoxItem");
        // for(outBoxItem of outBoxItems){
        //     syncWebstrates.inOutItemHandler(outBoxItem);
        // }
    });
    let textSnippets = dbDoc.querySelectorAll(".textSnippet");
    textSnippets.forEach((snippet) => {
        dragEngine(snippet);
    });
};

async function setLisenersOnBody(){
    let snippetsCreationFrag = await Fragment.one("#snippetsCreation").require();
    let ThemeSnippet = snippetsCreationFrag.ThemeSnippet;

    //set listeners on the body for doubleclick events
    let frameBody =  dbDoc.querySelector("body");

    var timeout;
    var lastTap = 0;

    $(frameBody).on('touchend click',function(event){
        var currentTime = new Date().getTime();
        var tapLength = currentTime - lastTap;        

        event.preventDefault();
        clearTimeout(timeout);

        if(tapLength < 200 && tapLength > 0){

            //Double Tap/Click
            console.log("Double Tap/Click");
            if(event.target !== frameBody){
            console.log("stopping");
            }else {
                let x, y;
                console.log(event.type);
                if(event.type === "touchend"){
                    let touch = event.touches[0] || event.changedTouches[0];
                    x = touch.pageX;
                    y = touch.pageY;
                }else if(event.type === "click"){
                    x = event.pageX;
                    y = event.pageY;
                }
                console.log(x,y);
                new ThemeSnippet(x, y);
            }

        }else{
            //console.log("Single Tap/Click");
            //Single Tap/Click
            timeout = setTimeout(function(){
                //Single Tap/Click code here

                clearTimeout(timeout); 
            }, 200);
        }
        lastTap = currentTime;
    });
};

/*
*  insert the css rules to db
*/
async function initStyle(){
    // basic rules on background color,size, etc
    let cssEffectsFrag = await Fragment.one("#cssEffects").require();
    let cssEffects = cssEffectsFrag.cssEffects;

    webstrate.ADQDA.cssEffects = cssEffects;

    cssEffects.initDBStyle();

	//if the position info already stored in this AD,
	//then use the stored info in <pos> element to set initial position
	let posElements = diagramDBDoc.querySelectorAll("pos");
	if(posElements){
		for (const pos of posElements) {
            if(pos.getAttribute("x") && pos.getAttribute("y")){
                cssEffects.addCssRuleOnPosition(pos, pos.getAttribute("x"), pos.getAttribute("y"));
            }
            if(pos.getAttribute("display") === "hide" && pos.getAttribute("id")){
                cssEffects.hideSnippetById(pos.getAttribute("id"));
            }
		}
    }
    
    //use css to hide irrelevant themeSnippets(themes in other Ads, themes from meta AD)
    let themeSnippets = dbDoc.querySelectorAll(".themeSnippet");
	if(themeSnippets){
		for(const snippet of themeSnippets){
			if(snippet.getAttribute("creator") !== creatorId){
                cssEffects.hideSnippetById(snippet.id);
			}
		} 
    }
    
    //use css to hide closed textSnippets
	let hiddenSnippets = dbDoc.querySelectorAll('.textSnippet[display='+ "hide" +']');
	if(hiddenSnippets){
		for(const snippet of hiddenSnippets){
			//if(snippet.getAttribute("creator") !== webstrate.webstrateId){
                cssEffects.hideSnippetById(snippet.id);
			//}
		} 
	}

	//use css rules to hide irrelevant tags on snippets (tags from other ADs)
	let tags = dbDoc.querySelectorAll("span.tag");
	if(tags){
		for(const tag of tags){
			if(tag.getAttribute("creator") !== creatorId){
                let clusterid = tag.getAttribute("clusterid");
				if(!webstrate.ADQDA.hideTagList.includes(clusterid)) webstrate.ADQDA.hideTagList.push(clusterid);
			}
        }
        //console.log(webstrate.hideTagList);
		for(let i=0; i<webstrate.ADQDA.hideTagList.length; i++){
            cssEffects.hideTagByClusterId(webstrate.ADQDA.hideTagList[i]);
		}
    }
    
    let metaTags = dbDoc.querySelectorAll("span.metaTag");
		if(metaTags){
		for(const metatag of metaTags){
            let tag = metatag.querySelector('.tag');
			if(tag && tag.getAttribute("creator") !== creatorId){
                let metaClusterid = metatag.getAttribute("metathemeid");
				if(!webstrate.ADQDA.hideMetaTagList.includes(metaClusterid)) webstrate.ADQDA.hideMetaTagList.push(metaClusterid);
			}
        }
        
		for(let i=0; i<webstrate.ADQDA.hideMetaTagList.length; i++){
            cssEffects.hideMetaTagByClusterId(webstrate.ADQDA.hideMetaTagList[i]);
		}
    }
    

	//hide the showGroup icon
	// let showGroupIcons = webstrate.dbDoc.querySelectorAll("i.showGroup");
	// if(showGroupIcons.length !== 0){
    //     let display = 'i.showGroup { display: none;}';
    //     console.log(display);
	// 	webstrate.dbDoc.styleSheets[0].insertRule(display, 0);
    // }
}

async function initWebstratesSync(){
    let syncWebstratesFrag = await Fragment.one("#syncWebstrates").require();
    webstrate.ADQDA.syncWebstrates = syncWebstratesFrag.syncWebstrates;
    webstrate.ADQDA.syncWebstrates(); 
}


