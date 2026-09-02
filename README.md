# 刘政远履历站 · GitHub Pages

把**这个压缩包里的全部文件**放到仓库 **根目录**（不要多套一层文件夹）。

仓库名必须是：

```
你的用户名.github.io
```

例如 `UukawaJun.github.io` → 打开 [https://UkawaJun.github.io](https://UukawaJun.github.io)

## 第一次上传

1. 在 GitHub 新建公开仓库 `UukawaJun.github.io`（用户名换成你的）。
2. 解压本压缩包。你应该能直接看到 `index.html`、`content/`、`assets/`。
3. 把这些文件全部提交并推到 `main` 分支。
4. 仓库 Settings → Pages：Source 选 `main` / `(root)`。等一两分钟。

若解压后多了一层文件夹，把里面的文件移到仓库根目录。

## 以后改字改项目

**不用改代码。** 打开 `content/`：

| 文件 | 对应页面 |
|---|---|
| `zh/profile.md` | 简介（姓名、摘要、证书也在 `certificates.md`） |
| `zh/education.md` | 教育经历 |
| `zh/work.md` | 工作实习 |
| `zh/projects.md` | 个人项目 |
| `zh/publications.md` | 出版 |
| `zh/honors.md` | 荣誉奖项 |
| `zh/journal.md` | 日志 |
| `zh/certificates.md` | 技能证书 |

英文、日文同样在 `en/`、`ja/`。三语都要改才齐。

每条记录都是：

```markdown
---
id: my-project
title: 标题
role: 角色
period: 2025.03 — 2025.07
tags: Python | OpenGL
github: https://github.com/你/仓库
images: assets/projects/xxx.png | 图注
---

这里写介绍，可用 Markdown。

- 要点一
- 要点二
```

新项目：在 `projects.md` **末尾再贴一组** `---` 即可。图片放到 `assets/` 里，路径写成 `assets/...`。

改完 → commit → push → 一两分钟后全网看到。

## 页面上的「编辑入口」

访客改不了。连续按 **U K W U K J** 才出现右下角入口。

保存会 **写回这个 GitHub 仓库**，所以必须登录 GitHub（用 Token）：

1. GitHub → Settings → Developer settings → Personal access tokens
2. 建 Fine-grained token，只授权这个仓库，Permissions → **Contents: Read and write**
3. 把 token 贴进编辑页。Token 只留在当前浏览器，不会写进网页文件。

`config.json` 里是仓库地址，若用户名或仓库名不同，改这里：

```json
{
  "github": {
    "owner": "UukawaJun",
    "repo": "UukawaJun.github.io",
    "branch": "main"
  }
}
```

不要删仓库根目录的 `.nojekyll`。有它 GitHub 才不会用 Jekyll 把 `content/*.md` 编译掉，页面才能读到原始 Markdown。

没有 Token 时，请直接在 GitHub 网页改 Markdown，效果一样。
