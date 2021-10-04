// databaseEngine, depends on linkEngine syncWebstrates

let databaseEngine = {};
let ID = () => { return '_' + Math.random().toString(36).substr(2, 9); };

databaseEngine = () => {
    console.log("start databaseEngine");

    let textSnippets = webstrate.Coding.dbDoc.querySelectorAll('.textSnippet');
   
    textSnippets.forEach(snippet => {
        databaseEngine.snippetHandlers(snippet);
    });

    databaseEngine.themes = [];
    databaseEngine.diagrams = [];

    //init databaseEngine.themes/diagrams
    let themeSnippets = webstrate.Coding.dbDoc.querySelectorAll('.themeSnippet[themelevel="0"]');
    themeSnippets.forEach(theme => {
        let id = theme.id;
        let creator = theme.getAttribute("creator");
        let content = theme.querySelector('.note_title').innerText;

        if(id && creator && content){
            let found = databaseEngine.themes.filter(dict => dict.themeID === theme.id).length
            if(found === 0){
                let dictionary = {
                    themeID: id,
                    creator: creator,
                    themeContent: content
                }
                databaseEngine.themes.push(dictionary);
            }
            if(!databaseEngine.diagrams.includes(creator)){
                databaseEngine.diagrams.push(creator);
            }
            webstrate.Coding.syncWebstrates.realtimeUpdate(theme);
        }
    });

    let autocompletes = webstrate.Coding.dbDoc.querySelectorAll('.autocomplete');
    autocompletes.forEach(auto => {
        databaseEngine.setAutocompleteHandler(auto);
    });

    let tags = webstrate.Coding.dbDoc.querySelectorAll('.tag');
    tags.forEach(tag => {
        if(tag) databaseEngine.addTooltip(tag);
    });

    let frameBody =  webstrate.Coding.dbDoc.querySelector("body");

    let dbClicknTapHandler = function(event) {
        //console.log("doubletap");

        event.preventDefault();
        event.stopPropagation();
        
        if(event.target.classList.contains("textSnippet")){
            createTagOnSnippet(event.target);
        }
    };

    frameBody.addEventListener('doubletap', dbClicknTapHandler);
    frameBody.addEventListener('dblclick', dbClicknTapHandler);

};

databaseEngine.snippetHandlers = function(snippet){

    webstrate.Coding.linkEngine.longtouchEvent(snippet);
};

function deleteCssRuleBySelector(selector){
    let CSSRuleList = webstrate.Coding.dbDoc.styleSheets[0].cssRules;
    let index = 0;
    for(const rule of CSSRuleList){
        if(rule.selectorText === selector){
            //already exists
            webstrate.Coding.dbDoc.styleSheets[0].deleteRule(index);
        }
        index++;
    }
}; 

function createTagOnSnippet(snippet){
    console.log("create tag");

    let $autocomplete = $('<div class="autocomplete"></div>');
    let $tag = $('<span class="tag" onsnippet="'+ snippet.id +'" creator="" clusterid="" content=""></span>');
    let $close = $('<span class="delete fas fa-times fa-sm"></span>');
    $tag.appendTo($autocomplete);
    $close.appendTo($autocomplete);
    //$close.appendTo($tag);
    $autocomplete.appendTo($(snippet));
    WPMv2.stripProtection($autocomplete[0]);

    databaseEngine.setAutocompleteHandler($autocomplete[0]);
    //fix me
    //databaseEngine.addTooltip($tag[0]);

    //new Tag(snippet, $autocomplete.get(0)); //test
}

