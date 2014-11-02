/*
- ether.base.js v0.1
- Basic constants & data structures for ethereum tools, contracts & tutorials
- http://ether.fund
- (c) 2014 J.R. Bédard (jrbedard.com)
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
	'LLL':{'name':"LLL", 'syntax':"Lisp", 'ext':"lll", 'mode':"ace/mode/lisp",
		'desc':"LLL is the Ethereum Low-level Lisp-like Language.",
		'specs':"https://github.com/ethereum/cpp-ethereum/wiki/LLL-PoC-6",
	},
	'Mutan':{'name':"Mutan", 'syntax':"C++", 'ext':"mut", 'mode':"ace/mode/c_cpp",
		'desc':"Mutan is a C-Like language for the Ethereum project.",
		'specs':"https://github.com/ethereum/go-ethereum/wiki/Mutan",
	},
	'Serpent':{'name':"Serpent", 'syntax':"Python", 'ext':"se", 'mode':"ace/mode/python",
		'desc':"Serpent is designed to be very similar to Python.",
		'specs':"https://github.com/ethereum/wiki/wiki/Serpent",
	},
	'Solidity':{'name':"Solidity", 'syntax':"C++", 'ext':"so", 'mode':"ace/mode/c_cpp",
		'desc':"The Solidity programming language.",
		'specs':"",
	},
};

const CONTRACT_PRIVACY = {
	'public':{'html':"<i class='fa fa-globe'></i> Public", 'title':"Viewable by anyone.", 'label':"success"},
	'unlisted':{'html':"<i class='fa fa-list-ul'></i> Unlisted", 'title':"Viewable by anyone but not listed anywhwere (secret URL).", 'label':"warning"},
	'private':{'html':"<i class='fa fa-lock'></i> Private", 'title':"Viewable only by you.", 'label':"danger"},
};


// btc
const BTC_UNITS = {'satoshi':1e-8, 'bit':1e-6, 'millibit':1e-3, 'BTC':1.0};

const SALE_PRICE = 2000.0; // Ethereum ether genesis sale, 1 BTC = 2000 ETH

const FIAT_UNITS = {};

var gBtcPrice = 0.0; // BTC



// themes
const EDITOR_THEMES = ["ambiance","chaos","chrome","clouds","clouds_midnight","cobalt","crimson_editor","dawn","dreamweaver","eclipse","github","idle_fingers","katzenmilch","kr_theme","kuroir","merbivore","merbivore_soft","mono_industrial","monokai","pastel_on_dark","solarized_dark","solarized_light","terminal","textmate","tomorrow","tomorrow_night","tomorrow_night_blue","tomorrow_night_bright","tomorrow_night_eighties","twilight","vibrant_ink","xcode"];

const EDITOR_DEFAULT = {"theme":"idle_fingers", "fontSize":"12", "tabSize":"4", "softTabs":1, "wrapMode":1, "highlightActiveLine":1, "showPrintMargin":0};

const ICON_STATES = {
	'default':{'icon':"file-o",'color':""},
	'typing':{'icon':"file-text-o",'color':""},
	'error':{'icon':"file-o",'color':""},
};


BigNumber.config({ERRORS: false}); // ignore the 15digits limit


const ETHERFACE_KEY = '111'; // Our Etherface Key








// search
gKeywords = ['LLL','Mutan','Serpent','Solidity','ethereum','blockchain','bank','sidechain','oracle','miner',
	'AlethZero','ZeroGox','ethereal','mist','platform','ethdev','swarm','whisper',
	'Vitalik Buterin','Gavin Wood','Jeffrey Wilcke','saltado','jrbedard','J.R. Bédard','Ursium',
	'unit','ether','ETH','BTC','wei','finney','szabo','gas','USD','money','cash','rent','profit','revenue','income','fiat','pay','paid',
	'category','template','coin','registrar','currency','storage','contract','smart contract','crowdfund','exchange','dApp',
	'tools','converter','calculator','gas fees','gas price','gas cost','contract editor','simulator','etherface','API','terminal','explorer',
	'operator','step','stop','suicide','sha3','sload','sstore','balance','create','call','memory','txdata','transaction',
	'data','decentralized','app','transfer','genesis','gini','meetup','wiki','forum','operation','account','peer','node','network','key','private','public',
	'reputation','consensus','review','crypto','block','fork','star','asset','property','code','script','mintchalk',
	'bitcoin','nxt','blockstream','viacoin','mastercoin','dogecoin','stellar','stripe','coinbase','bitpay','chain','xapo','namecoin','altcoin',
];