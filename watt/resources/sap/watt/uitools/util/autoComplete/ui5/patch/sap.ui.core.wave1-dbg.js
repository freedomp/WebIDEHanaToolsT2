/**
 * Defines a controller class or creates an instance of an already defined controller class.
 *
 * When a name and a controller implementation object is given, a new controller class
 * of the given name is created. The members of the implementation object will be copied
 * into each new instance of that controller class (shallow copy).
 * <b>Note</b>: as the members are shallow copied, controller instances will share all object values.
 * This might or might not be what applications expect.
 *
 * If only a name is given, a new instance of the named Controller class is returned.
 *
 * @param {string} sName The Controller name
 * @param {object} [oControllerImpl] An object literal defining the methods and properties of the Controller
 * @return {void | sap.ui.core.mvc.Controller} void or the new controller instance, depending on the use case
 * @public
 * @function
 * @name sap.ui.controller
 */

/**
 * Retrieve the {@link sap.ui.core.Core SAPUI5 Core} instance for the current window.
 * @return {sap.ui.core.Core} the API of the current SAPUI5 Core instance.
 * @public
 * @function
 * @name sap.ui.getCore
 */ 

/**
 * Returns the event bus.
 * @return {sap.ui.core.EventBus} the event bus
 * @since 1.8.0
 * @function
 * @public
 * @name sap.ui.core.Core.prototype.getEventBus
 */

/**
 * Adds an event registration for the given object and given event name.
 * 
 * The channel "sap.ui" is reserved by th UI5 framework. An application might listen to events on this channel but is not allowed to publish own events there.
 *
 * @param {string}
 *            [sChannelId] The channel of the event to subscribe for. If not given the default channel is used.
 * @param {string}
 *            sEventId The identifier of the event to subscribe for
 * @param {function}
 *            fnFunction The function to call, when the event occurs. This function will be called on the
 *            oListener-instance (if present) or on the event bus-instance. This functions might have the following parameters: sChannelId, sEventId, oData.
 * @param {object}
 *            [oListener] The object, that wants to be notified, when the event occurs
 * @return {sap.ui.core.EventBus} Returns <code>this</code> to allow method chaining
 * @public
 * @function
 * @name sap.ui.core.EventBus.prototype.subscribe
 */

/**
 * Removes an event registration for the given object and given event name.
 *
 * The passed parameters must match those used for registration with {@link #subscribe } beforehand!
 *
 * @param {string}
 *            [sChannelId] The channel of the event to unsubscribe from. If not given the default channel is used.
 * @param {string}
 *            sEventId The identifier of the event to unsubscribe from
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            [oListener] The object, that wants to be notified, when the event occurs
 * @return {sap.ui.core.EventBus} Returns <code>this</code> to allow method chaining
 * @public
 * @function
 * @name sap.ui.core.EventBus.prototype.unsubscribe
 */

/**
 * Fires the given event and notifies all listeners. Listeners must not change the content of the event.
 * 
 * The channel "sap.ui" is reserved by the UI5 framework. An application might listen to events 
 * on this channel but is not allowed to publish own events there.
 *
 * @param {string}
 *            [sChannelId] The channel of the event; if not given the default channel is used
 * @param {string}
 *            sEventId The identifier of the event
 * @param {object}
 * 			  [oData] the parameter map
 * @public
 * @function
 * @name sap.ui.core.EventBus.prototype.publish
 */

/**
 * Declares a module as existing.
 *
 * By default, this function assumes that the module will create a JavaScript object
 * with the same name as the module. As a convenience it ensures that the parent
 * namespace for that object exists (by calling jQuery.sap.getObject).
 * If such an object creation is not desired, <code>bCreateNamespace</code> must be set to false.
 *
 * @param {string | object} sModuleName name of the module to be declared
 *                           or in case of an object {modName: "...", type: "..."}
 *                           where modName is the name of the module and the type
 *                           could be a specific dot separated extension e.g.
 *                           <code>{modName: "sap.ui.core.Dev", type: "view"}</code>
 *                           loads <code>sap/ui/core/Dev.view.js</code> and
 *                           registers as <code>sap.ui.core.Dev.view</code>
 * @param {boolean} [bCreateNamespace=true] whether to create the parent namespace
 *
 * @public
 * @static
 * @function
 * @name jQuery.sap.declare
 */

/**
 * Ensures that the given module is loaded and executed before execution of the
 * current script continues.
 *
 * By issuing a call to this method, the caller declares a dependency to the listed modules.
 *
 * Any required and not yet loaded script will be loaded and execute synchronously.
 * Already loaded modules will be skipped.
 *
 * @param {string | string[] | object} sModuleName one or more names of modules to be loaded
 *                              or in case of an object {modName: "...", type: "..."}
 *                              where modName is the name of the module and the type
 *                              could be a specific dot separated extension e.g.
 *                              <code>{modName: "sap.ui.core.Dev", type: "view"}</code>
 *                              loads <code>sap/ui/core/Dev.view.js</code> and
 *                              registers as <code>sap.ui.core.Dev.view</code>
 *
 * @public
 * @static
 * @function
 * @SecSink {0|PATH} Parameter is used for future HTTP requests
 * @name jQuery.sap.require
 */

/**
 * Creates and displays a simple message toast notification message with the given text, and optionally other options.
 *
 * The only mandatory parameter is <code>sMessage</code>.
 *
 * @param {string} sMessage The message to be displayed.
 * @param {object} [mOptions] Optionally other options.
 * @param {int} [mOptions.duration=3000] Time in milliseconds before the close animation starts. Needs to be a finite positive nonzero integer.
 * @param {sap.ui.core.CSSSize} [mOptions.width='15em'] The width of the message toast, this value can be provided in %, em, px and all possible CSS measures.
 * @param {sap.ui.core.Popup.Dock} [mOptions.my='center_bottom'] Specifies which point of the message toast should be aligned.
 * @param {sap.ui.core.Popup.Dock} [mOptions.at='center_bottom'] Specifies the point of the reference element to which the message toast should be aligned.
 * @param {sap.ui.core.Control|Element|jQuery|Window|undefined} [mOptions.of=window] Specifies the reference element to which the message toast should be aligned, by default it is aligned to the browser visual viewport.
 * @param {string} [mOptions.offset='0_0'] The offset relative to the docking point, specified as a string with space-separated pixel values (e.g. "0 10" to move the message toast 10 pixels to the right).
 * @param {string} [mOptions.collision='fit_fit'] Specifies how the position of the message toast should be adjusted in case it overflows the screen in some direction. Possible values “fit”, “flip”, “none”, or a pair for horizontal and vertical e.g. "fit flip”, "fit none".
 * @param {function} [mOptions.onClose=null] Function to be called when the message toast closes.
 * @param {boolean} [mOptions.autoClose=true] Specify whether the message toast should close as soon as the end user touches the screen.
 * @param {string} [mOptions.animationTimingFunction='ease'] Describes how the close animation will progress. Possible values "ease", "linear", "ease-in", "ease-out", "ease-in-out". This feature is not supported in android and ie9 browsers.
 * @param {int} [mOptions.animationDuration=1000] Time in milliseconds that the close animation takes to complete. Needs to be a finite positive integer. For not animation set to 0. This feature is not supported in android and ie9 browsers.
 *
 * @type void
 * @public
 * @name sap.m.MessageToast.show
 * @function
 */
 
/**
 * @class Defines the accessible roles for ARIA support. This enumeration is used with the AccessibleRole control property.
 * For more information, goto "Roles for Accessible Rich Internet Applications (WAI-ARIA Roles)" at the www.w3.org homepage.
 * 
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.ui.core.AccessibleRole
 */