databaseEngine.setAutocompleteHandler = (auto) => {
    $(auto).on("click touchend", (e) => {
        
        if(e.target.classList.contains("delete")){
            let auto = e.target.parentNode; 
            //loop until auto is out most : autocomplate
            while(!auto.classList.contains("autocomplete")){
                auto = auto.parentNode;
            }
            auto.parentNode.removeChild(auto);
        }else if(e.target.classList.contains("tag")){
            //console.log("focus");
            e.target.setAttribute("contenteditable", "true");
            e.target.focus();
        }
        
        //let tooltip = tag.querySelector(".tooltip");
        //if(tooltip && tooltip.classList.contains("show"))  tooltip.classList.remove("show");
    });

    let tag = auto.querySelector('.tag');
    if(tag){
        autocomplete(tag);
    } 
}; 

function cancelFocus(){
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
};

function syncTagContent(tag, content){
    if(tag.getAttribute("content")){
        if(tag.getAttribute("content") !== content)  tag.setAttribute("content", content);
    }else{
        tag.setAttribute("content", content);
    }
};

/*tinp argument: the text field element*/
function autocomplete(inp) {
   // console.log("auto complete");
    
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        let content = this.innerText;
        
        //synchronise input text and the content attribute
        syncTagContent(inp, content); 

        //themeList, an array of possible autocompleted values: update themeList 
        let themeList = [];
        if(!inp.getAttribute("creator")){
            //this is a new tag
            for(let i=0; i<databaseEngine.themes.length; i++){
                let dictionary = databaseEngine.themes[i];
                let themeContent = dictionary.themeContent
                if(!themeList.includes(themeContent)){
                    themeList.push(themeContent);
                } 
            }
        }else{
            //this is editing an old tag 
            for(let i=0; i<databaseEngine.themes.length; i++){
                let dictionary = databaseEngine.themes[i];
                //when editing an old tag, only allow the user to manipulate inside the same diagram 
                if(dictionary.creator === inp.getAttribute("creator")){
                    let themeContent = dictionary.themeContent
                    if(!themeList.includes(themeContent)) themeList.push(themeContent);
                }
            }
        }

        let autocomplateList, autoItem; 
        /*close any already open lists of autocompleted values*/
        closeAllLists();

        if (!content) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        autocomplateList = document.createElement("DIV");
        autocomplateList.setAttribute("id", this.id + "autocomplete-list");
        autocomplateList.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(autocomplateList);
        
        /*for each item in the themeList...*/
        for (i = 0; i < themeList.length; i++) {
          /*check if the item starts with the same letters as the text field value:*/
          if (themeList[i].substr(0, content.length).toUpperCase() == content.toUpperCase()) {
            /*create a DIV element for each matching element:*/
            autoItem = document.createElement("DIV");
            /*make the matching letters bold:*/
            autoItem.innerHTML = "<strong>" + themeList[i].substr(0, content.length) + "</strong>";
            autoItem.innerHTML += themeList[i].substr(content.length);
            /*insert a input field that will hold the current array item's value:*/
            autoItem.innerHTML += "<input type='hidden' value='" + themeList[i] + "'>";
            
            /*execute a function when someone clicks on the item value (DIV element):*/
            autoItem.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                let value = this.getElementsByTagName("input")[0].value;
                console.log("I click one autoItem: ", value);
                inp.innerText = value;
                syncTagContent(inp, value);
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists();

                comfirmUser(inp, value);
            });

            autocomplateList.appendChild(autoItem);
          }
        }
    });

    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = webstrate.Coding.dbDoc.getElementById(this.id + "autocomplete-list");
        //let x = inp.parentNode.querySelector(".autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
          currentFocus++;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 38) { //up
          /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
          currentFocus--;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 13) {
          /*If the ENTER key is pressed, prevent the form from being submitted,*/
          e.preventDefault();
          if (currentFocus > -1) {
            /*and simulate a click on the "active" item:*/
            //console.log("enter ",x[currentFocus]);
            if (x) x[currentFocus].click();
          }else{
            //enter   
            comfirmUser(inp, inp.innerText);
            closeAllLists();
          }
          cancelFocus();
        }
    });

    // inp.addEventListener("blur", function(e) {
    //     console.log(e);
    //      closeAllLists();
    //      console.log("????/");
    //      //if(mouseOn(e) === "snippet"){
    //         comfirmUser(inp, inp.innerText);
    //      //}    
    //  });

    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    };
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    };
    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = webstrate.Coding.dbDoc.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
    };

  /*execute a function when someone clicks in the document:*/
