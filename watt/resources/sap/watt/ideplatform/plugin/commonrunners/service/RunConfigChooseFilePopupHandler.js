define(["sap.watt.ideplatform.run/util/DocumentWindowsUtil"], function(DocumentWindowsUtil) {

	"use strict";
	var chooseFilePopup = {

		_oChooseFilePopupFragment: null,
		_oFilesTable: null,
		_sSelectedFilePath: null,
		_oDeferred: undefined,
		_sWindowId: null,

		getContent: function(aHtmlFiles, sWindowId) {
			// close the window
			DocumentWindowsUtil.closeWindow(sWindowId);
			this._sWindowId = sWindowId;

			this._oDeferred = Q.defer();

			if (!this._oChooseFilePopupFragment) {
				this._oChooseFilePopupFragment = sap.ui.jsfragment("sap.watt.ideplatform.plugin.commonrunners.view.RunConfigChooseFilePopup", this);
			}
			this.context.i18n.applyTo(this._oChooseFilePopupFragment);

			//get the table
			var aFragContent = this._oChooseFilePopupFragment.getContent();
			var aGridContent = aFragContent[0].getContent();
			this._oFilesTable = aGridContent[0];

			//set the model
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData({
				aFileList: aHtmlFiles
			});
			this._oFilesTable.setModel(oModel);
			this._oFilesTable.bindRows("/aFileList");

			//open the popup
			this._oChooseFilePopupFragment.open();
			// retuen deferred promise
			return this._oDeferred.promise;
		},

		getResult: function() {

			return this._sSelectedFilePath;
		},

		cancel: function() {

			this._oChooseFilePopupFragment.close();
			this._oDeferred.resolve(false);
		},

		ok: function() {
			//open a new window
			var sNewWindowId = DocumentWindowsUtil.openWindow();
            DocumentWindowsUtil.renameWindow(sNewWindowId, this._sWindowId);
            
			//get the selected file
			var iSelectedRow = this._oFilesTable.getSelectedIndex();
			var aFileList = this._oFilesTable.getModel().getProperty("/aFileList");
			this._sSelectedFilePath = aFileList[iSelectedRow].fullPath;

			//close the popup 
			this._oChooseFilePopupFragment.close();

			//resolve the promise
			this._oDeferred.resolve(true);
		},

		rowSelection: function() {
			//get the selected file

			var iSelectedRow = this._oFilesTable.getSelectedIndex();
			if (iSelectedRow >= 0) {
				var aFileList = this._oFilesTable.getModel().getProperty("/aFileList");
				this._sSelectedFilePath = aFileList[iSelectedRow].fullPath;
			}
		},
		
		//enable the OK Button when a file is selected
		enableOK: function() {
			if (this._oFilesTable.getSelectedIndex() >= 0) {
				this._oChooseFilePopupFragment.getButtons()[0].setEnabled(true);
			} else {
				this._oChooseFilePopupFragment.getButtons()[0].setEnabled(false);
			}
		},

		cellClick: function() {

			if (this._sSelectedFilePath) {
				//open a new window
				var sNewWindowId = DocumentWindowsUtil.openWindow();
                DocumentWindowsUtil.renameWindow(sNewWindowId, this._sWindowId);

				//close the popup 
				this._oChooseFilePopupFragment.close();
				
				//open a new window
				sNewWindowId = DocumentWindowsUtil.openWindow();
                DocumentWindowsUtil.renameWindow(sNewWindowId, this._sWindowId);

				//resolve the promise
				this._oDeferred.resolve(true);
			}

		},

		getFocusElement: function() {

		},

		getTitle: function() {

		},

		getTooltip: function() {

		},

		setVisible: function() {

		},

		isVisible: function() {

		}
	};

	return chooseFilePopup;

});