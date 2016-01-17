define([], function() {

    var TokenDisplay = {};
            TokenDisplay["#NUM_CATOBJECT#"] = '"<DB_Schema>"."<Catalog_Object>"'; // Messages.MESSAGE_FOR_CATOBJECT_XMSG);
			TokenDisplay["#NUM_REPOBJECT#"] = '"<Repository_Package::Repository_Object>"'; // Messages.MESSAGE_FOR_REPOBJECT_XMSG);
			TokenDisplay["#MULTIPLICITY_ONE#"] = '"1"'; // Messages.MESSAGE_FOR_MULTIPLICITY_ONE_XMSG);
			TokenDisplay["#MULTIPLICITY_MANY#"] = '"*"'; // Messages.MESSAGE_FOR_MULTIPLICITY_MANY_XMSG);
			TokenDisplay["#MULTIPLICITY_ZERO_OR_ONE#"] = '"0..1"'; // Messages.MESSAGE_FOR_MULTIPLICITY_ZERO_OR_ONE_XMSG);
			TokenDisplay["#MULTIPLICITY_ONE_OR_MORE#"] = '"1..*"'; // Messages.MESSAGE_FOR_MULTIPLICITY_ONE_OR_MORE_XMSG);
			TokenDisplay["#QUOTED_ID#"] = '"<String _Identifier>"'; // Messages.MESSAGE_FOR_QUOTED_ID_XMSG);
			TokenDisplay["#ID#"] = '<String _Identifier>'; // Messages.MESSAGE_FOR_ID_XMSG);

    
    function XSODataCoCoDecorator() {
    }
    
    
    
    XSODataCoCoDecorator.prototype.decorate = function( /* List<String> */ parserProposals, coCoTypes ) {
        var aProposals = {};
        
        aProposals.isValue = false;
        aProposals.proposals = [];

      if( Object.prototype.toString.call( parserProposals ) !== '[object Array]' ) {
            throw Error("Invalid argument");
        }
      for ( var p = 0; p < parserProposals.length; p++ ) {
        var prop = parserProposals[p];
        if( Object.prototype.toString.call( prop.propTokens ) !== '[object Array]' ) {
            throw Error("Invalid argument");
        }
        var r = "";
        var resProp = [];
        for ( var pt = 0; pt < prop.propTokens.length; pt++ ) {
            var propToken = prop.propTokens[pt];
            if ( propToken.toUpperCase() === 'KEYS' ) {
                continue;
            }
            
            r = TokenDisplay.hasOwnProperty(propToken) ? TokenDisplay[propToken] : propToken;
            
            resProp.push(r);
        }
        if (resProp.length > 0) {
            console.log("..............Types: "+coCoTypes);
            switch ( prop.type ) {
                case coCoTypes.TYPE_KEYWORD:
                aProposals.proposals.push({ 
                        description: resProp.join(" ") + " ",
                        proposal: resProp.join(" ") + " ",
                        overwrite: true,
                        category: "xsodatatype"
                    });
                break;
                case coCoTypes.TYPE_ARTIFACT:
                aProposals.proposals.push({ 
                        description: resProp.join(' ') + ' ',// + prop.type,
                        proposal: resProp.join(' ') + ' ',
                        overwrite: true,
                        category: "xsodatatype"
                    });
                break;
                case coCoTypes.TYPE_IDENTIFIER:
                aProposals.proposals.push({ 
                        description: resProp.join(' ') + ' ',// + prop.type,
                        proposal: resProp.join(' ') + ' ',
                        overwrite: true,
                        category: "xsodatatype"
                    });
                    
            }
        }
//        resultProposals.push(resProp.join(' ')+' ');
            
        }
        
        return aProposals;
    };
    
    return XSODataCoCoDecorator;
});