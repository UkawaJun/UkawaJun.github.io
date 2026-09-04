---
id: uj-mouse
title: UJMouse：不用贝塞尔曲线的类人鼠标轨迹
role: 个人实践 / 算法实现
period: 2025.07 — 2025.11
tags: Python | 轨迹混合 | 人机交互
category: research
keywords: 鼠标轨迹 | 凸组合 | 无训练 | 贝塞尔
github: https://github.com/UkawaJun/Algo-UJMouse
summary: 不走贝塞尔，也不训练模型。随机抽三条手录轨迹加权混合，再拉到目标。调用 Move(x, y)。
images: assets/projects/ujmouse/bezier-vs-ujmouse.png | 左下到右上，各跑 5 次。左：贝塞尔；右：UJMouse。
---

- 项目介绍：独立写了一个类人鼠标移动库。仓库里有 402 条自己手录的轨迹（每条 19 个点）。每次移动随机抽 3 条，权重加起来为 1，逐点混合后再按目标方向和距离拉开。对外就一个接口：Move(x, y)。
- 做法：普通模式沿混合轨迹减速到位。打开 IterMode 后，长距离会在中段递归补点，偶尔被方差大的段带偏，再拐回来。轨迹加密存在 json 里，只在内存解密。
- 说明：仅保证单次移动在视觉上接近真人轨迹，不声称可绕过工业风控。数据来自同一记录者。2025 年 7 月至 11 月完成的练习模块。

---
id: square-diff
title: SquareDiff：O(√N) 求解 C = a² − b²
role: 个人实践 / 算法推导
period: 2025.07
tags: Python | 数论 | 图解
category: research
keywords: 平方差 | 因数分解 | 对勾函数 | O(√N)
github: https://github.com/UkawaJun/Algo-Fast-SquareDiff-Solve
summary: 本项目基于图解分析，将 C = a² − b² 的搜索上界约束在 √C，复杂度 O(√N)。
images: assets/projects/squarediff/intro.png | 仓库简介截图。时间复杂度 O(√N)，上界由对勾函数给出。
---

- 项目介绍：本项目求解满足 C = a² − b² 的全部正整数对 (a, b)。方法源于对函数曲线与数表的观察，而非标准因式分解流程。令 i = a − b，由观察得到 a = ½(i + C/i)。i 从 1 遍历至 √C，若 a 为整数则 b = a − i。
- 做法：代入得 b = ½(C/i − i)。当 i > √C 时，对勾函数越过零点，b 为负，正整数解不成立。因此遍历至 √C 即可覆盖全部正解，时间复杂度为 O(√N)。
- 说明：该问题与整数分解等价。Pollard's Rho、二次筛与 Shor 算法具有更低复杂度。本实现给出确定的代数上界。配图暂用仓库简介，正式图后续替换。

---
id: thesis-illicium
title: 八角茴香黄酮抗胃癌：网络药理学与分子对接
role: 本科毕业论文
period: 2025.03 — 2025.07
tags: 网络药理学 | 分子对接 | PyMOL
awards: 成绩 90.5 | 专业排名第三 | 优秀毕业论文
category: research
keywords: 八角茴香 | 黄酮类化合物 | 胃癌 | 网络药理学 | 分子对接
github: https://github.com/UkawaJun/replace-me-thesis
summary: 用网络药理学和分子对接，分析八角茴香黄酮对胃癌靶点的协同作用。成绩 90.5，专业第三。
images: assets/projects/thesis/ppi.png | 核心靶点 PPI 网络。AKT1、TP53、EGFR 等为枢纽节点。
---

- 项目介绍：八角茴香中槲皮素、木犀草素、山奈酚等黄酮有抗胃癌相关报道，物质基础尚不明确。本研究用网络药理学把候选成分与胃癌靶点接到同一张网络上，再用分子对接查看结合情况。
- 主要工作：TCMSP 筛选三种关键黄酮；多库挖掘靶点，与胃癌靶点取交得到 243 个交集靶点；STRING 构建 PPI，Cytoscape 得到 7 个核心靶点，富集与 PI3K-Akt 等通路相关；对 AKT1、TP53 做分子对接，PyMOL 观察山奈酚与 AKT1 的结合姿态。
- 结果：毕业论文成绩 90.5，专业排名第三，获优秀毕业论文。

