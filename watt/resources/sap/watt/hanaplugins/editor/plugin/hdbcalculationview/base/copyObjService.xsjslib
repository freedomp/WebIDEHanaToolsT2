// Generic to all extensions, to check, if this is the right input
function accept(oSapBackPack)
{
    if(oSapBackPack && oSapBackPack.ExtensionParameters) {
        if(oSapBackPack.ExtensionParameters.Source && oSapBackPack.ExtensionParameters.Target) {
            // source and target are roles
            if(oSapBackPack.ExtensionParameters.Source.stype === 'calculationview' && 
                    oSapBackPack.ExtensionParameters.Target.stype === 'calculationview') {
                        
                return true;
            }
            if(oSapBackPack.ExtensionParameters.Source.stype === 'analyticprivilege' && 
                    oSapBackPack.ExtensionParameters.Target.stype === 'analyticprivilege') {
                return true;
            }
        }
    }
    return false;
}

// Extension Function to process
function execExtAfterProcessProjectPut(oSapBackPack, connection)
{
    var oReturn = {};
    
 
    // source and target   
    var sourceId = oSapBackPack.ExtensionParameters.Source;  
    var targetId = oSapBackPack.ExtensionParameters.Target;
    
     var sourceName = oSapBackPack.ExtensionParameters.Source.name; 
    var targetName = oSapBackPack.ExtensionParameters.Target.name;
    
    
    // inactive session
    var session = $.repo.createInactiveSession(connection,"");
    var text = "";
    
    // modify content
    var content = $.repo.readObject(session,targetId);
    var DOUBLE_QUOTE = "\"";
    content.cdata = content.cdata.replace( "id=" + DOUBLE_QUOTE + sourceName + DOUBLE_QUOTE, "id=" + DOUBLE_QUOTE + targetName + DOUBLE_QUOTE);
      //content.cdata = content.cdata.replace("Calculation","Calculationhi");
    
     //content.cdata = content.cdata.replace("Calculation" ,content.cdata);
    
    
    // write new content
    var metadata = $.repo.readObjectMetadata(session,targetId);
    var res = $.repo.writeObject(session, targetId, metadata, content.cdata, null, null, null, null, true);
    if(res.error_code) {
        oReturn.error_code = res.error_code;
        oReturn.error_msg  = res.error_msg;
    }
    connection.commit();
    
    return oReturn;
}