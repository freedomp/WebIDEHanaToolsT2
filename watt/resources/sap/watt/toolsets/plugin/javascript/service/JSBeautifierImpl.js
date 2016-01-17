define(["sap/watt/lib/beautifiers/js/beautify", "sap.watt.toolsets.javascript/configurations/beautifyConfig"], function(jsbeautifier, beautifyConfig) {
	"use strict";
	var Beautifier = function Beautifier () {
	
	};
	
	Beautifier.prototype._oOptions = {
		"indent_size": 1,
		"indent_char": "\t",
		"indent_level": 0,
		"indent_with_tabs": true,
		"preserve_newlines": true,
		"max_preserve_newlines": 2,
		"jslint_happy": false,
		"brace_style": "collapse",
		"keep_array_indentation": false,
		"keep_function_indentation": true,
		"space_before_conditional": true,
		"break_chained_methods": false,
		"eval_code": false,
		"unescape_strings": false,
		"wrap_line_length": 140
	};

	Beautifier.prototype.configure= function (mConfig) {
		this.context.service.resource.includeStyles([{uri:"sap.watt.toolsets.javascript/css/beautifierSettings.css"}]).done();
		this._oSettings= beautifyConfig;
		this._oOriginalSettings=this._cloneSetting(this._oSettings);
		
	};
	
	//oSettings currently holds null
	Beautifier.prototype.beautify= function(sContent, oSettings, fileExtension){
	    	if (this.upacker){
			sContent=this.unpacker_filter(sContent);
		}
		
		return this.getOptions().then(function(options){ 
//check 
		    var output = jsbeautifier.js_beautify(sContent, options);
			return output;
		});		
	};

	Beautifier.prototype.beautifyJS= function(){
		return this.beautify.apply(this, arguments);
	};

	
	//deprecated... (not called)
// 	Beautifier.prototype.beautifyJS = function(code,suffix) { 
// 		if (this.upacker){
// 			code=this.unpacker_filter(code);
// 		}
// 		return this.getOptions().then(function(options){ 
// 		    var output = null;
// 		    if (suffix==="css"){
// 		        output=cssbeautifier.css_beautify(code, options);
// 		    }
// 		    else{
// 		   	    output=jsbeautifier.js_beautify(code, options);
// 		    }
// 			return output;
// 		});		
// 	};
	
	Beautifier.prototype.getOptions = function() { 
		var oProject = this.context.service.setting.project;								
		var that=this;
		that.hasError = false;
		return oProject.get(this.context.service.beautifier).then(function(mSettings) {
			if (mSettings) {					
				return that._updateOptionBySetting(mSettings);				
			} else {				
				return that._oOptions;
			}		
		}).fail(function(error) {
			that.hasError = true;
			return that._oOptions;
		});		
	};
	
	Beautifier.prototype.getSettings = function() { 	
		//read project setting in case of project switching		
		var oProject = this.context.service.setting.project;								
		var that=this;
		that.hasError = false;
		return oProject.get(this.context.service.beautifier).then(function(mSettings) {												
			if (mSettings) {					
				for (var pname in mSettings) {
				  if (mSettings.hasOwnProperty(pname)) {
				  
						for (var i=0;i<that._oSettings.length;i++){
							if (that._oSettings[i].id==pname){
								that._oSettings[i].value=mSettings[pname];
							}
						}
				  }
				}
				return that._oSettings;
			} else {				
				that._oSettings=that._cloneSetting(that._oOriginalSettings);
				return that._oSettings;
			}		
		}).fail(function(error) {
			that.hasError = true;
			that._oSettings=that._cloneSetting(that._oOriginalSettings);
			return that._oSettings;
		});		
	};
	
	Beautifier.prototype.setSettings = function(oSettings) { 		
		this._oSettings=oSettings;
		var oPrjSettings={};
		for (var i=0;i<oSettings.length;i++){			
			oPrjSettings[oSettings[i].id]=oSettings[i].value;
		}	
		//save project setting
		if (!this.hasError) {
			return this.context.service.setting.project.set(this.context.service.beautifier, oPrjSettings);
		}
	};
	
	Beautifier.prototype._updateOptionBySetting = function(mSettings){	
		var	Options={};		
		for (var pname in mSettings) {
		  if (mSettings.hasOwnProperty(pname)) {				
				if (pname=='detect-packers'){
					if (mSettings[pname]==true) {
						this.unpacker=true;
					} else {
						this.unpacker=false;
					}
				} else if (pname=="tab_size"){
					Options.indent_size = mSettings[pname];
					Options.indent_char = mSettings[pname] == 1 ? '\t' : ' ';
				} else if (pname=="max_preserve_newlines"){				
					Options.preserve_newlines = mSettings[pname]!=="-1";					
					Options[pname]=parseInt(mSettings[pname]);
				} else {
					Options[pname]=mSettings[pname];
				}
				
		  }
		}		
		return Options;		
	};
	
	Beautifier.prototype.unpacker_filter = function(source){
		//Todo
		return source;
	};
	
	Beautifier.prototype._cloneSetting = function(source){
		var target=[];
		for (var i=0;i<source.length;i++){			
			var ob={};
			for (var pname in source[i]) {
			  if (source[i].hasOwnProperty(pname)) {				
				ob[pname]=source[i][pname];
			  }
			}
			target.push(ob);
		}
		return target;
	};
	
	Beautifier._instance = undefined;
	
	Beautifier.getInstance = function() { 
		if (!Beautifier._instance) {
		    Beautifier._instance = new Beautifier();
		}
		return Beautifier._instance; 
	};
	
	return Beautifier.getInstance();
});