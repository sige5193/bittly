# 指令管理 / 请求脚本 / 内置函数

内置函数通过 `bittly` 进行调用，例如 `bittly.echo("hello")` 。

## `bittly.echo(content)`

原样返回参数 `content` 的内容。

参数：

- content ： 用于返回的字符串

返回值：字符串，返回内容为参数 `content` 的内容。

示例：

```javascript
let val = bittly.echo('hello');
// val = "hello"
```



## `bittly.timestamp()`

获取当前时间戳

返回值：数值，调用该方法时的时间戳。

示例：

```javascript
let val = bittly.timestamp();
// val = 1657028243
```



## `bittly.random(min,max)`

获取在 min 和 max 之间的一个随机数。

参数：

- min ：最小值
- max : 最大值

返回值：数值，返回在 min 和 max 之间的一个随机数。

示例：

```javascript
let val = bittly.random(100, 999);
// val = 123
```



## `bittly.bytesSum(values)`

计算给定字节的和

参数：

- values : 参与计算的数据对象列表。

返回：数值，values 所有元素计算后的结果。

示例：

```javascript
let val = bittly.bytesSum([
    {type:'uint8',value:'FF',format:'hex'},
    {type:'string', value:'0123456789'}
]);
// val = 780

// 当参数为表单时，可直接获取计算量
let val2 = bittly.bytesSum([
    $this.parameterFormItemGetByName('指令ID'),
    $this.parameterFormItemGetByName('参数数量')
]);
```

参数计算的values数组每个元素结构如下：

```javascript
{
    // 数据类型
	type : 'unint8',
    // 计算值
    value : 'FF',
    // 值格式
    format : 'hex',
}
```

- 数据类型 : 

  扩展数据类型： `int8` , `uint8` , `int16` , `uint16` , `int32`, `uint32`, `int64`, `uint64`

  内置数据类型：`string`, `form` , `byte` , `char_int` ,`char` , `unsigned_char` , `short` , `unsigned_short` , `int` , `unsigned_int` , `long` , `unsigned_long` , `long_long` , `unsigned_long_long` , `float` , `double` , `string` , `bytes`

- 计算值 ：

  计算值为参数计算的数值的字符串形式，例如，数字1表示为`'1'`， 如果直接书写数字，则按照实际值的十进制格式处理。

-  值格式：

  值格式支持 十六进制：`hex` ；十进制：`dec`, 八进制：`oct`；二进制：`bin`, 

  值格式为非必须项目，例如，如果数据类型为字符串 `string` 则不需要值格式。

   

## `bittly.crc*(data)`

计算给定数据的CRC值，crc 校验函数有多个名称，不同的crc函数完成不同的计算方式。

支持的计算函数：`crc32` , `crc16modbus` , `crc16ccitt`, `crc1`, `crc8`, `crc81wire`, `crc16` , `crc16kermit`, `crc16xmodem`, `crc24`, `crcjam`

参数：

- data ：支持传递数组，字符串和值对象，值对象参考 `bytesSum` 函数。

返回：CRC 计算后的数值。 

例如：

```javascript
// 当参数为表单时，可直接获取计算量， 假设 指令ID 为十六进制 AA，参数数量 为十六进制 01
let val2 = bittly.crc32([
    $this.parameterFormItemGetByName('指令ID'),
    $this.parameterFormItemGetByName('参数数量')
]);
// val2 = 1647736330 
// val2 = 6236760A // in hex

let val = bittly.crc16modbus("1234567890");
// val = 0xC20A 十六进制
// val = 49674 十进制
```

