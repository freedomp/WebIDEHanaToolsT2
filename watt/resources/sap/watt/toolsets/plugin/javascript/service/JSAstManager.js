define(["sap/watt/lib/orion/javascript/esprima/esprimaVisitor",
        "../util/WorkerHelper",
        "sap/watt/lib/orion/ui/esprima/esprima"], function(visitor, workerHelper) {

	"use strict";
    var _workerHelper;
	
	return {
	    
	    /**
	     * parse the content with the provided options
	     */
	    parse:function(content,options){
	        
	        //var that = this;
	        if(!options){
	            options = {};
	        }
	        var ast = null;
	        try{
	            ast = esprima.parse(content,options);
	        }catch(e){
	            ast = this.emptyAST(content);
	        }
	        return ast;
	    },
	    
	    visit : function(node,visitContext,operation,postoperation){
	        //var that = this;
	        visitor.visit(node,visitContext,operation,postoperation);
	        
	    },

		_visitContext: function(contentOwner, content, options, visitContext, operation, postoperation) {
			var context = {
			    contentOwner: contentOwner,
				content: content,
				parseOptions: options,
				visitorContext: visitContext,
				visitorOperation: operation,
				visitorPostOperation: postoperation
			};
			return context;
		},

		parseAndVisit: function(contentOwner, content, options, visitContext, operation, postoperation) {
			this.oDefered = Q.defer();
			//TODO - remove this line - just to check if the worker release memory:
			/*var startWorker = false;
			if (_workerHelper) {    
			    _workerHelper.terminateWorker();
			    startWorker = true;
			}*/
			if (!_workerHelper /*|| startWorker*/) {
			    var that = this;
			    var sWorkerPath = require.toUrl("sap.watt.toolsets.javascript/util/VisitorWorker.js");
				//workerHelper("resources/sap/watt/common/plugin/javascript/util/VisitorWorker.js",
				workerHelper(sWorkerPath,
					function(event) {
					    that.oDefered.resolve({outlineContext: event.data.result,contentOwner: event.data.contentOwner});
					},
					function(e){
					    that.context.service.log.error("JSAstManager",e.message,[ "user" ]).done();
					    that.oDefered.resolve({});
					}).then(function(workerHelper) {
					_workerHelper = workerHelper;
					var oContext = that._visitContext(contentOwner, content, options, visitContext, operation, postoperation);
					_workerHelper.doOperation("visit", oContext);
				}).done();
			} else{
		    	var oContext = this._visitContext(contentOwner, content, options, visitContext, operation, postoperation);
			    _workerHelper.doOperation("visit", oContext);
			}
			return this.oDefered.promise;
		},

		emptyAST: function(content) {

			//find the length of the text - 
			//TD- is that logically correct?
			var charCount = (content && typeof content.length === "number") ? content.length : 0;
			return {
				type: "Program", //$NON-NLS-0$
				body: [],
				comments: [],
				tokens: [],
				range: [0, charCount]
			};

		}

	};
});