define(
    ["rndrt/rnd"], //dependencies
    function (rnd) {
        var Utils = rnd.Utils;


        function Point(a, b) {
            this.x = a;
            this.y = b;
        }

        Point.prototype.x = 0;
        Point.prototype.y = 0;


        var StringBuffer = rnd.StringBuffer;
        StringBuffer.prototype.getLineOfOffset=function(offset) {
            var str = this.toString();
            var sub = str.substring(0,offset);
            var count=0;
            for (var i=0;i<sub.length;i++){
                if (sub[i]=="\n")
                    count++;
            }
            return count;
        };

        function TestUtilEclipseSelectionHandling() {
        };
        TestUtilEclipseSelectionHandling.MARKER_PREFIX="#selection.";
        TestUtilEclipseSelectionHandling.MARKER_BEGIN="begin.";
        TestUtilEclipseSelectionHandling.MARKER_END="end.";
        TestUtilEclipseSelectionHandling.MARKER_SUFFIX="#";
        TestUtilEclipseSelectionHandling.SELECTION_NAME_PATTERN="[[a-z][A-Z][0-9][_]]++";
        TestUtilEclipseSelectionHandling.extractSelectionsFromContent = function(contentWithSelections,contentWithoutSelections,markedSelections) {
            var correctedContentWithSelections=TestUtilEclipseSelectionHandling.correctLineEndings(contentWithSelections);
            var markerRangesList=TestUtilEclipseSelectionHandling.computeMarkerRangesList(correctedContentWithSelections);
            contentWithoutSelections[0]=TestUtilEclipseSelectionHandling.computeContentWithoutSelections(correctedContentWithSelections,markerRangesList);
            var documentWithoutSelections=new StringBuffer(contentWithoutSelections[0]);
            TestUtilEclipseSelectionHandling.computeMarkedSelections(correctedContentWithSelections,documentWithoutSelections,markerRangesList,markedSelections);
        };
        TestUtilEclipseSelectionHandling.CR="\r";
        TestUtilEclipseSelectionHandling.LF="\n";
        TestUtilEclipseSelectionHandling.CR_LF=TestUtilEclipseSelectionHandling.CR + TestUtilEclipseSelectionHandling.LF;
        TestUtilEclipseSelectionHandling.correctLineEndings = function(contentWithSelections) {
            var correctedContent;
            if (TestUtilEclipseSelectionHandling.isWindows() && !Utils.stringContains(contentWithSelections, TestUtilEclipseSelectionHandling.CR_LF)) {
                correctedContent=Utils.stringReplaceAll(contentWithSelections, TestUtilEclipseSelectionHandling.LF,TestUtilEclipseSelectionHandling.CR_LF);
            }else{
                correctedContent=Utils.stringReplaceAll(contentWithSelections, TestUtilEclipseSelectionHandling.CR_LF,TestUtilEclipseSelectionHandling.LF);
            }
            return correctedContent;
        };
        TestUtilEclipseSelectionHandling.isWindows = function() {
            return true;
        };
        TestUtilEclipseSelectionHandling.getUriFragmentForSelection = function(document,textSelection) {
            var startLine=textSelection.getStartLine() + 1;
            var endLine=startLine;
            var startLineOffset=textSelection.getOffset() - document.getLineOffset(startLine - 1);
            var endLineOffset=startLineOffset + textSelection.getText().length;
            var fragment=TestUtilEclipseSelectionHandling.createFragment(startLine,endLine,startLineOffset,endLineOffset);
            return fragment;
        };

        function StubTextSelection(_text, _startLine, _endLine, _offset) {
            this.text = _text;
            this.startLine = _startLine;
            this.endLine = _endLine;
            this.offset = _offset;
        }
        StubTextSelection.prototype.text="";
        StubTextSelection.prototype.startLine=0;
        StubTextSelection.prototype.endLine=0;
        StubTextSelection.prototype.offset=0;
        StubTextSelection.prototype.getStartLine=function() {
            return this.startLine;
        };
        StubTextSelection.prototype.getEndLine=function() {
            return this.endLine;
        };
        StubTextSelection.prototype.getOffset=function() {
            return this.offset;
        };
        StubTextSelection.prototype.getText=function() {
            return this.text;
        };
        TestUtilEclipseSelectionHandling.computeMarkerRangesList = function(contentWithSelections) {
            var markerRanges=[];
            var fromIndex=0;
            while (fromIndex < contentWithSelections.length) {
                var markerStartOffset=contentWithSelections.indexOf(TestUtilEclipseSelectionHandling.MARKER_PREFIX,fromIndex);
                if (markerStartOffset == -1) {
                    break;
                }
                fromIndex=markerStartOffset + TestUtilEclipseSelectionHandling.MARKER_PREFIX.length;
                var markerEndOffset=contentWithSelections.indexOf(TestUtilEclipseSelectionHandling.MARKER_SUFFIX,fromIndex) + 1;
                if (markerStartOffset == -1) {
                    throw new IllegalArgumentException();
                }
                fromIndex=markerEndOffset;
                var markerRange=new Point(markerStartOffset,markerEndOffset);
                markerRanges.push(markerRange);
            }
            return markerRanges;
        };
        TestUtilEclipseSelectionHandling.computeContentWithoutSelections = function(contentWithSelections,markerRangesList) {
            var buf=new StringBuffer(contentWithSelections);
            var sumOfMarkersLength=0;
            for (var markerRangeCount=0;markerRangeCount<markerRangesList.length;markerRangeCount++) {
                var markerRange=markerRangesList[markerRangeCount];
                var startOffset=markerRange.x - sumOfMarkersLength;
                var endOffset=markerRange.y - sumOfMarkersLength;
                var markerLength=endOffset - startOffset;
                buf.replace(startOffset,endOffset,"");
                sumOfMarkersLength+=markerLength;
            }
            var contentWithoutSelections=buf.toString();
            return contentWithoutSelections;
        };
        TestUtilEclipseSelectionHandling.computeMarkedSelections = function(contentWithSelections,documentWithoutSelections,markerRangesList,markedSelections) {
            var stubTextSelection=null;
            var selectionName=null;
            var sumOfMarkersLength=0;
            for (var markerRangeCount=0;markerRangeCount<markerRangesList.length;markerRangeCount++) {
                var markerRange=markerRangesList[markerRangeCount];
                var markerLength=markerRange.y - markerRange.x;
                var markerPrefixEndIndex=markerRange.x + TestUtilEclipseSelectionHandling.MARKER_PREFIX.length;
                if (Utils.stringStartsWith(contentWithSelections, TestUtilEclipseSelectionHandling.MARKER_BEGIN,markerPrefixEndIndex)) {
                    sumOfMarkersLength+=markerLength;
                    var startOffset=markerRange.y - sumOfMarkersLength;
                    var startLine=documentWithoutSelections.getLineOfOffset(startOffset);
                    stubTextSelection=new StubTextSelection(null,startLine,null,startOffset);
                    selectionName=contentWithSelections.substring(markerPrefixEndIndex + TestUtilEclipseSelectionHandling.MARKER_BEGIN.length,markerRange.y - TestUtilEclipseSelectionHandling.MARKER_SUFFIX.length);
                    TestUtilEclipseSelectionHandling.checkSelectionName(selectionName);
                    markedSelections[selectionName]=stubTextSelection;
                }else if (Utils.stringStartsWith(contentWithSelections, TestUtilEclipseSelectionHandling.MARKER_END,markerPrefixEndIndex)) {
                    selectionName=contentWithSelections.substring(markerPrefixEndIndex + TestUtilEclipseSelectionHandling.MARKER_END.length,markerRange.y - TestUtilEclipseSelectionHandling.MARKER_SUFFIX.length);
                    var selection=TestUtilEclipseSelectionHandling.getAndCheckSelection(selectionName,markedSelections);
                    var endOffset=markerRange.x - sumOfMarkersLength;
                    sumOfMarkersLength+=markerLength;
                    selection.endLine=documentWithoutSelections.getLineOfOffset(endOffset);
                    selection.text=documentWithoutSelections.substringLength(selection.offset,endOffset - selection.offset);
                }else{
                    sumOfMarkersLength+=markerLength;
                    var startOffset=markerRange.y - sumOfMarkersLength;
                    var startLine=documentWithoutSelections.getLineOfOffset(startOffset);
                    var endLine=startLine;
                    var text="";
                    stubTextSelection=new StubTextSelection(text,startLine,endLine,startOffset);
                    selectionName=contentWithSelections.substring(markerPrefixEndIndex,markerRange.y - TestUtilEclipseSelectionHandling.MARKER_SUFFIX.length);
                    TestUtilEclipseSelectionHandling.checkSelectionName(selectionName);
                    markedSelections[selectionName]=stubTextSelection;
                }
            }
            TestUtilEclipseSelectionHandling.checkSelectionRanges(markedSelections);
        };
        TestUtilEclipseSelectionHandling.getAndCheckSelection = function(selectionName,markedSelections) {
            var selection=markedSelections[selectionName];
            if (selection == null) {
                throw new IllegalArgumentException();
            }
            return selection;
        };
        TestUtilEclipseSelectionHandling.checkSelectionName = function(selectionName) {
            //if (!(selectionName.matches(TestUtilEclipseSelectionHandling.SELECTION_NAME_PATTERN))) {
            //    throw new IllegalArgumentException();
            //}
        };
        TestUtilEclipseSelectionHandling.checkSelectionRanges = function(markedSelections) {
            var keys = Object.keys(markedSelections);
            for (var entryCount=0;entryCount<keys.length;entryCount++) {
                var entry=markedSelections[keys[entryCount]];
                var textSelection=entry;
                if (textSelection.getStartLine() > textSelection.getEndLine()) {
                    var msg=null;
                    if (textSelection.getEndLine() == 0) {
                        msg="";
                    }else{
                        msg="";
                    }
                    throw new IllegalArgumentException(msg);
                }
            }
        };
        TestUtilEclipseSelectionHandling.END=";end=";
        TestUtilEclipseSelectionHandling.START="start=";
        TestUtilEclipseSelectionHandling.LINE_OFFSET_SEPARATOR=',';
        TestUtilEclipseSelectionHandling.createFragment = function(startLine,endLine,startLineOffset,endLineOffset) {
            var sb=new StringBuilder();
            sb.append(TestUtilEclipseSelectionHandling.START);
            sb.append(startLine);
            if (startLineOffset >= 0) {
                sb.append(TestUtilEclipseSelectionHandling.LINE_OFFSET_SEPARATOR);
                sb.append(startLineOffset);
            }
            if (endLine > 0) {
                sb.append(TestUtilEclipseSelectionHandling.END);
                sb.append(endLine);
                if (endLineOffset >= 0) {
                    sb.append(TestUtilEclipseSelectionHandling.LINE_OFFSET_SEPARATOR);
                    sb.append(endLineOffset);
                }
            }
            return sb.toString();
        };
        return TestUtilEclipseSelectionHandling;
    }
);