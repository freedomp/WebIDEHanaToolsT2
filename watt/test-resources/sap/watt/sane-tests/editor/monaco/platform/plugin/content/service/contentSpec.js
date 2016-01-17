//  The SaneTestFramework should be imported via 'STF' path.
define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	//  every suite must have a uniqueName. using a none unique name will cause an error.
	var suiteName = "content_service_tests";

	var oDocumentService;
	var oContentService;
	var oContentServiceImpl;
	var oContentPersistenceService;
	var oFakeFileDAO;
	var oAceEditorService;
	var oUserNotificationService;
	var oAceEditorCtrl;
	var oFile1Doc;
	var oFile2Doc;
	var oFile3Doc;
	var sDOC1 = "any js code";
	var sDOC2 = "other js code";
	var sDOC3 = "third js code";
	
	var sandbox;
	
	var mConsumer = {
		"name": "contentTestConsumer",

		"requires": {
			"services": [
				"editor"
			]
		},
		"configures": {
			"services": {
				"editor:defaultEditors": [{
					"extention": "*",
					"editorId": "ace"
				}]
			}
		}
	};

    function createFileStructure() {
    	return oFakeFileDAO.setContent({
			"folder" : {
				"file1.js" : sDOC1,
				"file2.js" : sDOC2,
				"file3.js" : sDOC3
			}
		}).then(function() {
			return [
				oFakeFileDAO.getDocument("/folder/file1.js"), 
				oFakeFileDAO.getDocument("/folder/file2.js"),
				oFakeFileDAO.getDocument("/folder/file3.js")
			];
		}).spread(function(oDoc1, oDoc2, oDoc3) {
			oFile1Doc = oDoc1;
			oFile2Doc = oDoc2;
			oFile3Doc = oDoc3;
			return oFile3Doc.reload();
		});	
    }
    
	describe("Content Service", function() {
		before(function() {
			return STF.startWebIde(suiteName, {config : "editor/monaco/platform/plugin/content/service/config.json"}).
			then(function() {
				return STF.register(suiteName, mConsumer);
			}).then(function() {
				oDocumentService = STF.getService(suiteName, "document");
				oContentService = STF.getService(suiteName, "content");
				oContentPersistenceService = STF.getService(suiteName, "contentPersistence");
				oFakeFileDAO = STF.getService(suiteName, "fakeFileDAO");
				oAceEditorService = STF.getService(suiteName, "aceeditor");
				oUserNotificationService = STF.getService(suiteName, "usernotification");
				sandbox = sinon.sandbox.create();	
				return STF.getServicePrivateImpl(oContentService);
			}).then(function(_oContentServiceImpl) {
				oContentServiceImpl = _oContentServiceImpl;
				return oAceEditorService.getContent();
			}).then(function(oAceEditorControl) {	
				oAceEditorCtrl = oAceEditorControl;
			});
		});
		
		after(function() {
			STF.shutdownWebIde(suiteName);
		});
		
		beforeEach(function() {
			return createFileStructure();
		});
		
		afterEach(function() {
			sandbox.restore();
			return oContentService.closeAll();
		});
		
		describe("Content Service: Open Files", function() {
			
			it("open single document", function() {
				return oDocumentService.open(oFile1Doc).then(function() {
					return oContentService.getCurrentEditor();
				}).then(function(oCurrentEditor) {
					expect(oCurrentEditor, "An editor has been opened").to.exist;
					expect(oCurrentEditor.getProxyMetadata().getName(), "Expecting Ace is opened").to.equal("aceeditor");
					return oContentService.getCurrentDocument();
				}).then(function(oCurrentDocument) {
					expect(oCurrentDocument, "Expecting File 1 is opened").to.equal(oFile1Doc);
				});
			});
	
			it("open multiple files, check reentrance", function() {
				return Q.all([ 
					oDocumentService.open(oFile1Doc), 
					oDocumentService.open(oFile2Doc), 
					oDocumentService.open(oFile3Doc),
					oDocumentService.open(oFile1Doc)
				]).then(function() {
					return [ 
						oContentService.getDocumentCount(), 
						oFile1Doc.getContent(), 
						oFile2Doc.getContent(),
						oFile3Doc.getContent()
					];
				}).spread(function(iDocumentCount, sDoc1Content, sDoc2Content, sDoc3Content) {
					expect(iDocumentCount, "3 documents open").to.equal(3);
					expect(oFile1Doc.isDirty(), "File 1 not dirty").to.be.false;
					expect(oFile2Doc.isDirty(), "File 2 not dirty").to.be.false;
					expect(oFile3Doc.isDirty(), "File 3 not dirty").to.be.false;
					expect(sDoc1Content, "File 1 content untouched").to.equal(sDOC1);
					expect(sDoc2Content, "File 2 content untouched").to.equal(sDOC2);
					expect(sDoc3Content, "File 3 content untouched").to.equal(sDOC3);
					return [
						oContentService.getCurrentEditor(), 
						oContentService.getDocuments(),
						oContentService.hasDocuments() 
					];
				}).spread(function(oCurrentEditor, aDocuments, bHasDocuments) {
					expect(oCurrentEditor.getProxyMetadata().getName(), "Expecting Ace is opened").to.equal("aceeditor");
					expect(aDocuments, "All 3 docs returned").to.have.length(3);
					expect(bHasDocuments, "Documents available").to.be.true;
				});
			});
			
			it("Excpetion thrown from editor should result in closing tab and clearing persistence", function() {
				sandbox.stub(oAceEditorService, "open").throws();
				sandbox.stub(oUserNotificationService, "alert").returns(Q());
				return oContentService.open(oFile1Doc, oAceEditorService).then(function() {
					return [oContentService.getDocumentCount(), oContentPersistenceService.getTabs()];
				}).spread(function(iNumDocuments, aTabs) {
					expect(iNumDocuments, "Tab closed").to.equal(0);
					expect(aTabs, "Persistence was cleared").to.be.empty;
				});			
			});
			
			it("Show tab if open", function() {
				return oContentService.open(oFile1Doc, oAceEditorService).then(function() {
					return oContentService.open(oFile2Doc, oAceEditorService);
				}).then(function() {
					return oContentService.showIfOpen(oFile1Doc, oAceEditorService);
				}).then(function() {
					return oContentService.getCurrentDocument();
				}).then(function(oCurrentDocument) {
					expect(oCurrentDocument, "tab with doc1 is active").to.equal(oFile1Doc);	
				});			
			});
			
			it("Show tab if open - when excpetion raised by editor tab should be closed and removed from persistence", function() {
				return oContentService.open(oFile1Doc, oAceEditorService).then(function() {
					return oContentService.open(oFile2Doc, oAceEditorService);
				}).then(function() {
					sandbox.stub(oAceEditorService, "open", function() {
						var oDefered = Q.defer();
						oDefered.reject();
						return oDefered.promise;
					});
					sandbox.stub(oUserNotificationService, "alert").returns(Q());
					return oContentService.showIfOpen(oFile1Doc, oAceEditorService);
				}).then(function() {
					return [oContentService.getDocumentCount(), oContentService.getCurrentDocument(), oContentPersistenceService.getTabs()];
				}).spread(function(iNumDocuments, oCurrentDocument, aTabs) {
					expect(iNumDocuments, "One document is opened").to.equal(1);
					expect(oCurrentDocument, "tab with doc1 was closed and tab with doc2 is active").to.equal(oFile2Doc);	
					expect(aTabs, "Persistence contains 1 tab").to.have.length(1);
					expect(aTabs[0].keystring).to.equal("file:/folder/file2.js:workspace", "Tab with doc1 was cleared from persistence");
				});			
			});
			
		});
		
		describe("Content Service: Work with Files", function() {
			beforeEach(function() {
				return Q.all([oDocumentService.open(oFile1Doc), oDocumentService.open(oFile2Doc)]).then(function(){
					return oDocumentService.open(oFile3Doc);
				});
			});
			
			it("change file and save all files", function() {
				var sCHANGE = "changed";
	
				// attach to "liveChange", otherwise oContentService.isCurrentDocumentDirty() might come to early
				var oDeferred = Q.defer();
				oAceEditorCtrl.attachLiveChange(function(){
					oDeferred.resolve();
				}, this);
	
				oAceEditorCtrl.setValue(sCHANGE);
	
				return oDeferred.promise.then(function() {
					return oContentService.isCurrentDocumentDirty().then(function(bDirty) {
						expect(oFile3Doc.isDirty(), "File 3 is dirty").to.be.true;
						expect(bDirty, "content service has recognized the change in the file").to.be.true;
						return oContentService.saveAll();
					}).then(function(){
						expect(oFile1Doc.isDirty(), "File 1 not dirty after save").to.be.false;
						expect(oFile2Doc.isDirty(), "File 2 not dirty after save").to.be.false;
						expect(oFile3Doc.isDirty(), "File 3 not dirty after save").to.be.false;
						return oFile3Doc.getContent();
					}).then(function(sDoc3Content) {
						expect(sDoc3Content, "File 3 change has reached the document").to.equal(sCHANGE);
					});
				});
			});
	
			it("change file and reload", function() {
				var sCHANGE = "changed";
	
				// attach to "liveChange", otherwise oContentService.isCurrentDocumentDirty() might come to early
				var oDeferred = Q.defer();
				oAceEditorCtrl.attachLiveChange(function(){
					oDeferred.resolve();
				}, this);
	
				oAceEditorCtrl.setValue(sCHANGE);
				
				return oDeferred.promise.then(function() {
					return oContentService.isCurrentDocumentDirty().then(function(bDirty) {
						expect(oFile3Doc.isDirty(), "File 3 is dirty").to.be.true;
						expect(bDirty, "content service has recognized the change in the file").to.be.true;
						return oFile3Doc.getContent();
					}).then(function(sDoc3Content) {
						expect(sDoc3Content, "File 3 change has reached the document").to.equal(sCHANGE);
						return oFile3Doc.reload();
					}).then(function() {
						return oFile3Doc.getContent();
					}).then(function(sDoc3Content) {
						expect(oFile3Doc.isDirty(), "File 3 is not dirty after reload").to.be.false;
						expect(sDoc3Content, "File 3 change resetted on the document").to.equal(sDOC3);
					});
				});
			}); 
			
			it("close other file", function(done) {
				oContentServiceImpl._getTabController().attachEventOnce("contentTabSelected", function(oEvent) {
					 expect(oEvent.getParameter("clicked"), "tabSelect event should be fired with clicked = false").to.be.false;
					 expect(oEvent.getParameter("index"), "tabSelect event should be fired with tabIndex = 1").to.equal(1);
					 done();
				}, this);
				return oContentService.close(oFile2Doc).then(function() {
					return oContentService.getCurrentDocument();
				}).then(function(oCurrentDoc){
					expect(oCurrentDoc, "File 3 still current tab").to.equal(oFile3Doc);
				});
			});
			
			it("change file3, switch tabs, close it without saving, content should be unchanged/not cached", function() {
				var sCHANGE = "changed";
	
				// attach to "liveChange", otherwise oContentService.isCurrentDocumentDirty() might come to early
				var oChangeDefer = Q.defer();
				oAceEditorCtrl.attachLiveChange(function(){
					oChangeDefer.resolve();
				}, this);
	
				oAceEditorCtrl.setValue(sCHANGE);
	
				return oChangeDefer.promise.then(function(){
					return oContentService.open(oFile2Doc,oAceEditorService);
				}).then(function() {
					return oContentService.open(oFile3Doc,oAceEditorService);
				}).then(function(){
					//close without dataloss
					return oContentServiceImpl._closeDocument(oFile3Doc,false);
				}).then(function () {
					return oFile3Doc.getContent();
				}).then(function(sDoc3Content) {
					expect(sDoc3Content, "File 3 should be unchanged").to.equal(sDOC3);
				});
			});
	
			it("close all files", function() {
				return oContentService.closeAll().then(function() {
					//works because q promise is going into next JS tick, then the UI5 eventing is finished
					return [ 
						oContentService.getCurrentEditor(),
						oContentService.getCurrentDocument(),
						oContentService.getDocuments(),
						oContentService.hasDocuments() 
					];
				}).spread(function(oCurrentEditor,oCurrentDoc, aDocuments, bHasDocuments) {
					expect(oCurrentEditor, "Editor is null").to.not.exist;
					expect(oCurrentDoc, "File is null").to.not.exist;
					expect(aDocuments, "documents arrray available but empty").to.be.empty;
					expect(bHasDocuments, "has no documents").to.be.false;
				});
			});
	
			it("close other files", function() {
				return oContentService.closeOthers().then(function() {
					//works because q promise is going into next JS tick, then the UI5 eventing is finished
					return [ 
						oContentService.getCurrentDocument(),
						oContentService.getDocuments(),
						oContentService.hasDocuments() 
					];
				}).spread(function(oCurrentDoc, aDocuments, bHasDocuments) {
					expect(oCurrentDoc, "Current File is still open").to.equal(oFile3Doc);
					expect(aDocuments).to.have.length(1);
					expect(bHasDocuments, "has still documents").to.be.true;
				});
			});
			
			it("rename active file", function() {
				var oEditorOpenDeferred = Q.defer();
				var oEditorCloseDeferred = Q.defer();
				sandbox.stub(oAceEditorService, "open", function(oDocument) {
					expect(oDocument.getTitle(),"editor.open() was called with renamed.js").to.equal( "renamed.js");
					oEditorOpenDeferred.resolve();
					return Q();
				});
				sandbox.stub(oAceEditorService, "close", function(oDocument) {
					expect(oDocument, "editor.close() was called with file3.js").to.equal(oFile3Doc);
					oEditorCloseDeferred.resolve();
					return Q();
				});
				return oDocumentService.getDocumentByPath("folder").then(function(oFolderDocument) {
					return oFile3Doc.move(oFolderDocument, "renamed.js");
				}).then(function() {
					return [oEditorOpenDeferred.promise, oEditorCloseDeferred.promise];
				}).spread(function() {
					return [oContentService.getCurrentDocument(), oContentService.getDocuments(),oContentService.hasDocuments()];
				}).spread(function(oCurrentDoc, aDocuments, bHasDocuments) {
					expect(oCurrentDoc.getTitle(), "Current document is renamed.js").to.equal("renamed.js");
					expect(aDocuments, "3 documents are open").to.have.length(3);
					expect(bHasDocuments, "has still documents").to.be.true;
				});
			});
			
			it("rename non-active file", function() {
				var oEditorCloseDeferred = Q.defer();
				sandbox.stub(oAceEditorService, "close", function(oDocument) {
					expect(oDocument, "editor.close() was called with file2.js").to.equal(oFile2Doc);
					oEditorCloseDeferred.resolve();
					return Q();
				});
				return oDocumentService.getDocumentByPath("folder").then(function(oFolderDocument) {
					return oFile2Doc.move(oFolderDocument, "renamed.js");
				}).then(function() {
					return oEditorCloseDeferred.promise;
				}).then(function() {
					return [oContentService.getCurrentDocument(), oContentService.getDocuments(),oContentService.hasDocuments()];
				}).spread(function(oCurrentDoc, aDocuments, bHasDocuments) {
					expect(oCurrentDoc.getTitle(), "Current document is file3.js").to.equal("file3.js");
					expect(aDocuments, "3 documents are open").to.have.length(3);
					expect(bHasDocuments, "has still documents").to.be.true;
				});
			});
			
			it("rename file including file extension, file should be closed", function() {
				var oEditorOpenDeferred = Q.defer();
				var oEditorCloseDeferred = Q.defer();
				sandbox.stub(oAceEditorService, "open", function(oDocument) {
					expect(oDocument.getTitle(), "editor.open() was called with file2.js").to.equal("file2.js");
					oEditorOpenDeferred.resolve();
					return Q();
				});
				sandbox.stub(oAceEditorService, "close", function(oDocument) {
					expect(oDocument, "editor.close() was called with file3.js").to.equal(oFile3Doc);
					oEditorCloseDeferred.resolve();
					return Q();
				});
				return oDocumentService.getDocumentByPath("folder").then(function(oFolderDocument) {
					return oFile3Doc.move(oFolderDocument, "renamed.xml");
				}).then(function() {
					return [oEditorOpenDeferred.promise, oEditorCloseDeferred.promise];
				}).spread(function() {
					return [oContentService.getCurrentDocument(), oContentService.getDocuments(),oContentService.hasDocuments()];
				}).spread(function(oCurrentDoc, aDocuments, bHasDocuments) {
					expect(oCurrentDoc.getTitle(), "Current document is file2.js").to.equal("file2.js");
					expect(aDocuments, "2 documents are open").to.have.length(2);
					expect(bHasDocuments, "has still documents").to.be.true;
				});
			});
			
			it("delete folder should close all files and don't trigger open on the editor", function() {
				var fnOldEditorOpen = oAceEditorService.open;
				oAceEditorService.open = function() {
					throw new Error("Open should not be called when closing documents because of deletions");
				};
				
				return oFakeFileDAO.getDocument("/folder").then(function(oFolder) {
					return oFolder.delete();
				}).then(function() {
					return oContentService.getDocuments();
				}).then(function(aDocuments){
					expect(aDocuments, "all documents being closed").to.be.empty;
				}).then(function() {
					//restore open method
					oAceEditorService.open = fnOldEditorOpen;
				});
			});
		});
	
	});
});