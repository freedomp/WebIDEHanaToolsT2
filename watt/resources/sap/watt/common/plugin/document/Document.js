define(function() {
	"use strict";

    var Document = sap.ui.base.Object.extend("sap.watt.common.plugin.document.Document", {
		constructor : function(oOwner, oDAO, mEntity, oEventEmitter) {
			this._oOwner = oOwner;
			this._oDAO = oDAO;
			this._mEntity = mEntity;
			this._mMetadata = {};
			this._oEventEmitter = oEventEmitter;
			this._mState = {
				bDirty : false,
				bNew : !mEntity,
				sETag : null
			};
			this._dirtyContent = null;
			this._bExtDoc = false;
			this._mExtInfo = null;
			this._savedContent = null;
			this._oSaveQueue = new Q.sap.Queue();
			this._oLoadedPromise = Q();
			this._oHiddenPromise = Q();
		}
	});

	Document.prototype = jQuery.extend(Document.prototype, {

        /** Gets the key string
		 * @returns {string} the key string
		 */
		getKeyString : function() {
			return this._mEntity.getKeyString(this._mEntity);
		},

		/** Gets the entity
		 * @return {object} the entity
		 */
		getEntity : function() {
			return this._mEntity;
		},

		contains : function(oDocument, bOnlyDirectChildren) {
			bOnlyDirectChildren = (bOnlyDirectChildren === true);
			return this.getEntity().contains(oDocument.getEntity(), bOnlyDirectChildren);
		},

		/** Checks whether the document is of the passed type
		 * @param {string} sType
		 * @returns {boolean}
		 */
		isTypeOf : function(sType) {
			return (sType === this.getType());
		},
		
		/** Return if the document is read-only,
		 * to be overwritten by subclasses
		 * @returns {boolean}
		 */
		isReadOnly : function() {
			if (this.getExtInfo() && this.getExtInfo().readOnly === true) {
				return true;
			}
			return !!this._mMetadata.readOnly;
		},

		/** Gets the entity type instance
		 * @return {object} the entity type instance
		 */
		getType : function() {
			return this._mEntity.getType();
		},

		/** Gets the metadata
		 * @return {object} the metadata
		 */
		getDocumentMetadata : function() {
			return this._mMetadata;
		},

		/** Sets the metadata
		 * @param {object} mMetadata the metadata
		 */
		setDocumentMetadata : function(mMetadata) {
			//TODO Should we use jQuery extend instead?
			this._mMetadata = mMetadata;
		},

		/** Gets the ETag
		 * @param {boolean} bRefresh indicator to get a fresh ETag
		 * @return {string} the ETag
		 */
		getETag : function(bRefresh) {
			var that = this;
			if (bRefresh) {
				return this._oDAO.readFileMetadata(this).then(function(oMetadata) {
					if (oMetadata) {
						return that._setState({
							sETag : oMetadata.sETag
						}).then(function() {
							return that._mState.sETag;
						});
					}
					
					return null;
				});
			} 
			
			return this._mState.sETag;
		},

		/** Gets the dirty state
		 * @return {boolean} the dirty state
		 */
		isDirty : function() {
			return this._mState.bDirty === true;
		},

		/** Whether the document is new or not.
		 * @return {boolean} the new state
		 */
		isNew : function() {
			return this._mState.bNew === true;
		},

		/** Loads content lazily by delegating to the adapter
		 * @return {object} the content
		 */
		getContent : function() {
			var that = this;
			return this._ensureLoaded().then(function(sSavedContent) {
				if (that._dirtyContent === null) {
					return sSavedContent;
				}
				
				return that._dirtyContent;
			});
		},
		
		/** Invalidates document stored data
		 */
		invalidate : function() {
			this._savedContent = null;
		},
		
		/** Sets the content with the saved content.
		 * Should be called when setContent was called but should not be saved
		 * @param {string|object} mContent the content
		 * @returns 
		 */
		revert : function(oSource) {
			return this.setContent(this._savedContent, oSource);
		},

		/** Sets the content
		 * @param {string|object} mContent the content
		 * @returns 
		 */
		setContent : function(mContent, oSource) {
			var that = this;
			return this._ensureLoaded().then(function(sSavedContent) {
				var bOldDirtyState = that._mState.bDirty;
				var bNewDirtyState;
				
				if (sSavedContent === mContent) {
					that._dirtyContent = null;
					bNewDirtyState = false;
				} else {
					if (that._dirtyContent === mContent) {
						return;
					}
					that._dirtyContent = mContent;
					bNewDirtyState = true;
				}
				
				return that._setState({bDirty : bNewDirtyState}).then(function() {
					if (bOldDirtyState !== bNewDirtyState || sSavedContent !== mContent) {
						return that._oEventEmitter.fireChanged({
							document : that,
							changeType : "content",
							options : {
								source : oSource
							}
						});
					}
				});
			});
		},
		
		setHidden : function(bHidden, oSource) {
			var that = this;
			
			this._oHiddenPromise.then(function() {
				bHidden = (bHidden === true);
				var bOldHidden = (that._mMetadata.hidden === true);
				
				if (bHidden === bOldHidden) {
					return Q();
				}
				
				that._mMetadata.hidden = bHidden;
				return that.getParent().then(function(oParent) {
					return that._oEventEmitter.fireChanged({
						document : that,
						changeType : "hidden",
						parent : oParent,
						options : {
							source : oSource
						}
					});
				});
			});
			
			return this._oHiddenPromise;
		},

		/** get extra info of the document
		 * @return {object} the information
		 */
		getExtInfo : function() {
			return this._mExtInfo;
		},

		/** Sets the extra info for the document
		 * @param {object} mExtInfo the information
		 * @returns 
		 */
		setExtInfo : function(mExtInfo) {
			this._mExtInfo = mExtInfo;
		},

		_hasStateChanged : function(mState) {
			for ( var sKey in mState) {
				if (this._mState[sKey] !== mState[sKey]) {
					return true;
				}
			}
			return false;
		},

		_setState : function(mState) {
			if (this._hasStateChanged(mState)) {
				jQuery.extend(this._mState, mState);
				return this._oEventEmitter.fireStateChanged({
					document : this
				});
			}
			return Q();
		},

		/** Delegates save to the adapter
		 * fireEvent - whether saved event is been fired or not
		 * @return {string} the new ETag
		 */
		save : function(fireEvent) {
		    fireEvent = (fireEvent !== false);
			if (!this.isDirty()) {
				return Q();
			}
			var that = this;

            return this._oSaveQueue.next(function() {
                return that._oDAO.save(that).then(function(sETag) {
                    that._savedContent = that._dirtyContent;
                    that._dirtyContent = null;
                    //Update eTag
                    return that._setState({
                        bDirty : false,
                        bNew : false,
                        sETag : sETag
                    }).then(function() {
                        if (fireEvent) {
                            return that._oEventEmitter.fireSaved({
                                document : that
                            });
                        }
                    }).thenResolve(sETag);
                });
            });
		},

		/**
		 * Reloads the content
		 */
		reload : function(oSource) {
			var that = this;
			this.invalidate();
			this._dirtyContent = null;
			return this._ensureLoaded().then(function() {
				return that._oEventEmitter.fireChanged({
					document : that,
					changeType : "content",
					options : {
						source : oSource
					}
				});
			});
		},

		"delete" : function() {
			// TODO add a bForce param to delete document even if it is dirty
			throw new Error("Delete not supported for documents of type " + this.getType());
		},

		/** Gets the title (e.g. path or name, type dependent)
		 * @return {string} the title
		 */
		getTitle : function() {
			return this._mEntity.getTitle();
		},

		needToReloadCheck : function() {
			var that = this;
			return Q.all([ this.getETag(), this.getETag(true), this.isDirty() ]).spread(
					function(oldETag, newETag, bDirty) {
						if (newETag === null) {
							return false;
						}
						
						if (oldETag !== newETag) { //indicator that content was changed
							if (bDirty) {
								return that._oOwner.context.service.document.context.service.usernotification.confirm(
										that._oOwner.context.service.document.context.i18n.getText("i18n", "document_reloadQuestion",
												[ that.getEntity().getFullPath() ])).then(function(oResult) {
									if (oResult.bResult) {
										// reload document
										return that.reload().then(function() {
											return Q(true);
										});
									} else {
										// do not reload document, keep the old content but exchange the eTag
										return that._setState({
											"sETag" : newETag
										}).then(function() {
											return Q();
										});
									}
								});
							} else {
								// reload document as it was not dirty
								return that.reload().then(function() {
									return Q(true);
								});
							}
						} else { //nothing to do
							return Q();
						}
					}).fail(function(oError) {
				//might fail if document is deleted which is ok
				return that.exists().then(function(bExists) {
					if (!bExists) {
						return Q();
					} else {
						throw oError;
					}
				});
			});
		},
	
		_ensureLoaded : function() {
			var that = this;

			this._oLoadedPromise = this._oLoadedPromise.then(function() {
				if (that._savedContent === null) {
					return that._oDAO.load(that).then(function(oResult) {
						that._savedContent = oResult.mContent;
						return that._setState({
							bDirty : false,
							sETag : oResult.sETag
						}).then(function() {
							return that._oEventEmitter.fireLoaded({
								document : that
							}).thenResolve(oResult.mContent);
						});
					});
				}
				
				return that._savedContent;
			});
			
			return this._oLoadedPromise;
		},

		_notifyAboutNewDocument : function(oParent, oNewDocument) {
			return Q.all([ this._oEventEmitter.fireCreated({
				document : oNewDocument,
				parent : oParent
			}), this._oEventEmitter.fireChanged({
				document : oParent,
				changeType : "children"
			}) ]);
		},

		_notifyAboutDeletion : function(oParent, oDeletedDocument) {
			return Q.all([ this._oEventEmitter.fireDeleted({
				document : oDeletedDocument,
				parent : oParent
			}), this._oEventEmitter.fireChanged({
				document : oDeletedDocument,
				changeType : "deleted"
			}) ]);
		},

		_notifyAboutMove : function(oNewDocument) {
			return this._oEventEmitter.fireChanged({
				document : this,
				newDocument : oNewDocument,
				changeType : "renamed"
			});
		}
	});

	return Document;
});