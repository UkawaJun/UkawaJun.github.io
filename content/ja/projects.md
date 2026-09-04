---
id: uj-mouse
title: UJMouse：ベジェ曲線を使わない人らしいマウス軌道
role: 個人実践 / アルゴリズム
period: 2025.07 — 2025.11
tags: Python | 軌道混合 | HCI
category: research
keywords: マウス軌道 | 凸結合 | 学習なし | ベジェ
github: https://github.com/UkawaJun/Algo-UJMouse
summary: ベジェも学習も使わない。手録の軌道を3本混ぜて目標へ伸ばす。Move(x, y) を呼ぶ。
images: assets/projects/ujmouse/bezier-vs-ujmouse.png | 左下から右上、各5回。左：ベジェ、右：UJMouse。
---

- 紹介：自分で書いた人らしいマウス移動のライブラリ。手録 402 本（各 19 点）。移動のたびに 3 本を乱択し、重みの和を 1 にして点ごとに混ぜ、目標の方向と距離で伸ばす。外向けのインタフェースは Move(x, y) だけ。
- やり方：通常は混合軌道のまま減速して着く。IterMode を入れると長い移動の途中を再帰で埋め、分散の大きい区間に引っ張られて戻ることがある。軌道は json に暗号化し、復号はメモリ内だけ。
- 注：一回の移動が人に見える、という範囲。工業的なボット対策は抜けない。データは一人分。2025 年 7–11 月に練習で作ったモジュール。

---
id: square-diff
title: SquareDiff：O(√N) で C = a² − b² を解く
role: 個人実践 / アルゴリズム導出
period: 2025.07
tags: Python | 数論 | 図解
category: research
keywords: 平方差 | 因数分解 | チェックマーク関数 | O(√N)
github: https://github.com/UkawaJun/Algo-Fast-SquareDiff-Solve
summary: 図解分析に基づき、C = a² − b² の探索上界を √C に抑え、計算量は O(√N)。
images: assets/projects/squarediff/intro.png | README の導入。計算量 O(√N)。上界はチェックマーク関数による。
---

- 紹介：本プロジェクトは C = a² − b² を満たす正の整数対 (a, b) をすべて求める。方法は関数曲線と数表の観察に基づき、標準的な因数分解の手順ではない。i = a − b と置き、観察から a = ½(i + C/i) を得る。i を 1 から √C まで走査し、a が整数なら b = a − i。
- やり方：代入して b = ½(C/i − i)。i > √C ではチェックマーク関数が零点を越え、b は負となり正の解は成立しない。したがって √C までの走査で正解を尽くし、計算量は O(√N)。
- 注：本問題は整数分解と等価である。Pollard's Rho、二次篩、Shor はより低い計算量を持つ。本実装は確定的な代数上界を与える。図は暫定の README 切り抜き。

---
id: thesis-illicium
title: 八角茴香フラボノイドの抗胃癌：ネットワーク薬理とドッキング
role: 学士論文
period: 2025.03 — 2025.07
tags: ネットワーク薬理 | ドッキング | PyMOL
awards: 90.5 | 専攻三位 | 優秀卒業論文
category: research
github: https://github.com/UkawaJun/replace-me-thesis
summary: ネットワーク薬理とドッキング。90.5 点、専攻三位。
images: assets/projects/thesis/ppi.png | コア標的の PPI
---

---
id: vertex-bezier
title: Vertex-Bezier：GPU による実時間の体積曲線マッピング
role: 個人実践 / グラフィックス
period: 2024.05 — 2024.06
tags: HLSL | 頂点シェーダ | IdeaXR | ベジェ
category: research
keywords: 頂点シェーダ | 体積曲線 | 局所フレーム | VR
github: https://github.com/UkawaJun/Algo-RealTime-VolumetricCurve-Mapping
demo: https://www.bilibili.com/video/BV1YZ421T71J/
summary: GPU の頂点シェーダで立方体をベジェ経路に沿って押し出し・ねじり、体積のある動的曲線を得る。
images: assets/projects/vertex-bezier/scene.png | IdeaXR のシーン。縄跳びや角管などの体積曲線は頂点シェーダがベジェ経路に沿って生成する。
---

- 紹介：本プロジェクトは IdeaXR（Godot）と HLSL 頂点シェーダにより、標準立方体をベジェ曲線に沿って実時間で押し出し・ねじり、VR 上で縄跳びや角管などの体積曲線を示す。変換は GPU 側、CPU は制御点 3–4 個のみを送り、毎フレームのメッシュ再生成と転送を避ける。
- やり方：経路パラメータ t で断面の太さを変える。二重の外積で局所座標を組み、ねじれても断面の向きを保つ。二次ベジェでは安定。
- 注：三次ベジェでは局所フレームの飛びが残る。現行の外積に代えて Parallel Transport Frame を導入する予定。2024 年 5 月 28 日–6 月 1 日に完成。

---
id: mine-rover
title: OpenGL による坑道三次元再構成探査車
role: 責任者
period: 2024
tags: OpenGL | Arduino | Python
awards: 河南省 IoT 一等 | 挑戦杯 省一等（A）
category: practice
github: https://github.com/UkawaJun/replace-me-mine-rover
summary: Arduino + OpenGL。超音波の深さを曲面にする。
---

---
id: vr-mechanic
title: VR 機械師 — 軸系分解組立
role: 責任者
period: 2024.06 — 2024.12
tags: IdeaXR | Blender
awards: 三次元大賽 省特等 | 国家三等（龍鼎） | 挑戦杯 省三等（B）
category: practice
github: https://github.com/UkawaJun/replace-me-vr-mechanic
demo: https://3dshow.3ddl.net/app/ffdjhh
summary: PC と VR。6 版、部品 100 超、約 30 レベル。研究室で使用。
---