//   webstrate.dbDoc.addEventListener("click", function (e) {
//       closeAllLists(e.target);
//       if(mouseOn(e) === "snippet"){
//         comfirmUser(inp.innerText);
//       }    
//   });

};// autocomplete()

function comfirmUser(tag, value){
    console.log("tagToBeAdded", tag, "with content ", value);
    
    let creator, themeID, sendTo;
    let dictionary = databaseEngine.themes.find(x => x.themeContent === value);
    
    if(dictionary){
        themeID = dictionary.themeID;
        creator = dictionary.creator;
    }

    let confirmMsg = document.querySelector('#confirmMsg');
    let content, footer;
    
    if(confirmMsg){
        content = confirmMsg.querySelector('.modal-body');
        footer = confirmMsg.querySelector('.modal-footer');

        if(confirmMsg.getAttribute("transient-visible") === "false"){
            confirmMsg.setAttribute("transient-visible", "true");
        }

        let removeConfirmBtn = () => {
            if(footer){
                let comfirmBtn = footer.querySelector(".confirm");
                if(comfirmBtn){
                    comfirmBtn.parentNode.removeChild(comfirmBtn);
                }
            }  
        }; 

        let addConfirmBtn = () =>{
            let comfirmBtn;
            if(footer)  comfirmBtn = footer.querySelector(".confirm");
            if(!comfirmBtn){
                let $comfirmBtn = $('<button type="button" class="move btn btn-secondary">Confirm</button>');
                $comfirmBtn.appendTo($(footer));
            }
        };

        let generateComfirmMsg = () => {
            //let situation = checkConflicts(tag, creator);
            if(content){
                //is the user creat a new tag or edit an old one?
                if(!tag.getAttribute("creator")){
                    /**
                     * create a new tag
                     */
                    if(!creator){
                        //its a new theme that doesn't belong to any AD yet
                        content.innerHTML = "Cluster snippet to new theme <strong>" + value
                        +"</strong>, <br />please choose a diagram to add in this theme:";
                        addConfirmBtn();
    
                        let $diagramList = $('<select class="form-control"><option>'
                        + '-- choose a diagram --' + '</option></div>');
                        // console.log("---------------------");
                        // console.log(databaseEngine.diagrams);
                        // console.log("---------------------");
                        // for(let i=0; i<databaseEngine.diagrams.length; i++){
                        //     let $diagram = $('<option>'+ databaseEngine.diagrams[i]+'</option>');
                        //     $diagram.appendTo($diagramList);
                        // }
                        let $diagram = $('<option>Tasks</option>');
                        $diagram.appendTo($diagramList);
                        $diagramList.appendTo($(content)); 
                        $diagramList.on("change", e => {
                            var $target = $("option:selected");
                            sendTo = $target[0].innerText;
                            //console.log("create a new theme in", sendTo);
                        });
    
                    }else{  //theme already exists

                        //conflicts.case: 
                        let conflicts = checkConflicts(tag, creator);
                        if(conflicts.case === 1){
                            content.innerHTML = conflicts.msg;
                        }else if(conflicts.case === 2){
                            content.innerHTML = conflicts.msg + " You want to?";
                            removeConfirmBtn();

                            let choiceMove = $('<button type="button" class="move btn btn-secondary" data-dismiss="modal">Move</button>');
                            let choiceCopynMove = $('<button type="button" class="copyNmove btn btn-secondary" data-dismiss="modal">Copy & Move</button>');

                            choiceMove.appendTo($(footer));   
                            choiceCopynMove.appendTo($(footer));   

                            choiceMove.on("click touchend", e => {
                                console.log("move snippet");
                            });

                            choiceCopynMove.on("click touchend", e => {
                                console.log("copy and move snippet");
                            });            

                        }else{
                            sendTo = creator;
                            content.innerHTML = "Theme <strong>" +value+ "</strong> already exist in diagram <strong>" 
                            + creator + "</strong>, <br /> continue cluster this snippet under this theme?";
                        }
                    }

                }else{
                    /**
                     * edit an old tag 
                     */
                    console.log("edit an old tag ");
                    if(!creator){
                        //its a new theme that doesn't belong to any AD yet
                        // content.innerHTML = "Cluster snippet to new theme <strong>" + value
                        // +"</strong>, <br />under the diagram " + tag.getAttribute("creator");  
                        let clusterid, themeSnippet, themeContent;
                        clusterid = inp.getAttribute("clusterid");
                        if(clusterid) themeSnippet = webstrate.Coding.dbDoc.querySelector("#"+clusterid);
                        if(themeSnippet) themeContent = themeSnippet.querySelector(".note_title").innerText;
                        content.innerHTML = "Change from cluster <strong>" +themeContent+"</strong> to <strong>" + value +
                        "</strong>, <br>under diagram <strong>" +tag.getAttribute("creator")+ "</strong>";
                        
                    }else{
                        //theme already exists
                        //it must be a theme in the same diagram 
                        console.log("theme already exists, it must be a theme in the same diagram ");

                        let conflicts = checkConflicts(tag, creator);
                        console.log(conflicts.case);
                        if(conflicts.case === 1){
                            content.innerHTML = conflicts.msg;
                        }else if(conflicts.case === 2){
                            content.innerHTML = conflicts.msg + " You want to?";
                            removeConfirmBtn();

                            let choiceMove = $('<button type="button" class="move btn btn-secondary" data-dismiss="modal">Move</button>');
                            let choiceCopynMove = $('<button type="button" class="move btn btn-secondary" data-dismiss="modal">Copy & Move</button>');
                            choiceMove.appendTo($(footer));   
                            choiceCopynMove.appendTo($(footer));   

                            choiceMove.on("click touchend", e => {
                                console.log("move snippet");
                            });

                            choiceCopynMove.on("click touchend", e => {
                                console.log("copy and move snippet");
                            });            

                        }else if(conflicts.case === 3){
                            content.innerHTML = conflicts.msg;
                            removeConfirmBtn();
                        }else{
                            console.log("normal");
                            sendTo = creator;
                            content.innerHTML = "??";
                            // content.innerHTML = "Theme <strong>" +value+ "</strong> already exist in diagram <strong>" 
                            // + creator + "</strong>, <br /> continue cluster this snippet under this theme?";
                        }

                    }
                }
            }
        }; //END generateComfirmMsg()

        let comfirmClicked = () => {
            let btnConfirm = confirmMsg.querySelector('.confirm');
            if(btnConfirm){
                btnConfirm.onclick = (e) => {

                    if(confirmMsg.getAttribute("transient-visible") === "true"){
                        if(!creator){
                            if(!sendTo){
                                alert("Please choose a affinity diagram!");
                                confirmMsg.setAttribute("transient-visible", "false");
                            }else{
                                
                                let situation = checkConflicts(tag, sendTo);

                                if(situation.case === 2){
                                    //alert(situation.msg);
                                    content.innerHTML = situation.msg;
                                    //+ " Do you want to change?";
                                    creator = sendTo;
                                }else{
                                    let newID = ID();
                                    let title = value;
                                    tag.setAttribute("creator", sendTo);
                                    tag.setAttribute("clusterid", newID);

                                    console.log("send signal to", sendTo);
                                    //need to add a themeSnippet in diagram(sendTo)
                                    generateThemeSnippet(newID, title, sendTo);
                                    confirmMsg.setAttribute("transient-visible", "false");
                                }
                            }

                        }else{
                            //creator exist: tag already exist
                            let situation = checkConflicts(tag, creator);

                            if(situation.case === 1){
                                //alert(situation.msg);
                                let auto = tag.parentNode;
                                if(auto.classList.contains("autocomplete")){
                                    auto.parentNode.removeChild(auto);
                                }
                            }else if(situation.case === 2){
                                //move to another theme
                                
                                //remove for now
                                let auto = tag.parentNode;
                                if(auto.classList.contains("autocomplete")){
                                    auto.parentNode.removeChild(auto);
                                }

                                //console.log( tag.getAttribute("clusterid"));
                                //tag.setAttribute("creator", sendTo);
                                //tag.setAttribute("clusterid", situation.themeID);
                                //console.log( tag.getAttribute("clusterid"));
                                //generateThemeSnippet(newID, title, sendTo);
                            }else{
                                //console.log("here here");
                                //move the snippet to correct position
                                tag.setAttribute("creator", sendTo);
                                tag.setAttribute("clusterid", themeID);
                                console.log("move the snippet's position!");
                            }
                            confirmMsg.setAttribute("transient-visible", "false");
                        }

                    }
                };
            }
        }; // comfirmClicked

        let cancelClicked = () => {
            let btnCancel = confirmMsg.querySelector('.cancel');
            if(btnCancel){
                btnCancel.onclick = (e) => {
                    if(confirmMsg.getAttribute("transient-visible") === "true"){
                        confirmMsg.setAttribute("transient-visible", "false");
                    }
                    //remove
                    let auto = tag.parentNode;
                    if(auto.classList.contains("autocomplete")){
                        auto.parentNode.removeChild(auto);
                    }
                };
            }
        };


        generateComfirmMsg();
        comfirmClicked();
        cancelClicked();
    }
};// comfirmUser()


