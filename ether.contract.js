/*
- ether.contract.js v0.1
- Contract Editor and Viewer for Ethereum
- http://ether.fund/tool/contract
- (c) 2014 J.R. Bédard (jrbedard.com)
*/

// todo: multiple settings per lang?
const EDITOR_SETTINGS = {
	'LLL':{'name':"LLL", 'mode':"ace/mode/lisp",
	},
	'Mutan':{'name':"Mutan", 'mode':"ace/mode/c_cpp",
	},
	'Serpent':{'name':"Serpent", 'mode':"ace/mode/python",
	},
	'Solidity':{'name':"Solidity", 'mode':"ace/mode/c_cpp",
	},
}

// themes
const EDITOR_THEMES = ["ambiance","chaos","chrome","clouds","cloud_midnight","cobalt","crimson_editor","dawn","dreamweaver","eclipse","github","idle_fingers","katzenmilch","kr_theme","kuroir","merbivore","merbivore_soft","mono_industrial","monokai","pastel_on_dark","solarized_dark","solarized_light","terminal","textmate","tomorrow","tomorrow_night","tomorrow_night_blue","tomorrow_night_bright","tomorrow_night_eighties","twilight","vibrant_ink","xcode"];


const ICON_STATES = {
	'default':{'icon':"file-o",'color':""},
	'typing':{'icon':"file-o",'color':""},
	'error':{'icon':"file-o",'color':""},
}




var editor = null;

// from backend
var gObj = null; // contract
var gState = null; // contract state : new,edit,view,etc
var gPref = null; // user preferences


// Init
$(function () {
	$("#push").remove();
	$("#footer").remove();
	$("#editor").hide();
	
	editor = ace.edit("editor");
	setEditor();
	
	
	// code changed
	editor.getSession().on('change', function(e) {
    	// e.type, etc
		//console.log(e);
		setIconState('typing');
	});
	
	// selected code
	editor.getSession().selection.on('changeSelection', function(e) {
	});
	
	// annotation changed
	editor.getSession().on("changeAnnotation", function(){
		var annot = editor.getSession().getAnnotations();
		for(var key in annot) {
			if(annot.hasOwnProperty(key)) {
            	//console.log("[" + annot[key][0].row + " , " + annot[key][0].column + "] - \t" + annot[key][0].text);
    		}
		}
	});
	
	// add command
	editor.commands.addCommand({
		name: 'myCommand',
		bindKey: {win: 'Ctrl-M',  mac: 'Command-M'},
		exec: function(editor) {
		},
		readOnly: true // false if this command should not apply in readOnly mode
	});

	
	$("#editorLoader").remove();
});


function setEditor() {
	$("#editor").hide();
	
	var lang = gObj['language']
	var language = ETH_LANGUAGES[lang]
	var settings = EDITOR_SETTINGS[lang];
	
	// language label
	$("#language").text(language['name']);
	$("#language").attr('href', language['specs']);
	$("#language").attr('title', language['desc']);
	
	// first line of the right editor
	$('#contractType >').tooltip('destroy');
	$("#contractType >").tooltip({placement:'top'});
	
	// mode
	editor.getSession().setMode(settings['mode']);
	
	// preferences
	setPreferences();
	
	//console.log(gState);
	if(gState['name'] == 'view') { // viewer
		editor.setReadOnly(true);
	} else {
		$("#editBtn").addClass('active');
	}
	
	loadContract();
	
	// show
	$("#editor").show();
	$("#editor").focus();
	editor.focus();
	
	loadParameters(); // hash
}


function setPreferences() {
	if(gPref) {
		editor.setTheme("ace/theme/"+gPref['theme']);
	} else {
		editor.setTheme({'theme':"ace/theme/textmate"});
	}
	
	$('#editor').attr("style", "fontSize=10px;");
	
	editor.getSession().setTabSize(4);
	editor.getSession().setUseSoftTabs(true);
	editor.getSession().setUseWrapMode(true);
	editor.setHighlightActiveLine(true);
	editor.setShowPrintMargin(false);
	
	//editor.getSession().setShowFoldWidget(true);
	//editor.getSession().showInvisibles(true);
	
	
	for(i=0; i < EDITOR_THEMES.length; ++i) {
		var theme = EDITOR_THEMES[i];
		$("ul#dropdown-editor-theme").append("<li><a data-id='"+theme+"' href='#'>"+theme+"</a></li>");
	}
	$("#btnTheme").html(gPref['theme'] + " <span class='caret'></span>");
	
}


