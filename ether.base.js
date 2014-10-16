/*
- ether.base.js v0.1
- Basic data structures and utilities to build ethereum tools & tutorials
- http://ether.fund
- (c) 2014 - J.R. Bédard - jrbedard.com
*/

// ether units
const ETH_UNITS = {'wei':1e-18, 'Kwei':1e-15, 'Mwei':1e-12, 'Gwei':1e-9, 'szabo':1e-6, 'finney':1e-3, 
	'ether':1.0, 'Kether':1e3, 'Mether':1e6, 'Gether':1e9, 'Tether':1e12
};

// gas costs
const ETH_FEES = {
    'step':{'cost':1,'desc':"Default amount of gas to pay for an execution cycle."},
	'stop': {'cost':0,'desc':'Nothing paid for the STOP operation.'},
    'suicide': {'cost':0,'desc':'Nothing paid for the SUICIDE operation.'},
    'sha3': {'cost':20,'desc':'Paid for a SHA3 operation.'},
    'sload': {'cost':20,'desc':'Paid for a SLOAD operation.'},
    'sstore': {'cost':100,'desc':'Paid for a normal SSTORE operation (doubled or waived sometimes).'},
    'balance': {'cost':20,'desc':'Paid for a BALANCE operation.'},
    'create': {'cost':100,'desc':'Paid for a CREATE operation.'},
    'call': {'cost':20,'desc':'Paid for a CALL operation.'},
	'memory': {'cost':1,'desc':'Paid for every additional word when expanding memory.'},
    'txdata': {'cost':5,'desc':'Paid for every byte of data or code for a transaction.'},
    'transaction': {'cost':500,'desc':'Paid for every transaction.'},
};

// contract languages
const ETH_LANGUAGES = {
	'lll':{'name':"LLL", 'syntax':"Lisp",
		'specs':"https://github.com/ethereum/cpp-ethereum/wiki/LLL",
		'desc':"LLL is the Ethereum Low-level Lisp-like Language.",
	},
	'mutan':{'name':"Mutan", 'syntax':"C++",
		'specs':"https://github.com/ethereum/go-ethereum/wiki/Mutan",
		'desc':"Mutan is a C-Like language for the Ethereum project.",
	},
	'serpent':{'name':"Serpent", 'syntax':"Python",
		'specs':"https://github.com/ethereum/wiki/wiki/Serpent",
		'desc':"Serpent is designed to be very similar to Python.",
	},
};


// btc
const BTC_UNITS = {'satoshi':1e-8, 'bit':1e-6, 'millibit':1e-3, 'BTC':1.0};

const SALE_PRICE = 2000.0; // Ethereum ether genesis sale, 1 BTC = 2000 ETH

const FIAT_UNITS = {};


var gBtcPrice = 0.0; // BTC



BigNumber.config({ERRORS: false}); // ignore the 15digits limit


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