function checkConflicts(inp, creator){
    let conflicts = {
        case: 0,
        msg: "",
        themeID: ""
    };
    let snippet = inp.parentNode;
    while( !snippet.classList.contains("textSnippet") ){
        snippet = snippet.parentNode;
    }
    //console.log(snippet);
    if(inp.getAttribute("creator")){
            if(creator !== inp.getAttribute("creator")){
                conflicts = {
                    case: 3,
                    msg: "The theme has already existed in another diagram"
                        + ", <br/> you cannot make this change.",
                    themeID: ""
                }
            }else if(creator === inp.getAttribute("creator")){
                conflicts = {
                    case: 2,
                    msg: "The snippet has already been clustered in the same diagram",
                        //+ ", <br/>under theme <strong>" + inp.getAttribute("clu") + "</strong>.",
                    themeID: inp.getAttribute("clusterid")
                }
            }
    }else{
        //new tag 
        let tags = snippet.querySelectorAll(".tag");
        for(tag of tags){
            if(tag === inp){
                //do nothing
            }else if(tag.getAttribute("content") === inp.getAttribute("content")){
                conflicts = {
                    case: 1,
                    msg: "The snippet has already been clustered under this theme!",
                    themeID: ""
                };
            }else if(tag.getAttribute("creator") === creator){
                conflicts = {
                    case: 2,
                    msg: "The snippet has already been clustered in the same diagram" 
                        + ", <br/>under theme <strong>" + tag.getAttribute("content") + "</strong>.",
                    themeID: tag.getAttribute("clusterid")
                }
            }
        }
    }

    return conflicts;
}; //checkConflicts
    