sap.ui.core.AccessibleRole = {
  
    /**
     * No explicit role is applicable. An AccessibleName should be specified for the control.
     *  
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.None
     */
    None : "None",

    /**
     * A message with an alert or error information.
     *  
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Alert
     */
    Alert : "Alert",

    /**
     * A separate window with an alert or error information.
     *  
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.AlertDialog
     */
    AlertDialog : "AlertDialog",

    /**
     * A software unit executing a set of tasks for the user. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Application
     */
    Application : "Application",

    /**
     * Usually defined as the advertisement at the top of a web page.
     * The banner content typically contains the site or company logo, or other key advertisements.
     *  
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Banner
     */
    Banner : "Banner",

    /**
     * Allows user-triggered actions.
     *  
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Button
     */
    Button : "Button",

    /**
     * A control that has three possible values: true, false, mixed. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Checkbox
     */
    Checkbox : "Checkbox",

    /**
     * A table cell containing header information for a column. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.ColumnHeader
     */
    ColumnHeader : "ColumnHeader",

    /**
     * Allows selecting an item from a list, or to enter data directly in the input field. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Combobox
     */
    Combobox : "Combobox",

    /**
     * Information about the content on the page. Examples are footnotes, copyrights, or links to privacy statements.
     *  
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.ContentInfo
     */
    ContentInfo : "ContentInfo",

    /**
     * The content of the associated element represents a definition.
     * If there is a definition element within the content, this one represents the term being defined.
     *  
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Definition
     */
    Definition : "Definition",

    /**
     * Descriptive content for a page element. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Description
     */
    Description : "Description",

    /**
     * A small window that is designed to interrupt the current application processing
     * in order to inform the user and to get some response. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Dialog
     */
    Dialog : "Dialog",

    /**
     * A list of references to members of a single group.
     *  
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Directory
     */
    Directory : "Directory",

    /**
     * Content that contains related information, such as a book. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Document
     */
    Document : "Document",

    /**
     * Contains cells of tabular data arranged in rows and columns, for example in a table. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Grid
     */
    Grid : "Grid",

    /**
     * A table cell in a grid where the cells can be active, editable, and selectable.
     * Cells may have functional relationships to controls, for example. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.GridCell
     */
    GridCell : "GridCell",

    /**
     * A section of user interface objects. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Group
     */
    Group : "Group",

    /**
     * A heading for a section of the page. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Heading
     */
    Heading : "Heading",

    /**
     * A container for a collection of elements that form an image. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Img
     */
    Img : "Img",

    /**
     * An interactive reference to a resource. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Link
     */
    Link : "Link",

    /**
     * A container for non-interactive list items which are the children of the list. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.List
     */
    List : "List",

    /**
     * A widget that allows the user to select one or more items from a list.
     * The items within the list are static and can contain images. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Listbox
     */
    Listbox : "Listbox",

    /**
     * A single item in a list. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.ListItem
     */
    ListItem : "ListItem",

    /**
     * An area where new information is added, or old information disappears.
     * Information types are chat logs, messaging, or error logs, for example.
     * The log contains a sequence: New information is always added to the end of the log. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Log
     */
    Log : "Log",

    /**
     * Defines the main content of a document.
     *  
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Main
     */
    Main : "Main",

    /**
     * Is used to scroll text across the page.
     *  
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Marquee
     */
    Marquee : "Marquee",

    /**
     * Offers a list of choices to the user.
     *  
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Menu
     */
    Menu : "Menu",

    /**
     * A container for menu items where each item may activate a submenu.
     *  
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Menubar
     */
    Menubar : "Menubar",

    /**
     * A child in a menu. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.MenuItem
     */
    MenuItem : "MenuItem",

    /**
     * A checkable menu item (tri-state). 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.MenuItemCheckbox
     */
    MenuItemCheckbox : "MenuItemCheckbox",

    /**
     * A menu item which is part of a group of menuitemradio roles. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.MenuItemRadio
     */
    MenuItemRadio : "MenuItemRadio",

    /**
     * A collection of links suitable for use when navigating the document or related documents. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Navigation
     */
    Navigation : "Navigation",

    /**
     * The content is parenthetic or ancillary to the main content of the resource. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Note
     */
    Note : "Note",

    /**
     * A selectable item in a list represented by a select.
     *  
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Option
     */
    Option : "Option",

    /**
     * An element whose role is presentational does not need to be mapped to the accessibility API. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Presentation
     */
    Presentation : "Presentation",

    /**
     * Shows the execution progress in applications providing functions that take a long time. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.ProgressBar
     */
    ProgressBar : "ProgressBar",

    /**
     * An option in single-select list. Only one radio control in a radiogroup can be selected at the same time.
     *  
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Radio
     */
    Radio : "Radio",

    /**
     * A group of radio controls. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.RadioGroup
     */
    RadioGroup : "RadioGroup",

    /**
     * A large section on the web page. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Region
     */
    Region : "Region",

    /**
     * A row of table cells. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Row
     */
    Row : "Row",

    /**
     * A table cell containing header information for a row. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.RowHeader
     */
    RowHeader : "RowHeader",

    /**
     * A search section of a web document. In many cases, this is a form used to submit search requests about the site,
     * or a more general Internet wide search service. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Search
     */
    Search : "Search",

    /**
     * A unique section of the document. In the case of a portal, this may include time display, weather forecast,
     * or stock price. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Secondary
     */
    Secondary : "Secondary",

    /**
     * Indicates that the element contains content that is related to the main content of the page. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.SeeAlso
     */
    SeeAlso : "SeeAlso",

    /**
     * A line or bar that separates sections of content. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Separator
     */
    Separator : "Separator",

    /**
     * A user input where the user selects an input in a given range. This form of range expects an analogous keyboard
     * interface. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Slider
     */
    Slider : "Slider",

    /**
     * Allows users to select a value from a list of given entries where exactly one value is displayed at runtime, and
     * the other ones can be displayed by scrolling using the arrow up and arrow down key.
     *  
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.SpinButton
     */
    SpinButton : "SpinButton",

    /**
     * A container for processing advisory information. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Status
     */
    Status : "Status",

    /**
     * A header for a tab panel. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Tab
     */
    Tab : "Tab",

    /**
     * A list of tabs which are references to tab panels.
     *  
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Tablist
     */
    Tablist : "Tablist",

    /**
     * A container for the resources associated with a tab. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Tabpanel
     */
    Tabpanel : "Tabpanel",

    /**
     * Inputs that allow free-form text as their value. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Textbox
     */
    Textbox : "Textbox",

    /**
     * A numerical counter which indicates an amount of elapsed time from a start point,
     * or of the time remaining until a certain end point. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Timer
     */
    Timer : "Timer",

    /**
     * A collection of commonly used functions represented in compact visual form. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Toolbar
     */
    Toolbar : "Toolbar",

    /**
     * A popup that displays a description for an element when the user passes over or rests on that element.
     * Supplement to the normal tooltip processing of the user agent.
     *  
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Tooltip
     */
    Tooltip : "Tooltip",

    /**
     * A form of a list (tree) having groups (subtrees) inside groups (subtrees), where the sub trees can be collapsed and expanded.
     *  
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.Tree
     */
    Tree : "Tree",

    /**
     * A grid whose rows are expandable and collapsable in the same manner as the ones of trees. 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.TreeGrid
     */
    TreeGrid : "TreeGrid",

    /**
     * A tree node 
     * @public
	 * @enum {string} sap.ui.core.AccessibleRole.TreeItem
     */
    TreeItem : "TreeItem"

};

/**
 * @class Configuration options for the colors of a progress bar
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.ui.core.BarColor
 */
sap.ui.core.BarColor = {
  
    /**
     * Color: blue (#b8d0e8) 
     * @public
	 * @enum {string} sap.ui.core.BarColor.NEUTRAL
     */
    NEUTRAL : "NEUTRAL",

    /**
     * Color: green (#b5e7a8) 
     * @public
 	 * @enum {string} sap.ui.core.BarColor.POSITIVE
    */
    POSITIVE : "POSITIVE",

    /**
     * Color: yellow (#faf2b0) 
     * @public
 	 * @enum {string} sap.ui.core.BarColor.CRITICAL
    */
    CRITICAL : "CRITICAL",

    /**
     * Color: red (#ff9a90) 
     * @public
	 * @enum {string} sap.ui.core.BarColor.NEGATIVE
     */
    NEGATIVE : "NEGATIVE"

};

/**
 * @class A string type that represents CSS color values. Allowed values are CSS hex colors like "#666666" or
 * 	"#fff", RGB/HSL values like "rgb(0,0,0)" or "hsla(50%,10%,30%,0.5)" as well as css color
 * 	names like "green" and "darkblue" and values like "inherit" and "transparent".
 * 	The empty string is also allowed and has the same effect as setting no color.
 *
 * @static
 * @public
 * @name sap.ui.core.CSSColor
 */
