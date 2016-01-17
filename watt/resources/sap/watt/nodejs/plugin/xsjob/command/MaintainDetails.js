define(function() {
	"use strict";

    return {
        execute: function(iFirstArg, ioWindow) {
            var that = this;

            var loSelectionService = this.context.service.selection;
            return loSelectionService.assertNotEmpty().then(function(iaSelection) {
                var loDocument = iaSelection[0].document;
                if (loDocument === null || loDocument.getType() !== "file") {
                    return Q(false);
                }
                var lsFileExtension = loDocument.getEntity().getFileExtension();
                if (lsFileExtension.toLowerCase() === 'xsjob') {
                    var lsFileURI = (loDocument.getEntity().getParentPath() + "/" + loDocument.getEntity().getName()).substr(1);
                    that._navigateToAdminister(ioWindow, lsFileURI);
                } else {
                    return false;
                }
            });
        },

        isAvailable: function() {
            var loSelectionService = this.context.service.selection;
            return loSelectionService.assertNotEmpty().then(function(iaSelection) {
                var loDocument = iaSelection[0].document;
                if (loDocument === null || loDocument.getType() !== "file") {
                    return Q(false);
                }
                var lsFileExtension = loDocument.getEntity().getFileExtension();
                if (lsFileExtension.toLowerCase() === 'xsjob') {
                    return true;
                } else {
                    return false;
                }
            });
        },

        isEnabled: function() {
            return true;
        },

        _navigateToAdminister: function(ioWindow, isFileURI) {
            ioWindow.location.href = "/sap/hana/xs/admin/index.html?package=" + this._uriToParentURI(isFileURI).replace(/\//g, '.') + "&name=" + this._uriToFilenameWithoutSuffix(isFileURI) + "&type=xsjob";
        },

        _uriToFilenameWithoutSuffix: function(uri) {
            var splitArray = uri.split(/[\/]+/).pop().split(/[\.]+/);
            splitArray.pop();
            return splitArray.join('.');
        },
        
        _uriToParentURI: function(uri) {
            var splitArray = uri.split(/[\/]+/);
            if (splitArray.length == 1) {
                return 'jstree.root';
            } else {
                splitArray.pop();
                return splitArray.join('/');
            }
        }
    };
});