databaseEngine.addTooltip = function(tag){

    let tooltip;

    let add = (event) => {
        console.log("mouseover");
        event.preventDefault();
        event. stopPropagation();
        tooltip = tag.querySelector('.tooltip');
        let creator = tag.getAttribute("creator");
        if(!creator || creator === "") creator = "unknown";
        console.log(tooltip, creator);
        if(!tooltip){
            let $transient = $('<transient></transient>');
            let $tooltip = $('<span class="tooltip"> Diagram: '+creator+'</span>');
            $tooltip.appendTo($transient);
            $transient.appendTo($(tag));
            tooltip = $tooltip[0];
        }else{
            tooltip.innerText = 'Diagram: ' + creator;
        }     
        if(!tooltip.classList.contains("show")){
            tooltip.classList.add("show");
        }  
    };

    let remove = (event) => {
        event.preventDefault();
        event. stopPropagation();
        tooltip = tag.querySelector('.tooltip');
        if(tooltip.classList.contains("show")){
            tooltip.classList.remove("show");
        }  
    }
    
    //console.log(tag);
    tag.addEventListener("mouseover", add);
    tag.addEventListener("mouseout", remove);
    if(tag.parentNode.classList.contains("metaTag")){
        tag.parentNode.addEventListener("mouseover", add);
        tag.parentNode.addEventListener("mouseout", remove);
    } 
};

