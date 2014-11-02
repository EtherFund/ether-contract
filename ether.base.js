/*
- ether.base.js v0.1
- Basic data utilities for ethereum tools, contracts & tutorials
- http://ether.fund
- (c) 2014 J.R. Bédard (jrbedard.com)
*/



function getBTCprice(func) {
	$.get('/api/btc_price', function(data) {
		//btcprice = new BigNumber(data);
		gBtcPrice = data.toFixed(2);
		func(gBtcPrice);
	});
}


// Convert to all ether denominations
function convertEther(input, options) {
	// todo options
	var ether = new BigNumber(ETH_UNITS[input['unit']]).times(input['value']); // value for 1 ETH
	
	var output = $.extend({}, ETH_UNITS);
	$.each(ETH_UNITS, function(unit, value) {
		output[unit] = ether.dividedBy(value).noExponents();
	});
	return output;
}

// figure wich ether unit to use
function figureEtherUnit(input) {
	var output = convertEther(input);
	var best = null; // best unit
	$.each(output, function(unit, value) {
		val = new BigNumber(value);	
		if(value >= 1 && value <= 1000) {
			best = {unit:unit, value:val};
		}
	});
	//console.log(best);
	if(!best) { best = input; }
	return best;
}



// convert to all BTC denomination
function convertBTC(input, options) {
	// todo options
	var btc = new BigNumber(BTC_UNITS[input['unit']]).times(input['value']); // value for 1 BTC
	
	var output = $.extend({}, BTC_UNITS);
	$.each(BTC_UNITS, function(unit, value) {
		output[unit] = btc.dividedBy(value).noExponents();
	});
	return output;
}

// figure 
function figureBTCUnit(input) {
	return input;
}


function convertUSD() {
	
}





// set value+unit selector
function setEtherInput(id, value, unit) {
	if(value || value==0) {
		$("#input-"+id).val(value); // value
	}
	if(unit) {
		$("#btn-"+id).val(unit);
		$("#btn-"+id).html(unit+" <span class='caret'></span>");
		
		$("#dropdown-"+id+" li").removeClass("active");
		$("#dropdown-"+id+" li#in-"+unit).addClass("active"); // active in dd
	}
}


// validate an ether input value
function validateEtherInput(ids) {
	var values = {};
	for(i=0; i<ids.length; i++) {
		var id = ids[i];
		// value
		var val = $("#input-"+id).val();
		if(!val || val=="") {
			$("#input-"+id+"-wrap").addClass("has-error");
			continue;
		}
		if(isNaN(val)) {
			$("#input-"+id+"-wrap").addClass("has-error");
			continue;
		}
		// ok, cleared!
		$("#input-"+id+"-wrap").removeClass("has-error");
		
		var unit = $("#btn-"+id).val();
		values[id] = {value:parseFloat(val), unit:unit};		
	}
	if(ids.length != Object.keys(values).length) { // invalid inputs
		return null;
	}
	return values;
}


// no scientific notation: 1e3 -> 1000
BigNumber.prototype.noExponents = function(){
	var data= String(this).split(/[eE]/);
	if(data.length== 1) return data[0]; 

	var  z= '', sign= this<0? '-':'',
	str= data[0].replace('.', ''),
	mag= Number(data[1])+ 1;

	if(mag<0){
		z= sign + '0.';
		while(mag++) z += '0';
		return z + str.replace(/^\-/,'');
	}
	mag -= str.length;  
	while(mag--) z += '0';
	return str + z;
}

// add english commas to numbers
Number.prototype.withCommas = function() {
	return this.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function toggleCommas(show) {
	if(show) {
		$("input").each(function(index) {
			var val = $(this).val();
			if(val && val != "" && !isNaN(val)) {
				console.log(val);
				$(this).val( parseFloat(val).withCommas() );
			}
		});
	}
}



// set URL params
function setHashParams(input, set) {
	var str = [];
	$.each(input, function(id, obj) { // each field (id,obj)
		var args = obj['hash']; // todo: not flexible!!
		str.push(encodeURIComponent(args[0]) + "=" + encodeURIComponent(obj['value']));
		str.push(encodeURIComponent(args[1]) + "=" + encodeURIComponent(obj['unit']));
	});
	var hash = str.join("&");
	$(".shareLink").attr('href', gPageUrl+"#"+hash);
	
	if(set) { // actually set hash in URL
		if(history.pushState) {
	    	history.pushState(null,null,"#"+hash);
		} else {
	    	document.location.hash = hash;
		}
	}
	return hash;
}


$(".shareLink").attr('title',"Click to generate a URL in address bar with your inputs so you can save & share.");
$('.shareLink').tooltip({'placement':'bottom'});

// permanent link with hash, clicked
$(".shareLink").click(function() {
	window.location.reload();
});


// get params from URL hash
function getHashParams() {
	if(!document.location.hash) { return null; }
	var hashParams = {};
	var e,
	    a = /\+/g, // Regex for replacing addition symbol with a space
	    r = /([^&;=]+)=?([^&;]*)/g,
	    d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
	    q = window.location.hash.substring(1);

	while (e = r.exec(q))
	   hashParams[d(e[1])] = d(e[2]);

	return hashParams;
}

// set cursor position on input
$.fn.selectRange = function(start, end) {
    if(start == -1) { start = $(this).val().length } // end of input
	if(!end) end = start;
    return this.each(function() {
        if (this.setSelectionRange) {
            this.focus();
            this.setSelectionRange(start, end);
        } else if (this.createTextRange) {
            var range = this.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', start);
            range.select();
        }
    });
};


String.prototype.escapeSpecialChars = function() {
    return this.replace(/\\n/g, "\\n")
               .replace(/\\'/g, "\\'")
               .replace(/\\"/g, '\\"')
               .replace(/\\&/g, "\\&")
               .replace(/\\r/g, "\\r")
               .replace(/\\t/g, "\\t")
               .replace(/\\b/g, "\\b")
               .replace(/\\f/g, "\\f");
};


// not authentiated
function isUserAnon() {
	if(!gUser || (gUser && gUser=="AnonymousUser")) { 
		return true;
	} else {
		return false;
	}
};



// Ajax POST
function etherPost(url, data, done, error) {
	data.csrfmiddlewaretoken = gCsrfToken;
	$.ajax({
		type:'POST', cache:false, url: url, data: data,
		beforeSend:function(xhr, settings) {
		},
	  	success:function(data) {
			if('error' in data) {
				error(data);
			} else {
				done(data);
			}
	  	},
	  	error:function() {
			error(data);
	  	}
	});
};

// Parse
function etherParse(data) {
	var json = null;
	try {
    	json = $.parseJSON(data);
  	}
  	catch(e) {
    	console.log("error: "+e);
		//etherGrowl()
  	};
	return json;
};


// growl
function etherGrowl(msg, type, icon, hidden) {
	var params = { message:msg };
	if(icon) {
		params['message'] = " "+msg
		params['icon'] = 'fa fa-fw fa-lg '+icon
	}
	
	$.growl(params, 
		{ type:type, allow_dismiss:false,
		element:"#editorPanel", placement:{align:'left'},
		offset:{x:0, y:-46}, padding:0,
		animate: {
			enter: 'animated flipInX',
			exit: 'animated flipOutX'
		},
		onHidden: function() { if(hidden) { hidden(); } }
	});
}


// Login or Register Modal
function loginOrRegisterModal(title, action, func) {
	if(isUserAnon()) {
		var modal = $("#loginModal");
		modal.find(".modal-title").html(title);
		modal.find("#dothat").html(action); 
		modal.modal({});
	} else {
		func();
	}
}









