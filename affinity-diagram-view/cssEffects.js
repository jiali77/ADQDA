let cssEffects = {};

let styleSheet = webstrate.ADQDA.dbDoc.styleSheets[0];
let CSSRuleList = styleSheet.cssRules;

cssEffects.initDBStyle = () => {
    // basic rules on background color,size, etc
    let styleRule = document.getElementById('style-database.css');
    if(styleRule){
        let dataViewCssRules = styleRule.sheet.cssRules || styleRule.sheet.rules;
        if(dataViewCssRules){
            for (const rule of dataViewCssRules){
                let ruleString = rule.cssText;
                styleSheet.insertRule(ruleString, 0);
            }
        }
    }
};

cssEffects.addCssRuleOnPosition = (target, x, y) => {
    if(target instanceof jQuery) target = target.get(0);
    let already = cssEffects.hasPosRule(target);
   
    if(!already){
        let posRule = '#' + target.id + ' {left: '+ x +'px; top: '+ y +'px; }';
        styleSheet.insertRule(posRule, 0);
        checkPosNode(target, x, y);
    }
    
};

cssEffects.hasPosRule = (target) => {
    if(target instanceof jQuery) target = target.get(0);
    let already = false;

    for(const rule of CSSRuleList){
        if(rule.selectorText === "#"+target.id){
            //already exists
            already = true;
        }
    }
    return already;
};

cssEffects.moveSnippet = (id, newX, newY) => {
    //console.log("move", id, newX, newY);

    // if(newX<320){
    //     alert("throw snippet to pile?");
    // }else{
        for(const rule of CSSRuleList){
            if(rule.selectorText === "#"+id){
    
                rule.style.left = newX + 'px';
                rule.style.top = newY + 'px';
                //console.log(webstrate.ADQDA.diagramDBDoc.getElementById(id));
                webstrate.ADQDA.diagramDBDoc.getElementById(id).setAttribute("x", newX);
                webstrate.ADQDA.diagramDBDoc.getElementById(id).setAttribute("y", newY);
            }
        }
    //}
};

cssEffects.pileGap = 15;
//cssEffects.pileSnippetNum = 0;
//cssEffects.pileThemeNum = 0;
let pileSnippetNum = pileThemeNum = 0;

cssEffects.insertToPile = (target) => {
    //let pileInfo = webstrate.diagramDBDoc.querySelector('#pileInfo');
    //let pileSnippetNum = pileThemeNum = 0;
    // if(pileInfo){
    //     pileSnippetNum = parseInt(pileInfo.getAttribute("pilesnippetnum"));
    //     pileThemeNum = parseInt(pileInfo.getAttribute("pilethemenum"));
    // }
    
    let box = document.body.getBoundingClientRect();

    let iniX = 25;
    let iniY, startY;
    let role = webstrate.ADQDA.dragEngine.getTargetRole(target);

    if(role === "themeSnippet"){
        startY = (box.height*0.7 > 250)?box.height*0.7:250;;
        iniY = startY+pileThemeNum*cssEffects.pileGap;
        pileThemeNum++;
        //if(pileInfo) pileInfo.setAttribute("pilethemenum", pileThemeNum);

    } else if (role === "textSnippet") {
        
        //startY = (box.height*0.3 > 250)?box.height*0.3:250;
        startY = 30;
        
        iniY = startY+pileSnippetNum*cssEffects.pileGap;
        pileSnippetNum++;
        //if(pileInfo) pileInfo.setAttribute("pilesnippetnum", pileSnippetNum);
    }
    //console.log(iniY);
    if(iniX && iniY){
        cssEffects.addCssRuleOnPosition(target, iniX, iniY);
    } 
};


cssEffects.hideSnippetById = (snippetId) => {

    let display = '#' + snippetId +' { display: none;}';
    styleSheet.insertRule(display, 0);
};

cssEffects.appearSnippetById = (snippetId) => {
    let already = false;

    for(const rule of CSSRuleList){
        if(rule.selectorText === '#' + snippetId){
            //already exists
            already = true;
            rule.style.display = "block";
        }
    }
    if(!already){
        let display = '#' + snippetId +' { display: block;}';
        console.log(display);
        styleSheet.insertRule(display, 0);
    }
};

cssEffects.hideTagByClusterId = (clusterId) => {
    let display = 'span.tag[clusterid="'+ clusterId +'"] { display: none;}';
    styleSheet.insertRule(display, 0);
    console.log(display);
};

cssEffects.hideMetaTagByClusterId = (clusterId) => {
    let display = 'span.metaTag[metathemeid="'+ clusterId +'"] { display: none;}';
    styleSheet.insertRule(display, 0);
};

cssEffects.deleteCssRuleBySelector = (selector) => {
    let CSSRuleList = styleSheet.cssRules;
    let index = 0;
    for(const rule of CSSRuleList){
        if(rule.selectorText === selector){
            //already exists
            //console.log("delete", rule.selectorText);
            styleSheet.deleteRule(index);
        }
        index++;
    }
};

cssEffects.addPointedBgEffect = (selectorTextId, classSelector, color) => {
    let pointerDownRule = '#' + selectorTextId +'.'+ classSelector +' { ' +
    'background: '+ color +'; position: absolute; z-index: 999; box-shadow: 0px 10px 20px #888888;}';
    if(pointerDownRule)	styleSheet.insertRule(pointerDownRule, 0);
    //console.log(pointerDownRule);
    //console.log(styleSheet);
};

cssEffects.changeBgColor = (selectorTextId, classSelector, color) => {
    let already = false;
    for(const rule of CSSRuleList){
        if(rule.selectorText === "#"+selectorTextId){
            //already exists
            already = true;
            rule.style.background = color;
            console.log(rule);
        }
    }
    if(!already){
        let colorRule = '#' + selectorTextId +'.'+ classSelector +' { ' +
        'background: '+ color + '}';
        console.log(colorRule);
        styleSheet.insertRule(colorRule, 0);
    }

};

cssEffects.appearAutocomplete = () => {
    let already = false;

    for(const rule of CSSRuleList){
        if(rule.selectorText === ".autocomplete[creator="+webstrate.ADQDA.creatorId+"]"){
            //already exists
            already = true;
        }
    }
    if(!already){
        let display = '.tag[creator="'+webstrate.ADQDA.creatorId +'"] {display: inline-grid}';
        console.log(display);
        if(display)	styleSheet.insertRule(display, 0);
    }
};

function checkPosNode(target, x, y) {
	let posElm = webstrate.ADQDA.diagramDBDoc.getElementById(target.id);
    //console.log("--------checkPosNode--------", target, posElm);
    if(!posElm){
        let themePos = $('<pos id="'+target.id+'" x="'+ x +'" y="'+ y +'"></pos>');
        themePos.appendTo($(webstrate.ADQDA.diagramDBDoc.querySelector('#posList')));
        WPMv2.stripProtection(themePos[0]);
    
    }else if (parseFloat(posElm.getAttribute("x")) != x || parseFloat(posElm.getAttribute("y")) != y){
        posElm.setAttribute("x", x);
        posElm.setAttribute("y", y);
    }   
};

exports.cssEffects = cssEffects;