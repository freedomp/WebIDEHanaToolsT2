define([], function() {
	var issuesTestData = {
		getBaseValidatorWithissues : function(){
			return ({
				params: {
					validationsResults: [{
						document: "/uuu/file.js",
						result: {
							issues: [{
								"ruleId": "stylistic-problem",
								"path": "/uuu/file.js",
								"severity": "warn",
								"category": "Syntax Error",
								"helpUrl": "http://www.ecma-international.org/ecma-262/5.1/",
								"checker": "ESLint",
								"line": 1,
								"column": 6,
								"message": "Syntax Error:ESLint(syntax-parse): Unexpected token {",
								"source": undefined
							},
								{
									"ruleId": "syntax-parse",
									"path": "/uuu/file.js",
									"severity": "error",
									"category": "Syntax Error",
									"helpUrl": "http://www.ecma-international.org/ecma-262/5.1/",
									"checker": "ESLint",
									"line": 3,
									"column": 7,
									"message": "Syntax Error:ESLint(syntax-parse): Unexpected token {",
									"source": undefined
								}]
						}
					},
						{
							document: "/bbb/newFILE.js",
							result: {
								issues: [{
									"ruleId": "stylistic-problem",
									"path": "/bbb/newFILE.js",
									"severity": "warn",
									"category": "Syntax Error",
									"helpUrl": "http://www.ecma-international.org/ecma-262/5.1/",
									"checker": "ESLint",
									"line": 1,
									"column": 6,
									"message": "Syntax Error:ESLint(syntax-parse): Unexpected token {",
									"source": undefined
								}]
							}
						}]
		}
	});

				},
		getBaseValidatorWithoutIssues: function(){
			return ({
				params: {
					validationsResults: [{
						document: "/bb/file1.js",
						result: {
							issues:[]
						}
					},{
						document: "/cc/file2.js",
						result:{
							issues:[]
						}
					}]
				}
			});
		},

		getBaseValidatorResultsWithoutkeys: function(){
			return ({
				params: {
					validationsResults: [{
						document: null,
						result: {
							issues:[]
						}
					},{
						result:{
							issues:[]
						}
					},{
						document: null,
						result: {
							issues:[{
								"ruleId": "stylistic-problem",
								"path": "/uuu/file.js",
								"severity": "warn",
								"category": "Syntax Error",
								"helpUrl": "http://www.ecma-international.org/ecma-262/5.1/",
								"checker": "ESLint",
								"line": 1,
								"column": 6,
								"message": "Syntax Error:ESLint(syntax-parse): Unexpected token {",
								"source": undefined
							}]
						}
					}]
				}
			});


		},

		getBaseValidatorResultsMixed: function(){
			return ({
				params: {
					validationsResults: [{
						document: "/aa/blue.js",
						result: {
							issues:[]
						}
					},{
						result:{
							issues:[]
						}
					},{
						document: null,
						result: {
							issues:[{
								"ruleId": "stylistic-problem",
								"path": "/uuu/file.js",
								"severity": "warn",
								"category": "Syntax Error",
								"helpUrl": "http://www.ecma-international.org/ecma-262/5.1/",
								"checker": "ESLint",
								"line": 1,
								"column": 6,
								"message": "Syntax Error:ESLint(syntax-parse): Unexpected token {",
								"source": undefined
							}]
						}
					},{
						document: "/dd/abc.js",
						result: {
							issues:[{
								"ruleId": "stylistic-problem",
								"path": "/dd/abc.js",
								"severity": "warn",
								"category": "Syntax Error",
								"helpUrl": "http://www.ecma-international.org/ecma-262/5.1/",
								"checker": "ESLint",
								"line": 10,
								"column": 20,
								"message": "This is syntax",
								"source": undefined
							}]
						}
					}
					]
				}
			});
		},

		getProblemsArray1: function(){
			return (
				[{
				id : "id1",
				severity: "warn",
				location: "/dev",
				file: "fileX.js(1,1)"
			},{
				id : "id2",
				severity: "info",
				location: "/prod",
				file: "fileJ.js(2,4)"
			}, {
				id : "id3",
				severity: "error",
				location: "/prod/dev",
				file: "fileBB.js(6,4)"
				}]
			);
		}

	};

	return issuesTestData;
});



