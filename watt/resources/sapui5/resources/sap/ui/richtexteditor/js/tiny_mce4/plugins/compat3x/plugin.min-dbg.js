!function(a){function b(){}function c(a){!f&&window&&window.console&&(f=!0,console.log("Deprecated TinyMCE API call: "+a))}function d(a,d,e,f){return a=a||this,d?(this.add=function(b,g,h){function i(c){var h=[];if("string"==typeof e&&(e=e.split(" ")),e&&"function"!=typeof e)for(var i=0;i<e.length;i++)h.push(c[e[i]]);("function"!=typeof e||(h=e(d,c,a)))&&(e||(h=[c]),h.unshift(f||a),b.apply(g||f||a,h)===!1&&c.stopImmediatePropagation())}return c("<target>.on"+d+".add(..)"),a.on(d,i,h),i},this.addToTop=function(a,b){this.add(a,b,!0)},this.remove=function(b){return a.off(d,b)},void(this.dispatch=function(){return a.fire(d),!0})):void(this.add=this.addToTop=this.remove=this.dispatch=b)}function e(e){function f(b,c){a.each(b.split(" "),function(a){e["on"+a]=new d(e,a,c)})}function g(a,b,c){return[b.level,c]}function h(a){return function(b,c){return!c.selection&&!a||c.selection==a?[c]:void 0}}function i(){function b(){return i()}var d={},e="add addMenu addSeparator collapse createMenu destroy displayColor expand focus getLength hasMenus hideMenu isActive isCollapsed isDisabled isRendered isSelected mark postRender remove removeAll renderHTML renderMenu renderNode renderTo select selectByIndex setActive setAriaProperty setColor setDisabled setSelected setState showMenu update";return c("editor.controlManager.*"),a.each(e.split(" "),function(a){d[a]=b}),d}if(!e.controlManager){e.controlManager={buttons:{},setDisabled:function(a,b){c("controlManager.setDisabled(..)"),this.buttons[a]&&this.buttons[a].disabled(b)},setActive:function(a,b){c("controlManager.setActive(..)"),this.buttons[a]&&this.buttons[a].active(b)},onAdd:new d,onPostRender:new d,add:function(a){return a},createButton:i,createColorSplitButton:i,createControl:i,createDropMenu:i,createListBox:i,createMenuButton:i,createSeparator:i,createSplitButton:i,createToolbar:i,createToolbarGroup:i,destroy:b,get:b,setControlType:i},f("PreInit BeforeRenderUI PostRender Load Init Remove Activate Deactivate","editor"),f("Click MouseUp MouseDown DblClick KeyDown KeyUp KeyPress ContextMenu Paste Submit Reset"),f("BeforeExecCommand ExecCommand","command ui value args"),f("PreProcess PostProcess LoadContent SaveContent Change"),f("BeforeSetContent BeforeGetContent SetContent GetContent",h(!1)),f("SetProgressState","state time"),f("VisualAid","element hasVisual"),f("Undo Redo",g),f("NodeChange",function(a,b){return[e.controlManager,b.element,e.selection.isCollapsed(),b]});var j=e.addButton;e.addButton=function(b,c){function d(){return e.controlManager.buttons[b]=this,f?f.call(this):void 0}var f;for(var g in c)"onpostrender"===g.toLowerCase()&&(f=c[g],c.onPostRender=d);return f||(c.onPostRender=d),c.title&&(c.title=a.i18n.translate((e.settings.language||"en")+"."+c.title)),j.call(this,b,c)},e.on("init",function(){var a=e.undoManager,b=e.selection;a.onUndo=new d(e,"Undo",g,null,a),a.onRedo=new d(e,"Redo",g,null,a),a.onBeforeAdd=new d(e,"BeforeAddUndo",null,a),a.onAdd=new d(e,"AddUndo",null,a),b.onBeforeGetContent=new d(e,"BeforeGetContent",h(!0),b),b.onGetContent=new d(e,"GetContent",h(!0),b),b.onBeforeSetContent=new d(e,"BeforeSetContent",h(!0),b),b.onSetContent=new d(e,"SetContent",h(!0),b)}),e.on("BeforeRenderUI",function(){var b=e.windowManager;b.onOpen=new d,b.onClose=new d,b.createInstance=function(b,d,e,f,g,h){c("windowManager.createInstance(..)");var i=a.resolve(b);return new i(d,e,f,g,h)}})}}var f;a.util.Dispatcher=d,a.onBeforeUnload=new d(a,"BeforeUnload"),a.onAddEditor=new d(a,"AddEditor","editor"),a.onRemoveEditor=new d(a,"RemoveEditor","editor"),a.util.Cookie={get:b,getHash:b,remove:b,set:b,setHash:b},a.on("SetupEditor",e),a.PluginManager.add("compat3x",e),a.addI18n=function(b,c){var d=a.util.I18n,e=a.each;return"string"==typeof b&&-1===b.indexOf(".")?void d.add(b,c):void(a.is(b,"string")?e(c,function(a,c){d.data[b+"."+c]=a}):e(b,function(a,b){e(a,function(a,c){e(a,function(a,e){"common"===c?d.data[b+"."+e]=a:d.data[b+"."+c+"."+e]=a})})}))}}(tinymce);
