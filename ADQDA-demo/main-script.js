webstrate.on("loaded", function(webstrateId, clientId, user) {
	// The Webstrates client has now finished loading.
  
		initListeners();
  
	  window.currentFrame = document.querySelector('#frame');
	  window.activeADdb = undefined;
	  window.frameDoc = undefined;
	  window.lowerLevel = undefined;
  
	  window.currentFrame.webstrate.on("transcluded", function(webstrateId, clientId, user) {
  
		  window.currentFrame.setAttribute("webstrateid", webstrateId);
  
		  window.frameDoc = window.currentFrame.contentWindow.document;
  
		  if(window.frameDoc){
			  if(webstrateId.includes("coding-view")){
				  //do noting for now
				  //initCodingEnv();
			  }else if (webstrateId.includes("affinity-diagram-view")){
				  initAD();
			  }else if (webstrateId.includes("meta")){
				  initMetaAD();
			  }else if(webstrateId.includes("projects")){
				  //do noting for now
			  }
		  }
  
	  });
  
  function initListeners(){
	  /*
	  * Add listeners to all the breadcrumb items
	  */
	  let breadcrumbItems = document.querySelectorAll('.breadcrumb-item');
	  if(breadcrumbItems){
		  breadcrumbItems.forEach((item) => {
			  addListener(item, "click");	
		  });
	  }
  
	  let adList = document.querySelectorAll('a.dropdown-item');
	  if(adList){
		  adList.forEach((item) => {
			  addListener(item, "click");
		  });
	  }
  
	  enableNewDiagram();
  
  } // initListeners()
  
  function addListener(el, type) {
	  if(el.tagName == "li" || el.tagName == "LI"){
		  //click on Coding or Projects
		  $(el).on("touch click", changeView);
	  }else if(el.tagName == "div" || el.tagName == "DIV"){
		  //click on the AD-Diagrams button
		  $(el).on("touch click", chooseDiagram);
	  }else if(el.tagName == "a" || el.tagName == "A"){
		  //click on one of the affinity diagrams
		  $(el).on("touch click", changeDiagram);
	  }
  }
  
  function initAD(){
	  console.log("************ initAd ************");
	  if(window.frameDoc) {
  
		  let diagramDB, diagramDBDoc, baseDB, baseDBDoc;
		  //now currentFrame is affinity-diagram-view, get the diagramDB
		  diagramDB = window.frameDoc.querySelector("#source");
  
		  if(window.activeADdb && diagramDB && diagramDB.src !== 'https://demo.webstrates.net/' + window.activeADdb) {
			  diagramDB.src ='/' + window.activeADdb;
		  }
  
		  
		  if(diagramDB){
			  
			  diagramDB.webstrate.on("transcluded", () => {
				  //console.log("======= diagramDB transcluded ========");
				  diagramDBDoc = diagramDB.contentWindow.document;
  
				  baseDB = diagramDBDoc.querySelector("#source");
				  if(baseDB){
					  baseDB.webstrate.on("transcluded", () => {
						  //console.log("======= baseDB transcluded ========");
  
						  baseDBDoc = baseDB.contentWindow.document;
						  let frameBody =  baseDBDoc.querySelector("body");
						  
						  activateLongTouch(frameBody);
					  });
				  }
			  });
		  }
  
		  $(window.frameDoc.querySelector('body')).on('touchstart mousedown', (e) => {
			  switch(e.target.id){
				  case "levelUp":
					  levelUp(window.activeADdb);
					  break;
				  case "levelDown":
					  //console.log("down");
					  toggleMenu();
					  alert("already at the base diagram");
					  break;
				  case "color":
					  break;
			  }
		  });
  
	  }
  };
  
  function initMetaAD(){
	  console.log("******initMetaAd******");
  
	  if(window.frameDoc) {
  
		  $(window.frameDoc.querySelector('body')).on('touchstart mousedown', (e) => {
			  switch(e.target.id){
				  case "levelUp":
					  //console.log("you are alreay at second level");
					  alert("only support two-level hierarchy for now");
					  break;
				  case "levelDown":
					  levelDown();
					  break;
				  case "color":
					  break;
			  }
		  });
  
		  let lowerFrame, lowerFrameDoc, baseDB, baseDBDoc;
		  
		  lowerFrame = window.frameDoc.querySelector("#source");
  
		  if(lowerFrame){
			  if(window.lowerLevel && lowerFrame.src !== 'https://demo.webstrates.net/' + window.lowerLevel){
				  lowerFrame.src = '/' + window.lowerLevel;
			  }
  
			  lowerFrame.webstrate.on("transcluded", () => {
				  lowerFrameDoc = lowerFrame.contentWindow.document;
				  baseDB = lowerFrameDoc.querySelector("#source");
				  if(baseDB){
					  baseDB.webstrate.on("transcluded", () => {
						  baseDBDoc = baseDB.contentWindow.document;
						  let frameBody =  baseDBDoc.querySelector("body");
						  activateLongTouch(frameBody);
					  });
				  }
			  });
		  }
	  }
  }
  
  window._listeners = [];
  function activateLongTouch(target){
	  console.log("activateLongTouch");
	  let longtouchTimer;
	  let touchduration = 1000; 
  
	  let startHandler = (event) => {
		  if(event.cancelable){
			  event.preventDefault();
			  event.stopPropagation();
		  }
		  
		  let startX, startY, checkX, checkY;
  
		  let onlongtouch = function() {
			  console.log("long touch/click");
			  console.log(startX, startY, checkX, checkY);
  
			  if(startX && startY){
				  if(!checkX && !checkY){
					  //no move
					  toggleMenu(startX, startY);
				  }else{
					  let moveDis = Math.sqrt((startX-checkX)*(startX-checkX)+(startY-checkY)*(startY-checkY));
					  console.log(moveDis);
					  if(moveDis < 8){
						  console.log("on similar spot");
						  toggleMenu(startX, startY);
					  }
				  }
			  }
		  };
  
		  longtouchTimer = setTimeout(onlongtouch, touchduration);
  
		  if(event.type === "touchstart"){
			  let touch = event.touches[0] || event.changedTouches[0];
			  startX = touch.pageX;
			  startY = touch.pageY;
		  }else if(event.type === "mousedown"){
			  startX = event.pageX;
			  startY = event.pageY;
		  }
  
		  let moveHandler = (event) => {
			  if(event.cancelable){
				  event.preventDefault();
				  event.stopPropagation();
			  }
  
			  if(event.type === "touchmove"){
				  let touch = event.touches[0] || event.changedTouches[0];
				  checkX = touch.pageX;
				  checkY = touch.pageY;
			  }else if(event.type === "mousemove"){
				  checkX = event.pageX;
				  checkY = event.pageY;
			  }
		  };
  
		  let endHandler = (event) => {
			  if (longtouchTimer) clearTimeout(longtouchTimer);
				  //console.log("mouseup detected by ", webstrate.webstrateId);
				  if(event.cancelable){
					  event.preventDefault();
					  event.stopPropagation();
				  }
  
				  if(event.type === "touchend"){
					  removeListener(target, "touchmove");
					  removeListener(target, "touchend");
				  }else if(event.type === "mouseup"){
					  //remove mousemoveHandler
					  removeListener(target, "mousemove");
					  removeListener(target, "mouseup");
				  }
		  };
  
		  if(event.type === "touchstart"){
			  target.addEventListener("touchmove", moveHandler);
			  window._listeners.push({target: target, type: "touchmove", listener: moveHandler});
		  
			  target.addEventListener("touchend", endHandler);
			  window._listeners.push({target: target, type: "touchend", listener: endHandler});
		  }else if(event.type === "mousedown"){
			  //mousedown triggers the mousemoveHandler
			  target.addEventListener("mousemove", moveHandler);
			  window._listeners.push({target: target, type: "mousemove", listener: moveHandler});
			  target.addEventListener("mouseup", endHandler);
			  window._listeners.push({target: target, type: "mouseup", listener: endHandler});
		  }
  
	  };
  
	  target.addEventListener("mousedown", startHandler);
	  window._listeners.push({target: target, type: "mousedown", listener: startHandler});
  
	  target.addEventListener("touchstart", startHandler);
	  window._listeners.push({target: target, type: "touchstart", listener: startHandler});
  
  }; //END activateLongTouch
  
  function toggleMenu(x, y){
	  let menu = window.frameDoc.querySelector('.circle');
	  if(menu){
		  menu.classList.toggle('open');
		  if(x && y) menu.setAttribute("style", "left: "+ (x-125) +"px; top: "+ (y-125)+"px;");
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
  
  function levelUp(baseId){
	  console.log("go to a highter level");
	  toggleMenu();
	  let newWebstrate = baseId + '-meta';
	  console.log("new high level: ", newWebstrate);
	  
	  $.ajaxSetup({
		  error: AjaxError
	  });
  
	  function AjaxError(x, e) {
		  if (x.status == 0) {
			  alert(' Check Your Network.');
		  } else if (x.status == 404) {
			  alert('Requested URL not found.');
		  } else if (x.status == 409) {
			  //alert('URL already exists.');
			  changeCurrentIframe(newWebstrate);
			  window.lowerLevel = baseId;
  
			  checkBreadcrumbItem(newWebstrate);
			  
		  } else if (x.status == 500) {
			  alert('Internel Server Error.');
		  }  else {
			  alert('Unknow Error.\n' + x.responseText);
		  }
	  }
  
	  //request a new webstrate for meta clustering
	  $.get("/AffinityDiagram-prototype?copy=" + newWebstrate, (data, status, xhr) => {
		  changeCurrentIframe(newWebstrate);
		  window.lowerLevel = baseId;
		  
		  checkBreadcrumbItem(newWebstrate);
	  });
	  
  }
  
  function levelDown(){
	  console.log("go back to the lower level");
	  toggleMenu();
	  window.activeADdb = window.lowerLevel;
	  changeCurrentIframe(window.lowerLevel);
	  checkBreadcrumbItem(window.lowerLevel);
  }
  
  //////////////////////////////////////////////////////////////////////////////
  
  
  function changeView(event){
	  event.preventDefault();
	  event.stopPropagation();
  
	  let el = event.currentTarget;
	  let webstrateid = el.getAttribute("webstrateid");
  
	  //console.log("onClick ChangeView", webstrateid);
	  highlightItem(el);
	  changeCurrentIframe(webstrateid);
  }
  
  function highlightItem(el){
	  let styleSheet = document.styleSheets[0];
	  let CSSRuleList = styleSheet.cssRules;
	  let breadcrumbItems = document.querySelectorAll('.breadcrumb-item');
  
	  if( el instanceof jQuery) el = el.get(0);
  
	  breadcrumbItems.forEach((li) => {
		  let already = false;
		  let id = li.getAttribute("webstrateid");
		  if(el === li){
			  for(const rule of CSSRuleList){
				  if(rule.selectorText === 'li[webstrateid="'+ id +'"]'){
					  rule.style.color = "orange";
					  already = true;
				  }
			  }
			  if(!already){
				  let display = 'li[webstrateid="'+ id +'"] { color: orange;}';
				  styleSheet.insertRule(display, 0);
			  }
			  
		  }else{
			  for(const rule of CSSRuleList){
				  if(rule.selectorText === 'li[webstrateid="'+ id +'"]'){
					  rule.style.color = "black";
					  already = true;
				  }
			  }
			  if(!already){
				  let display = 'li[webstrateid="'+ id +'"] { color: black;}';
				  styleSheet.insertRule(display, 0);
			  }
		  }
	  });
  }
  
  function changeCurrentIframe(webstrateid) {
	  window.currentFrame = document.querySelector('#frame');
	  if(window.currentFrame){
		  if(webstrateid.includes("coding") || webstrateid.includes("Coding") || webstrateid.includes("meta")){
			  if(window.currentFrame.src !== 'https://demo.webstrates.net/'+webstrateid) {
				  window.currentFrame.src ='/'+webstrateid;
			  }
		  }else if(webstrateid.includes("projects")){
			  //do nothing for now
  
		  }else{
			  let viewer = "affinity-diagram-view";
			  if(window.currentFrame.src !== 'https://demo.webstrates.net/'+viewer) {
				  window.currentFrame.src ='/'+viewer;
			  }
			  // let diagramDB = window.frameDoc.querySelector("#source");
			  // //console.log("&&&&&&&&&&&&&", window.activeADdb, diagramDB, diagramDB.src);
			  // if(window.activeADdb && diagramDB && diagramDB.src !== 'https://demo.webstrates.net/' + window.activeADdb) {
			  // 	console.log("change diagram DB to ", window.activeADdb)
			  // 	diagramDB.src ='/' + window.activeADdb;
			  // }
		  }
	  }
  }
  
  function chooseDiagram(event){
	  event.preventDefault();
	  event.stopPropagation();
  
	  let dropdown = event.currentTarget.querySelector('.dropdown-menu');
  
	  if(dropdown){
		  let num = dropdown.querySelectorAll('.dropdown-item').length;
  
		  let openStatus = dropdown.getAttribute('transient-drop');
		  if(!openStatus){
			  dropdown.setAttribute('transient-drop', "false");
			  openStatus = dropdown.getAttribute('transient-drop');;
		  }
		  if(!(event.target.tagName === "INPUT")){
			  if(openStatus === "false"){
				  //fix me 
				  let offset = -(62+32*num);
				  dropdown.style.transform = 'translate3d(191px,'+ offset + 'px, 0px)';
				  
				  dropdown.setAttribute('transient-drop', "true");
	  
			  }else if(openStatus === "true"){
				  dropdown.setAttribute('transient-drop', "false");
			  }
		  }
	  }
  } //chooseDiagram(event)
  
  function enableNewDiagram(){
  
	  let newADBtn = document.querySelector('.addNewAD').querySelector('span');
	  let input = document.querySelector('.addNewAD').querySelector('input');
  
	  let newAD = (e) => {
		  e.preventDefault();
  
		  let newWebstrateId = $(input).val();
		  //console.log("newWebstrateId: ",newWebstrateId);
		  if(newWebstrateId === ""){
			  alert("plase enter a name for the ad!");
		  }else{
  
			  $.ajaxSetup({
				 error: AjaxError
			  });
  
			  function AjaxError(x, e) {
				if (x.status == 0) {
				  alert(' Check Your Network.');
				} else if (x.status == 404) {
				  alert('Requested URL not found.');
				} else if (x.status == 409) {
				  alert('URL already exists.');
				  // change the viewport to the meta-ad
				  //currentFrame.src =' /' + newWebstrate;
				} else if (x.status == 500) {
				  alert('Internel Server Error.');
				}  else {
				   alert('Unknow Error.\n' + x.responseText);
				}
			  }
  
			  let source = "/diagramDB"; //test
				$.get(source + "?copy=" + newWebstrateId, (data, status, xhr) => {
				  //stpe 1: add a new item in "list-group" in the ad-env page
				  let list = document.querySelector('.dropdown-menu');
				  if(list){
					  let $item = $('<a class="dropdown-item" webstrateid='+newWebstrateId+'>'+ newWebstrateId +'</a>');
					  $item.appendTo($(list));
  
					  let ADView = "AffinityDiagram-view";
					  window.activeADdb = newWebstrateId;
				  
					  changeCurrentIframe(ADView);
					  checkBreadcrumbItem(window.activeADdb);
  
					  //changeCurrentIframe(newWebstrateId);
					  //console.log(list);
					  addListener($item.get(0), "click");
				  }
				 });
		  }
	  }
  
	  $(newADBtn).on("touch click", newAD);
  
  
  } //END; 
  
  function changeDiagram(event){
	  console.log("--onClick ChangeDiagram--");
	  event.preventDefault();
  
	  let target = event.currentTarget;
	  let webstrateid = target.getAttribute("webstrateid");
	  
	  let ADView = "affinity-diagram-view";
	  window.activeADdb = webstrateid;	//console.log(window.activeADdb);
  
	  changeCurrentIframe(ADView);
	  checkBreadcrumbItem(window.activeADdb);
  }
  
  function checkBreadcrumbItem(id){
	  let itemNum = document.querySelectorAll('li.breadcrumb-item').length;
	  if(itemNum === 2){
		  let item = document.querySelector('.breadcrumb').querySelector('li[webstrateid="'+id+']');
		  //add
		  if(!item){
			  addBreadCrumbItem(id);
		  }
  
	  }else if (itemNum === 3){
		  //replace
		  let last = document.querySelectorAll('li.breadcrumb-item')[2];
		  if(last.getAttribute("webstrateid") != id){
			  last.setAttribute("webstrateid", id);
			  last.innerHTML = id;
  
			  //console.log("replace");
			  highlightItem(last);
			  addListener(last, "click");
		  }
	  }
  }
  
  function addBreadCrumbItem(webstrateid){
	  let $trans = $('<transient></transient>');
	  let $separator = $('<i class="fas fa-angle-right mx-2 separator show" aria-hidden="true"></i>');
	  let $item = $('<li webstrateid="'+webstrateid+'"class="breadcrumb-item show" aria-hidden="true">'+webstrateid+'</li>');
	  
	  $separator.appendTo($trans);
	  $item.appendTo($trans);
	  $trans.appendTo($(".breadcrumb"));
  
	  highlightItem($item[0]);
	  addListener($item[0], "click");
  }
  
  });  //END loaded