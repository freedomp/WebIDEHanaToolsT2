define([], function(){

    return [
        {
            "id":"keep_array_indentation",
            "text":"dlg_keep_array_indentation",
            "type":"boolean",
            "value":false
        },
        {
            "id":"break_chained_methods",
            "text":"dlg_break_chained_methods",
            "type":"boolean",
            "value":false
        },
        {
            "id":"space_before_conditional",
            "text":"dlg_space_before_conditional",
            "type":"boolean",
            "value":true
        },
        {
            "id":"unescape_strings",
            "text":"dlg_unescape_strings",
            "type":"boolean",
            "value":false
        },
        {
            "id":"tab_size",
            "type":"array",
            "text":"dlg_tab_size",
            "value":"1",
            "items":[
                {
                    "value":"1",
                    "text":"a Tab"
                },
                {
                    "value":"2",
                    "text":"2 Spaces"
                },
                {
                    "value":"3",
                    "text":"3 Spaces"
                },
                {
                    "value":"4",
                    "text":"4 Spaces"
                },
                {
                    "value":"8",
                    "text":"8 Spaces"
                }
            ]
        },
        {
            "id":"max_preserve_newlines",
            "type":"array",
            "text":"dlg_max_preserve_newlines",
            "value":"2",
            "items":[
                {
                    "value":"-1",
                    "text":"No New Lines"
                },
                {
                    "value":"1",
                    "text":"1 New Line"
                },
                {
                    "value":"2",
                    "text":"2 New Lines"
                },
                {
                    "value":"5",
                    "text":"5 New Lines"
                },
                {
                    "value":"10",
                    "text":"10 New Lines"
                },
                {
                    "value":"0",
                    "text":"Unlimited New Lines"
                }
            ]
        },
        {
            "id":"wrap_line_length",
            "type":"array",
            "text":"dlg_wrap_line_length",
            "value":"140",
            "items":[
                {
                    "value":"0",
                    "text":"Do not wrap lines"
                },
                {
                    "value":"40",
                    "text":"near 40 characters"
                },
                {
                    "value":"70",
                    "text":"near 70 characters"
                },
                {
                    "value":"80",
                    "text":"near 80 characters"
                },
                {
                    "value":"110",
                    "text":"near 110 characters"
                },
                {
                    "value":"120",
                    "text":"near 120 characters"
                },
                {
                    "value":"140",
                    "text":"near 140 characters"
                }
            ]
        },
        {
            "id":"brace_style",
            "type":"array",
            "text":"dlg_brace_style",
            "value":"collapse",
            "items":[
                {
                    "value":"collapse",
                    "text":"Braces with control statement"
                },
                {
                    "value":"expand",
                    "text":"Braces on own line"
                },
                {
                    "value":"end-expand",
                    "text":"End braces on own line"
                }
            ]
        }
    ];

});