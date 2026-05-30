<img width="1403" height="850" alt="image" src="https://github.com/user-attachments/assets/bf66ddec-d2a3-4fa6-a7fb-a5bfc3276f7d" />

PicDeliver是一个可以将GitHup公共仓库中的图片资源转换为CDN加速链接，依靠JsDelivr强大的CDN，但主域名由于大陆访问受限，因此提供了目前大陆可用的转换地址

**在线访问地址**：https://img2cdn.loorays.top/

# JsDelivr全球CDN节点
- https://cdn.jsdmirror.com/（JSDMirror+腾讯云 EdgeOne→ 大陆支持）
- [https://cdn.jsdelivr.net](http://cdn.jsdelivr.net/)（原大陆节点已下线 → 现在走海外）
- [https://gcore.jsdelivr.net](https://gcore.jsdelivr.net/)（Gcore 专属→服务器香港）
- [https://testingcf.jsdelivr.net](http://testingcf.jsdelivr.net/)（Cloudflare 专属→服务器香港）
- [https://fastly.jsdelivr.net](http://fastly.jsdelivr.net/)（Fastly 专属→服务器香港）
# GitHup图床访问地址格式
https://cdn.jsdmirror.com/gh/用户名/仓库名/图片路径.png

其中https://cdn.jsdmirror.com/gh可替换JsDelivr全球CDN节点中的任意一个

建议使用**GitHup Token**来使用GitHup的公共API,因为默认只有每小时60次的请求，使用token可升级为**每小时5000次请求**

# 本项目为AI工具开发，使用Gemini 3.5
AI Studio: https://ai.studio/apps/1e9cce76-9fd69-4383-9b55-43f96dc5e06

## 本地运行

**环境**  Node.js
1. 安装依赖:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. 运行:
   `npm run dev`
