/**
 * Everytime a snippet get dragged, update the distance matrix: dict_text & dict_theme
 */
 let clusterEngine = {},
 dict_text = {},
 dict_theme = {},
 nearest = undefined;
 
 clusterEngine.highLevel = {};
 
 let dragEngine = webstrate.ADQDA.dragEngine;
 
 clusterEngine = (target) => {
     clusterEngine.highLevel = webstrate.ADQDA.creatorId + '-meta';
     let dbDoc = webstrate.ADQDA.dbDoc;
         
     let textSnippetNum = dbDoc.querySelectorAll('.textSnippet').length,
     imgSnippetNum = dbDoc.querySelectorAll('.imgSnippet').length,
     themeSnippetNum = dbDoc.querySelectorAll('.themeSnippet[creator="'+ webstrate.ADQDA.creatorId +'"]').length;
     
     //caculate the distances if there are more than one themeSnippet && textSnippet
     if( ( textSnippetNum > 0 || imgSnippetNum > 0) && themeSnippetNum > 0){
         //console.log("clustering");
         let box = dragEngine.getAbsoluteBoundingRect(target);
         
         let centerX = box.left + box.width/2;
         let centerY = box.top + box.height/2;
 
         // calculate the distance matrix when dragging snippet
         distanceMatrix(target, centerX, centerY);
 
         let mindis_theme = Object.keys(dict_theme)[0];
         let mindis_text = Object.keys(dict_text)[0];
 
         if(!mindis_text){ //mindis_text === undefined
             //only one text/image snippet, nearest one is a themeSnippet
 
             let themeID = dict_theme[mindis_theme];
             clustering(target, themeID);
 
         }else{ // multiple text/image snippets
 
         if(mindis_theme <= mindis_text){
             //nearest one is a themeSnippet
             let themeID = dict_theme[mindis_theme];
             clustering(target, themeID);
 
         }else{
             //nearest one is a note
             let textID = dict_text[mindis_text];
             clustering(target, textID);
 
         } // -->  end: mindis_theme > mindis_text
 
         } // --> end: multiple text/image snippets
 
     }
 };
 
 let distanceMatrix = (target, centerX, centerY) => {
     let dbDoc = webstrate.ADQDA.dbDoc;
     dict_text = {};
     dict_theme = {};
 
     let themeSnippets = dbDoc.querySelectorAll('.themeSnippet[creator="'+webstrate.ADQDA.creatorId+'"]');
     //update distance matrix : dict_theme = {};
     for(let i=0; i<themeSnippets.length; i++){
         //let themeBox = themeSnippets[i].getBoundingClientRect();
         let themeBox = dragEngine.getAbsoluteBoundingRect(themeSnippets[i]);
         let themeCenterX = themeBox.left + themeBox.width/2;
         let themeCenterY = themeBox.top + themeBox.height/2;
         let a = themeCenterX - centerX;
         let b = themeCenterY - centerY;
         let distance = Math.round(Math.sqrt(a*a + b*b));
         dict_theme[distance] = themeSnippets[i].id;
     }
 
     let textSnippets = dbDoc.querySelectorAll('.textSnippet');
     let imgSnippet = dbDoc.querySelectorAll('.imgSnippet');
 
     //update distance matrix : dict_text = {};
     for(let j=0; j<textSnippets.length; j++){
         if(textSnippets[j].id == target.id) continue;
         //let textBox = textSnippets[j].getBoundingClientRect();
         let textBox = dragEngine.getAbsoluteBoundingRect(textSnippets[j]);
         let textCenterX = textBox.left + textBox.width/2;
         let textCenterY = textBox.top + textBox.height/2;
         let a = textCenterX - centerX;
         let b = textCenterY - centerY;
         let distance = Math.round(Math.sqrt(a*a + b*b));
         dict_text[distance] = textSnippets[j].id;
     }
 
     for(let k=0; k<imgSnippet.length; k++){
         if(imgSnippet[k].id == target.id) continue;
         //let imgBox = imgSnippet[k].getBoundingClientRect();
         let imgBox = dragEngine.getAbsoluteBoundingRect(imgSnippet[k]);
         let imgCenterX = imgBox.left + imgBox.width/2;
         let imgCenterY = imgBox.top + imgBox.height/2;
         let a = imgCenterX - centerX;
         let b = imgCenterY - centerY;
         let distance = Math.round(Math.sqrt(a*a + b*b));
         dict_text[distance] = imgSnippet[k].id;
     }
     //console.log(dict_text);
     //console.log(dict_theme);
 };
 
 let clustering = (target, nearestID) => {
     //console.log("clustering");
     let highLevel = clusterEngine.highLevel;
 
     nearest = webstrate.ADQDA.dbDoc.getElementById(nearestID);
     //console.log(nearest);
     let type = dragEngine.getTargetRole(nearest); 
     let themeID, content, metaID, metaContent;
 
     if(type === "themeSnippet"){
         themeID = nearestID;
         content = nearest.querySelector('.note_title').innerText;
 
         let metaTag = nearest.querySelector('.tagOnTheme[creator="'+ highLevel +'"]');
 
         if(metaTag){
             metaID = metaTag.getAttribute("clusterid");
             metaContent = metaTag.innerText;
         }
 
     } else if (type === "textSnippet"){
 
         let metaTag = nearest.querySelector('.metaTag[creator="'+ highLevel +'"]');
         if(metaTag){
             metaID = metaTag.getAttribute("metathemeid");
             metaContent = metaTag.getAttribute("content");
             let tag = metaTag.querySelector('.tag');
             if(tag){
                 themeID = tag.getAttribute("clusterid");
                 content = tag.getAttribute("content");
             }
         }else{
             let tag = nearest.querySelector('span[creator="'+webstrate.ADQDA.creatorId+'"]');
             if(tag){
                 themeID = tag.getAttribute("clusterid");
                 content = tag.getAttribute("content");
             }
         }
     }
 
     //console.log(themeID+","+content, metaID+","+metaContent);
 
     //let theme = webstrate.dbDoc.querySelector('#'+themeID);
 
     // let snippetsList;
     // if(theme){
     //     snippetsList = theme.querySelector('.mySnippetsList');
     //     if(!snippetsList){
     //         let $snippetsList = $('<ol class="mySnippetsList" ></ol>');
     //         $snippetsList.appendTo($(theme));
     //         snippetsList = theme.querySelector('.mySnippetsList');
     //     }
     // } 
 
     let checkNearEnough = () => {
         let nearEnough = false;
 
         let box = dragEngine.getAbsoluteBoundingRect(target);
         let nearestBox = dragEngine.getAbsoluteBoundingRect(nearest);
         let centerX = box.left + box.width/2;
         let centerY = box.top + box.height/2;
         let threshold = 10;
     
         if( centerX<(nearestBox.right+box.width/2+threshold) && centerX>(nearestBox.left-box.width/2-threshold) &&
              centerY<(nearestBox.bottom+box.height/2+threshold) && centerY>(nearestBox.top-box.height/2-threshold)){
             //near enought
             nearEnough = true;
         }else{
             //away away
             nearEnough = false;
         }
         return nearEnough;
     }
 
     if(metaID && metaContent && metaContent !== "" && themeID && content && content !== ""){
         if(checkNearEnough()){
             setMetaTag(target, metaID, metaContent);
             setTag(target, themeID, content);
         }else{
             removeTag(target);
             removeMetaTag(target);
         }  
     }else if(themeID && content && content !== ""){
         removeMetaTag(target);
         if(checkNearEnough()){
             setTag(target, themeID, content);
         }else{
             removeTag(target);
         }  
     }else{
         removeTag(target);
         removeMetaTag(target);
     }
         //setTag(target, themeID, content);
         //addMetaTag(target, metaID, metaContent);
 
         //console.log("-----------------");
         //add to theme' list
         // if(snippetsList){
         //     let li = snippetsList.querySelector('li[snippetid="'+ target.id + '"]');
         //     if(li){
         //         li.setAttribute("status", "added");
         //     }else{
         //         //let $li = $('<li snippetid="'+ target.id +'" status="added"></li>');
         //         let $li = $('<li snippetid="'+ target.id +'" status="added" time="'+getTimeStamp()+'"></li>');
         //         $li.appendTo($(snippetsList));
         //     }
         // }
 
             //remove from theme' list
             // if(snippetsList){
             //     let li = snippetsList.querySelector('li[snippetid="'+ target.id + '"]');
             //     if(li){
             //         li.setAttribute("status", "removed");
             //     }else{
             //         //let $li = $('<li snippetid="'+ target.id +'" status="removed"></li>');
             //         let $li = $('<li snippetid="'+ target.id +'" status="removed" time="'+getTimeStamp()+'"></li>');
             //         $li.appendTo($(snippetsList));
             //     }
             // }
         
     
 };
 
 let removeTag = (target) => {
     let tag = target.querySelector('.tag[creator="'+webstrate.ADQDA.creatorId+'"]');
     if(tag){
          //console.log("removeTag");
         let snippet;
         if(tag.parentNode.classList.contains("autocomplete")){
             snippet = tag.parentNode.parentNode;
             snippet.removeChild(tag.parentNode);
         }else{
             tag.parentNode.removeChild(tag);
         }
        
        
     }
 };
 
 let removeMetaTag = (target) => {
     let metaTag = target.querySelector('.metaTag[creator="'+clusterEngine.highLevel+'"]');
     if(metaTag){
         //console.log("remove metaTag");
         target.removeChild(metaTag);
     }
 };
 
 let setTag = (target, themeID, content) => {
     
     if(themeID && content && content !== ""){
         console.log("setTag");
         let tag = target.querySelector('.tag[creator="'+webstrate.ADQDA.creatorId+'"]');
         let metaTag = target.querySelector('.metaTag[creator="'+clusterEngine.highLevel+'"]');
 
         if(!tag ){
             let $tag = $('<span class="tag" onsnippet="'+ target.id + '"creator="'+
             webstrate.ADQDA.creatorId+'" clusterid="' + themeID + '" content="'+ content +'">'+ content +'</span>');
             //for Coding view test
             let $delete = $('<span class="delete fas fa-times fa-sm"></span>');
             let $autocomplete = $('<div class="autocomplete"></div>');
 
             $autocomplete.append($tag);
             $autocomplete.append($delete);
 
             if(metaTag){
                 $tag.appendTo($(metaTag));
             }else{
                 //$tag.appendTo($(target));
                 $autocomplete.appendTo($(target));
             } 
 
             WPMv2.stripProtection($tag[0]);
             WPMv2.stripProtection($delete[0]);
             WPMv2.stripProtection($autocomplete[0]);
 
         }else{
             if(tag.getAttribute("clusterid") !== themeID) tag.setAttribute("clusterid",themeID);
             if(tag.getAttribute("content") !== content){
                 tag.setAttribute("content",content);
                 tag.innerText = content;
             }
         }
     }
 };
 
 function setMetaTag(target, metaID, metaContent){
     let highLevel = clusterEngine.highLevel;
     if(metaID && metaContent && metaContent !== ""){
         console.log("setMetaTag");
         let tag = target.querySelector('.tag[creator="'+webstrate.ADQDA.creatorId+'"]');
         let metaTag = target.querySelector('.metaTag[creator="'+highLevel+'"]');
 
         if(!metaTag){
             let $metaTag = $('<span class="metaTag" metathemeid="'+ metaID+'" content="'+ 
             metaContent+'" creator="'+ highLevel +'">'+metaContent +'</span>');
             if(!tag){
                 $metaTag.appendTo($(target));
             }else{
                 wrap(tag, $metaTag[0]);
             }
         }else{
             if (metaTag.getAttribute("metathemeid") !== metaID) metaTag.setAttribute("metathemeid",metaID);
             if (metaTag.getAttribute("content") !== metaContent){
                 metaTag.setAttribute("content",metaContent);
                 metaTag.innerText = metaContent;
             }
         }
     }
 };
 
 function wrap(el, wrapper) {
     el.parentNode.insertBefore(wrapper, el);
     wrapper.appendChild(el);
 };
 
 function getTimeStamp() {
     let today = new Date();
     let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
     let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
     console.log(today, date, time);
 
     return date+' '+time;
 };
 
 
 clusterEngine.realtimeUpdate = (themeSnippet) => {
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
                         updateContent(themeSnippet.id, textNode.data);
                     }
                     observer.observe(textNode, config);
                 }
 
             }else if(mutation.type === 'characterData'){
                 //console.log("character change");
                 if(mutation.target.nodeType === 3){
                     if(!mutation.target.parentNode){ 
                         //delete last character will delete the textNode
                         updateContent(themeSnippet.id, '');
                     }else{
                         if(mutation.target.parentNode.parentNode === themeSnippet){
                             let clusterID = themeSnippet.id;
                             let newContent = mutation.target.data;
                             updateContent(clusterID, newContent);
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
     console.log("observe on ", title);
     observer.observe(title, config);
 };
 
 function updateContent(clusterID, newContent){
     let tags = webstrate.ADQDA.dbDoc.querySelectorAll('.tag[clusterid="'+ clusterID +'"]');
     for(tag of tags){
         if(tag.innerText !== newContent) tag.innerText = newContent;
         if(tag.getAttribute("content") !== newContent) tag.setAttribute("content", newContent);
     }
 };
 
 exports.clusterEngine = clusterEngine;