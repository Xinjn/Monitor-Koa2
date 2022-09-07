# monitor
前端监控 SDK DEMO，仅供学习，请勿在生产环境中使用。

## DEMO

git clone 项目后，执行命令打开服务器。

```js
npm run server
```

然后用 vscode 的 `live server` 插件访问 examples 目录上的 html 文件，即可尝试体验监控 SDK 的效果。同时打开开发者工具，点击 network 标签，可以看到上报数据的发送请求。

## 使用

### 直接 HTML 文件中引入使用

```html
<script src="https://cdn.jsdelivr.net/npm/sdk-monitor/index.js"></script>

<script>
    monitor.init({
        url: 'http://localhost:8080/reportData'
    })
    // 手动埋点：用户点击
    monitor.behavior.onClick()
</script>
```

### 在 npm 中使用

安装
```js
npm i sdk-monitor
```

引入
```js
import monitor from 'sdk-monitor'
```

示例：用户点击
```js
mounted(){
    // 初始化
    monitor.init({
        url: 'http://localhost:3000/api/reportData' // 上报地址
    })
    // 手动埋点：用户点击
    monitor.behavior.onClick()
}
```