---
id: vertex-bezier
title: Vertex-Bezier：GPU 实时体积曲线映射
role: 个人实践 / 图形学
period: 2024.05 — 2024.06
tags: HLSL | 顶点着色器 | IdeaXR | 贝塞尔
category: research
keywords: 顶点着色器 | 体积曲线 | 局部标架 | VR
github: https://github.com/UkawaJun/Algo-RealTime-VolumetricCurve-Mapping
demo: https://www.bilibili.com/video/BV1YZ421T71J/
summary: 本项目在 GPU 顶点着色器中，将立方体沿贝塞尔路径挤压扭转，生成具有体积的动态曲线几何。
images: assets/projects/vertex-bezier/scene.png | IdeaXR 场景。跳绳、牛角管等体积曲线由顶点着色器沿贝塞尔路径生成。
---

- 项目介绍：本项目基于 IdeaXR（Godot）与 HLSL 顶点着色器，将标准立方体沿贝塞尔曲线实时挤压与扭转，用以在 VR 中呈现跳绳、牛角管等具有体积感的曲线几何。几何变换在 GPU 完成，CPU 仅传递 3–4 个控制点，以避免逐帧由 CPU 生成网格并回传显存所造成的掉帧。
- 做法：沿曲线路径以参数 t 调节截面粗细；以二次叉乘构建局部坐标系，使横截面在扭转时保持定向。二次贝塞尔路径下表现稳定。
- 说明：三次贝塞尔下局部标架仍会出现跳变。后续拟以 Parallel Transport Frame 替换当前叉乘方案。2024 年 5 月 28 日至 6 月 1 日完成。

---
id: mine-rover
title: 基于 OpenGL 的矿井巷道三维重建探测车
role: 科研项目 / 竞赛负责人
period: 2024
tags: OpenGL | Arduino | Python
awards: 河南省高等学校物联网设计大赛一等奖 | 挑战杯省级一等奖（科技 A 类）
category: practice
github: https://github.com/UkawaJun/replace-me-mine-rover
summary: Arduino + OpenGL 超声波探测车。球面采样、卷积去噪，深度数据实时画成三维曲面。
---

- 核心工作：基于 Arduino、Python、OpenGL，实现一种 X-Y 坐标系均匀采样的球面曲面探测：超声波采集深度，串口回传 PC，渲染为带 XYZ 深度色阶的三维模型。针对噪点，软件侧用卷积核做矩阵去噪，硬件侧做稳定测距；调试阶段用蓝牙控制车辆。采集到渲染整条链路由本人完成。
- 成果：河南省高等学校物联网设计大赛省级一等奖；挑战杯省级一等奖（科技 A 类）。

---
id: vr-mechanic
title: VR 机械师 · 轴系结构拆装虚拟仿真
role: 项目 / 竞赛负责人
period: 2024.06 — 2024.12
tags: IdeaXR | Blender | Substance 3D Painter
awards: 全国三维数字化创新设计大赛省特等奖 | 国家三等奖（龙鼎奖） | 挑战杯省级三等奖（科技 B 类）
category: practice
github: https://github.com/UkawaJun/replace-me-vr-mechanic
demo: https://3dshow.3ddl.net/app/ffdjhh
summary: 轴系拆装虚拟仿真，PC / VR 双端。六个版本，100 余件零件，约 30 个关卡，已在校实验室使用。
---

- 研发内容：使用 IdeaXR 构建轴系拆装系统，设计「看—学—练—考」教学流程，支持 PC 与 VR，已在校实验室上课。本人负责 100 余件机械零件的模型修正（拓扑布线、PBR），以及约 30 个关卡开发和 VR 调试，项目共迭代 6 个版本。
- 成果：挑战杯省级三等奖（科技 B 类）；全国三维数字化创新设计大赛省特等奖、国家三等奖（龙鼎奖）。
