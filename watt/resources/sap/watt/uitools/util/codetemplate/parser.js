var nodeTypes = { 
	ELEMENT:1, 
	ATTRIBUTE:2, 
	TEXT:3, 
	CDATA:4, 
	PROCESSING_INSTRUCTION:7, 
	COMMENT:8, 
	DOCUMENT:9 
};

exports.parseData = function(xmlcontent) {
  	//console.log("start parse xml content");
	var retdata = {xmlkeywords: [], xmltemplates: [], jskeywords: [], jstemplates: []};
	
	var root = createDocNode();
	if (xmlcontent && xmlcontent.length>0){ 
		//preparse for CData
		var preData = preParse(xmlcontent);
		var content = preData.str;

		//parse the content				
		var parsedIndex = -1;
		if (parsedIndex == -1) {
			var pos = content.indexOf("<");
			parsedIndex = pos-1;
			var text = pos>-1?content.substring(0, content.indexOf("<")):content;
			root.childNodes.push(createTextNode(text));
		}
		
		//parse complete tags				
		var regRes;
		var curObj=root;
		var regTags = new RegExp("<([^>\\/\\s+]*)([^>]*)>([^<]*)", "g");
		var regTrim = new RegExp("^\\s+|\\s+$", "g");
		while((regRes=regTags.exec(content))!=null){
			var data;
			data = parseTag(content, regRes, root, curObj, preData, retdata);
			curObj = data.curObj;
		}
		
	}
	
	return retdata;
};

function createDocNode() {
	return {
		nodeType: nodeTypes.DOCUMENT,
		nodeName: "#document",
		childNodes: []
	};
}
		
function createTextNode(v){
	return {
		nodeType: nodeTypes.TEXT,
		nodeName: "#text",
		nodeValue: v
	};
}


function preParse(str) {
	var preData = {str: ""};
	preData.str = str.slice(0);
	
	//preparse for CDATA
	var reg=/<!\[CDATA\[([\u0001-\uFFFF]*?)\]\]>/g;
	var cdataList=[], acdata;
	while((acdata=reg.exec(preData.str))!=null){ 
		var sOffset = acdata.index;
		cdataList.push({str:acdata[0].slice(9, -3), offset:sOffset});
	}
	
	
	for(i=cdataList.length-1; i>=0; i--){ 
		preData.str=preData.str.slice(0, cdataList[i].offset) + "<![CDATA["+i+"]]>" + preData.str.slice(cdataList[i].offset + cdataList[i].str.length + 12);
	}
	
	preData.cdataList = cdataList;
	
	return preData;
}

function parseTag(content, regRes, root, curObj, preData, retdata) {
	var regTrim = new RegExp("^\\s+|\\s+$", "g");
	var reAttr = new RegExp("([^=]*)=((\"([^\"]*)\")|('([^']*)'))", "g");
	
	//	closing tag
	if (regRes[2].charAt(0)=="/" && regRes[2].replace(regTrim, "").length>0) {
		if(curObj.parentNode){
			curObj=curObj.parentNode;
		}
	}
	//	open tag
	else if(regRes[1].length>=0){
		if (regRes[1].length==0 || regRes[1].charAt(0)=="?") {
			//code for some scenarios
			var tagObj = regRes;
		}
		else if(regRes[1].charAt(0)=="!"){
			if(regRes[1].indexOf("![CDATA[")==0){
				var val=null;
				if (regRes[1].slice(-2) == "]]") {
					val=regRes[1].slice(8, -2);
				} else {
					val=regRes[1].slice(8);
				}
				if (val.length>0) {
					var valObj = preData.cdataList[parseInt(val, 10)];
					curObj.childNodes.push({
						nodeType: nodeTypes.CDATA,
						nodeName: "#cdata",
						nodeValue: valObj.str
					});
					
					if (curObj && curObj.parentNode && curObj.parentNode.nodeName == "Template") {
						var t = {
							name:curObj.parentNode.tName,
							prefix:curObj.parentNode.tAlias,
							description:curObj.parentNode.tName,
							template:valObj.str
						};
						if (curObj.nodeName == "xmlTemplate") {
							retdata.xmlkeywords.push(t.name);
							retdata.xmltemplates.push(t);
							//console.log("  => add xml node: " + t);
						} else if (curObj.nodeName == "jsTemplate") {
							var desc = t.description;
							var pos = desc.lastIndexOf('.');
							if (pos > 0) {
								var className = desc.substring(pos + 1);
								var parentName = desc.substring(0, pos);
								t.description = className + " in " + parentName;
							}
							
							retdata.jskeywords.push(t.name);
							retdata.jstemplates.push(t);
							//console.log("  => add js node: " + t);
						}
					}
				}
			}
		}
		else {								
			//	create Element 
			var name=regRes[1].replace(regTrim,"");
			var o={
				nodeType:nodeTypes.ELEMENT,
				nodeName:name,
				localName:name,
				namespace:"",
				attributes:[],
				parentNode:null,
				childNodes:[]
			};
			
			var tp = null;
			//	check if it's namespace.
			if(name.indexOf(":")>-1){
				tp=name.split(":");
				o.namespace=tp[0];
				o.localName=tp[1];
			}

			//	parse the attribute
			var attr;
			var aname;
			var aval;
			while((attr=reAttr.exec(regRes[2]))!=null){
				if(attr.length>0){
					aname=attr[1].replace(regTrim,"");
					aval=(attr[4]||attr[6]||"");
					if(aname.indexOf("xmlns")==0){
						//attribute is for xml namespace
						var attrObj = attr;
					} else {
						var ln=aname;
						var ns="";
						if(aname.indexOf(":")>0){
							tp=aname.split(":");
							ln=tp[1];
							ns=tp[0];
						}
						o.attributes.push({
							nodeType:nodeTypes.ATTRIBUTE,
							nodeName:aname,
							localName:ln,
							namespace:ns,
							nodeValue:aval
						});
						if (o.nodeName == "Template") {
							if (aname == "name") {
								o.tName = aval;
							}
							if (aname == "alias") {
								o.tAlias = aval;
							}
						}

					}
				}
			}
			
			if(curObj){
				curObj.childNodes.push(o);
				o.parentNode=curObj;
				//	when not self-closing.
				if(regRes[2].charAt(regRes[2].length-1)!="/"){
					curObj=o;
				}
			}
				
		}
	}
	var text=regRes[3];
	if(regRes[3]!=null){
		curObj.childNodes.push(createTextNode(text));
	}
	
	return {curObj:curObj};
}




