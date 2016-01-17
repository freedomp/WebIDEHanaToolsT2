/*global define*/
define(["./SAX"], function(saxParser) {
    "use strict";
    /**
     *
     *
     * Modify SAX.js to get startTagLine:
     * add 'parser.startTagLine = parser.line' & 'parser.startTagColumn = parser.column' to line 963 & 990
     */

    function handleOpen(nodes, xml){
        return function(n){
            //console.log("open tag: " + n.name);
            var node = xml.createElementNS(n.ns[n.prefix] || "", n.name);
            for(var property in n.attributes){
                if(n.attributes.hasOwnProperty(property)){
                    var attribute = n.attributes[property];
                    node.setAttribute(attribute.name, attribute.value);
                }
            }
            node.position = {
                line: {
                    start: this.startTagLine + 1,    // SAX.js starts at line 0
                    end: this.line + 1               // SAX.js starts at line 0
                },
                column: {
                    start: this.startTagColumn - 1, // get pos before tag begin
                    end: this.column + 1            // get pos after tag end
                }
            };
            nodes.push(node);
        };
    }

    function handleClose(nodes, xml){
        return function(){//tagName){
            //console.log("close tag: " + tagName);
            var node = nodes.pop();
            if(node){
                if(nodes.length === 0){
                    xml.appendChild(node);
                }else{
                    nodes[nodes.length - 1].appendChild(node);
                }
            }
        };
    }

    function handleComment(nodes, xml){
        return function(comment){
            //console.log("comment tag: " + comment);
            var node = xml.createComment(comment);
            if(nodes.length === 0){
                xml.appendChild(node);
            }else{
                nodes[nodes.length - 1].appendChild(node);
            }
        };
    }

    return {
        parseXML: function (source){
            var strict = true,
                nodes = [],
                /* eslint-disable no-undef*/
                xml = document.implementation.createDocument("", "", null),
                /* eslint-enable no-undef*/
                parser = saxParser.parser(strict, {xmlns: true, position: true});

            parser.oncomment = handleComment(nodes, xml);
            parser.onopentag = handleOpen(nodes, xml);
            parser.onclosetag = handleClose(nodes, xml);
            parser.write(source);
            return xml;
        }
    };
});
