<div align="center">
  <a href="https://bittly.sigechen.com"
  ><img src="https://res.bittly.sigechen.com/img/logo.png" alt="Bittly Logo" height="64"/></a>
  <br/>
  <p><h3><b>Bittly</b></h3></p>
  <p><b>一个支持多种通讯方式和协议的测试工具，支持串口，网络，蓝牙，HTTP，Websocket ... </b></p>
  
  [![Website](https://img.shields.io/website?url=https%3A%2F%2Fbittly.sigechen.com)](https://bittly.sigechen.com)
  
  <p><a href="README.md">English</a> | 简体中文</p>
  
  <img src="https://res.bittly.sigechen.com/images/bittly-2.gif" alt="Bittly"/>
</div>

# Table of Contents
- [支持](#支持)
- [功能](#功能)
- [安装](#安装)
- [文档](#文档)
- [开发](#开发)
- [Contributing](#Contributing)
- [License](#License)

### 支持 
[![Bittly QQ GROUP](https://img.shields.io/badge/QQ%20Group-1014521818-blue)](https://qm.qq.com/cgi-bin/qm/qr?k=NqSWCMQAFL5RE-ic1tC8U0Fp5gtc1XwB&jump_from=webapi)
[![Bittly QQ](https://img.shields.io/badge/QQ-568109749-black)](http://wpa.qq.com/msgrd?v=3&uin=568109749&site=qq&menu=yes)
![Wechat](https://img.shields.io/badge/Wechat-sige--5193-brightgreen)
![Email](https://img.shields.io/badge/Email-568109749%40qq.com-infornational)
![Twitter](https://img.shields.io/twitter/url?style=social&url=https%3A%2F%2Ftwitter.com%2Fsige_5193)

### 功能

📈 支持的通讯方式和协议有串口，网络，蓝牙，HTTP，WebSocket，MQTT以及Modbus。 

📂 可以将发送的内容保存起来，并通过文件夹的方式进行分类管理，方便日后使用。

🎨 支持文本，HEX，文件以及结构化数据参数编辑器方便快捷的构建参数内容。

🚀 通过结构化参数编辑器能够根据数据类型自动处理数据进制，大小端问题，自动完成各种数据类型参数构建。

📄 支持加载参数文件并逐行或指定字节进行分次发送。

🎩 使用环境变量，脚本变量，快速调用等方式快速方便的计算数据校验等动态内容。

📊 支持数据流，HEX，文本，结构格式化以及绘图的方式查看数据响应内容，支持自定义协议，无需适配。

📚 支持将响应内容保存为二进制文件，文本文件，以及 Excel 文件方便后续使用。

🚦 通过将指令绑定到面板组件来快速创建一个上位机控制面板，只需要少量代码甚至无需代码。

🍡 控制面板支持按钮，滑动条，输入框，下拉选项，地图，绘图，指示器，模拟终端等各种组件。

🖥️ 控制面板支持数据传输日志，以及变量监控，从而能够实时查看运行状态。

✔️ 支持为指令创建测试用例，并通过运行测试用例来保证指令响应数据的正确性。

📜 支持将项目整体导出文档，输出文件支持PDF和Markdown格式。

🌎 I18n: 提供多语言支持，可任意切换至其他语言。(您可以通过Pull Request的方式来帮助我们将Bittly翻译到其他语言)

⏳ 不止是这些功能呢 😄

### 安装
1. 从 [https://bittly.sigechen.com/download](https://bittly.sigechen.com/download) 下载安装包或压缩文件 。
2. 执行下载好的安装程序，或直接解压压缩包到合适位置。
3. 然后点击 `Bittly` 即可启动程序来使用。

### 文档

您可以在 https://bittly.sigechen.com/manual 查阅使用文档。

### 开发

1. 配置好 nodejs 开发环境
2. 使用 git 克隆本项目 `git clone https://github.com/sige5193/bittly.git`
3. 使用 npm 安装项目依赖 `npm install`
4. 运行开发服务器可以进行开发调试 `npm run electron:serve`
5. 运行单元测试 `npm run test:unit`
6. 项目打包 `npm run electron:build`

### Contributing

我们十分欢迎您的参与，请参考 [Github Flow](https://docs.github.com/en/get-started/quickstart/github-flow), 通过创建分支，提交代码，创建 `Pull Request` 的方式来进行参与。

### License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT) - see the `LICENSE` file for details.
