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
};

// themes
const EDITOR_THEMES = ["ambiance","chaos","chrome","clouds","clouds_midnight","cobalt","crimson_editor","dawn","dreamweaver","eclipse","github","idle_fingers","katzenmilch","kr_theme","kuroir","merbivore","merbivore_soft","mono_industrial","monokai","pastel_on_dark","solarized_dark","solarized_light","terminal","textmate","tomorrow","tomorrow_night","tomorrow_night_blue","tomorrow_night_bright","tomorrow_night_eighties","twilight","vibrant_ink","xcode"];

const EDITOR_DEFAULT = {"theme":"textmate", "fontSize":"12", "tabSize":"4", "softTabs":1, "wrapMode":1, "highlightActiveLine":1, "showPrintMargin":0};

const ICON_STATES = {
	'default':{'icon':"file-o",'color':""},
	'typing':{'icon':"file-o",'color':""},
	'error':{'icon':"file-o",'color':""},
};

// from backend
var gObj = null; // contract
var gState = null; // contract state : new,edit,view,etc
var gPref = null; // user preferences

// ace editor
var editor = null;




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
	
	// first line of the panel on the right
	$('#contractType >').tooltip('destroy');
	$("#contractType >").tooltip({placement:'top'});
	
	if(isUserAnon()) { // Anonymous
		
	}
	
	// mode
	editor.getSession().setMode(settings['mode']);
	
	// preferences
	setPreferences();
	
	//console.log(gState);
	if(gState['name'] == 'view') { // viewer
		//editor.setReadOnly(true);
	} else {
		
	}
	
	loadContract();
	
	// show
	$("#editor").show();
	$("#editor").focus();
	editor.focus();
	
	loadParameters(); // hash
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
			editor.setHighlightActiveLine(true); // override..
			goToLine(params['l']);
		}
	} else {
		// else, from DB?
		goToLine( getLineCount(), 0);
	}
}






// Editor tabs
$('#contractTabs a').click(function(e) {
	e.preventDefault();
	$(this).tab('show');
});


// Download button
$("#downloadBtn").click(function(e) {
	e.preventDefault();
	
	$("#saveName").attr('value', gObj['name']);
	$("#saveLang").attr('value', gObj['language']);
	$("#saveCode").attr('value', encodeURIComponent(editor.getValue()));
	
	$("#downloadForm").attr('action', '/contract/download');
	$("#downloadForm").submit();
	
	etherGrowl("Downloading '<b>"+gObj['name']+"</b>'...", "success");
});



// Fork button
$("#forkBtn").click(function(e) {
	e.preventDefault();
	loginOrRegisterModal("<i class='fa fa-code-fork'></i> Forking Contract", "fork<br><b>"+gObj['name']+"</b>", function() {
		// fork
		forkContract();
	});
});

// Save Button
$("#saveBtn, #editDesc").click(function(e) {
	e.preventDefault();
	loginOrRegisterModal("<i class='fa fa-save'></i> Save Contract", "save<br><b>"+gObj['name']+"</b>", function() {
		// save
		saveContract();
	});
});

// Login or Register Modal
function loginOrRegisterModal(title, action, func) {
	if(isUserAnon()) {
		$("#loginModal .modal-title").html(title);
		$("#loginModal #dothat").html(action); 
		$("#loginModal").modal({});
	} else {
		func();
	}
}

// Save Contract
function saveContract() {
	if(isUserAnon()) { return; }
	// according to gState
	
	etherPost("/contract/save", gObj, function(data) {
		etherGrowl("Saved '<b>"+gObj['name']+"</b>'", "success");
		
	}, function(data) {
		etherGrowl("Error saving '<b>"+gObj['name']+"</b>'", "danger");
		console.log('error saving: '+data);
	});
}


// Fork Contract
function forkContract() {
	
}



// All following should be angularJS!

// CONTRACT DIALOG

// contract meta dialog
$("#metaBtn").click(function(e) {
	e.preventDefault();
	$("#contractModal #contractName").val(gObj['name']);
	$("#contractModal #contractDesc").val(gObj['desc']);
	//todo: btn-language, category
	
	$("#saveMetaBtn").button("reset");
	$("#contractModal").modal({});
});


