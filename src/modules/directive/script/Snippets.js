module.exports = {
    variableSet : {
        name : 'snippetVariableSet',
        template : 
`/* "varName" : the name of placeholder variable, like "{{varName}}" */
/* "varValue" : the value of variable */
$this.variableSet("varName","varValue");`
    },
    parametersGet : {
        name : 'snippetParametersGet',
        template : 
`/* text mode : the params would be the content of text editor */
/* hex mode : the params would be the content of hex editor */
/* file mode : the params would be the contnet of given file path */
/* form mode : the params would be an array which contain all form items */
let params = $this.parametersGet();`,
    },
    paramFormItemValueGetByName : {
        name : 'snippetParamFormItemValueGetByName',
        template : 
`/* get the value of form item */
/* "itemName" : the name of form item */
/* val : the text content of form value */
let val = $this.parameterFormValueGetByName("itemName");`
    },
    paramFormItemGetByName : {
        name : 'snippetParamFormItemGetByName',
        template : 
`/* get the item object of form item */
/* "itemName" : the name of form item */
/* val : the object of form item */
let item = $this.parameterFormItemGetByName("itemName");`
    },
    paramFormItemGetByIndex : {
        name : 'snippetParamFormItemGetByIndex',
        template : 
`/* get the item object of form item by index */
/* 1 : the index of form item, the index starts from 1 */
/* val : the object of form item */
let item = $this.parameterFormItemGetByIndex(1);`
    },
    paramFormItemValueGetByIndex : {
        name : 'snippetParamFormItemValueGetByIndex',
        template : 
`/* get the value of form item */
/* 1 : the index of form item, the index starts from 1 */
/* val : the text content of form value */
let val = $this.parameterFormItemValueGetByIndex(1);`
    },
    timestamp : {
        name : 'snippetTimestamp',
        template : 
`/* get current timestamp */
let timestamp = bittly.timestamp();`,
    },
    random : {
        name : 'snippetRandom',
        template : 
`/* generate random number by given range */
/* 0 : the min number for random range */
/* 100 : the max number for random range */
let randomNum = bittly.random(0, 100);`,
    },
    bytesSum : {
        name : 'snippetBytesSum',
        template : 
`/* calculate sum value of bytes by given values. */
let sumNum = bittly.bytesSum(
$this.parameterFormItemGetByIndex(1),
$this.parameterFormItemGetByIndex(2),
$this.parameterFormItemGetByIndex(3)
/* and more ... */
);`,
    },
    crc : {
        name : 'snippetCRC',
        template : 
`/* calculate crc by given mode and values. */
/* "crc16modbus" : the crc mode, it could be one of the following mode : */
/* crc32 crc16modbus crc16ccitt crc1 crc8 crc81wire crc16 */
/* crc16kermit crc16xmodem crc24 crcjam */
/* the reset of parameters are values to calculate. */
let crcNum = bittly.crc(
"crc16modbus",
$this.parameterFormItemGetByIndex(1),
$this.parameterFormItemGetByIndex(2),
$this.parameterFormItemGetByIndex(3)
/* and more ... */
);`,
    },
    statusSet : {
        name : 'snippetStatusSet',
        template : 
`/* set directive status value */
/* "statusName" : name of status */
/* "StatusValue" : value of status */
$this.statusSet("statusName","StatusValue");
`,
    },
    statusGet : {
        name : 'snippetsStatusGet',
        template : 
`/* get directive status */
/* "statusName" : name of status */
/* "statusDefaultValue" : default value of status if not exists, not required. */
$this.statusGet("statusName","statusDefaultValue");
`,
    },
};