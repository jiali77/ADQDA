let ID = () => {return '_' + Math.random().toString(36).substr(2, 9);}

class ThemeSnippet {
    constructor(x,y){
        this.type = "themeSnippet";
        this.element = undefined;
        this.generateNode(x,y);
        this.initCssRule(x,y);
        //this.addPosNode(x,y);
        this.addListeners();
        this.addInOutBoxes();
    }

    generateNode = (x, y) => {
        let $snippetdiv = $('<div></div>')
                        .attr("id", ID())
                        .addClass("note themeSnippet")
                        .attr("creator", webstrate.ADQDA.creatorId)
                        .attr("themelevel", 0)
                        .attr("x", x+"px").attr("y", y+"px");

        let $handle = $('<div></div>').addClass("handle");
        let $close = $('<i></i>').addClass("fas fa-times fa-lg close");
        let $lockGroup = $('<i></i>').addClass("far fa-object-group fa-lg lockGroup");
        let $showGroup = $('<i></i>').addClass("far fa-lg showGroup fa-caret-square-down");
        let $title = $('<h3></h3>').addClass("note_title").attr("contenteditable","true");

        $snippetdiv.append($close)
                    .append($lockGroup)
                    .append($showGroup)
                    .append($handle)
                    .append($title);

        this.element = $snippetdiv.get(0);

        let parentNode = webstrate.ADQDA.dbDoc.querySelector("#themeDB");
        if(parentNode){
            parentNode.appendChild(this.element);  
            WPMv2.stripProtection(this.element);
        } 
    }

    addInOutBoxes = () => {
        webstrate.ADQDA.addInOutBoxes(this.element.id, this.element);
    }

    initCssRule = (x,y) => {
        if(this.element) {
            //console.log("here x: ",x);
            webstrate.ADQDA.cssEffects.addCssRuleOnPosition(this.element, x, y);
        }
    }

    // addPosNode = (x,y) => {
    //     let posElm = webstrate.diagramDBDoc.getElementById(this.element.id);
    //     if(!posElm){
	// 		let themePos = $('<pos id="'+this.element.id+'" x="'+ x +'" y="'+ y +'"></pos>');
    //         themePos.appendTo($(webstrate.diagramDBDoc.querySelector('#posList')));

	// 	}else if (parseFloat(posElm.getAttribute("x")) != x || parseFloat(posElm.getAttribute("y")) != y){
    //         posElm.setAttribute("x", x);
    //         posElm.setAttribute("y", y);
    //     }
    // }
    
    addListeners = () => {
        if(this.element){
            //this.node.addEventListener('click', mouseOn);
            webstrate.ADQDA.dragEngine(this.element);
            webstrate.ADQDA.clusterEngine.realtimeUpdate(this.element);

            //let title = this.element.querySelector('.note_title');
            //console.log(title);
            //observer.observe(title, config);
        }
    }
};

webstrate.ADQDA.addInOutBoxes = (themeid, target) => {
    console.log("create inoutBoxes");

    //let $transient = $('<transient class="inoutboxes"></transient>');
    let $transient = $('<div class="inoutboxes"></div>');
    $transient.attr("themeid", themeid);
    $transient.attr("transient-display", "hide");

    let $inBox = $('<div class="inbox"></div>');
    $inBox.appendTo($transient);

    //<i class="fas fa-map-marker-alt"></i>
    let $dropin1 = $('<i class="pointright fas fa-map-marker-alt"></i>');
    $dropin1.appendTo($inBox);
    //arrow to indicate inbox 
    let $inputArrow = $('<i class="inputArrow fas fa-long-arrow-alt-right fa-lg"></i>');
    $inputArrow.appendTo($inBox);

    let $outBox = $('<div class="outbox"></div>');
    $outBox.appendTo($transient);

    let $dropin2 = $('<i class="pointleft fas fa-map-marker-alt"></i>');
    $dropin2.appendTo($outBox);
    //arrow to indicate outbox
    let $outputArrow = $('<i class="outputArrow fas fa-long-arrow-alt-right fa-lg"></i>');
    $outputArrow.appendTo($outBox);

    $transient.appendTo($(target));
};

function TextSnippet(){
    this.type = "textSnippet";
}



// // Options for the observer (which mutations to observe)
// const config = {  characterData: true, childList: true };

// // Callback function to execute when mutations are observed
// const callback = function(mutationsList, observer) {
//     // Use traditional 'for loops' for IE 11
//     for(let mutation of mutationsList) {
//         //console.log(mutation.type);
//         if (mutation.type === 'childList') {
//             //console.log('A child node has been added or removed.');
//             let textNode = mutation.target.childNodes[0];
//             observer.observe(textNode, config);
//         }else if(mutation.type === 'characterData'){
//             if(mutation.target.nodeType === 3){
//                 console.log(mutation.target);
//                 if(!mutation.target){ //delete last character will delete the textNode

//                 }else{
//                     let themeSnippet = mutation.target.parentNode.parentNode
//                     if(themeSnippet && themeSnippet.classList.contains("themeSnippet")){
//                         let clusterID = themeSnippet.id;
//                         let newContent = mutation.target.data;
//                         updateContent(clusterID, newContent);
//                     }
//                 }

//             }
            
//         }
//     }
// };

// // Create an observer instance linked to the callback function
// const observer = new MutationObserver(callback);

// // Start observing the target node for configured mutations
// //observer.observe(targetNode, config);

// function updateContent(clusterID, newContent){
//     let tags = webstrate.dbDoc.querySelectorAll('.tag[clusterid="'+ clusterID +'"]');
//     for(tag of tags){
//         if(tag.innerText !== newContent) tag.innerText = newContent;
//         if(tag.getAttribute("content") !== newContent) tag.setAttribute("content", newContent);
//     }
// };

exports.ThemeSnippet = ThemeSnippet;