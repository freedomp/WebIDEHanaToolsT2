define(["../codecompletion/XMLVisitor"], function(parser) {

    var oFormatXML = function FormatXML(){
        this.xmlVisitor = new parser();
    };

    oFormatXML.prototype.format = function(sContent, oSettings){
        if(!sContent || !oSettings){
            throw "Please set content and settings to FormatXML";
        }
        this.indentation = oSettings.indentation;
        this.lineWrapping = oSettings.lineWrapping;
        var oAST = this.xmlVisitor.getParser().parse(sContent, sContent.length - 1);
        if(oAST && oAST.root)
        {
            var formattedContent = this._formatContent(oAST.root.childNodes, 0).join('');
            return formattedContent;
        }
        return '';
    };

    oFormatXML.prototype._formatContent = function(oNodes, iIndentLevel) {
        var aFormattedContent = [];
        var iNumberOfIndentations = this.indentation;
        var iCurrentLineIndentation = iNumberOfIndentations * iIndentLevel;
        var aTempIndent = [];
        var sTempIndent;
        if(oNodes)
        {
            for (var j = 0; j < iCurrentLineIndentation; j++) {
                aTempIndent.push("\t");
            }
            sTempIndent = aTempIndent.join('');
            for (var i = 0; i < oNodes.length; i++) {

                var oNode = oNodes[i];

                if(oNode.nodeType === 1)
                {
                    if(iIndentLevel !== 0){
                        aFormattedContent.push("\n");
                    }
                    aFormattedContent.push(sTempIndent);
                    aFormattedContent.push("<");
                    aFormattedContent.push(oNode.nodeName);
                }

                if(oNode.nodeType === 3 && oNode.nodeValue !== "" && oNode.nodeValue !== " ")
                {
                    aFormattedContent.push("\n");
                    aFormattedContent.push(sTempIndent);
                    aFormattedContent.push(oNode.nodeValue);
                }

                if(oNode.nodeType === 8)
                {
                    aFormattedContent.push("<!-- ");
                    aFormattedContent.push(oNode.nodeValue);
                    aFormattedContent.push(" -->");
                    if(iIndentLevel === 0){ //comment before the content
                        aFormattedContent.push("\n");
                    }
                }

                if(oNode.attributes)
                {
                    aFormattedContent.push(this._createFormattedAttributes("<"+oNode.nodeName, oNode.attributes, (iIndentLevel + 1)*iNumberOfIndentations));
                    aFormattedContent.push(">");
                }

                var iNextIndent = iIndentLevel + 1;
                var aContent = this._formatContent(oNode.childNodes,  iNextIndent);

                if(oNode.nodeType === 1)
                {
                    aContent.push("\n");
                    aContent.push(sTempIndent);
                    aContent.push("</"+oNode.nodeName+">");
                }
                aFormattedContent.push(aContent.join(''));
            }
        }

        return aFormattedContent;
    };


    oFormatXML.prototype._createFormattedAttributes = function(sStartNode, aAttributes, iCurrentLineIndentation){
        var sCurrentAttributeLine = '';
        var aFormattedAttributes = [];
        var aIndent = [];
        var sAttributeLine;
        var sPreviousAttributeLine = '';
        var sIndent = '';

        for (var j = 0; j < iCurrentLineIndentation; j++) {
            aIndent.push("\t");
        }

        for(var i = 0; i < aAttributes.length; i++){
            var attribute = aAttributes[i];
            sCurrentAttributeLine = sCurrentAttributeLine + attribute.nodeName + "=" + "\"" + attribute.nodeValue + "\"";
            sAttributeLine = aIndent.join("") + sCurrentAttributeLine;

            if(sPreviousAttributeLine.length + sCurrentAttributeLine.length + 1 >= this.lineWrapping) // The +1 is for space character. When checking the wrapping we need to take in consideration space but without adding it to the string.
            {
                if (i === 0) { //For the first attribute: explicitly add EOL
                    aFormattedAttributes.push("\n");
                }
                sPreviousAttributeLine = sCurrentAttributeLine;
                aFormattedAttributes.push(aIndent.join(''));
                if (i === aAttributes.length - 1) { //For the Last attribute: no need to add EOL
                    sCurrentAttributeLine = sCurrentAttributeLine;
                }
                else {
                    sCurrentAttributeLine = sCurrentAttributeLine + "\n";
                }
                aFormattedAttributes.push(sCurrentAttributeLine);
                sCurrentAttributeLine = '';
            }
            else {
                sCurrentAttributeLine = sCurrentAttributeLine + ' ';// If the attributes has not passed the wrapping limit add the space.
            }
        }
        return aFormattedAttributes.join('');
    };

    return oFormatXML;
});

