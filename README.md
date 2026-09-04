# 刘政远履历站 · GitHub Pages

把压缩包里的文件放到仓库 **根目录**（能直接看到 `index.html`，不要多套一层 `site/`）。

仓库：[`UkawaJun/UkawaJun.github.io`](https://github.com/UkawaJun/UkawaJun.github.io)  
站点：https://UkawaJun.github.io

## 覆盖到已有仓库

1. 解压。根目录应有 `index.html`、`content/`、`assets/`、`.nojekyll`。
2. 用这些文件覆盖仓库根目录同名文件。不要删掉你仓库里其它自己加的文件。
3. **务必保留** 根目录的 `.nojekyll`（没有它，GitHub 会用 Jekyll 吃掉 `content/*.md`）。
4. 提交并推到 `main`。
5. Settings → Pages：Source 选 `main` / `(root)`。等一两分钟。

若解压后多了一层文件夹，把里面的文件移到仓库根。

## 以后改字

不用改代码。打开 `content/`：

| 文件 | 页面 |
|---|---|
| `zh/profile.md` | 简介 |
| `zh/education.md` | 教育 |
| `zh/work.md` | 工作实习 |
| `zh/projects.md` | 项目 |
| `zh/publications.md` | 出版 |
| `zh/honors.md` | 荣誉 |
| `zh/journal.md` | 日志 |
| `zh/featured.md` | 首页精选 |
| `zh/interests.md` | 研究兴趣 |
| `zh/certificates.md` | 技能证书 |
| `zh/course-certs.md` | 课程证书 |

英文、日文在 `en/`、`ja/`。三语都要改才齐。

每条记录：

```markdown
---
id: my-project
title: 标题
role: 角色
period: 2025.03 — 2025.07
category: research
github: https://github.com/UkawaJun/仓库名
images: assets/projects/xxx.png | 图注
---

介绍，可用 Markdown。
```

新项目：在 `projects.md` 再贴一组 `---`。图片放到 `assets/`，路径写成 `assets/...`。

改完 → commit → push → 一两分钟后全网看到。

## 页面上的编辑入口

访客改不了。连续按 **U K W U K J** 出现右下角入口。保存会写回本仓库，需要 Fine-grained token（只授权这个仓库，Contents: Read and write）。`config.json` 里已是 `UkawaJun / UkawaJun.github.io / main`。

没有 Token 时，直接在 GitHub 网页改 Markdown 即可。