sap.ui.core.CSSColor = sap.ui.base.DataType.createType('sap.ui.core.CSSColor', {
    isValid : function(vValue) {
      return /^(#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})|rgb\(\s*((1?[0-9]?[0-9]|2([0-4][0-9]|5[0-5]))|([0-9]?[0-9](\.[0-9]+)?|100(\.0+)?)%)\s*(,\s*((1?[0-9]?[0-9]|2([0-4][0-9]|5[0-5]))|([0-9]?[0-9](\.[0-9]+)?|100(\.0+)?)%)\s*){2}\)|rgba\((\s*((1?[0-9]?[0-9]|2([0-4][0-9]|5[0-5]))|([0-9]?[0-9](\.[0-9]+)?|100(\.0+)?)%)\s*,){3}\s*(0(\.[0-9]+)?|1(\.0+)?)\s*\)|hsl\(\s*([0-2]?[0-9]?[0-9]|3([0-5][0-9]|60))\s*(,\s*(([0-9]?[0-9](\.[0-9]+)?|100(\.0+)?)%)\s*){2}\)|hsla\(\s*([0-2]?[0-9]?[0-9]|3([0-5][0-9]|60))\s*,(\s*(([0-9]?[0-9](\.[0-9]+)?|100(\.0+)?)%)\s*,){2}\s*(0(\.[0-9]+)?|1(\.0+)?)\s*\)|aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coralcornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|green|greenyellow|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightsteelblue|lightyellow|lime|limegreen|linen|magenta|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silverskyblue|slateblue|slategray|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen|transparent|inherit|)$/.test(vValue);
    }

  },
  sap.ui.base.DataType.getType('string')
);

/**
 * @class A string type that represents CSS size values. Allowed values are CSS sizes like "1px" or "2em" or "50%", but also the special values "auto" and "inherit". 
 * Note that CSS does not allow all of these values for every CSS property representing a size. E.g. "auto" is not an allowed value for a padding size.
 *
 * @static
 * @public
 * @name sap.ui.core.CSSSize
 */
sap.ui.core.CSSSize = sap.ui.base.DataType.createType('sap.ui.core.CSSSize', {
    isValid : function(vValue) {
      return /^(auto|inherit|[-+]?(0*|([0-9]+|[0-9]*\.[0-9]+)([rR][eE][mM]|[eE][mM]|[eE][xX]|[pP][xX]|[cC][mM]|[mM][mM]|[iI][nN]|[pP][tT]|[pP][cC]|%)))$/.test(vValue);
    }

  },
  sap.ui.base.DataType.getType('string')
);

/**
 * @class This type checks the short hand form of a margin or
 * 		padding definition. E.g. "1px 1px" or up to four values are allowed.
 * 	
 *
 * @static
 * @public
 * @name sap.ui.core.CSSSizeShortHand
 */
sap.ui.core.CSSSizeShortHand = sap.ui.base.DataType.createType('sap.ui.core.CSSSizeShortHand', {
    isValid : function(vValue) {
      return /^(inherit|(auto|[-+]?(0*|(\d+|\d*\.\d+)([eE][mM]|[eE][xX]|[pP][xX]|[cC][mM]|[mM][mM]|[iI][nN]|[pP][tT]|[pP][cC]|%))){1}(\s(auto|[-+]?(0*|(\d+|\d*\.\d+)([eE][mM]|[eE][xX]|[pP][xX]|[cC][mM]|[mM][mM]|[iI][nN]|[pP][tT]|[pP][cC]|%)))){0,3})$/.test(vValue);
    }

  },
  sap.ui.base.DataType.getType('string')
);

/**
 * @class Collision behavior: horizontal/vertical.
 * Defines how the position of an element should be adjusted in case it overflows the window in some direction. For both
 * directions this can be "flip", "fit" or "none". If only one behavior is provided it is applied to both directions.
 * Examples: "flip", "fit none".
 *
 * @static
 * @public
 * @name sap.ui.core.Collision
 */
sap.ui.core.Collision = sap.ui.base.DataType.createType('sap.ui.core.Collision', {
    isValid : function(vValue) {
      return /^((flip|fit|none)( (flip|fit|none))?)$/.test(vValue);
    }

  },
  sap.ui.base.DataType.getType('string')
);

/**
 * @class Font design for texts
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.ui.core.Design
 */
sap.ui.core.Design = {
  
    /**
     * Standard font 
     * @public
	 * @enum {string} sap.ui.core.Design.Standard
     */
    Standard : "Standard",

    /**
     * Mono space font 
     * @public
 	 * @enum {string} sap.ui.core.Design.Monospace
    */
    Monospace : "Monospace"

};
  
/**
 * @class Docking position: horizontal/vertical.
 * Defines a position on the element which is used for aligned positioning of another element (e.g. the left top 
 * corner of a popup is positioned at the left bottom corner of the input field). For the horizontal position possible values 
 * are "begin", "left", "center", "right" and "end", where left/right always are left and right, or begin/end which are 
 * dependent on the text direction. For the vertical position possible values are "top", "center" and "bottom".
 * Examples: "left top", "end bottom", "center center".
 *
 * @static
 * @public
 * @name sap.ui.core.Dock 
 */
sap.ui.core.Dock = sap.ui.base.DataType.createType('sap.ui.core.Dock', {
    isValid : function(vValue) {
      return /^((begin|left|center|right|end) (top|center|bottom))$/.test(vValue);
    }

  },
  sap.ui.base.DataType.getType('string')
);

/**
 * @class Configuration options for horizontal alignments of controls
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.ui.core.HorizontalAlign 
 */
sap.ui.core.HorizontalAlign = {
  
    /**
     * Locale-specific positioning at the beginning of the line 
     * @public
	 * @enum {string} sap.ui.core.HorizontalAlign.Begin
     */
    Begin : "Begin",

    /**
     * Locale-specific positioning at the end of the line 
     * @public
	 * @enum {string} sap.ui.core.HorizontalAlign.End
     */
    End : "End",

    /**
     * Hard option for left alignment 
     * @public
	 * @enum {string} sap.ui.core.HorizontalAlign.Left
     */
    Left : "Left",

    /**
     * Hard option for right alignment 
     * @public
	 * @enum {string} sap.ui.core.HorizontalAlign.Right
     */
    Right : "Right",

    /**
     * Centered alignment of text 
     * @public
	 * @enum {string} sap.ui.core.HorizontalAlign.Center
     */
    Center : "Center"

}; 

/**
 * @class A string type representing an Id or a name.
 *
 * @static
 * @public
 * @name sap.ui.core.ID 
 */
sap.ui.core.ID = sap.ui.base.DataType.createType('sap.ui.core.ID', {
    isValid : function(vValue) {
      return /^([A-Za-z_][-A-Za-z0-9_.:]*)$/.test(vValue);
    }

  },
  sap.ui.base.DataType.getType('string')
);

/**
 * @class Semantic Colors of an icon.
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.ui.core.IconColor 
 */
sap.ui.core.IconColor = {
  
    /**
     * Default color (brand color) 
     * @public
	 * @enum {string} sap.ui.core.IconColor.Default
     */
    Default : "Default",

    /**
     * Positive color 
     * @public
	 * @enum {string} sap.ui.core.IconColor.Positive
     */
    Positive : "Positive",

    /**
     * Negative color 
     * @public
	 * @enum {string} sap.ui.core.IconColor.Negative
     */
    Negative : "Negative",

    /**
     * Critical color 
     * @public
	 * @enum {string} sap.ui.core.IconColor.Critical
     */
    Critical : "Critical",

    /**
     * Neutral color. 
     * @public
	 * @enum {string} sap.ui.core.IconColor.Neutral
     */
    Neutral : "Neutral"

};

/**
 * @class State of the Input Method Editor (IME) for the control. Depending on its value, it allows users to enter and edit for example Chinese characters.
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.ui.core.ImeMode 
 */
sap.ui.core.ImeMode = {
  
    /**
     * The value is automatically computed by the user agent. 
     * @public
	 * @enum {string} sap.ui.core.ImeMode.Auto
     */
    Auto : "Auto",

    /**
     * IME is used for entering characters. 
     * @public
	 * @enum {string} sap.ui.core.ImeMode.Active
     */
    Active : "Active",

    /**
     * IME is not used for entering characters. 
     * @public
	 * @enum {string} sap.ui.core.ImeMode.Inactive
     */
    Inactive : "Inactive",

    /**
     * IME is disabled. 
     * @public
	 * @enum {string} sap.ui.core.ImeMode.Disabled
     */
    Disabled : "Disabled"

};

/**
 * @class Defines the different message types of a message
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.ui.core.MessageType 
 */
sap.ui.core.MessageType = {
  
    /**
     * Message should be just an information 
     * @public
	 * @enum {string} sap.ui.core.MessageType.Information
     */
    Information : "Information",

    /**
     * Message is a warning 
     * @public
	 * @enum {string} sap.ui.core.MessageType.Warning
     */
    Warning : "Warning",

    /**
     * Message is an error 
     * @public
	 * @enum {string} sap.ui.core.MessageType.Error
     */
    Error : "Error",

    /**
     * Message has no specific level 
     * @public
	 * @enum {string} sap.ui.core.MessageType.None
     */
    None : "None",

    /**
     * Message is an success message 
     * @public
	 * @enum {string} sap.ui.core.MessageType.Success
     */
    Success : "Success"

};

/**
 * @class Defines the different possible states of an element that can be open or closed and does not only toggle between these states, but also spends some time in between (e.g. because of an animation).
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.ui.core.OpenState 
 */
sap.ui.core.OpenState = {
  
    /**
     * Open and currently not changing states. 
     * @public
	 * @enum {string} sap.ui.core.OpenState.OPEN
     */
    OPEN : "OPEN",

    /**
     * Closed and currently not changing states. 
     * @public
	 * @enum {string} sap.ui.core.OpenState.CLOSED
     */
    CLOSED : "CLOSED",

    /**
     * Already left the CLOSED state, is not OPEN yet, but in the process of getting OPEN. 
     * @public
	 * @enum {string} sap.ui.core.OpenState.OPENING
     */
    OPENING : "OPENING",

    /**
     * Still open, but in the process of going to the CLOSED state. 
     * @public
	 * @enum {string} sap.ui.core.OpenState.CLOSING
     */
    CLOSING : "CLOSING"

};

/**
 * @class A string type that represents a percentage value.
 *
 * @static
 * @public
 * @name sap.ui.core.Percentage 
 */
sap.ui.core.Percentage = sap.ui.base.DataType.createType('sap.ui.core.Percentage', {
    isValid : function(vValue) {
      return /^([0-9][0-9]*(\.[0-9]+)?%)$/.test(vValue);
    }

  },
  sap.ui.base.DataType.getType('string')
);

/**
 * @class Actions are: Click on track, button, drag of thumb, or mouse wheel click
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.ui.core.ScrollBarAction 
 */
sap.ui.core.ScrollBarAction = {
  
    /**
     * Single step scrolling caused by clicking an arrow button or arrow key. 
     * @public
	 * @enum {string} sap.ui.core.ScrollBarAction.Step
     */
    Step : "Step",

    /**
     * Range scrolling caused by clicking track area or using page up or page down key. 
     * @public
	 * @enum {string} sap.ui.core.ScrollBarAction.Page
     */
    Page : "Page",

    /**
     * Scrolling done by mouse wheel 
     * @public
	 * @enum {string} sap.ui.core.ScrollBarAction.MouseWheel
     */
    MouseWheel : "MouseWheel",

    /**
     * Scrolling done by dragging the scroll bar's paint thumb 
     * @public
	 * @enum {string} sap.ui.core.ScrollBarAction.Drag
     */
    Drag : "Drag"

};

/**
 * @class Defines the possible values for horizontal and vertical scrolling behavior.
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.ui.core.Scrolling 
 */
sap.ui.core.Scrolling = {
  
    /**
     * No scroll bar provided even if the content is larger than the available space. 
     * @public
	 * @enum {string} sap.ui.core.Scrolling.None
     */
    None : "None",

    /**
     * A scroll bar is shown if the content requires more space than the given space (rectangle) provides. 
     * @public
	 * @enum {string} sap.ui.core.Scrolling.Auto
     */
    Auto : "Auto",

    /**
     * A scroll bar is always shown even if the space is large enough for the current content. 
     * @public
	 * @enum {string} sap.ui.core.Scrolling.Scroll
     */
    Scroll : "Scroll",

    /**
     * No scroll bar is shown, and the content stays in the given rectangle. 
     * @public
	 * @enum {string} sap.ui.core.Scrolling.Hidden
     */
    Hidden : "Hidden"

};

/**
 * @class Configuration options for text alignments.
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.ui.core.TextAlign 
 */
sap.ui.core.TextAlign = {
  
    /**
     * Locale-specific positioning at the beginning of the line. 
     * @public
	 * @enum {string} sap.ui.core.TextAlign.Begin
     */
    Begin : "Begin",

    /**
     * Locale-specific positioning at the end of the line. 
     * @public
	 * @enum {string} sap.ui.core.TextAlign.End
     */
    End : "End",

    /**
     * Hard option for left alignment. 
     * @public
	 * @enum {string} sap.ui.core.TextAlign.Left
     */
    Left : "Left",

    /**
     * Hard option for right alignment. 
     * @public
	 * @enum {string} sap.ui.core.TextAlign.Right
     */
    Right : "Right",

    /**
     * Centered text alignment. 
     * @public
	 * @enum {string} sap.ui.core.TextAlign.Center
     */
    Center : "Center"

};

/**
 * @class Configuration options for the direction of texts.
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.ui.core.TextDirection 
 */
sap.ui.core.TextDirection = {
  
    /**
     * Specifies left-to-right text direction. 
     * @public
	 * @enum {string} sap.ui.core.TextDirection.LTR
     */
    LTR : "LTR",

    /**
     * Specifies right-to-left text direction. 
     * @public
	 * @enum {string} sap.ui.core.TextDirection.RTL
     */
    RTL : "RTL",

    /**
     * Inherits the direction from its parent control/container. 
     * @public
	 * @enum {string} sap.ui.core.TextDirection.Inherit
     */
    Inherit : "Inherit"

};

/**
 * @class Level of a title.
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @since 1.9.1
 * @name sap.ui.core.TitleLevel 
 */
sap.ui.core.TitleLevel = {
  
    /**
     * The level of the title is choosen by the control rendering the title. 
     * @public
	 * @enum {string} sap.ui.core.TitleLevel.Auto
     */
    Auto : "Auto",

    /**
     * The Title is of level 1. 
     * @public
	 * @enum {string} sap.ui.core.TitleLevel.H1
     */
    H1 : "H1",

    /**
     * The Title is of level 2 
     * @public
	 * @enum {string} sap.ui.core.TitleLevel.H2
     */
    H2 : "H2",

    /**
     * The Title is of level 3 
     * @public
	 * @enum {string} sap.ui.core.TitleLevel.H3
     */
    H3 : "H3",

    /**
     * The Title is of level 4 
     * @public
	 * @enum {string} sap.ui.core.TitleLevel.H4
     */
    H4 : "H4",

    /**
     * The Title is of level 5 
     * @public
	 * @enum {string} sap.ui.core.TitleLevel.H5
     */
    H5 : "H5",

    /**
     * The Title is of level 6 
     * @public
	 * @enum {string} sap.ui.core.TitleLevel.H6
     */
    H6 : "H6"

};

/**
 * @class A string type that represents an RFC 3986 conformant URI.
 *
 * @static
 * @public
 * @name sap.ui.core.URI 
 */
sap.ui.core.URI = sap.ui.base.DataType.createType('sap.ui.core.URI', {
    isValid : function(vValue) {
      return /^((([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?)$/.test(vValue);
    }

  },
  sap.ui.base.DataType.getType('string')
);

/**
 * @class Marker for the correctness of the current value.
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.ui.core.ValueState 
 */
sap.ui.core.ValueState = {
  
    /**
     * State is not valid. 
     * @public
	 * @enum {string} sap.ui.core.ValueState.Error
     */
    Error : "Error",

    /**
     * State is valid but with a warning. 
     * @public
	 * @enum {string} sap.ui.core.ValueState.Warning
     */
    Warning : "Warning",

    /**
     * State is valid. 
     * @public
	 * @enum {string} sap.ui.core.ValueState.Success
     */
    Success : "Success",

    /**
     * State is not specified. 
     * @public
	 * @enum {string} sap.ui.core.ValueState.None
     */
    None : "None"

};

/**
 * @class
 * Configuration options for vertical alignments, for example of a layout cell content within the borders.
 * 
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.ui.core.VerticalAlign 
 */
sap.ui.core.VerticalAlign = {
  
    /**
     * 
     * Content is aligned at the bottom.
     *  
     * @public
	 * @enum {string} sap.ui.core.VerticalAlign.Bottom
     */
    Bottom : "Bottom",

    /**
     * 
     * Content is centered vertically .
     *  
     * @public
	 * @enum {string} sap.ui.core.VerticalAlign.Middle
     */
    Middle : "Middle",

    /**
     * 
     * Content is aligned at the top.
     *  
     * @public
	 * @enum {string} sap.ui.core.VerticalAlign.Top
     */
    Top : "Top",

    /**
     * 
     * Content respect the parent's vertical alignment.
     *  
     * @public
	 * @enum {string} sap.ui.core.VerticalAlign.Inherit
     */
    Inherit : "Inherit"

};

/**
 * @class Configuration options for text wrapping.
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.ui.core.Wrapping 
 */
sap.ui.core.Wrapping = {
  
    /**
     * The standard browser behavior is considered for wrapping. 
     * @public
	 * @enum {string} sap.ui.core.Wrapping.None
     */
    None : "None",

    /**
     * The text is actually on the same line but displayed within several lines. 
     * @public
	 * @enum {string} sap.ui.core.Wrapping.Soft
     */
    Soft : "Soft",

    /**
     * Inserts actual line breaks in the text at the wrap point. 
     * @public
	 * @enum {string} sap.ui.core.Wrapping.Hard
     */
    Hard : "Hard",

    /**
     * Wrapping shall not be allowed. 
     * @public
	 * @enum {string} sap.ui.core.Wrapping.Off
     */
    Off : "Off"

};
  
/**
 * @class Specifies possible view types
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.ui.core.mvc.ViewType 
 */
sap.ui.core.mvc.ViewType = {
  
    /**
     * JSON View 
     * @public
	 * @enum {string} sap.ui.core.mvc.ViewType.JSON
     */
    JSON : "JSON",

    /**
     * XML view 
     * @public
	 * @enum {string} sap.ui.core.mvc.ViewType.XML
     */
    XML : "XML",

    /**
     * HTML view 
     * @public
	 * @enum {string} sap.ui.core.mvc.ViewType.HTML
     */
    HTML : "HTML",

    /**
     * JS View 
     * @public
	 * @enum {string} sap.ui.core.mvc.ViewType.JS
     */
    JS : "JS",

    /**
     * Template View 
     * @public
	 * @enum {string} sap.ui.core.mvc.ViewType.Template
     */
    Template : "Template"

}; 

/**
 * @class Enumaration for different HistoryDirections
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.ui.core.routing.HistoryDirection 
 */
sap.ui.core.routing.HistoryDirection = {
  
    /**
     * The page has already been navigated to and it was the successor of the previous page 
     * @public
	 * @enum {string} sap.ui.core.routing.HistoryDirection.Forwards
     */
    Forwards : "Forwards",

    /**
     * The page has already been navigated to and it was the precessor of the previous page 
     * @public
	 * @enum {string} sap.ui.core.routing.HistoryDirection.Backwards
     */
    Backwards : "Backwards",

    /**
     * A new Entry is added to the history 
     * @public
	 * @enum {string} sap.ui.core.routing.HistoryDirection.NewEntry
     */
    NewEntry : "NewEntry",

    /**
     * A Navigation took place, but it could be any of the other three states 
     * @public
	 * @enum {string} sap.ui.core.routing.HistoryDirection.Unknown
     */
    Unknown : "Unknown"

};


/**
 * @class Available Background Design.
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.m.BackgroundDesign 
 */
sap.m.BackgroundDesign = {
  
    /**
     * A solid background color dependent on the theme. 
     * @public
	 * @enum {string} sap.m.BackgroundDesign.Solid
     */
    Solid : "Solid",

    /**
     * Transparent background. 
     * @public
	 * @enum {string} sap.m.BackgroundDesign.Transparent
     */
    Transparent : "Transparent",

    /**
     * A translucent background depending on the opacity value of the theme. 
     * @public
	 * @enum {string} sap.m.BackgroundDesign.Translucent
     */
    Translucent : "Translucent"

};

/**
 * @class Different types for a button (predefined types)
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.m.ButtonType 
 */
sap.m.ButtonType = {
  
    /**
     * default type (no special styling) 
     * @public
	 * @enum {string} sap.m.ButtonType.Default
     */
    Default : "Default",

    /**
     * back type (back navigation button for header) 
     * @public
	 * @enum {string} sap.m.ButtonType.Back
     */
    Back : "Back",

    /**
     * accept type (blue button) 
     * @public
	 * @enum {string} sap.m.ButtonType.Accept
     */
    Accept : "Accept",

    /**
     * reject style (red button) 
     * @public
 	 * @enum {string} sap.m.ButtonType.Reject
    */
    Reject : "Reject",

    /**
     * transparent type 
     * @public
	 * @enum {string} sap.m.ButtonType.Transparent
     */
    Transparent : "Transparent",

    /**
     * up type (up navigation button for header) 
     * @public
	 * @enum {string} sap.m.ButtonType.Up
     */
    Up : "Up",

    /**
     * Unstyled type (no styling) 
     * @public
 	 * @enum {string} sap.m.ButtonType.Unstyled
    */
    Unstyled : "Unstyled",

    /**
     * emphasized type 
     * @public
 	 * @enum {string} sap.m.ButtonType.Emphasized
    */
    Emphasized : "Emphasized"

};

/**
 * @class A subset of DateTimeInput types that fit to a simple API returning one string.
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.m.DateTimeInputType 
 */
sap.m.DateTimeInputType = {
  
    /**
     * An input control for specifying a date value. The user can select a month, day of the month, and year. 
     * @public
	 * @enum {string} sap.m.DateTimeInputType.Date
     */
    Date : "Date",

    /**
     * An input control for specifying a date and time value. The user can select a month, day of the month, year, and time of day. 
     * @public
	 * @enum {string} sap.m.DateTimeInputType.DateTime
     */
    DateTime : "DateTime",

    /**
     * An input control for specifying a time value. The user can select the hour, minute, and optionally AM or PM. 
     * @public
	 * @enum {string} sap.m.DateTimeInputType.Time
     */
    Time : "Time"

};

/**
 * @class Enum for the type of sap.m.Dialog control.
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.m.DialogType 
 */
sap.m.DialogType = {
  
    /**
     * This is the default value for Dialog type. Stardard dialog in iOS has a header on the top and the left, right buttons are put inside the header. In android, the left, right buttons are put to the bottom of the Dialog. 
     * @public
	 * @enum {string} sap.m.DialogType.Standard
     */
    Standard : "Standard",

    /**
     * Dialog with type Message looks the same as the Stardard Dialog in Android. And it puts the left, right buttons to the bottom of the Dialog in iOS. 
     * @public
	 * @enum {string} sap.m.DialogType.Message
     */
    Message : "Message"

};

/**
 * @class Used by the FacetFilter control to adapt its design according to type.
 * 
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.m.FacetFilterType 
 */
sap.m.FacetFilterType = {
  
    /**
     * Forces FacetFilter to display facet lists as a row of buttons, one button per facet. The FacetFilter will automatically adapt to the Light type when it detects smart phone sized displays. 
     * @public
	 * @enum {string} sap.m.FacetFilterType.Simple
     */
    Simple : "Simple",

    /**
     * Forces FacetFilter to display in light mode. 
     * @public
	 * @enum {string} sap.m.FacetFilterType.Light
     */
    Light : "Light"

};

/**
 * @class Available options for the layout of all elements along the cross axis of the flexbox layout.
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.m.FlexAlignItems 
 */
sap.m.FlexAlignItems = {
  
    /**
     * The cross-start margin edges of the box items are placed flush with the cross-start edge of the line. 
     * @public
	 * @enum {string} sap.m.FlexAlignItems.Start
     */
    Start : "Start",

    /**
     * The cross-start margin edges of the box items are placed flush with the cross-end edge of the line. 
     * @public
	 * @enum {string} sap.m.FlexAlignItems.End
     */
    End : "End",

    /**
     * The box items' margin boxes are centered in the cross axis within the line. 
     * @public
	 * @enum {string} sap.m.FlexAlignItems.Center
     */
    Center : "Center",

    /**
     * If the box items' inline axes are the same as the cross axis, this value is identical to ?start?. Otherwise, it participates in baseline alignment: all participating box items on the line are aligned such that their baselines align, and the item with the largest distance between its baseline and its cross-start margin edge is placed flush against the cross-start edge of the line. 
     * @public
	 * @enum {string} sap.m.FlexAlignItems.Baseline
     */
    Baseline : "Baseline",

    /**
     * Make the cross size of the items' margin boxes as close to the same size as the line as possible. 
     * @public
	 * @enum {string} sap.m.FlexAlignItems.Stretch
     */
    Stretch : "Stretch",

    /**
     * Inherits the value from its parent. 
     * @public
	 * @enum {string} sap.m.FlexAlignItems.Inherit
     */
    Inherit : "Inherit"

};

/**
 * @class Available options for the layout of individual elements along the cross axis of the flexbox layout overriding the default alignment.
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.m.FlexAlignSelf 
 */
sap.m.FlexAlignSelf = {
  
    /**
     * Takes up the value of alignItems from the parent FlexBox 
     * @public
	 * @enum {string} sap.m.FlexAlignSelf.Auto
     */
    Auto : "Auto",

    /**
     * The cross-start margin edges of the box item is placed flush with the cross-start edge of the line. 
     * @public
	 * @enum {string} sap.m.FlexAlignSelf.Start
     */
    Start : "Start",

    /**
     * The cross-start margin edges of the box item is placed flush with the cross-end edge of the line. 
     * @public
 	 * @enum {string} sap.m.FlexAlignSelf.End
    */
    End : "End",

    /**
     * The box item's margin box is centered in the cross axis within the line. 
     * @public
 	 * @enum {string} sap.m.FlexAlignSelf.Center
    */
    Center : "Center",

    /**
     * If the box item's inline axis is the same as the cross axis, this value is identical to ?start?. Otherwise, it participates in baseline alignment: all participating box items on the line are aligned such that their baselines align, and the item with the largest distance between its baseline and its cross-start margin edge is placed flush against the cross-start edge of the line. 
     * @public
  	 * @enum {string} sap.m.FlexAlignSelf.Baseline
   */
    Baseline : "Baseline",

    /**
     * Make the cross size of the item's margin box as close to the same size as the line as possible. 
     * @public
  	 * @enum {string} sap.m.FlexAlignSelf.Stretch
   */
    Stretch : "Stretch",

    /**
     * Inherits the value from its parent. 
     * @public
  	 * @enum {string} sap.m.FlexAlignSelf.Inherit
   */
    Inherit : "Inherit"

};

/**
 * @class Available directions for flex layouts.
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.m.FlexDirection 
 */
sap.m.FlexDirection = {
  
    /**
     * Elements are layed out along the direction of the inline axis (text direction). 
     * @public
  	 * @enum {string} sap.m.FlexDirection.Row
     */
    Row : "Row",

    /**
     * Elements are layed out along the direction of the block axis (usually top to bottom). 
     * @public
  	 * @enum {string} sap.m.FlexDirection.Column
     */
    Column : "Column",

    /**
     * Elements are layed out along the reverse direction of the inline axis (against the text direction). 
     * @public
  	 * @enum {string} sap.m.FlexDirection.RowReverse
     */
    RowReverse : "RowReverse",

    /**
     * Elements are layed out along the reverse direction of the block axis (usually bottom to top). 
     * @public
   	 * @enum {string} sap.m.FlexDirection.ColumnReverse
    */
    ColumnReverse : "ColumnReverse",

    /**
     * Inherits the value from its parent. 
     * @public
     * @enum {string} sap.m.FlexDirection.Inherit
   */
    Inherit : "Inherit"

};

/**
 * @class Available options for the layout of elements along the main axis of the flexbox layout.
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.m.FlexJustifyContent 
 */
sap.m.FlexJustifyContent = {
  
    /**
     * Box items are packed toward the start of the line. 
     * @public
     * @enum {string} sap.m.FlexJustifyContent.Start
     */
    Start : "Start",

    /**
     * Box items are packed toward the end of the line. 
     * @public
     * @enum {string} sap.m.FlexJustifyContent.End
     */
    End : "End",

    /**
     * Box items are packed toward the center of the line. 
     * @public
     * @enum {string} sap.m.FlexJustifyContent.Center
     */
    Center : "Center",

    /**
     * Box items are evenly distributed in the line. 
     * @public
     * @enum {string} sap.m.FlexJustifyContent.SpaceBetween
    */
    SpaceBetween : "SpaceBetween",

    /**
     * Box items are evenly distributed in the line, with half-size spaces on either end. 
     * @public
     * @enum {string} sap.m.FlexJustifyContent.SpaceAround
     */
    SpaceAround : "SpaceAround",

    /**
     * Inherits the value from its parent. 
     * @public
     * @enum {string} sap.m.FlexJustifyContent.Inherit
     */
    Inherit : "Inherit"

};

/**
 * @class Determines the type of HTML elements used for rendering controls.
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.m.FlexRendertype 
 */
sap.m.FlexRendertype = {
  
    /**
     * DIV elements are used for rendering 
     * @public
     * @enum {string} sap.m.FlexRendertype.Div
     */
    Div : "Div",

    /**
     * Unordered lists are used for rendering. 
     * @public
     * @enum {string} sap.m.FlexRendertype.List
     */
    List : "List"

};

/**
 * @class Different levels for headers
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.m.HeaderLevel 
 */
sap.m.HeaderLevel = {
  
    /**
     * Header level 1 
     * @public
     * @enum {string} sap.m.HeaderLevel.H1
     */
    H1 : "H1",

    /**
     * Header level 2 
     * @public
     * @enum {string} sap.m.HeaderLevel.H2
     */
    H2 : "H2",

    /**
     * Header level 3 
     * @public
     * @enum {string} sap.m.HeaderLevel.H3
     */
    H3 : "H3",

    /**
     * Header level 4 
     * @public
     * @enum {string} sap.m.HeaderLevel.H4
     */
    H4 : "H4",

    /**
     * Header level 5 
     * @public
     * @enum {string} sap.m.HeaderLevel.H5
     */
    H5 : "H5",

    /**
     * Header level 6 
     * @public
     * @enum {string} sap.m.HeaderLevel.H6
     */
    H6 : "H6"

};

/**
 * @class Available Filter Item Design.
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.m.IconTabFilterDesign 
 */
sap.m.IconTabFilterDesign = {
  
    /**
     * A horizontally layouted design providing more space for texts. 
     * @public
     * @enum {string} sap.m.IconTabFilterDesign.Horizontal
     */
    Horizontal : "Horizontal",

    /**
     * A vertically layouted design using minimum horizontal space. 
     * @public
     * @enum {string} sap.m.IconTabFilterDesign.Vertical
     */
    Vertical : "Vertical"

};

/**
 * @class A subset of input types that fit to a simple API returning one string.
 * Not available on purpose: button, checkbox, hidden, image, password, radio, range, reset, search, submit.
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.m.InputType 
 */
sap.m.InputType = {
  
    /**
     * default (text) 
     * @public
     * @enum {string} sap.m.InputType.Text
     */
    Text : "Text",

    /**
     * An input control for specifying a date value. The user can select a month, day of the month, and year. 
     * @public
     * @deprecated Since version 1.9.1. 
     * Please use sap.m.DateTimeInput control with type "Date" to create date input.
     * @enum {string} sap.m.InputType.Date
     */
    Date : "Date",

    /**
     * An input control for specifying a date and time value. The user can select a month, day of the month, year, and time of day. 
     * @public
     * @deprecated Since version 1.9.1. 
     * Please use dedicated sap.m.DateTimeInput control with type "DateTime" to create date-time input.
     * @enum {string} sap.m.InputType.Datetime
     */
    Datetime : "Datetime",

    /**
     * An input control for specifying a date and time value where the format depends on the locale. 
     * @public
     * @deprecated Since version 1.9.1. 
     * Please use dedicated sap.m.DateTimeInput control with type "DateTime" to create date-time input.
     * @enum {string} sap.m.InputType.DatetimeLocale
     */
    DatetimeLocale : "DatetimeLocale",

    /**
     * A text field for specifying an email address. Brings up a keyboard optimized for email address entry. 
     * @public
     * @enum {string} sap.m.InputType.Email
     */
    Email : "Email",

    /**
     * An input control for selecting a month. 
     * @public
     * @deprecated Since version 1.9.1. 
     * There is no cross-platform support. Please do not use this Input type.
     * @enum {string} sap.m.InputType.Month
     */
    Month : "Month",

    /**
     * A text field for specifying a number. Brings up a number pad keyboard. Specifying an input type of \d* or [0-9]* is equivalent to using this type. 
     * @public
     * @enum {string} sap.m.InputType.Number
     */
    Number : "Number",

    /**
     * A text field for specifying a phone number. Brings up a phone pad keyboard. 
     * @public
     * @enum {string} sap.m.InputType.Tel
     */
    Tel : "Tel",

    /**
     * An input control for specifying a time value. The user can select the hour, minute, and optionally AM or PM. 
     * @public
     * @deprecated Since version 1.9.1. 
     * Please use dedicated sap.m.DateTimeInput control with type "Time" to create time input.
     * @enum {string} sap.m.InputType.Time
     */
    Time : "Time",

    /**
     * A text field for specifying a URL. Brings up a keyboard optimized for URL entry. 
     * @public
     * @enum {string} sap.m.InputType.Url
     */
    Url : "Url",

    /**
     * An input control for selecting a week. 
     * @public
     * @deprecated Since version 1.9.1. 
     * There is no cross-platform support. Please do not use this Input type.
     * @enum {string} sap.m.InputType.Week
     */
    Week : "Week",

    /**
     * Password input where the user entry cannot be seen. 
     * @public
     * @enum {string} sap.m.InputType.Password
     */
    Password : "Password"

};

/**
 * @class Available label display modes.
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.m.LabelDesign 
 */
sap.m.LabelDesign = {
  
    /**
     * Displays the label in bold. 
     * @public
     * @enum {string} sap.m.LabelDesign.Bold
     */
    Bold : "Bold",

    /**
     * Displays the label in normal mode. 
     * @public
     * @enum {string} sap.m.LabelDesign.Standard
     */
    Standard : "Standard"

};

/**
 * @class Defines the differnet header styles.
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @deprecated Since version 1.16. 
 * Has no functionality since 1.16.
 * @name sap.m.ListHeaderDesign 
 */
sap.m.ListHeaderDesign = {
  
    /**
     * Standard header style 
     * @public
     * @enum {string} sap.m.ListHeaderDesign.Standard
     */
    Standard : "Standard",

    /**
     * Plain header style 
     * @public
     * @enum {string} sap.m.ListHeaderDesign.Plain
     */
    Plain : "Plain"

};

/**
 * @class Different modes for the list selection (predefined modes)
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.m.ListMode 
 */
sap.m.ListMode = {
  
    /**
     * default mode (no selection) 
     * @public
     * @enum {string} sap.m.ListMode.None
     */
    None : "None",

    /**
     * right positioned single selection mode (only one list item can be selected) 
     * @public
     * @enum {string} sap.m.ListMode.SingleSelect
     */
    SingleSelect : "SingleSelect",

    /**
     * multi selection mode (whole list item including checkbox will be selected) 
     * @public
     * @enum {string} sap.m.ListMode.MultiSelect
     */
    MultiSelect : "MultiSelect",

    /**
     * delete mode (only one list item can be deleted) 
     * @public
     * @enum {string} sap.m.ListMode.Delete
     */
    Delete : "Delete",

    /**
     * Single selection master mode (only one list item can be selected), selected item is highlighted but no radiobutton is visible. 
     * @public
     * @enum {string} sap.m.ListMode.SingleSelectMaster
     */
    SingleSelectMaster : "SingleSelectMaster",

    /**
     * left positioned single selection mode (only one list item can be selected) 
     * @public
     * @enum {string} sap.m.ListMode.SingleSelectLeft
     */
    SingleSelectLeft : "SingleSelectLeft"

};

/**
 * @class Defines which separator style will be taken.
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.m.ListSeparators 
 */
sap.m.ListSeparators = {
  
    /**
     * Separators around all items. 
     * @public
     * @enum {string} sap.m.ListSeparators.All
     */
    All : "All",

    /**
     * Separators only between the items. 
     * @public
     * @enum {string} sap.m.ListSeparators.Inner
     */
    Inner : "Inner",

    /**
     * No Separators are used. 
     * @public
     * @enum {string} sap.m.ListSeparators.None
     */
    None : "None"

};

/**
 * @class List types
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.m.ListType 
 */
sap.m.ListType = {
  
    /**
     * Inactive 
     * @public
     * @enum {string} sap.m.ListType.Inactive
     */
    Inactive : "Inactive",

    /**
     * Detail 
     * @public
     * @enum {string} sap.m.ListType.Detail
     */
    Detail : "Detail",

    /**
     * Navigation 
     * @public
     * @enum {string} sap.m.ListType.Navigation
     */
    Navigation : "Navigation",

    /**
     * Active 
     * @public
     * @enum {string} sap.m.ListType.Active
     */
    Active : "Active",

    /**
     * DetailAndActive 
     * @public
     * @enum {string} sap.m.ListType.DetailAndActive
     */
    DetailAndActive : "DetailAndActive"

};

/**
 * @class Available Page Background Design.
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.m.PageBackgroundDesign 
 */
sap.m.PageBackgroundDesign = {
  
    /**
     * Standard Page background color. 
     * @public
     * @enum {string} sap.m.PageBackgroundDesign.Standard
     */
    Standard : "Standard",

    /**
     * Page background color when a List is set as the Page content. 
     * @public
     * @enum {string} sap.m.PageBackgroundDesign.List
     */
    List : "List",

    /**
     * A solid background color dependent on the theme. 
     * @public
     * @enum {string} sap.m.PageBackgroundDesign.Solid
     */
    Solid : "Solid",

    /**
     * Transparent background for the page. 
     * @public
     * @enum {string} sap.m.PageBackgroundDesign.Transparent
     */
    Transparent : "Transparent"

};

/**
 * @class Types for the placement of popover control.
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.m.PlacementType 
 */
sap.m.PlacementType = {
  
    /**
     * Popover will be placed at the left side of the reference control. 
     * @public
     * @enum {string} sap.m.PlacementType.Left
     */
    Left : "Left",

    /**
     * Popover will be placed at the right side of the reference control. 
     * @public
     * @enum {string} sap.m.PlacementType.Right
     */
    Right : "Right",

    /**
     * Popover will be placed at the top of the reference control. 
     * @public
     * @enum {string} sap.m.PlacementType.Top
     */
    Top : "Top",

    /**
     * Popover will be placed at the bottom of the reference control. 
     * @public
     * @enum {string} sap.m.PlacementType.Bottom
     */
    Bottom : "Bottom",

    /**
     * Popover will be placed at the top or bottom of the reference control. 
     * @public
     * @enum {string} sap.m.PlacementType.Vertical
     */
    Vertical : "Vertical",

    /**
     * Popover will be placed at the right or left side of the reference control. 
     * @public
     * @enum {string} sap.m.PlacementType.Horizontal
     */
    Horizontal : "Horizontal",

    /**
     * Popover will be placed automatically at the reference control. 
     * @public
     * @enum {string} sap.m.PlacementType.Auto
     */
    Auto : "Auto"

};

/**
 * @class Defines the display of table pop-ins
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @since 1.13.2
 * @name sap.m.PopinDisplay 
 */
sap.m.PopinDisplay = {
  
    /**
     * Inside the table popin, header is displayed in first line and value field is displayed in next line. 
     * @public
     * @enum {string} sap.m.PopinDisplay.Block
     */
    Block : "Block",

    /**
     * Inside the table popin, value field is displayed next to the header in the same line. Note: If there is no enough space for the value field then goes to next line. 
     * @public
     * @enum {string} sap.m.PopinDisplay.Inline
     */
    Inline : "Inline"

};

/**
 * @class Possible values for the visualization of float values in the RatingIndicator Control.
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.m.RatingIndicatorVisualMode 
 */
sap.m.RatingIndicatorVisualMode = {
  
    /**
     * Values are rounded to the nearest integer value (e.g. 1.7 -> 2). 
     * @public
     * @enum {string} sap.m.RatingIndicatorVisualMode.Full
     */
    Full : "Full",

    /**
     * Values are rounded to the nearest half value (e.g. 1.7 -> 1.5). 
     * @public
     * @enum {string} sap.m.RatingIndicatorVisualMode.Half
     */
    Half : "Half"

};

/**
 * @class Breakpoint names for different screen sizes.
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.m.ScreenSize 
 */
sap.m.ScreenSize = {
  
    /**
     * 240px wide 
     * @public
     * @enum {string} sap.m.ScreenSize.Phone
     */
    Phone : "Phone",

    /**
     * 600px wide 
     * @public
     * @enum {string} sap.m.ScreenSize.Tablet
     */
    Tablet : "Tablet",

    /**
     * 1024px wide 
     * @public
     * @enum {string} sap.m.ScreenSize.Desktop
     */
    Desktop : "Desktop",

    /**
     * 240px wide 
     * @public
     * @enum {string} sap.m.ScreenSize.XXSmall
     */
    XXSmall : "XXSmall",

    /**
     * 320px wide 
     * @public
     * @enum {string} sap.m.ScreenSize.XSmall
     */
    XSmall : "XSmall",

    /**
     * 480px wide 
     * @public
     * @enum {string} sap.m.ScreenSize.Small
     */
    Small : "Small",

    /**
     * 560px wide 
     * @public
     * @enum {string} sap.m.ScreenSize.Medium
     */
    Medium : "Medium",

    /**
     * 768px wide 
     * @public
     * @enum {string} sap.m.ScreenSize.Large
     */
    Large : "Large",

    /**
     * 960px wide 
     * @public
     * @enum {string} sap.m.ScreenSize.XLarge
     */
    XLarge : "XLarge",

    /**
     * 1120px wide 
     * @public
     * @enum {string} sap.m.ScreenSize.XXLarge
     */
    XXLarge : "XXLarge"

};

/**
 * @class Enumeration for different Select types.
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @since 1.16
 * @name sap.m.SelectType 
 */
sap.m.SelectType = {
  
    /**
     * Will show the text. 
     * @public
     * @enum {string} sap.m.SelectType.Default
     */
    Default : "Default",

    /**
     * Will show only the specified icon. 
     * @public
     * @enum {string} sap.m.SelectType.IconOnly
     */
    IconOnly : "IconOnly"

};

/**
 * @class The mode of SplitContainer or SplitApp control to show/hide the master area.
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.m.SplitAppMode 
 */
sap.m.SplitAppMode = {
  
    /**
     * Master will automatically be hidden in portrait mode. 
     * @public
     * @enum {string} sap.m.SplitAppMode.ShowHideMode
     */
    ShowHideMode : "ShowHideMode",

    /**
     * Master will always be shown but in a compressed version when in portrait mode. 
     * @public
     * @enum {string} sap.m.SplitAppMode.StretchCompressMode
     */
    StretchCompressMode : "StretchCompressMode",

    /**
     * Master will be shown inside a Popover when in portrait mode 
     * @public
     * @enum {string} sap.m.SplitAppMode.PopoverMode
     */
    PopoverMode : "PopoverMode",

    /**
     * Master area is hidden initially both in portrait and landscape. Master area can be opened by clicking on the top left corner button or swiping right. Swipe is only enabled on mobile devices. Master will keep the open state when changing the orientation of the device. 
     * @public
     * @enum {string} sap.m.SplitAppMode.HideMode
    */
    HideMode : "HideMode"

};

/**
 * @class Types for StandardTile
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.m.StandardTileType 
 */
sap.m.StandardTileType = {
  
    /**
     * Tile representing that something needs to be created 
     * @public
     * @enum {string} sap.m.StandardTileType.Create
     */
    Create : "Create",

    /**
     * Monitor tile 
     * @public
     * @enum {string} sap.m.StandardTileType.Monitor
     */
    Monitor : "Monitor",

    /**
     * Default type 
     * @public
     * @enum {string} sap.m.StandardTileType.None
     */
    None : "None"

};

/**
 * @class Directions for swipe event.
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.m.SwipeDirection 
 */
sap.m.SwipeDirection = {
  
    /**
     * Swipe from left to right 
     * @public
     * @enum {string} sap.m.SwipeDirection.LeftToRight
     */
    LeftToRight : "LeftToRight",

    /**
     * Swipe from right to left. 
     * @public
     * @enum {string} sap.m.SwipeDirection.RightToLeft
     */
    RightToLeft : "RightToLeft",

    /**
     * Both directions (left to right or right to left) 
     * @public
     * @enum {string} sap.m.SwipeDirection.Both
     */
    Both : "Both"

};

/**
 * @class Enumaration for different switch types.
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.m.SwitchType 
 */
sap.m.SwitchType = {
  
    /**
     * Will show "ON" and "OFF" translated to the current language or the custom text if provided 
     * @public
     * @enum {string} sap.m.SwitchType.Default
     */
    Default : "Default",

    /**
     * Switch with accept and reject icons 
     * @public
     * @enum {string} sap.m.SwitchType.AcceptReject
     */
    AcceptReject : "AcceptReject"

};

/**
 * @class Types of the Toolbar Design
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @since 1.16.8
 * @name sap.m.ToolbarDesign 
 */
sap.m.ToolbarDesign = {
  
    /**
     * The toolbar can be inserted into other controls and if the design is "Auto" then it inherits the design from parent control. 
     * @public
     * @enum {string} sap.m.ToolbarDesign.Auto
     */
    Auto : "Auto",

    /**
     * The toolbar and its content will be displayed transparent. 
     * @public
     * @enum {string} sap.m.ToolbarDesign.Transparent
     */
    Transparent : "Transparent",

    /**
     * The toolbar appears smaller than the regular size to show information(e.g: text, icon). 
     * @public
     * @enum {string} sap.m.ToolbarDesign.Info
     */
    Info : "Info"

};


/**
 * @class A string type that represents Grid's indent values for large, medium and small screens. Allowed values are separated by space Letters L, M or S followed by number of columns from 1 to 11 that the container has to take, for example: "L2 M4 S6", "M12", "s10" or "l4 m4". Note that the parameters has to be provided in the order large  medium  small.
 *
 * @static
 * @public
 * @name sap.ui.layout.GridIndent 
 */
sap.ui.layout.GridIndent = sap.ui.base.DataType.createType('sap.ui.layout.GridIndent', {
    isValid : function(vValue) {
      return /^(([Ll](?:[0-9]|1[0-1]))? ?([Mm](?:[0-9]|1[0-1]))? ?([Ss](?:[0-9]|1[0-1]))?)$/.test(vValue);
    }

  },
  sap.ui.base.DataType.getType('string')
);

/**
 * @class Position of the Grid. Can be "Left", "Center" or "Right". "Left" is default.
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @name sap.ui.layout.GridPosition 
 */
sap.ui.layout.GridPosition = {
  
    /**
     * Grid is aligned left. 
     * @public
	 * @enum {string} sap.ui.layout.GridPosition.Left
     */
    Left : "Left",

    /**
     * Grid is aligned to the right. 
     * @public
	 * @enum {string} sap.ui.layout.GridPosition.Right
     */
    Right : "Right",

    /**
     * Grid is centered on the screen. 
     * @public
	 * @enum {string} sap.ui.layout.GridPosition.Center
     */
    Center : "Center"

};

/**
 * @class A string type that represents Grid's span values for large, medium and small screens. Allowed values are separated by space Letters L, M or S followed by number of columns from 1 to 12 that the container has to take, for example: "L2 M4 S6", "M12", "s10" or "l4 m4". Note that the parameters has to be provided in the order large  medium  small.
 *
 * @static
 * @public
 * @name sap.ui.layout.GridSpan 
 */
sap.ui.layout.GridSpan = sap.ui.base.DataType.createType('sap.ui.layout.GridSpan', {
    isValid : function(vValue) {
      return /^(([Ll](?:[1-9]|1[0-2]))? ?([Mm](?:[1-9]|1[0-2]))? ?([Ss](?:[1-9]|1[0-2]))?)$/.test(vValue);
    }

  },
  sap.ui.base.DataType.getType('string')
);

/**
 * @class A string that defines the number of used cells in a GridLayout. This can be a number from 1 to 16, "auto" or "full".
 *
 * @static
 * @public
 * @name sap.ui.layout.form.GridElementCells
 */
sap.ui.layout.form.GridElementCells = sap.ui.base.DataType.createType('sap.ui.layout.form.GridElementCells', {
    isValid : function(vValue) {
      return /^(auto|full|([1-9]|1[0-6]))$/.test(vValue);
    }

  },
  sap.ui.base.DataType.getType('string')
);

/**
 * @class Available FormLayouts used for the SimpleForm.
 *
 * @version 1.19.0-SNAPSHOT
 * @static
 * @public
 * @since 1.16.0
 * @name sap.ui.layout.form.SimpleFormLayout 
 */
sap.ui.layout.form.SimpleFormLayout = {
  
    /**
     * Uses the ResponsiveLayout for the SimpleForm 
     * @public
	 * @enum {string} sap.ui.layout.form.SimpleFormLayout.ResponsiveLayout
     */
    ResponsiveLayout : "ResponsiveLayout",

    /**
     * Uses the GridLayout for the SimpleForm 
     * @public
	 * @enum {string} sap.ui.layout.form.SimpleFormLayout.GridLayout
     */
    GridLayout : "GridLayout",

    /**
     * Uses the ResponsiveGridLayout for the SimpleForm 
     * @public
     * @since 1.16.0
	 * @enum {string} sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout
     */
    ResponsiveGridLayout : "ResponsiveGridLayout"

};