function loadContract() {
	
	if(gObj['code']) {
		editor.setValue(gObj['code']);
	}
	
	// Data
	if(gObj['data']) {
		//$("#data").text();
	} else {
		$("#data").text("No Data module yet.");
	}
	
	// Messages
	if(gObj['messages']) {
		//$("#data").text();
	} else {
		$("#messages").text("No Messages module yet.");
	}
	
	// Debug
	if(gObj['debug']) {
		//$("#data").text();
	} else {
		$("#debug").text("No Debug/Simulation module yet.");
	}
}


// load parameters from hash
function loadParameters() {
	var params = getHashParams();
	if(params) {
		if(params['l']) {
			editor.setHighlightActiveLine(true); // ?
			goToLine(params['l']);
		}
	} else {
		// else, from DB?
		
		goToLine( getLineCount(), 0);
	}
}




function saveContract() {
	// according to gState
	
	// todo: populate hidden form
}


// download
function downloadContract() {
	$("#saveName").attr('value', gObj['name']);
	$("#saveLang").attr('value', gObj['language']);
	
	var code = editor.getValue();
	code = encodeURIComponent(code);
	$("#saveCode").attr('value', code);
	
	$("#contractForm").attr('action', '/contract/download');
	$("#contractForm").submit();
}


// edit contract
function editContract() {
	
	$("#editBtn").addClass('active');
	editor.setReadOnly(false); 
	
	//$("#contractHistoryList").append("<li>Updated by '' <abbr></abbr></li>");
}

// for contract
function forkContract() {
	// coming soon
}



// Editor tabs
$('#contractTabs a').click(function(e) {
	e.preventDefault();
	$(this).tab('show');
});


// Download button
$("#downloadBtn").click(function(e) {
	e.preventDefault();
	downloadContract();
});

// Edit button
$("#editBtn").click(function(e) {
	e.preventDefault();
	editContract();
});

// Fork button
$("#forkBtn").click(function(e) {
	e.preventDefault();
	if(!gUser || gUser=="AnonymousUser") {
		$("#loginModal .modal-title").html("<i class='fa fa-code-fork'></i> Forking Contract");
		$("#loginModal #dothat").html("fork <b>"+gObj['name']+"</b>"); 
		$("#loginModal").modal({});
	} else {
		
	}
});

// Save Button
$("#saveBtn, #editDesc").click(function(e) {
	e.preventDefault();
	if(!gUser || gUser=="AnonymousUser") {
		$("#loginModal .modal-title").html("<i class='fa fa-save'></i> Save Contract");
		$("#loginModal #dothat").html("save <b>"+gObj['name']+"</b>"); 
		$("#loginModal").modal({});
	} else {
		
	}
});







// contract meta dialog
$("#metaBtn").click(function(e) {
	e.preventDefault();
	$("#contractModal").modal({});
});

$("#saveMetaBtn").click(function(e) {
	e.preventDefault();
	$("#contractModal").modal('hide');
});


// editor preference dialog
$("#prefBtn").click(function(e) {
	e.preventDefault();
	$("#preferenceModal").modal({});
});

$("#savePrefBtn").click(function(e) {
	e.preventDefault();
	$("#preferenceModal").modal('hide');
});


// theme preference selected
$("ul#dropdown-editor-theme li a").click(function(e) {
	e.preventDefault();
	var theme = $(this).attr('data-id');
	console.log(theme);
	$("#btnTheme").html(theme+" <span class='caret'></span>");
	
	editor.setTheme({'theme':"ace/theme/"+theme});
});








// Editor State

function goToLine(line, col) {
	editor.gotoLine(line, col, false);
}
function getLineCount() {
	return editor.session.getLength();
}


function setIconState(state) {
	var state = ICON_STATES[state];
	$("#contractIcon").html("<i class='fa fa-file-text-o'></i>");
}


/*
window.onbeforeunload = function() {
    return 'Are you sure you want to navigate away from this page?';
};
*/
