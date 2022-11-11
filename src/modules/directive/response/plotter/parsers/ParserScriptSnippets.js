module.exports = {
    channelCreate : {
        title : 'ChannelCreate',
        template : 
`/* ch01 : the id of new channel */
/* "CH01" : the name of new channel */
let ch01 = $this.channelAdd("CH01");`,
    },
    channelPushData : {
        title : 'ChannelPushData',
        template : 
`$this.channelDataPush(
    ch01, /* the id of the channel */
    100 /* the value to push into */
);`
    },
    getDataLength : {
        title : 'GetDataLength',
        template : 
`/* get length of data */
let length = $this.getDataLength();`,
    },
    readInt8 : {
        title : 'ReadInt8',
        template : 
`/* read an int8 number and move cursor 1 byte forward. */
let num = $this.readInt8();
`,
    },
    readUint8 : {
        title : 'ReadUint8',
        template : 
`/* read an uint8 number and move cursor 1 byte forward. */
let num = $this.readUint8();`,
    },
    readInt16BE : {
        title : 'ReadInt16BE',
        template : 
`/* read an int16 number and move cursor 2 byte forward. */
let num = $this.readInt16BE();`,
    },
    readUint16BE : {
        title : 'ReadUint16BE',
        template : 
`/* read an uint16 number and move cursor 2 byte forward. */
let num = $this.readUint16BE();`,
    },
    readInt16LE : {
        title : 'ReadInt16LE',
        template : 
`/* read an int16 number and move cursor 2 byte forward. */
let num = $this.readInt16LE();`,
    },
    readUint16LE : {
        title : 'ReadUint16LE',
        template : 
`/* read an uint16 number and move cursor 2 byte forward. */
let num = $this.readUint16LE();`,
    },
    readInt32BE : {
        title : 'ReadInt32BE',
        template : 
`/* read an int32 number and move cursor 4 byte forward. */
let num = $this.readInt32BE();`,
    },
    readUint32BE : {
        title : 'ReadUint32BE',
        template : 
`/* read an uint32 number and move cursor 4 byte forward. */
let num = $this.readUint32BE();`,
    },
    readInt32LE : {
        title : 'ReadInt32LE',
        template : 
`/* read an int32 number and move cursor 4 byte forward. */
let num = $this.readInt32LE();`,
    },
    readUint32LE : {
        title : 'ReadUint32LE',
        template : 
`/* read an uint32 number and move cursor 4 byte forward. */
let num = $this.readUint32LE();`,
    },
    readInt64BE : {
        title : 'ReadInt64BE',
        template : 
`/* read an int64 number and move cursor 8 byte forward. */
let num = $this.readInt64BE();`,
    },
    readUint64BE : {
        title : 'ReadUint64BE',
        template : 
`/* read an uint64 number and move cursor 8 byte forward. */
let num = $this.readUint64BE();`,
    },
    readInt64LE : {
        title : 'ReadInt64LE',
        template : 
`/* read an int64 number and move cursor 8 byte forward. */
let num = $this.readInt64LE();`,
    },
    readUint64LE : {
        title : 'ReadUint64LE',
        template : 
`/* read an uint64 number and move cursor 8 byte forward. */
let num = $this.readUint64LE();`,
    },
    readFloat32BE : {
        title : 'ReadFloat32BE',
        template : 
`/* read a float number and move cursor 4 byte forward. */
let num = $this.readFloat32BE();`,
    },
    readFloat64BE : {
        title : 'ReadFloat64BE',
        template : 
`/* read a double number and move cursor 8 byte forward. */
let num = $this.readFloat64BE();`,
    },
    readFloat32LE : {
        title : 'ReadFloat32LE',
        template : 
`/* read a float number and move cursor 4 byte forward. */
let num = $this.readFloat32LE();`,
    },
    readFloat64LE : {
        title : 'ReadFloat64LE',
        template : 
`/* read a double number and move cursor 8 byte forward. */
let num = $this.readFloat64LE();`,
    },
    getCursor : {
        title : 'GetCursor',
        template : 
`/* get position of data cursor */
let cursor = $this.getCursor();`,
    },
    moveCursor : {
        title : 'MoveCursor',
        template : 
`/* move data cursor by offset */
$this.moveCursor(-1);`,
    },
    setCursor : {
        title : 'SetCursor',
        template : 
`/* set data cursor position */
$this.setCursor(1);`,
    },
};