---
title: 欢迎使用 Hexo 搭建你的个人博客！
date: 2026-09-20 12:00:00
tags:
  - Hexo
  - GitHub Pages
  - 博客搭建
categories:
  - 博客指南
---

欢迎来到你的个人独立博客！本博客基于 **Hexo** 静态博客框架构建，并配置了 **GitHub Pages + GitHub Actions** 自动化部署与**自定义域名**支持。

<!-- more -->

---

## 🚀 常用操作指南

### 1. 本地启动与写作预览
在项目根目录下打开终端，执行以下命令即可启动本地预览：

```bash
npm run server
```
打开浏览器访问 [http://localhost:4000](http://localhost:4000) 即可实时查看博客效果，修改文件后页面会自动刷新。

### 2. 创建一篇新文章
使用以下命令创建新的 Markdown 文章：

```bash
npx hexo new "我的第二篇博客"
```
新文章将保存在 `source/_posts/我的第二篇博客.md`。

文章开头支持 YAML 格式的 Front-matter 元数据：
```yaml
---
title: 文章标题
date: 2026-09-20 12:00:00
tags:
  - 标签1
  - 标签2
categories:
  - 分类名称
---
这里是正文...
```

---

## 🌐 绑定你自己的自定义域名

如果你拥有自己的独立域名（如 `yourdomain.com` 或 `blog.yourdomain.com`）：

1. **修改配置文件**：
   - 打开根目录下的 `_config.yml`，将 `url:` 改为你的真实域名（例如 `https://blog.yourdomain.com`）。
   - 打开 `source/CNAME` 文件，将里面的内容替换为你的域名（例如 `blog.yourdomain.com`，不要带 `https://`）。
2. **在域名解析后台添加 DNS 记录**：
   - **如果是二级域名（推荐，如 `blog.yourdomain.com`）**：
     - 添加一条 `CNAME` 记录，主机记录为 `blog`，记录值为 `<你的GitHub用户名>.github.io`。
   - **如果是顶级根域名（如 `yourdomain.com`）**：
     - 添加 4 条 `A` 记录，主机记录为 `@`，记录值分别为：
       - `185.199.108.153`
       - `185.199.109.153`
       - `185.199.110.153`
       - `185.199.111.153`
3. **在 GitHub 开启 HTTPS 强制跳转**：
   - 推送代码到 GitHub 后，进入仓库的 **Settings** -> **Pages**。
   - 确认 **Custom domain** 显示你的域名，并勾选 **Enforce HTTPS**（GitHub 会自动为你申请免费 SSL 证书）。

---

## 🤖 自动化部署说明（GitHub Actions）

本项目已为你配置了 `.github/workflows/deploy.yml` 自动化工作流：
- 你每次只需在本地完成写作后，将源码通过 `git push` 推送到 GitHub 仓库的 `main` 分支。
- GitHub Actions 会在云端自动安装依赖、编译生成静态文件并秒级发布到 GitHub Pages。
- 你无需在本地手动执行打包上传，换一台电脑也能随时随地写文章！
