module.exports = {
    variableSet : {
        name : 'VariableSet',
        template : 
`/**
 * set runtime variable by given variable name and value
 * "varName" : the name of variable 
 * "varValue" : the value of variable 
 **/
bittly.variableSet("varName","varValue");`
    },
    variableGet : {
        name : 'VariableGet',
        template : 
`/**
 * get runtime variable by given variable name
 * "varName" : the name of variable 
 **/
let value = bittly.variableGet("varName");`
    },
    directiveExecText : {
        name : 'DirectiveExecText',
        template :
`/**
 * execute directive with text parameters
 * "path/to/directive" : the full path of directive,
 *     for example : "modbus/f03.read registers"
 * "ABC" : content of text parameters
 **/
let response = await bittly.directiveExecText(
    "path/to/directive",
    "ABC"
);

/* sleep 500 ms to receive response */
await bittly.msleep(500);

/* read text content from response */
let result = bittly.responseReadAsText(response);
`
    },
    directiveExecHex : {
        name : 'DirectiveExecHex',
        template : 
`/**
 * execute directive with hex parameters
 * "path/to/directive" : the full path of directive,
 *     for example : "modbus/f03.read registers"
 * "00 AA BB FF" : content of hex parameters
 **/
let response = await bittly.directiveExecHex(
    "path/to/directive",
    "00 AA BB FF"
);

/* sleep 500 ms to receive response */
await bittly.msleep(500);

/* read hex content from response, the result would be a byte array */
let result = bittly.responseReadAsBytes(response);
`
    },
    directiveExecForm : {
        name : 'DirectiveExecForm',
        template : 
`/**
 * execute directive with form parameters
 * "path/to/directive" : the full path of directive,
 *     for example : "modbus/f03.read registers"
 * ["FF","00"] : content of form parameters. 
 *     for example, the ["FF","00"] could be used to :
 *     | Name   | Type | Format | Value |
 *     | Attr01 | Byte | Hex    | FF    |
 *     | Attr02 | Byte | Hex    | 00    |
 **/
let response = await bittly.directiveExecForm(
    "path/to/directive",
    ["FF","00"]
);
/* sleep 500 ms to receive response */
await bittly.msleep(500);

/* read formatted content from response */
let result = bittly.responseReadAsForm(response);

/* read first attribute's value from result */
let value = result.getReadableValueByIndex(0);
`
    },
    widgetValueGet : {
        name : 'WidgetValueGet',
        template : 
`/**
 * get this widget's value. for example, if this widget
 * is an input box, the result of "$this.valueGet()" would
 * be the content of this input box 
 **/
let value = $this.valueGet();`
    },
    widgetDataSet : {
        name : 'WidgetDataSet',
        template : 
`/**
 * set value to widget attribute
 * "value" : the name of attribute, most of widgets use 'value'
 *           as the attribute to display data, but some of widgets,
 *           like 'map', it requires 'longitude' and 'latitude' 
 *           attribute, you can check the widget doc to get the details.
 * "widget-value" : the value to attribute.
 **/
$this.dataSet("value","widget-value");`
    },
    msleep : {
        name : 'Msleep',
        template : 
`/* delay 1000 millisecond. */
await bittly.msleep(1000);`,
    }
};