let generateThemeSnippet = (id, title, creator) => {
    console.log("========= generateThemeSnippet =========");

    let $snippetdiv = $('<div></div>')
                    .attr("id", id)
                    .addClass("note themeSnippet")
                    .attr("creator", creator)
                    .attr("themelevel", 0);

    let $handle = $('<div></div>').addClass("handle");
    let $close = $('<i></i>').addClass("fas fa-times fa-lg close");
    let $lockGroup = $('<i></i>').addClass("far fa-object-group fa-lg lockGroup");
    let $showGroup = $('<i></i>').addClass("far fa-lg showGroup fa-caret-square-down");
    let $title = $('<h3>'+title+'</h3>').addClass("note_title").attr("contenteditable","true");

    let $transient = $('<div class="inoutboxes"></div>');
    $transient.attr("themeid", id);
    $transient.attr("transient-display", "hide");

    let $inBox = $('<div class="inbox"></div>');
    $inBox.appendTo($transient);
    let $dropin = $('<i class="dropin fas fa-map-marked-alt"></i>');
    $dropin.appendTo($inBox);
    let $inputArrow = $('<i class="inputArrow fas fa-long-arrow-alt-right fa-lg"></i>');
    $inputArrow.appendTo($inBox);

    let $outBox = $('<div class="outbox"></div>');
    $outBox.appendTo($transient);
    let $outputArrow = $('<i class="outputArrow fas fa-long-arrow-alt-right fa-lg"></i>');
    $outputArrow.appendTo($outBox);

    $snippetdiv.append($close)
                .append($lockGroup)
                .append($showGroup)
                .append($handle)
                .append($title)
                .append($transient);

    let element = $snippetdiv.get(0);

    let parentNode = webstrate.Coding.dbDoc.querySelector("#themeDB");
    if(parentNode){
        parentNode.appendChild(element);  
        WPMv2.stripProtection(element);

        let dictionary = {
            themeID: id,
            creator: creator,
            themeContent: title
        }
        databaseEngine.themes.push(dictionary);

    }
};

 // class Tag{
    // 	constructor(uperNode, elm){
    // 		this.element = elm;
    // 		this.uperNode = uperNode;
    // 		if(elm && uperNode){
    //             this.uperNode.appendChild(this.element);
    //             this.setHandlers();
    // 		}
    // 	}
    
    // 	setHandlers(){
    // 		let self = this;
    // 		// self.element.querySelector('i.delete').onclick = function(){
    // 	    //       this.parentElement.remove();
    // 		// 	  self.delete();
    //         // }
    //         let tag = self.element.querySelector('.tag');
    //         console.log(tag);
    //         databaseEngine.autocomplete(tag, databaseEngine.themes);
    
    //         //self.element.onclick = () => {
    //         tag.onclick = () => {
    //             console.log("click");
    //             tag.focus();
    //         }
    //     }
    
    // 	delete(){
    // 		//override on child
    // 	}
    // }


    exports.databaseEngine = databaseEngine;