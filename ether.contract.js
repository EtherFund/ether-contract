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
}

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
	
	if(false) { // viewer
		editor.setReadOnly(true); 
	}
	
	loadContract();
	
	// show
	$("#editor").show();
	$("#editor").focus();
	editor.focus();
	
	goToLine( getLineCount(), 0);
}


function setPreferences() {
	if(gPref) {
		editor.setTheme(gPref['theme']);
	} else {
		editor.setTheme({'theme':"ace/theme/textmate"});
	}
	/*
	editor.getSession().setTabSize(4);
	editor.getSession().setUseSoftTabs(true);
	$('#editor').attr("style", "fontSize=12px;");
	editor.getSession().setUseWrapMode(true);
	editor.setHighlightActiveLine(false);
	editor.setShowPrintMargin(false);
	*/
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



function saveContract() {
	// according to gState
	
	// todo: populate hidden form
}


// download
function downloadContract() {
	$("#saveName").attr('value', gObj['name']);
	$("#saveLang").attr('value', gObj['language']);
	
	var code = editor.getValue().escapeSpecialChars();
	//console.log(code);
	
	$("#saveCode").attr('value', code);
	
	//
	
	$("#contractForm").attr('action', '/contract/download');
	$("#contractForm").submit();
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
