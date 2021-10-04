let transcriptFrame, transcriptDoc, frameDB, dbDoc;

webstrate.Coding = {
	transcriptFrame: undefined,
	transcriptDoc: undefined,
	frameDB: undefined,
	dbDoc:undefined,
	checkID: undefined,

	databaseEngine: undefined,
	generateEngine: undefined,
	linkEngine: undefined,
	syncWebstrates: undefined
	
};

webstrate.on("loaded", function(webstrateId, clientId, user) {
  // The Webstrates client has now finished loading.
	console.log(webstrateId, "loaded");

    pageSetUp(); 
	
	// $('#transcription-p18').on("click touchend", e =>{
	// 	let transcript = e.currentTarget.id;
	// 	let currentTranscript = document.querySelector('#transcriptionView');
	// 	if(currentTranscript){
	// 		if(currentTranscript.src !== 'https://webstrates.r2.enst.fr/' + transcript) {
	// 			currentTranscript.src ='/'+transcript;
	// 		}
	// 	}
	// });
	
	transcriptFrame = document.getElementById('transcriptionView');
	frameDB = document.getElementById('db');

	if(transcriptFrame && frameDB){
		webstrate.Coding.transcriptFrame = transcriptFrame;
		webstrate.Coding.frameDB = frameDB;

	    transcriptFrame.webstrate.on("transcluded", function(webstrateId, clientId, user) {
			console.log("transcriptFrame transcluded");
			// The webstrate client in the iframe has now finished loading.
			transcriptDoc = transcriptFrame.contentWindow.document; 
			webstrate.Coding.transcriptDoc = transcriptDoc;

			frameDB.webstrate.on("transcluded", function(webstrateId, clientId, user) {
				console.log("frameDB transcluded");
				// The webstrate client in the iframe has now finished loading.
				dbDoc = frameDB.contentWindow.document;
				webstrate.Coding.dbDoc = dbDoc;

				setDependencies();

				//for transcript
				initCssonTranscript();
				
				//for database
				initCssOnDataBase();

				if(webstrate.Coding.checkID){
					showSource();
				}
			});

		});
	}

	function initCssonTranscript(){
		let styleSheet = transcriptDoc.styleSheets[0];
		//add basic stylesheet to database
		if(document.getElementById('style-transcript.css')){
			let dataViewCssRules = document.getElementById('style-transcript.css').sheet.cssRules;
			if(dataViewCssRules){
				for (const rule of dataViewCssRules){
					let ruleString = rule.cssText;
					styleSheet.insertRule(ruleString, 0);
				}
			}
		}
	}

	function initCssOnDataBase() {
		let styleSheet = dbDoc.styleSheets[0];
		//add basic stylesheet to database
		if(document.getElementById('style-database.css')){
			let dataViewCssRules = document.getElementById('style-database.css').sheet.cssRules;
			if(dataViewCssRules){
				for (const rule of dataViewCssRules){
					let ruleString = rule.cssText;
					styleSheet.insertRule(ruleString, 0);
				}
			}
		}
	}


});  //END: webstrate on.loaded

function pageSetUp(){
    if(cQuery('#counter').length == 0){
        let counter = cQuery('<div number="0" style="display: none;"></div>');
        counter[0].id = "counter";
        cQuery(document.body).append(counter);
        WPMv2.stripProtection(counter[0]);
    }
}

async function setDependencies(){
	let generateEngineFrag = await Fragment.one("#generateEngine").require();
	webstrate.Coding.generateEngine = generateEngineFrag.generateEngine;

	let databaseEngineFrag = await Fragment.one("#databaseEngine").require();
	webstrate.Coding.databaseEngine = databaseEngineFrag.databaseEngine;

	let linkEngineFrag = await Fragment.one("#linkEngine").require();
	webstrate.Coding.linkEngine = linkEngineFrag.linkEngine;

	let syncWebstratesFrag = await Fragment.one("#syncWebstrates").require();
	webstrate.Coding.syncWebstrates = syncWebstratesFrag.syncWebstrates;

	// console.log("=====herehere===");
	// console.log( webstrate.Coding.generateEngine);
	// console.log( webstrate.Coding.databaseEngine);
	// console.log( webstrate.Coding.linkEngine);
	// console.log( webstrate.Coding.syncWebstrates);

	webstrate.Coding.generateEngine();
	webstrate.Coding.databaseEngine();
	webstrate.Coding.linkEngine();
	webstrate.Coding.syncWebstrates();
}

/*
* update the snippet's cluster info
* 1. updateClusterInfo: update info in the snippets' cluster attribute
* 2. updateTagList: add metaTag info in QDA-database (tag-list)
*/

function updateClusterInfo(note, clusterID) {
    let clusters = note.getAttribute("cluster");
	let clusterArray = clusters.split(",");
	const isInClusters = clusterArray.some(v => v === clusterID);

	if(clusters == "none"){
		note.setAttribute("cluster", clusterID);
	}else if(!isInClusters){
		clusters += ',' + clusterID;
		note.setAttribute("cluster", clusters);
	}
}


function updateTagList(id, tagValue) {
  //update the tagging info in QDA-database
  let doc = window.frameRight.contentWindow.document;
  if(doc){

	  if(!doc.querySelector("#tag-list")){
	  	  let $list = $('<ul id="tag-list" style="display:none"></ul>');
		  $list.appendTo($(doc));
	  }
  	  let list = doc.querySelector("#tag-list");
	  //add in tag-list
	  if(!list.querySelector('#'+id)){
		  let li = $('<li tagID="'+id+'" tag-value="'+tagValue+'"></li>');
		  li.appendTo($(list));
	  }
   }
}


/*
* convert to CSV file to download the coded data
*/

var snippetData = [];

function generate_snippet_data(){
    snippetData = [];
    var frame2 = document.getElementById('frame2').contentWindow.document;
    var snippets = frame2.getElementsByClassName('snippet');
    for(var i=0; snippets.length > i; i++){
        var oneSnippet = {id: snippets[i].id,
                        participant: snippets[i].getAttribute('participant'),
                        url: snippets[i].getAttribute('url'),
                        snippet: snippets[i].innerText };
        snippetData.push(oneSnippet);
    }

}

function convertArrayOfObjectsToCSV(args) {
        var result, ctr, keys, columnDelimiter, lineDelimiter, data;

        data = args.data || null;
        if (data == null || !data.length) {
            return null;
        }

        columnDelimiter = args.columnDelimiter || ';';
        lineDelimiter = args.lineDelimiter || '\n';

        keys = Object.keys(data[0]);

        result = '';
        result += keys.join(columnDelimiter);
        result += lineDelimiter;

        data.forEach(function(item) {
            ctr = 0;
            keys.forEach(function(key) {
                if (ctr > 0) result += columnDelimiter;

                result += item[key];
                ctr++;
            });
            result += lineDelimiter;
        });

        return result;
}

function downloadCSV(args) {

    generate_snippet_data();

    var data, filename, link;
    var csv = convertArrayOfObjectsToCSV({
        data: snippetData
    });
    if (csv == null) return;

    filename = args.filename || 'export.csv';

    if (!csv.match(/^data:text\/csv/i)) {
        csv = 'data:text/csv;charset=utf-8,' + csv;
    }
    data = encodeURI(csv);

    link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download', filename);
    link.click();
}