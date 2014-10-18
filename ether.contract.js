/*
- ether.contract.js v0.1
- Contract Editor and Viewer for Ethereum
- http://ether.fund/tool/contract
- (c) 2014 J.R. Bédard (jrbedard.com)
*/

// todo: multiple settings per lang?
const EDITOR_SETTINGS = {
	'lll':{'name':"LLL", 'mode':"ace/mode/lisp",
	},
	'mutan':{'name':"Mutan", 'mode':"ace/mode/c_cpp",
	},
	'serpent':{'name':"Serpent", 'mode':"ace/mode/python",
	},
	'solidity':{'name':"Solidity", 'mode':"ace/mode/c_pp",
	},
}


const EDITOR_SCAFOLDS = {
	'lll':{'code':"lll..."},
	'serpent':{'code':"init:\n\ncode:\n"},
	'mutan':{'code':"mutan..."},
}

const ICON_STATES = {
	'default':{'icon':"file-o",'color':""},
	'typing':{'icon':"file-o",'color':""},
	'error':{'icon':"file-o",'color':""},
}

var editor = null;

// from backend
var gLang = "lll";
var gPref = {'theme':"ace/theme/textmate"}; // user preferences



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
		console.log(e);
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
	
	var language = ETH_LANGUAGES[gLang]
	var settings = EDITOR_SETTINGS[gLang];
	
	// language btn
	$("#btn-language").html(language['name'] + " <span class='caret'></span>");
	
	$("#language").text(language['name']);
	$("#language").attr('href', language['specs']);
	$("#language").attr('title', language['desc']);
	
	// first line of the right editor
	$('#contractType >').tooltip('destroy');
	$("#contractType >").tooltip({placement:'top'});
	
	
	// mode
	editor.getSession().setMode(settings['mode']);
	editor.setTheme(gPref['theme']);
	
	var scafold = EDITOR_SCAFOLDS[gLang];
	if(true) {
		editor.setValue(scafold['code']);
	}

	if(false) { // viewer
		editor.setReadOnly(true); 
	}

	// show
	$("#editor").show();
	$("#editor").focus();
	editor.focus();	
}


function setPreferences() {
	editor.getSession().setTabSize(4);
	editor.getSession().setUseSoftTabs(true);
	document.getElementById('editor').style.fontSize='12px';
	editor.getSession().setUseWrapMode(true);
	editor.setHighlightActiveLine(false);
	editor.setShowPrintMargin(false);
	editor.setReadOnly(true);
}


// changed language
$("#dropdown-language a").click(function() {
	gLang = $(this).attr('data-id');
	//$(this).parent().addClass('active');
	setEditor();
	return true;
});


function goToLine(lineNumber) {
	editor.gotoLine(lineNumber);
}
function getLineCount() {
	return editor.session.getLength();
}


// Editor tabs
$('#contractTabs a').click(function (e) {
	e.preventDefault()
	$(this).tab('show')
})



function setIconState(state) {
	var state = ICON_STATES[state];
	$("#contractIcon").html("<i class='fa fa-file-text-o'></i>");
}


/*
window.onbeforeunload = function() {
    return 'Are you sure you want to navigate away from this page?';
};
*/
