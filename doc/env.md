# 环境管理

环境变量用于针对不同的运行环境设置不同的参数属性，在切换环境时，不再需要手动修改与环境变量有关的参数内容，可通过切换环境变量快速实现参数变更。

环境变量配置没有数量限制，可按照需要创建任意多个环境配置。

环境变量在使用时，可使用占位符 `{{env.变量名}}` 来引用环境变量，例如下图， `{{env.DEBUG_INFO}}` 当处于开发环境时为`01`, 正式环境时为 `00`，如果切换到默认环境，则没有该配置项，则 `{{env.DEBUG_INFO}}` 为空。

![Bittly 环境变量配置](res/2022071906533601.png)

