define(["sap/watt/lib/lodash/lodash"] ,function(_) {

        "use strict";

        /**
         * Private
         */

        // In case the user selects a folder and a file within the folder, clicks copy -> redundant copy/cut and irrelevant data in the ui dialog
        // This function removes the selected files if the folder which contain them is also selected
        function _removeSelectedFilesUnderSelectedFolders(aSelection) {
            var selectedDocuments = [];
            var selectedFolderDocuments = [];
            var redundantDocuments = [];
            
            var sdLength = aSelection.length;
            for (var sd = 0; sd < sdLength; sd++) {
            	var oDocument = aSelection[sd].document;
            	selectedDocuments.push(oDocument);
            	if (oDocument.getEntity().isFolder()) {
            		selectedFolderDocuments.push(oDocument);
            	}
            }
			
			var sdpLength = selectedDocuments.length;
			var sfdpLength = selectedFolderDocuments.length;
			for (var sfdp = 0; sfdp < sfdpLength; sfdp++) {
				var sSelectedFolderDocumentPath = selectedFolderDocuments[sfdp].getEntity().getFullPath();
				for (var sdp = 0; sdp < sdpLength; sdp++) {
					var sSelectedDocumentParentPath = selectedDocuments[sdp].getEntity().getParentPath();
					if (sSelectedFolderDocumentPath === sSelectedDocumentParentPath) {
						redundantDocuments.push(selectedDocuments[sdp]);
					}
				}
			}
			
			var aSelectedDocumentsToDelete = _.difference(selectedDocuments, redundantDocuments);

            // return an array of document as the selection does
            return _.map(aSelectedDocumentsToDelete, function(oSelectedDocumentToDelete) {
            	return {document : oSelectedDocumentToDelete};
            });
        }

        function isLevelOneFolder(documentEntity){
            return (documentEntity.getParentPath() === "" && documentEntity.getName() !== "");
        }

        function isRootOrLevelOneFolderInSelection(checkRoot, checkLevelOne){
            return this.assertBasicSelection()
                .then(function(arrSelection){
                    var returnVal = {val : true, selectionLength : arrSelection.length};
                    for ( var i = 0; i < arrSelection.length; i++) {
                        var oSelectionDocumentEntity = arrSelection[i].document.getEntity();

                        // is root
                        if (checkRoot && oSelectionDocumentEntity.isRoot()){
                            return returnVal;
                            
                        }

                        // level 1 folder (a folder under the root)
                        if (checkLevelOne && isLevelOneFolder(oSelectionDocumentEntity)){
                            return returnVal;
                    }}
                    returnVal.val = false;
                    return returnVal;
                });
        }

        function _isRootIncludedInSelection(){
            return isRootOrLevelOneFolderInSelection.call(this,true)
                .then(function(returnVal){
                    return returnVal.val;
                });
        }

        function _isLevelOneIncludedInSelection(){
            return isRootOrLevelOneFolderInSelection.call(this,false,true)
                .then(function(returnVal){
                    return returnVal.val;
                });
        }

        function _isRootOrLevelOneFolderIncludedInSelection(){
            return isRootOrLevelOneFolderInSelection.call(this,true,true)
                .then(function(returnVal){
                    return returnVal.val;
                });
        }

        function _isSingleSelectionWithNoRootOrLevelOneFolderSelection(){
            return isRootOrLevelOneFolderInSelection.call(this,true,true)
                .then(function(returnVal){
                    return !returnVal.val && returnVal.selectionLength === 1;
                });
        }

        function isSingleSelection(arrSelection){
            return arrSelection.length === 1;
        }

        function isFolder(selection){
            return selection.document.getEntity().getType() === "folder";
        }

        function _isSingleFolderNotRootSelection(){
            return this.assertBasicSelection()
                .then(function(arrSelection){
                    return isSingleSelection(arrSelection) && // single selection
                           !arrSelection[0].document.getEntity().isRoot() && // not root
                           isFolder(arrSelection[0]); // a folder
                });
        }
        function _isSingleFolderNotRootNotProjectSelection(){
            return this.assertBasicSelection()
                .then(function(arrSelection){
                    return isSingleSelection(arrSelection) && // single selection
                           !arrSelection[0].document.getEntity().isRoot() && // not root
                           isFolder(arrSelection[0])&&
                           !arrSelection[0].document.getEntity().isProject(); //not project
                    
                });
        }
        function _isSingleFolderSelection(){
            return this.assertBasicSelection()
                .then(function(arrSelection){
                    return isSingleSelection(arrSelection) && // single selection
                           isFolder(arrSelection[0]); // a folder
                });
        }

        function _isSingleNoRootSelection(){
            return this.assertBasicSelection()
                .then(function(arrSelection){
                    return isSingleSelection(arrSelection) && // single selection
                           !arrSelection[0].document.getEntity().isRoot(); // root
                });
        }
        
        function _isSingleRootSelection(){
            return this.assertBasicSelection()
                .then(function(arrSelection){
                    return isSingleSelection(arrSelection) && // single selection
                           arrSelection[0].document.getEntity().isRoot(); // root
                });
        }

        function _isSingleFileSelection(){
            return this.assertBasicSelection()
                .then(function(arrSelection){
                    return isSingleSelection(arrSelection) && // single selection
                           !isFolder(arrSelection[0]); // a file
                });
        }

        function _assertBasicSelection(){
            var selectionService = this.context.service.selection;
            return selectionService.assertOwner(this.context.service.repositorybrowser)
                .then(function(){
                    return selectionService.assertNotEmpty();
                });
        }

        /**
         * public
         */
        return {
            isRootIncludedInSelection : _isRootIncludedInSelection,
            assertBasicSelection : _assertBasicSelection,
            isSingleFolderNotRootSelection : _isSingleFolderNotRootSelection,
            isSingleFolderSelection : _isSingleFolderSelection,
            isSingleNoRootSelection : _isSingleNoRootSelection,
            isSingleRootSelection : _isSingleRootSelection,
            isLevelOneIncludedInSelection : _isLevelOneIncludedInSelection,
            isRootOrLevelOneFolderIncludedInSelection : _isRootOrLevelOneFolderIncludedInSelection,
            isSingleSelectionWithNoRootOrLevelOneFolderSelection : _isSingleSelectionWithNoRootOrLevelOneFolderSelection,
            isSingleFileSelection : _isSingleFileSelection,
            removeSelectedFilesUnderSelectedFolders : _removeSelectedFilesUnderSelectedFolders,
            isSingleFolderNotRootNotProjectSelection:_isSingleFolderNotRootNotProjectSelection
            
        };

});