define([
        "../CalcViewEditorUtil"

    ],
	function( CalcViewEditorUtil) {
		var FindAndHighlight = function() {
			this.highlightControl = undefined;
			this.editor = undefined;
			this.liveValue = "";
			this.curTab = undefined;
			this._editorSymbols = [];
			this._Sequencetabels = {};
			this.SequnceNumber = 0;
			this._CurSequnce = 0;
			this.searchField = undefined;
			this.nextButton = undefined;
			this.viewText = undefined;
			this.joinLength = 0;
		};

		FindAndHighlight.prototype = {
			registerTable: function(key, table) {
				this._Sequencetabels[key] = table;
			},
			unRegisterTable: function(key) {
				delete this._Sequencetabels[key];
			},
			findFunction: function() {
				var that = this;
				that.clearEditor();
				that.highlightControl.removeStyleClass("searchLayoutDisplay");
				this.searchField = that.highlightControl.getRows()[0].getCells()[1].getContent()[0];
				this.nextButton = that.highlightControl.getRows()[0].getCells()[3].getContent()[0];
				var prevButton = that.highlightControl.getRows()[0].getCells()[4].getContent()[0];
				var closeButton = that.highlightControl.getRows()[0].getCells()[5].getContent()[0];
				this.viewText = that.highlightControl.getRows()[0].getCells()[2].getContent()[0];
				this.viewText.setText("");
				/*that.searchField.attachLiveChange(function() {
					that._CurSequnce = 0;
					that.liveValue = this.getLiveValue();
					that.clearEditor();
					that.editorSymbols();
					that.highlightDetails();
					that.nextButton.firePress();

				});
				 nextButton.attachPress(function(e) {
					that._CurSequnce++;
					if (that._CurSequnce > that.SequnceNumber) {
						that._CurSequnce = 1;
					}
					that.navigationHighlight();
				   this.detachPress();
				});
				prevButton.attachPress(function() {
					that._CurSequnce--;
					if (that._CurSequnce === 0) {
						that._CurSequnce = that.SequnceNumber;
					}
					that.navigationHighlight();
				});
				*/
				closeButton.attachPress(function() {
					that._CurSequnce = 0;
					that.liveValue = "";
					that.clearEditor();
					that.editorSymbols();
					that.highlightDetails();
					that.searchField.setValue();
				});
			},
			search: function(liveValue) {
				var that = this;
				that.viewText.setText("");
				that._CurSequnce = 0;
				that.liveValue = liveValue;
				that.clearEditor();
				that.editorSymbols();
				that.highlightDetails();
				that.nextButton.firePress();

			},
			next: function() {
				var that = this;
				that._CurSequnce++;
				if (that._CurSequnce > that.SequnceNumber) {
					that._CurSequnce = 1;
				}
				that.navigationHighlight();
				if (that.SequnceNumber > 0) {
				that.viewText.setText(that._CurSequnce + " of " + that.SequnceNumber);
				}
			},
			previous: function() {
				var that = this;
				that._CurSequnce--;
				if (that._CurSequnce === 0) {
					that._CurSequnce = that.SequnceNumber;
				}
				that.navigationHighlight();
				if (that.SequnceNumber > 0) {
				that.viewText.setText(that._CurSequnce + " of " + that.SequnceNumber);
				}
			},
			editorSymbols: function() {
				var semanticLinkSymbol;
				for (var i = 0; i < this.editor._editor.getAllSymbols().length; i++) {
					if (this.editor._editor.getAllSymbols()[i].classDefinition.qualifiedName === this.editor.SEMANTICS_SYMBOL) {
						semanticLinkSymbol = this.editor._editor.getAllSymbols()[i];
					}
				}
				var fs = semanticLinkSymbol.getLinkSymbols()[0].sourceSymbol;
				this.repeatSymbols(fs);

			},
			repeatSymbols: function(NodeSymbol) {
				for (var j = 0, len = NodeSymbol.getAllSymbols().length; j < len; j++) {
					if (NodeSymbol.getAllSymbols()[j].__fullClassName__ === "TableSymbol") {
						var name = (NodeSymbol.getAllSymbols()[j].object.name).toUpperCase();
						if (this.liveValue !== "" && name.includes(this.liveValue.toUpperCase())) {
							this._editorSymbols.push(NodeSymbol.getAllSymbols()[j]);
							NodeSymbol.getAllSymbols()[j].changeTableBorder = true;
						}
					}
				}
				for (var m = 1, len1 = NodeSymbol.getLinkSymbols().length; m < len1; m++) {
					var link = NodeSymbol.getLinkSymbols()[m];
					this.repeatSymbols(link.sourceSymbol);
				}

			},
			clearEditor: function() {
				for (var i = 0, len = this._editorSymbols.length; i < len; i++) {
					this._editorSymbols[i].changeTableBorder = false;
					this._editorSymbols[i].highlightBorder = false;
				}
				this._editorSymbols.length = 0;
			},
			highlightDetails: function() {
				var curEditor = CalcViewEditorUtil.getCurEditor();
				var curtab = curEditor._detailsPane._selectedKey;
				this.curTab = curtab;
				var _SequnceNumber = this._editorSymbols.length;
				var highlightValue = this.liveValue;
				if (curtab === "Mapping") {
					var firstTable = this._Sequencetabels["mp1"];
					var path = firstTable.mBindingInfos.rows.path;
					var elements = firstTable.getModel().oData[path.replace("/", "")].nodes;
					elements.forEach(function(element) {
						var nodes = element.nodes;
						nodes.forEach(function(node) {
							if (((node.name).toUpperCase()).includes(highlightValue.toUpperCase()) && (highlightValue !== "")) {
								_SequnceNumber++;
								node.seq = "" + _SequnceNumber;
								node.focus = "none";
							} else {
								node.seq = "none";
								node.focus = "none";
							}
						});

					});
					firstTable.getModel().refresh(true);
					var secondTable = this._Sequencetabels["mp2"];
					var path1 = secondTable.mBindingInfos.rows.path;
					var elements1 = secondTable.getModel().oData[path1.replace("/", "")].nodes;
					elements1.forEach(function(element1) {
						if (((element1.name).toUpperCase()).includes(highlightValue.toUpperCase()) && (highlightValue !== "")) {
							_SequnceNumber++;
							element1.seq = _SequnceNumber;
							element1.focus = "none";
						} else {
							element1.seq = "none";
							element1.focus = "none";
						}
					});
					secondTable.getModel().refresh(true);
				}
				if ((curtab.indexOf("calculated") > -1) || (curtab.indexOf("paramete") > -1) || (curtab.indexOf("restricted") > -1)) {
					//Restricted,Calculated,parameters,variabel
					var firstTable1;
					if (curtab.indexOf("calculated") > -1) {
						firstTable1 = this._Sequencetabels["cc"];
					} else if (curtab.indexOf("paramete") > -1) {
						firstTable1 = this._Sequencetabels["pv"];
					} else {
						firstTable1 = this._Sequencetabels["rc"];
					}
					var elements2 = firstTable1.getModel().oData;
					elements2.forEach(function(element) {

						if (((element.name).toUpperCase()).includes(highlightValue.toUpperCase()) && (highlightValue !== "")) {
							_SequnceNumber++;
							element.seq = "" + _SequnceNumber;
							element.focus = "none";
						} else {
							element.seq = "none";
							element.focus = "none";
						}

					});
					firstTable1.getModel().refresh(true);
				}
				if (curtab.indexOf("hierarchi") > -1) {
					//StarJoin Hierarchies
					var firstTable3 = this._Sequencetabels["hi1"];
					var elements3 = firstTable3.getModel().oData;
					elements3.forEach(function(element) {

						if (((element.name).toUpperCase()).includes(highlightValue.toUpperCase()) && (highlightValue !== "")) {
							_SequnceNumber++;
							element.seq = "" + _SequnceNumber;							
							element.focus = "none";
						} else {
							element.seq = "none";
							element.focus = "none";
						}

					});
					firstTable3.getModel().refresh(true);

					//StarJoin Hierarchies
					var secondTable3 = this._Sequencetabels["hi2"];
					if (secondTable3 !== undefined) {

						var elements4 = secondTable3.getModel().oData;
						elements4.forEach(function(element) {

							if (((element.name).toUpperCase()).includes(highlightValue.toUpperCase()) && (highlightValue !== "")) {
								_SequnceNumber++;
								element.seq = "" + _SequnceNumber;
								element.focus = "none";
							} else {
								element.seq = "none";
								element.focus = "none";
							}

						});
						secondTable3.getModel().refresh(true);
					}
				}

				if (curtab.startsWith("columns")) {
					//Columns pane
					var semTable = this._Sequencetabels["sc1"];
					var semElements = semTable.getModel().oData.columns;
					semElements.forEach(function(element) {
						if (((element.name).toUpperCase()).includes(highlightValue.toUpperCase()) && (highlightValue !== "")) {
							_SequnceNumber++;
							element.seq = "" + _SequnceNumber;
							element.focus = "none";
						} else {
							element.seq = "none";
							element.focus = "none";
						}
						if ((element.label !== undefined) && ((element.label).toUpperCase()).includes(highlightValue.toUpperCase()) && (highlightValue !==
							"")) {
							_SequnceNumber++;
							element.seq1 = "" + _SequnceNumber;
							element.focus1 = "none";
						} else {
							element.seq1 = "none";
							element.focus1 = "none";
						}
					});
					semTable.getModel().refresh(true);
					var shaTable = this._Sequencetabels["sc2"];
					if (shaTable !== undefined) {
						var shaElements = shaTable.getModel().oData.sharedColumns;
						shaElements.forEach(function(element) {
							if (((element.name).toUpperCase()).includes(highlightValue.toUpperCase()) && (highlightValue !== "")) {
								_SequnceNumber++;
								element.seq = "" + _SequnceNumber;
								element.focus = "none";
							} else {
								element.seq = "none";
								element.focus = "none";
							}
							if ((element.label !== undefined) && ((element.label).toUpperCase()).includes(highlightValue.toUpperCase()) && (highlightValue !==
								"")) {
								_SequnceNumber++;
								element.seq1 = "" + _SequnceNumber;
								element.focus1 = "none";
							} else {
								element.seq1 = "none";
								element.focus1 = "none";
							}
						});
						shaTable.getModel().refresh(true);

					}

				}
				if (curtab.startsWith("details")) {

					var detTable = this._Sequencetabels["dc"];
					var detElements = detTable.getModel().oData.columns;
					detElements.forEach(function(element) {
						if (((element.name).toUpperCase()).includes(highlightValue.toUpperCase()) && (highlightValue !== "")) {
							_SequnceNumber++;
							element.seq = "" + _SequnceNumber;
							element.focus = "none";
						} else {
							element.seq = "none";
							element.focus = "none";
						}

					});
					detTable.getModel().refresh(true);
				}
				if (curtab.startsWith("Join")) {
					var diagramPane = CalcViewEditorUtil.getCurEditor()._detailsPane._getSelectedContent().diagramPane;
					this.joinLength = diagramPane.joinHighlight(highlightValue, _SequnceNumber);
					_SequnceNumber = this.joinLength + this._editorSymbols.length;
				}
				this.SequnceNumber = _SequnceNumber;
			},
			navigationHighlight: function() {
				for (var k = 0; k < this._editorSymbols.length; k++) {
					this._editorSymbols[k].highlightBorder = false;
				}
				if (this._CurSequnce <= this._editorSymbols.length) {
					this._editorSymbols[this._CurSequnce - 1].highlightBorder = true;
					this.highlightDetails();
				} else {
					var curtab = this.curTab;
					var highlightValue = this.liveValue;
					var _SequnceNumber = this._editorSymbols.length + 1;
					if (curtab === "Mapping") {
						var firstTable = this._Sequencetabels["mp1"];
						var path = firstTable.mBindingInfos.rows.path;
						var elements = firstTable.getModel().oData[path.replace("/", "")].nodes;
						for (var k = 0; k < elements.length; k++) {
							var element = elements[k];
							var nodes = element.nodes;
							for (var i = 0; i < nodes.length; i++) {
								var node = nodes[i];
								if (((node.name).toUpperCase()).includes(highlightValue.toUpperCase()) && (highlightValue !== "")) {
									_SequnceNumber++;
									node.seq = "" + _SequnceNumber;
									node.focus = "none";
									if (this._CurSequnce + 1 === _SequnceNumber) {
										node.focus = "focus";
										firstTable.setFirstVisibleRow(i);
									}
								} else {
									node.seq = "none";
									node.focus = "none";
								}
							}
						}
						firstTable.getModel().refresh(true);
						var secondTable = this._Sequencetabels["mp2"];
						var path1 = secondTable.mBindingInfos.rows.path;
						var elements1 = secondTable.getModel().oData[path1.replace("/", "")].nodes;
						for (var j = 0; j < elements1.length; j++) {
							var element1 = elements1[j];
							if (((element1.name).toUpperCase()).includes(highlightValue.toUpperCase()) && (highlightValue !== "")) {
								_SequnceNumber++;
								element1.seq = _SequnceNumber;
								element1.focus = "none";
								if (this._CurSequnce + 1 === _SequnceNumber) {
									element1.focus = "focus";
									secondTable.setFirstVisibleRow(j);
								}
							} else {
								element1.seq = "none";
								element1.focus = "none";
							}
						}
						secondTable.getModel().refresh(true);
					}
					if ((curtab.indexOf("calculated") > -1) || (curtab.indexOf("paramet") > -1) || (curtab.indexOf("restricted") > -1)) {
						//Restricted,Calculated,parameters,variabel
						var firstTable1;
						if (curtab.indexOf("calculated") > -1) {
							firstTable1 = this._Sequencetabels["cc"];
						} else if (curtab.indexOf("paramet") > -1) {
							firstTable1 = this._Sequencetabels["pv"];
						} else {
							firstTable1 = this._Sequencetabels["rc"];
						}
						var elements2 = firstTable1.getModel().oData;
						for (var m = 0; m < elements2.length; m++) {
							var ele = elements2[m];
							if (((ele.name).toUpperCase()).includes(highlightValue.toUpperCase()) && (highlightValue !== "")) {
								_SequnceNumber++;
								ele.seq = "" + _SequnceNumber;
								ele.focus = "none";
								if (this._CurSequnce + 1 === _SequnceNumber) {
									ele.focus = "focus";
									firstTable1.setFirstVisibleRow(m);
								}
							} else {
								ele.seq = "none";
								ele.focus = "none";
							}

						}
						firstTable1.getModel().refresh(true);
					}
					if (curtab.indexOf("hierarchi") > -1) {
						//StarJoin Hierarchies
						var firstTable3 = this._Sequencetabels["hi1"];

						var elements3 = firstTable3.getModel().oData;
						for (var n = 0; n < elements3.length; n++) {
							var element = elements3[n];
							if (((element.name).toUpperCase()).includes(highlightValue.toUpperCase()) && (highlightValue !== "")) {
								_SequnceNumber++;
								element.seq = "" + _SequnceNumber;
								element.focus = "none";
								if (this._CurSequnce + 1 === _SequnceNumber) {
									element.focus = "focus";
									firstTable3.setFirstVisibleRow(n);
								}
							} else {
								element.seq = "none";
								element.focus = "none";
							}

						}
						firstTable3.getModel().refresh(true);

						//StarJoin Hierarchies
						var secondTable3 = this._Sequencetabels["hi2"];
						if (secondTable3 !== undefined) {
							var elements4 = secondTable3.getModel().oData;
							for (var o = 0; o < elements4.length; o++) {
								var element = elements4[o];
								if (((element.name).toUpperCase()).includes(highlightValue.toUpperCase()) && (highlightValue !== "")) {
									_SequnceNumber++;
									element.seq = "" + _SequnceNumber;
									element.focus = "none";
									if (this._CurSequnce + 1 === _SequnceNumber) {
										element.focus = "focus";
										secondTable3.setFirstVisibleRow(o);
									}
								} else {
									element.seq = "none";
									element.focus = "none";
								}

							}
							secondTable3.getModel().refresh(true);
						}

					}
					if (curtab.startsWith("columns")) {
						//Columns pane
						var semTable = this._Sequencetabels["sc1"];
						var semElements = semTable.getModel().oData.columns;
						for (var p = 0; p < semElements.length; p++) {
							var element = semElements[p];
							if (((element.name).toUpperCase()).includes(highlightValue.toUpperCase()) && (highlightValue !== "")) {
								_SequnceNumber++;
								element.seq = "" + _SequnceNumber;
								element.focus = "none";
								if (this._CurSequnce + 1 === _SequnceNumber) {
									element.focus = "focus";
									semTable.setFirstVisibleRow(p);
								}
							} else {
								element.seq = "none";
								element.focus = "none";
							}
							if ((element.label !== undefined) && ((element.label).toUpperCase()).includes(highlightValue.toUpperCase()) && (highlightValue !==
								"")) {
								_SequnceNumber++;
								element.seq1 = "" + _SequnceNumber;
								element.focus1 = "none";
								if (this._CurSequnce + 1 === _SequnceNumber) {
									element.focus1 = "focus";
									semTable.setFirstVisibleRow(p);
								}
							} else {
								element.seq1 = "none";
								element.focus1 = "none";
							}
						}
						semTable.getModel().refresh(true);

						var shaTable = this._Sequencetabels["sc2"];
						if (shaTable !== undefined) {
							var shaElements = shaTable.getModel().oData.sharedColumns;
							for (var r = 0; r < shaElements.length; r++) {
								var element = shaElements[r];
								if (((element.name).toUpperCase()).includes(highlightValue.toUpperCase()) && (highlightValue !== "")) {
									_SequnceNumber++;
									element.seq = "" + _SequnceNumber;
									element.focus = "none";
									if (this._CurSequnce + 1 === _SequnceNumber) {
										element.focus = "focus";
										shaTable.setFirstVisibleRow(r);
									}
								} else {
									element.seq = "none";
									element.focus = "none";
								}
								if ((element.label !== undefined) && ((element.label).toUpperCase()).includes(highlightValue.toUpperCase()) && (highlightValue !==
									"")) {
									_SequnceNumber++;
									element.seq1 = "" + _SequnceNumber;
									element.focus1 = "none";
									if (this._CurSequnce + 1 === _SequnceNumber) {
										element.focus1 = "focus";
										shaTable.setFirstVisibleRow(r);
									}
								} else {
									element.seq1 = "none";
									element.focus1 = "none";
								}
							}
							shaTable.getModel().refresh(true);

						}

					}
					if (curtab.startsWith("details")) {
						//Columns pane
						var detTable = this._Sequencetabels["dc"];
						var detElements = detTable.getModel().oData.columns;
						for (var p = 0; p < detElements.length; p++) {
							var element = detElements[p];
							if (((element.name).toUpperCase()).includes(highlightValue.toUpperCase()) && (highlightValue !== "")) {
								_SequnceNumber++;
								element.seq = "" + _SequnceNumber;
								element.focus = "none";
								if (this._CurSequnce + 1 === _SequnceNumber) {
									element.focus = "focus";
									detTable.setFirstVisibleRow(p);
								}
							} else {
								element.seq = "none";
								element.focus = "none";
							}

						}
						detTable.getModel().refresh(true);
					}
					if (curtab.startsWith("Join")) {
						var diagramPane = CalcViewEditorUtil.getCurEditor()._detailsPane._getSelectedContent().diagramPane;
						diagramPane.joinHighlight(highlightValue, this._CurSequnce - this._editorSymbols.length);
					}

				}

			}

		};
		return FindAndHighlight;
	});