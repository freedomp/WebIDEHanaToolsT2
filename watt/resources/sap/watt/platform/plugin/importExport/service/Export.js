define([], function () {

        "use strict";

        var Export =
        {
            exportDocument: function(oDocument, sFileName) {
                var that = this;
                return this.context.service.progress.startTask("Export", " Export process").then(function (iProgressId) {
                    if (oDocument.getType() === "folder") {
                        return oDocument.exportZip().then(function (oBlob) {
                            if (!sFileName) {
                                sFileName = oDocument.getEntity().getName() + ".zip";
                            }
                            return that._downLoadBlob(oBlob, oDocument, sFileName);
                        }).fail(function (oError) {
                            return that.context.service.usernotification.alert(oError.message);
                        }).fin(function(){
                            that.context.service.progress.stopTask(iProgressId).done();
                        });
                    } else if (oDocument.getType() === "file") {
                        return oDocument.createFileBlob().then(function (oBlob) {
                            if (!sFileName) {
                                sFileName = oDocument.getEntity().getName();
                            }
                            return that._downLoadBlob(oBlob, oDocument, sFileName);
                        }).fail(function (oError) {
                            return that.context.service.usernotification.alert(oError.message);
                        }).fin(function(){
                            that.context.service.progress.stopTask(iProgressId).done();
                        });
                    }
            });
        },

            _downLoadBlob : function(oBlob,oDocument,sFileName){

                    var a = document.createElement('a');
                    a.href = (window.URL || window.webkitURL).createObjectURL(oBlob);
                    a.download = sFileName;
                    if (sap.ui.Device.browser.chrome || sap.ui.Device.browser.firefox) {
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    } else if (sap.ui.Device.browser.internet_explorer) {
                        window.navigator.msSaveOrOpenBlob(oBlob, a.download);
                    } else if (sap.ui.Device.browser.safari) {
                        var blobUrl = a.href;
                        var xhr = new XMLHttpRequest();
                        xhr.responseType = 'blob';
                        // Convert blob url to data url
                        xhr.onload = function() {
                            var recoveredBlob = xhr.response;
                            var reader = new FileReader();

                            reader.onload = function() {
                                var blobAsDataUrl = reader.result;
                                a.href = blobAsDataUrl;
//							   No supported by Safari 6,7,8
//						       a.setAttribute("download","download.zip");
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                            };
                            reader.readAsDataURL(recoveredBlob);
                        };

                        xhr.open('GET', blobUrl);
                        xhr.send();
                    } else {
                        window.open(a.href);
                    }
                    return Q(sFileName);
            }
        };

        return Export;
    }
);