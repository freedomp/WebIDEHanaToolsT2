define({

	"eslintConfig": {
		"env": {
			"browser": true,
			"node": true,
			"amd": true,
			"mocha": true,
			"jquery": true
		},
		// global variables with keys as names and a boolean value to determine if they are assignable
		"globals": {
			//"sap":false,
			// "Q": false,
			// CouchDB globals
			"require": false,
			"respond": false,
			"getRow": false,
			"emit": false,
			"send": false,
			"start": false,
			"sum": false,
			"log": false,
			"exports": false,
			"module": false,
			"provides": false,
			// development, debugging, and tracing globals
			"alert": false,
			"confirm": false,
			"console": false,
			"Debug": false,
			"opera": false,
			"prompt": false,
			"_trace": false,
			"_log": false,
			"_assert": false,
			"_measure": false,
			"_fatal": false,
			"START": false,
			"STOP": false,
			"ERROR": false,
			"WARNING": false,
			"INFO": false,
			"DEBUG": false,
			// Dojo Toolkit globals
			"dojo": false,
			"dijit": false,
			"dojox": false,
			"define": false,
			// "require" : false,
			// jQuery globals
			"$": false,
			"jQuery": false,
			// MooTools globals
			// "$" : false,
			"$$": false,
			"Asset": false,
			"Browser": false,
			"Chain": false,
			"Class": false,
			"Color": false,
			"Cookie": false,
			"Core": false,
			"Document": false,
			"DomReady": false,
			"DOMEvent": false,
			"DOMReady": false,
			"Drag": false,
			"Element": false,
			"Elements": false,
			"Event": false,
			"Events": false,
			"Fx": false,
			"Group": false,
			"Hash": false,
			"HtmlTable": false,
			"Iframe": false,
			"IframeShim": false,
			"InputValidator": false,
			"instanceOf": false,
			"Keyboard": false,
			"Locale": false,
			"Mask": false,
			"MooTools": false,
			"Native": false,
			"Options": false,
			"OverText": false,
			"Request": false,
			"Scroller": false,
			"Slick": false,
			"Slider": false,
			"Sortables": false,
			"Spinner": false,
			"Swiff": false,
			"Tips": false,
			"Type": false,
			"typeOf": false,
			"URI": false,
			"Window": false,
			// widely adopted globals
			"escape": false,
			"unescape": false,
			// PhantomJS globals
			"phantom": true,
			// "require" : true,
			"WebPage": true,
			// "console" : true,
			// "exports" : true,
			// Prototype and Scriptaculous globals
			// "$" : false,
			// "$$" : false,
			"$A": false,
			"$F": false,
			"$H": false,
			"$R": false,
			"$break": false,
			"$continue": false,
			"$w": false,
			"Abstract": false,
			"Ajax": false,
			// "Class" : false,
			"Enumerable": false,
			// "Element" : false,
			// "Event" : false,
			"Field": false,
			"Form": false,
			// "Hash" : false,
			"Insertion": false,
			"ObjectRange": false,
			"PeriodicalExecuter": false,
			"Position": false,
			"Prototype": false,
			"Selector": false,
			"Template": false,
			"Toggle": false,
			"Try": false,
			"Autocompleter": false,
			"Builder": false,
			"Control": false,
			"Draggable": false,
			"Draggables": false,
			"Droppables": false,
			"Effect": false,
			"Sortable": false,
			"SortableObserver": false,
			"Sound": false,
			"Scriptaculous": false,
			// Rhino globals
			"defineClass": false,
			"deserialize": false,
			"gc": false,
			"help": false,
			"importClass": false,
			"importPackage": false,
			"java": false,
			"load": false,
			"loadClass": false,
			"Packages": false,
			"print": false,
			"quit": false,
			"readFile": false,
			"readUrl": false,
			"runCommand": false,
			"seal": false,
			"serialize": false,
			"spawn": false,
			"sync": false,
			"toint32": false,
			"version": false,
			// ShellJS globals
			"target": false,
			"echo": false,
			"exit": false,
			"cd": false,
			"pwd": false,
			"ls": false,
			"find": false,
			"cp": false,
			"rm": false,
			"mv": false,
			"mkdir": false,
			"test": false,
			"cat": false,
			"sed": false,
			"grep": false,
			"which": false,
			"dirs": false,
			"pushd": false,
			"popd": false,
			"env": false,
			"exec": false,
			"chmod": false,
			"config": false,
			"error": false,
			"tempdir": false,
			// Web Worker globals
			"importScripts": true,
			"postMessage": true,
			"self": true,
			// Windows Scripting Host globals
			"ActiveXObject": true,
			"Enumerator": true,
			"GetObject": true,
			"ScriptEngine": true,
			"ScriptEngineBuildVersion": true,
			"ScriptEngineMajorVersion": true,
			"ScriptEngineMinorVersion": true,
			"VBArray": true,
			"WSH": true,
			"WScript": true,
			"XDomainRequest": true,
			// Yahoo User Interface globals
			"YUI": false,
			"Y": false,
			"YUI_config": false,
			// QUnit globals
			"asyncTest": false,
			"deepEqual": false,
			"equal": false,
			"equals": false,
			"expect": false,
			// "module" : false,
			"notDeepEqual": false,
			"notEqual": false,
			"notStrictEqual": false,
			"ok": false,
			"QUnit": false,
			// "start" : false,
			"stop": false,
			"strictEqual": false,
			// "test" : false,
			"throws": false,
			// Hana globals
			"ctypes": false,
			"xsruntime": false,
			// Jasmine globals
			"jasmine": false,
			"describe": false,
			"it": false,
			"xdescribe": false,
			"xit": false,
			"beforeEach": false,
			"afterEach": false,
			// "expect" : false,
			"spyOn": false,
			"waitsFor": false,
			"runs": false,
			// other globals
			"Q": false,
			"d3": false,
			"sinon": false,
			"sap": false
		},
		"rules": {
			"block-scoped-var": 0,
			"brace-style": [0, "1tbs"],
			"camelcase": 2,
			"complexity": [0, 11],
			"consistent-return": 2,
			"consistent-this": [0, "that"],
			"curly": [2, "all"],
			"default-case": 0,
			"dot-notation": [2, {
				"allowKeywords": true
			}],
			"eqeqeq": 2,
			"func-names": 0,
			"func-style": [0, "declaration"],
			"guard-for-in": 0,
			"handle-callback-err": 0,
			"max-depth": [0, 4],
			"max-len": [0, 80, 4],
			"max-nested-callbacks": [0, 2],
			"max-params": [0, 3],
			"max-statements": [0, 10],
			"new-cap": 2,
			"new-parens": 2,
			"no-alert": 2,
			"no-array-constructor": 2,
			"no-bitwise": 0,
			"no-caller": 2,
			"no-catch-shadow": 2,
			"no-comma-dangle": 0,
			"no-cond-assign": 2,
			"no-console": 2,
			"no-constant-condition": 2,
			"no-control-regex": 2,
			"no-debugger": 2,
			"no-delete-var": 2,
			"no-div-regex": 0,
			"no-dupe-keys": 2,
			"no-else-return": 0,
			"no-empty": 2,
			"no-empty-class": 2,
			"no-empty-label": 2,
			"no-eq-null": 0,
			"no-eval": 2,
			"no-ex-assign": 2,
			"no-extend-native": 2,
			"no-extra-boolean-cast": 2,
			"no-extra-parens": 0,
			"no-extra-semi": 2,
			"no-extra-strict": 0,
			"no-fallthrough": 2,
			"no-floating-decimal": 0,
			"no-func-assign": 2,
			"global-strict": [0, "never"],
			"no-implied-eval": 2,
			"no-inner-declarations": [2, "functions"],
			"no-invalid-regexp": 2,
			"no-irregular-whitespace": 2,
			"no-iterator": 2,
			"no-label-var": 2,
			"no-labels": 2,
			"no-lone-blocks": 2,
			"no-lonely-if": 0,
			"no-loop-func": 2,
			"no-mixed-requires": [0, false],
			"no-mixed-spaces-and-tabs": [0, false],
			"no-multi-str": 2,
			"no-multiple-empty-lines": [0, {
				"max": 2
			}],
			"no-native-reassign": 2,
			"no-negated-in-lhs": 2,
			"no-nested-ternary": 0,
			"no-new": 2,
			"no-new-func": 2,
			"no-new-object": 2,
			"no-new-require": 0,
			"no-new-wrappers": 2,
			"no-obj-calls": 2,
			"no-octal": 2,
			"no-octal-escape": 2,
			"no-path-concat": 0,
			"no-plusplus": 0,
			"no-process-exit": 2,
			"no-proto": 2,
			"no-redeclare": 2,
			"no-regex-spaces": 2,
			"no-reserved-keys": 2,
			"no-restricted-modules": 0,
			"no-return-assign": 2,
			"no-script-url": 2,
			"no-self-compare": 0,
			"no-sequences": 2,
			"no-shadow": 2,
			"no-shadow-restricted-names": 2,
			"no-spaced-func": 2,
			"no-space-before-semi": 0,
			"no-sparse-arrays": 2,
			"no-sync": 0,
			"no-ternary": 0,
			"no-undef": 2,
			"no-undef-init": 2,
			"no-underscore-dangle": 0,
			"no-unreachable": 2,
			"no-unused-expressions": 2,
			"no-unused-vars": [2, {
				"vars": "all",
				"args": "after-used"
			}],
			"no-use-before-define": 2,
			"no-warning-comments": [0, {
				"terms": ["todo", "fixme", "xxx"],
				"location": "start"
			}],
			"no-with": 2,
			"no-wrap-func": 2,
			"yoda": [2, "never"],
			"one-var": 0,
			"quote-props": 0,
			"quotes": [2, "double"],
			"radix": 0,
			"semi": 2,
			"sort-vars": 0,
			"space-after-keywords": [0, "always"],
			"space-before-blocks": [0, "always"],
			"space-in-brackets": [0, "never"],
			"space-infix-ops": 0,
			"space-return-throw-case": 2,
			"space-unary-ops": [2, {
				"words": true,
				"nonwords": false
			}],
			"strict": 0,
			"use-isnan": 2,
			"valid-jsdoc": 0,
			"valid-typeof": 2,
			"wrap-iife": 0,
			"wrap-regex": 0,
			"no-dupe-args": 2,
			"no-duplicate-case": 2,
			"no-extra-bind": 2,
			"no-inline-comments": 0,
			"no-multi-spaces": 0,
			"no-process-env": 0,
			"no-trailing-spaces": 0,
			"no-throw-literal": 2,
			"no-undefined": 0,
			"no-void": 2,
			"no-var": 0,
			"comma-dangle": [2, "never"],
			"comma-spacing": 0,
			"comma-style": 0,
			"eol-last": 0,
			"generator-star": 0,
			"generator-star-spacing": 0,
			"indent": 0,
			"key-spacing": [0, {
				"beforeColon": false,
				"afterColon": true
			}],
			"operator-assignment": [0, "always"],
			"padded-blocks": 0,
			"semi-spacing": [0, {
				"before": false,
				"after": true
			}],
			"space-after-function-name": [0, "never"],
			"space-before-function-parentheses": [0, "always"],
			"space-in-parens": [0, "never"],
			"spaced-line-comment": [0, "always"],
			"vars-on-top": 0,
			"no-continue": 0,
			"no-empty-character-class": 2,
			"linebreak-style": [0, "unix"],
			"no-param-reassign": 0,
			"no-unneeded-ternary": 0,
			"prefer-const": 0,
			"array-bracket-spacing": [0, "never"],
			"accessor-pairs": 0,
			"computed-property-spacing": [0, "never"],
			"dot-location": 0,
			"lines-around-comment": 0,
			"newline-after-var": 0,
			"object-curly-spacing": [0, "never"],
			"object-shorthand": 0,
			"operator-linebreak": 0,
			"space-before-function-paren": [0, "always"],
			"spaced-comment": 0

		}
	},
	"rulesExt": {
		"block-scoped-var": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"brace-style": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"camelcase": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"complexity": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"consistent-return": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"consistent-this": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"curly": {
			"severity": "error",
			"category": "Best Practice"
		},
		"default-case": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"dot-notation": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"eqeqeq": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"func-names": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"func-style": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"guard-for-in": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"handle-callback-err": {
			"severity": "warning",
			"category": "Node.js"
		},
		"max-depth": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"max-len": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"max-nested-callbacks": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"max-params": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"max-statements": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"new-cap": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"new-parens": {
			"severity": "error",
			"category": "Stylistic Issue"
		},
		"no-alert": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"no-array-constructor": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"no-bitwise": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"no-caller": {
			"severity": "error",
			"category": "Best Practice"
		},
		"no-catch-shadow": {
			"severity": "warning",
			"category": "Variable"
		},
		"no-comma-dangle": {
			"severity": "error",
			"category": "Possible Error"
		},
		"no-cond-assign": {
			"severity": "warning",
			"category": "Possible Error"
		},
		"no-console": {
			"severity": "warning",
			"category": "Possible Error"
		},
		"no-constant-condition": {
			"severity": "error",
			"category": "Possible Error"
		},
		"no-control-regex": {
			"severity": "warning",
			"category": "Possible Error"
		},
		"no-debugger": {
			"severity": "error",
			"category": "Possible Error"
		},
		"no-delete-var": {
			"severity": "warning",
			"category": "Variable"
		},
		"no-div-regex": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"no-dupe-keys": {
			"severity": "error",
			"category": "Possible Error"
		},
		"no-else-return": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"no-empty": {
			"severity": "error",
			"category": "Best Practice"
		},
		"no-empty-class": {
			"severity": "warning",
			"category": "Possible Error"
		},
		"no-empty-label": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"no-eq-null": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"no-eval": {
			"severity": "error",
			"category": "Best Practice"
		},
		"no-ex-assign": {
			"severity": "error",
			"category": "Possible Error"
		},
		"no-extend-native": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"no-extra-boolean-cast": {
			"severity": "error",
			"category": "Possible Error"
		},
		"no-extra-parens": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"no-extra-semi": {
			"severity": "error",
			"category": "Best Practice"
		},
		"no-extra-strict": {
			"severity": "warning",
			"category": "Strict Mode"
		},
		"no-fallthrough": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"no-floating-decimal": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"no-func-assign": {
			"severity": "error",
			"category": "Possible Error"
		},
		"global-strict": {
			"severity": "warning",
			"category": "Strict Mode"
		},
		"no-implied-eval": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"no-inner-declarations": {
			"severity": "error",
			"category": "Possible Error"
		},
		"no-invalid-regexp": {
			"severity": "error",
			"category": "Possible Error"
		},
		"no-irregular-whitespace": {
			"severity": "error",
			"category": "Possible Error"
		},
		"no-iterator": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"no-label-var": {
			"severity": "warning",
			"category": "Variable"
		},
		"no-labels": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"no-lone-blocks": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"no-lonely-if": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"no-loop-func": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"no-mixed-requires": {
			"severity": "warning",
			"category": "Node.js"
		},
		"no-mixed-spaces-and-tabs": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"no-multi-str": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"no-multiple-empty-lines": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"no-native-reassign": {
			"severity": "error",
			"category": "Best Practice"
		},
		"no-negated-in-lhs": {
			"severity": "error",
			"category": "Possible Error"
		},
		"no-nested-ternary": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"no-new": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"no-new-func": {
			"severity": "error",
			"category": "Best Practice"
		},
		"no-new-object": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"no-new-require": {
			"severity": "warning",
			"category": "Node.js"
		},
		"no-new-wrappers": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"no-obj-calls": {
			"severity": "error",
			"category": "Possible Error"
		},
		"no-octal": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"no-octal-escape": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"no-path-concat": {
			"severity": "warning",
			"category": "Node.js"
		},
		"no-plusplus": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"no-process-exit": {
			"severity": "warning",
			"category": "Node.js"
		},
		"no-proto": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"no-redeclare": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"no-regex-spaces": {
			"severity": "warning",
			"category": "Possible Error"
		},
		"no-reserved-keys": {
			"severity": "error",
			"category": "Possible Error"
		},
		"no-restricted-modules": {
			"severity": "warning",
			"category": "Node.js"
		},
		"no-return-assign": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"no-script-url": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"no-self-compare": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"no-sequences": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"no-shadow": {
			"severity": "warning",
			"category": "Variable"
		},
		"no-shadow-restricted-names": {
			"severity": "warning",
			"category": "Variable"
		},
		"no-spaced-func": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"no-space-before-semi": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"no-sparse-arrays": {
			"severity": "error",
			"category": "Possible Error"
		},
		"no-sync": {
			"severity": "warning",
			"category": "Node.js"
		},
		"no-ternary": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"no-undef": {
			"severity": "error",
			"category": "Variable"
		},
		"no-undef-init": {
			"severity": "warning",
			"category": "Variable"
		},
		"no-underscore-dangle": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"no-unreachable": {
			"severity": "error",
			"category": "Possible Error"
		},
		"no-unused-expressions": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"no-unused-vars": {
			"severity": "warning",
			"category": "Variable"
		},
		"no-use-before-define": {
			"severity": "warning",
			"category": "Variable"
		},
		"no-warning-comments": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"no-with": {
			"severity": "error",
			"category": "Best Practice"
		},
		"no-wrap-func": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"yoda": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"one-var": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"quote-props": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"quotes": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"radix": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"semi": {
			"severity": "error",
			"category": "Possible Error"
		},
		"sort-vars": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"space-after-keywords": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"space-before-blocks": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"space-in-brackets": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"space-infix-ops": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"space-return-throw-case": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"space-unary-ops": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"strict": {
			"severity": "warning",
			"category": "Strict Mode"
		},
		"use-isnan": {
			"severity": "error",
			"category": "Possible Error"
		},
		"valid-jsdoc": {
			"severity": "warning",
			"category": "Possible Error"
		},
		"valid-typeof": {
			"severity": "warning",
			"category": "Possible Error"
		},
		"wrap-iife": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"wrap-regex": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"no-dupe-args": {
			"severity": "error",
			"category": "Possible Error"
		},
		"no-duplicate-case": {
			"severity": "error",
			"category": "Possible Error"
		},
		"no-extra-bind": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"no-inline-comments": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"no-multi-spaces": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"no-process-env": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"no-trailing-spaces": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"no-throw-literal": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"no-undefined": {
			"severity": "error",
			"category": "Variable"
		},
		"no-void": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"no-var": {
			"severity": "warning",
			"category": "ECMAScript 6"
		},
		"comma-dangle": {
			"severity": "error",
			"category": "Possible Error"
		},
		"comma-spacing": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"comma-style": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"eol-last": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"generator-star": {
			"severity": "info",
			"category": "ECMAScript 6"
		},
		"generator-star-spacing": {
			"severity": "info",
			"category": "ECMAScript 6"
		},
		"indent": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"key-spacing": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"operator-assignment": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"padded-blocks": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"semi-spacing": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"space-after-function-name": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"space-before-function-parentheses": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"space-in-parens": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"spaced-line-comment": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"vars-on-top": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"no-continue": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"no-empty-character-class": {
			"severity": "error",
			"category": "Possible Error"
		},
		"linebreak-style": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"no-param-reassign": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"no-unneeded-ternary": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"prefer-const": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"array-bracket-spacing": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"accessor-pairs": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"computed-property-spacing": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"dot-location": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"lines-around-comment": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"newline-after-var": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"object-curly-spacing": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"object-shorthand": {
			"severity": "warning",
			"category": "Best Practice"
		},
		"operator-linebreak": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"space-before-function-paren": {
			"severity": "info",
			"category": "Stylistic Issue"
		},
		"spaced-comment": {
			"severity": "info",
			"category": "Stylistic Issue"
		}
	}
});