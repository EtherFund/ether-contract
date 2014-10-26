/*
- ether.contract.js v0.1
- Contract Editor and Viewer for Ethereum
- http://ether.fund/tool/contract
- (c) 2014 J.R. Bédard (jrbedard.com)
*/


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
	
	setLanguage();
	
	setPrivacy();
	
	setPreferences();
	
	loadContract();
	
	loadParameters(); // hash
		
	setEditor();
	
	setTimeout(function () {
		//editor.resize(true);
		$("#editor").show();
		$("#editor").focus();
		editor.focus();
		$("#editorLoader").remove();
	}, 100); 
	
	//setNavigateAway();
});



// Set language
function setLanguage() {
	var lang = gObj.language;
	var language = ETH_LANGUAGES[lang];
	
	// language label
	$("#language").text(language.name);
	$("#language").attr('href', language.specs);
	$("#language").attr('title', language.desc);
	
	// first line of the panel on the right
	$('#contractType >').tooltip('destroy');
	$("#contractType >").tooltip({placement:'top'});
	
	// first tag: language label
	$("#languageLabel").text(lang);
	//$("#languageLabel").attr('href', 'test'); // todo
	
	// mode
	editor.getSession().setMode(language.mode);
}


// Set Privacy
function setPrivacy() {
	var privacy = CONTRACT_PRIVACY[gObj.privacy];
	$("#privacyLabel").html(privacy.html);
	$("#privacyLabel").attr('title', privacy.title);
	$("#privacyLabel").attr('class', 'label label-'+privacy.label);
	
	$("#privacyLabel").tooltip('destroy');
	$("#privacyLabel").tooltip({placement:'right'});
}



function loadContract() {
	if(gObj.code) {
		editor.setValue(gObj.code);
	}
	
	// Data
	if(gObj.data) {
		//$("#data").text();
	} else {
		$("#data").text("No Data module yet.");
	}
	
	// Messages
	if(gObj.messages) {
		//$("#data").text();
	} else {
		$("#messages").text("No Messages module yet.");
	}
	
	// Debug
	if(gObj.debug) {
		//$("#data").text();
	} else {
		$("#debug").text("No Debug/Simulation module yet.");
	}
}



