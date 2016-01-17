define(["./XSODataCoCoDecorator", "../../parser/OSDLParser", "../../util/CoCoUtil"],
function(XSODataCoCoDecorator, OSDLParser, CoCoUtil) {
    
    //console.log('Load code completion for XSOData');
    
    return {
    	
    	_oParser: null,
    	_oDecorator: null,
    	_oCocoTypes: null,
    	        
    	init: function() {
    		this._oParser = new OSDLParser();
    		this._oDecorator = new XSODataCoCoDecorator();
    		this._oCocoTypes = CoCoUtil;
		},
    	        
        /**
        * Returns code completion proposals
        * @return {aProposals}
        */
        getWordSuggestions: function (oContentStatus) {
        	// Auto hint is not supported
            if (oContentStatus.isAutoHint) { 
            	return {
    				"proposals": []
    			};
            }
            var text = oContentStatus.buffer;
            var coords = oContentStatus.offset;
            var lineArray = text.substring(0,coords).split('\n');
			var line = lineArray.length;
			var column = (line === 0) ? 0 : lineArray[line-1].length+1;
			
			try {
				var aProposals = this._oParser.getCompletions(text, line, column);
				aProposals = this._oDecorator.decorate(aProposals, this._oCocoTypes);
				return aProposals;
			} catch(e) {
				this.context.service.log.error("codecompletion", that.context.i18n.getText("i18n", "serviceCodeCompletion_cocoFailed") + e.message ).done();
				return {
					"proposals": []
   				};
			}
        }
        
    };
});


