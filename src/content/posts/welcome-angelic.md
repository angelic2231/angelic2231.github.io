---
title: 欢迎来到 Angelic 的全新现代化博客！
published: 2026-09-20
description: 基于 Astro + Fuwari 打造的现代极简毛玻璃独立博客，支持全站亚克力磨砂质感、代码高亮与丝滑过渡。
tags: [Astro, Fuwari, 毛玻璃, 博客搭建, Java]
category: 博客指南
draft: false
---

欢迎来到我的个人独立博客！本站现已全新升级至 **Astro** 静态站点框架，并采用了备受赞誉的 **Fuwari** 现代磨砂毛玻璃主题。

无论是全站半透明的卡片悬浮投影、自适应深色/浅色模式平滑切换，还是极致轻量的打包体积，都让整个博客焕然一新！

---

## 🎨 为什么选择 Astro + Fuwari？

- **高级毛玻璃美学（Glassmorphism）**：
  组件全部基于 Tailwind CSS 和 `backdrop-filter: blur()`，打造通透温润的亚克力质感。
- **极致的性能体验**：
  基于 Astro 孤岛架构与 Vite，默认打包接近 0kb JavaScript，秒级打开，无需漫长等待。
- **专为开发者打造的代码块**：
  内置 Expressive Code，支持行号高亮、代码折叠、文件类型角标与一键复制功能。

例如一段经典的 Java 代码：

```java title="HelloAngelic.java" {5-7}
package com.angelic.blog;

public class HelloAngelic {
    public static void main(String[] args) {
        // 欢迎访问我的独立博客
        String domain = "https://angelic.today";
        System.out.println("Welcome to " + domain + "!");
    }
}
```

---

## ✍️ 日常写作指南

在 WebStorm 里写文章非常简单：

1. **新建文章**：
   在 `src/content/posts/` 目录下新建 `.md` 文件。
2. **填写文章元信息**：
   ```yaml
   ---
   title: 文章标题
   published: 2026-09-20
   description: 文章简要描述
   tags: [标签1, 标签2]
   category: 分类名称
   draft: false
   ---
   ```
3. **推送到线上**：
   在 WebStorm 里点击 **Commit & Push**，GitHub Actions 会在云端全自动构建发布，1 分钟内即可在全球通过 **[https://angelic.today](https://angelic.today)** 访问到最新内容！