function setEditor() {
	
	// Anon
	if(isUserAnon()) { 
		etherGrowl("Welcome! Feel free to edit the contract", "info", 'fa-file-text-o', function() {
			etherGrowl("But you need to <a href='/user/login/'>Log-in</a> to create one", "warning", 'fa-sign-in')
		});
	} else {
		// is my doc?
		// else
	}
	
	// code changed
	editor.getSession().on('change', function(e) {
    	// e.type, etc
		//console.log(e);
		if(true) {
			setIconState('typing');
		}
	});
	
	
	// selected code
	editor.getSession().selection.on('changeSelection', function(e) {
		//console.log('test');
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
}



// load parameters from hash
function loadParameters() {
	var params = getHashParams();
	if(params) {
		if(params['l']) {
			editor.setHighlightActiveLine(true); // override..
			goToLine(params['l']);
			etherGrowl("The line "+params['l']+" is selected", "info", 'fa-indent');
		}
	} else {
		// else, from DB?
		goToLine( getLineCount(), 0);
	}
}


function setNavigateAway() {
	// todo: if not saved recently
	window.onbeforeunload = function() {
    	return "Your latest contract modification won't be saved";
	};
}





// Editor tabs
$('#contractTabs a').click(function(e) {
	e.preventDefault();
	$(this).tab('show');
});


// Download button
$("#downloadBtn").click(function(e) {
	e.preventDefault();
	$("#saveName").attr('value', gObj.name);
	$("#saveLang").attr('value', gObj.language);
	$("#saveCode").attr('value', encodeURIComponent(editor.getValue()));
	
	$("#downloadForm").attr('action', '/contract/download');
	$("#downloadForm").submit();
	
	etherGrowl("Downloading '<b>"+gObj.name+"."+ETH_LANGUAGES[gObj.language].ext+"</b>'...", "success", 'fa-download');
});



// Fork button
$("#forkBtn").click(function(e) {
	e.preventDefault();
	loginOrRegisterModal("<i class='fa fa-code-fork'></i> Forking Contract", "fork<br><b>"+gObj.name+"</b>", function() {
		// fork
		forkContract();
	});
});

// Star button
$("#starBtn").click(function(e) {
	e.preventDefault();
	loginOrRegisterModal("<i class='fa fa-star'></i> Starring Contract", "star<br><b>"+gObj.name+"</b>", function() {
		// star
		starContract();
	});
});

// Save Button
$("#saveBtn").click(function(e) {
	e.preventDefault();
	loginOrRegisterModal("<i class='fa fa-save'></i> Save Contract", "save<br><b>"+gObj.name+"</b>", function() {
		// save
		saveContract();
	});
});




// Save Contract
function saveContract() {
	if(isUserAnon()) { return; }
	gObj.code = editor.getValue();
	gObj.linecount = editor.session.getLength();
	
	etherPost("/contract/save", gObj, function(data) {
		etherGrowl("Saved '<b>"+gObj.name+"</b>'", "success", 'fa-save');
		
	}, function(data) {
		console.log('Error:'); console.log(data);
		etherGrowl("Error saving '<b>"+gObj.name+"</b>'", "danger", 'fa-warning');
	});
}


// Delete Contract
function deleteContract() {
	if(isUserAnon()) { return; }
	var modal = $("#deleteModal");
	modal.find("#deleteContractName").text(gObj.name); 
	modal.modal({}); // Delete Modal
	
	// Delete Button
	modal.find("#deleteContractBtn").off('click');
	modal.find("#deleteContractBtn").click(function(e) {
		e.preventDefault();
		
		etherPost("/contract/delete", gObj, function(data) {
			modal.modal('hide');
			etherGrowl("Deleted '<b>"+gObj.name+"</b>'", "success", 'fa-save');
			window.location.replace("/contracts/"); // redirect
		
		}, function(data) {
			//if('error' in data) {
			console.log('Error:'); console.log(data);
			modal.modal('hide');
			etherGrowl("Error deleting '<b>"+gObj.name+"</b>'", "danger", 'fa-warning');
		});
	});
}


// Fork Contract
function forkContract() {
	etherGrowl("Forking is not implemented yet!", "warning", 'fa-code-fork');
}


// Star Contract
function starContract() {
	etherPost("/contract/star", gObj, function(data) {
		$("#starBtn #starCount").text( gObj.stars.length+1 );
		//$("#starBtn").disable(true);
		etherGrowl("Starred '<b>"+gObj.name+"</b>'", "success", 'fa-star');
	
	}, function(data) {
		if('error' in data && data['error'] == 'already') { 
			etherGrowl("You already starred '<b>"+gObj.name+"</b>'", "warning", 'fa-star');
			return;
		}
		console.log('Error:'); console.log(data);
		etherGrowl("Error starring '<b>"+gObj.name+"</b>'", "danger", 'fa-warning');
	});
}



// All following should be angularJS!

// CONTRACT DIALOG

// OPEN contract meta dialog
$("#metaBtn, #editDesc").click(function(e) {
	e.preventDefault();
	var modal = $("#contractModal");
	
	modal.find("#contractName").val(gObj.name);
	modal.find("#contractDesc").val(gObj.desc);
	
	modal.find("#btnLanguage").val(gObj.language);
	modal.find("#btnLanguage").html(gObj.language+" <span class='caret'></span>");
	
	modal.find("#btnPrivacy").val(gObj.privacy);
	modal.find("#btnPrivacy").html(CONTRACT_PRIVACY[gObj.privacy].html +" <span class='caret'></span>");
	//todo: category
	
	modal.find("#saveMetaBtn").button("reset");
	modal.modal({});
	
	// language selected
	modal.find('ul#dropdownLanguages li a').off('click');
	modal.find("ul#dropdownLanguages li a").click(function(e) {
		e.preventDefault();
		modal.find("#btnLanguage").html($(this).html()+" <span class='caret'></span>");
		modal.find("#btnLanguage").val($(this).attr('data-id'));
	});
	
	// privacy selected
	modal.find('ul#dropdownPrivacy li a').off('click');
	modal.find("ul#dropdownPrivacy li a").click(function(e) {
		e.preventDefault();
		modal.find("#btnPrivacy").html($(this).html()+" <span class='caret'></span>");
		modal.find("#btnPrivacy").val($(this).attr('data-id'));
	});
	
	// Delete Button
	modal.find("#deleteBtn").off('click');
	modal.find("#deleteBtn").click(function(e) {
		e.preventDefault();
		deleteContract();
	});
});


// SAVE contract meta dialog
$("#saveMetaBtn").click(function(e) {
	e.preventDefault();
	if(isUserAnon()) { return; }
	var modal = $("#contractModal");
	
	gObj.name = modal.find("#contractName").val();
	gObj.desc = modal.find("#contractDesc").val();
	gObj.language = modal.find("#btnLanguage").val();
	gObj.privacy = modal.find("#btnPrivacy").val().toLowerCase();
	//todo: category
	
	gObj.code = editor.getValue();
	gObj.linecount = editor.session.getLength();
	
	
	etherPost("/contract/save", gObj, function(data) {
		$("h1 #contractName").text(gObj.name);
		$("#contractTabContent #contractDesc").text(gObj.desc);
		setLanguage();
		setPrivacy();
		// todo: category
		// todo: change slug in url if different than new slug
		
		modal.modal('hide');
		etherGrowl("Saved '<b>"+gObj.name+"</b>'", "success", 'fa-save');
		
	}, function(data) {
		//todo: if('error' in data) {
		console.log('Error:'); console.log(data);
		modal.modal('hide');
		etherGrowl("Error saving '<b>"+gObj.name+"</b>'", "danger", 'fa-warning');
	});
});




// EDITOR PREFERENCES DIALOG

// editor preference dialog
$("#prefBtn").click(function(e) {
	e.preventDefault();
	var modal = $("#prefModal");
	
	modal.find("ul#dropdownThemes li").remove();
	for(i=0; i < EDITOR_THEMES.length; ++i) {
		var theme = EDITOR_THEMES[i];
		modal.find("ul#dropdownThemes").append("<li class='"+(gPref.theme==theme?'active':'')+"'><a data-id='"+theme+"' href='#'>"+theme+"</a></li>");
	}
	modal.find("#btnTheme").html(gPref.theme + " <span class='caret'></span>");
	modal.find("#btnTheme").val(gPref.theme);
	modal.find("#fontSize").val(gPref.fontSize);
	modal.find("#tabSize").val(gPref.tabSize);
	
	// checkboxes..
	if(gPref.softTabs == "1") { modal.find("#softTabs").attr('checked', true); }
	if(gPref.wrapMode == "1") { modal.find("#wrapMode").attr('checked', true); }
	if(gPref.highlightActiveLine == "1") { modal.find("#highlightActiveLine").attr('checked', true); }
	if(gPref.showPrintMargin == "1") { modal.find("#showPrintMargin").attr('checked', true); }
	
	modal.find("#savePrefBtn").button("reset");
	modal.modal({});
	
	// theme preference selected
	modal.find('ul#dropdownThemes li a').off('click');
	modal.find("ul#dropdownThemes li a").click(function(e) {
		e.preventDefault();
		var theme = $(this).data('id');
		modal.find("#btnTheme").html(theme+" <span class='caret'></span>");
		modal.find("#btnTheme").val(theme);
		// note: cant change theme dynamically while in modal
	});
});


// Save editor preferences
$("#savePrefBtn").click(function(e) {
	e.preventDefault();
	var modal = $("#prefModal");
	
	gPref.theme = modal.find("#btnTheme").val();
	gPref.fontSize = modal.find("#fontSize").val();
	gPref.tabSize = modal.find("#tabSize").val();
	
	// checkboxes.
	gPref.softTabs = modal.find("#softTabs").is(':checked') ? "1" : "0";
	gPref.wrapMode = modal.find("#wrapMode").is(':checked') ? "1" : "0";
	gPref.highlightActiveLine = modal.find("#highlightActiveLine").is(':checked') ? "1" : "0";
	gPref.showPrintMargin = modal.find("#showPrintMargin").is(':checked') ? "1" : "0";
	
	// Anon
	if(isUserAnon()) { 
		modal.modal('hide');
		setPreferences();
		
		// todo: total-storage.js
		
		etherGrowl("Saved editor preferences temporarily", "success", 'fa-save', function() {
			etherGrowl("<a href='/user/login/'>Log-in or Register</a> to save permanently", "info", 'fa-cog');
		});
		return;
	}
	
	// save for logged-in users
	etherPost("/contract/userpref", gPref, function(data) {
		modal.modal('hide');
		setPreferences();
		etherGrowl("Saved Editor Preferences", "success", 'fa-save');
		
	}, function(data) {
		//todo: if('error' in data) { }
		console.log('Error:'); console.log(data);
		modal.modal('hide');
		etherGrowl("Error saving editor preferences", "danger", 'fa-warning');
	});
});


// Set preferences
function setPreferences() {
	editor.setTheme("ace/theme/"+gPref.theme);
	document.getElementById('editor').style.fontSize = gPref.fontSize+'px';
	
	editor.getSession().setTabSize(parseInt(gPref.tabSize));
	editor.getSession().setUseSoftTabs(gPref.softTabs == "1");
	editor.getSession().setUseWrapMode(gPref.wrapMode == "1");
	editor.setHighlightActiveLine(gPref.highlightActiveLine == "1");
	editor.setShowPrintMargin(gPref.showPrintMargin == "1");
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