// save contract meta dialog
$("#saveMetaBtn").click(function(e) {
	e.preventDefault();
	gObj['name'] = $("#contractModal #contractName").val();
	gObj['desc'] = $("#contractModal #contractDesc").val();
	//todo: btn-language, category
	
	etherPost("/contract/save", gObj, function(data) {
  		$("h1 #contractName").text(gObj['name']);
		$("#contractTabContent #contractDesc").text(gObj['desc']);
		$("#contractModal").modal('hide');
		etherGrowl("Saved '<b>"+gObj['name']+"</b>'", "success");
		
	}, function(data) {
		console.log('error: '+data);
		$("#contractModal").modal('hide');
		etherGrowl("Error saving '<b>"+gObj['name']+"</b>'", "danger");
	});
});




// EDITOR PREFERENCES DIALOG

// editor preference dialog
$("#prefBtn").click(function(e) {
	e.preventDefault();
	
	for(i=0; i < EDITOR_THEMES.length; ++i) {
		var theme = EDITOR_THEMES[i];
		$("ul#dropdownThemes").append("<li><a data-id='"+theme+"' href='#'>"+theme+"</a></li>");
	}
	$("#prefModal #btnTheme").html(gPref['theme'] + " <span class='caret'></span>");
	$("#prefModal #btnTheme").val(gPref['theme']);
	$("#prefModal #fontSize").val(gPref['fontSize']);
	$("#prefModal #tabSize").val(gPref['tabSize']);
	
	// checkboxes..
	if(gPref['softTabs']) { $("#prefModal #softTabs").attr('checked', true); }
	if(gPref['wrapMode']) { $("#prefModal #wrapMode").attr('checked', true); }
	if(gPref['highlightActiveLine']) { $("#prefModal #highlightActiveLine").attr('checked', true); }
	if(gPref['showPrintMargin']) { $("#prefModal #showPrintMargin").attr('checked', true); }
	
	$("#savePrefBtn").button("reset");
	$("#prefModal").modal({});
	
	// theme preference selected
	$('#prefModal ul#dropdownThemes li a').off('click');
	$("#prefModal ul#dropdownThemes li a").click(function(e) {
		e.preventDefault();
		
		var theme = $(this).attr('data-id');
		$("#prefModal #btnTheme").html(theme+" <span class='caret'></span>");
		$("#prefModal #btnTheme").val(theme);
		// note: cant change theme dynamically while in modal
	});
});



// Save editor preferences
$("#savePrefBtn").click(function(e) {
	e.preventDefault();
	
	gPref['theme'] = $("#prefModal #btnTheme").val();
	gPref['fontSize'] = $("#prefModal #fontSize").val();
	gPref['tabSize'] = $("#prefModal #tabSize").val();
	
	// checkboxes..
	gPref['softTabs'] = $("#prefModal #softTabs").is(':checked') ? 1 : 0;
	gPref['wrapMode'] = $("#prefModal #wrapMode").is(':checked') ? 1 : 0;
	gPref['highlightActiveLine'] = $("#prefModal #highlightActiveLine").is(':checked') ? 1 : 0;
	gPref['showPrintMargin'] = $("#prefModal #showPrintMargin").is(':checked') ? 1 : 0;
	
	// Anon
	if(isUserAnon()) { 
		$("#prefModal").modal('hide');
		setPreferences();
		etherGrowl("Saved Editor Preferences", "success");
		return;
	}
	
	// todo: cookie alt??
	
	// save for users
	etherPost("/contract/userpref", gPref, function(data) {
		$("#prefModal").modal('hide');
		setPreferences();
		etherGrowl("Saved Editor Preferences", "success");
		
	}, function(data) {
		console.log('error: '+data);
		$("#prefModal").modal('hide');
		etherGrowl("Error saving editor preferences", "danger");
	});
});


// Set preferences
function setPreferences() {
	//console.log(gPref);
	editor.setTheme("ace/theme/"+gPref['theme']);
	document.getElementById('editor').style.fontSize=gPref['fontSize']+'px';
	
	editor.getSession().setTabSize(parseInt(gPref['tabSize']));
	editor.getSession().setUseSoftTabs(gPref['softTabs'] == 1);
	editor.getSession().setUseWrapMode(gPref['wrapMode'] == 1);
	editor.setHighlightActiveLine(gPref['highlightActiveLine'] == 1);
	editor.setShowPrintMargin(gPref['showPrintMargin'] == 1);
	//editor.getSession().setShowFoldWidget(true);
	//editor.getSession().showInvisibles(true);
}


function contractGrowl() {
	
}


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
