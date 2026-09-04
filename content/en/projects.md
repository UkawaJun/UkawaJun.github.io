---
id: uj-mouse
title: UJMouse: human-like mouse movement without Bézier curves
role: Personal practice / algorithm
period: 2025.07 — 2025.11
tags: Python | trajectory blend | HCI
category: research
keywords: mouse trajectory | convex combination | training-free | Bézier
github: https://github.com/UkawaJun/Algo-UJMouse
summary: No Bézier, no training. Blend three recorded trajectories and stretch them to the target. Call Move(x, y).
images: assets/projects/ujmouse/bezier-vs-ujmouse.png | Bottom-left to top-right, 5 runs each. Left: Bézier; right: UJMouse.
---

- Project: a human-like mouse library I wrote myself. 402 trajectories I recorded by hand (19 points each). Each move draws 3 at random, weights sum to 1, blends pointwise, then stretches to the target. Public API is Move(x, y).
- Method: normal mode follows the blend and slows at the end. IterMode fills long moves recursively, so the cursor sometimes wanders and comes back. Trajectories sit encrypted in json and decrypt only in memory.
- Note: one move can look human; it will not beat industrial anti-bot. All data is from one person. A practice module, Jul–Nov 2025.

---
id: square-diff
title: SquareDiff: O(√N) solver for C = a² − b²
role: Personal practice / derivation
period: 2025.07
tags: Python | number theory | graphs
category: research
keywords: square difference | factorization | check-mark function | O(√N)
github: https://github.com/UkawaJun/Algo-Fast-SquareDiff-Solve
summary: An O(√N) solver for C = a² − b². The search bound √C follows from graphical analysis of the check-mark function.
images: assets/projects/squarediff/intro.png | README intro. Time O(√N); the bound is given by the check-mark function.
---

- Project: this work finds all positive integer pairs (a, b) with C = a² − b². The method comes from graphical analysis of the curves and number tables, not from the usual factorisation pipeline. Set i = a − b; observation gives a = ½(i + C/i). Iterate i from 1 to √C; if a is an integer, b = a − i.
- Method: substitution yields b = ½(C/i − i). When i > √C the check-mark function crosses zero and b is negative, so no positive solution remains. Iterating to √C therefore covers every positive solution, in O(√N) time.
- Note: the problem is equivalent to integer factorisation. Pollard's Rho, the quadratic sieve, and Shor's algorithm have lower complexity. This implementation states a deterministic algebraic bound. The figure is a temporary README capture.

---
id: thesis-illicium
title: Star-anise flavonoids against gastric cancer: network pharmacology and docking
role: Undergraduate thesis
period: 2025.03 — 2025.07
tags: network pharmacology | docking | PyMOL
awards: 90.5 | third in the major | outstanding thesis
category: research
keywords: star anise | flavonoids | gastric cancer
github: https://github.com/UkawaJun/replace-me-thesis
summary: Network pharmacology and docking on star-anise flavonoids and gastric-cancer targets. 90.5, third in the major.
images: assets/projects/thesis/ppi.png | Core-target PPI network
---

- TCMSP for three flavonoids; 243 shared targets with gastric cancer; STRING + Cytoscape to seven hubs; docking AKT1 and TP53.

---
id: vertex-bezier
title: Vertex-Bezier: GPU volumetric curve mapping
role: Personal practice / graphics
period: 2024.05 — 2024.06
tags: HLSL | vertex shader | IdeaXR | Bézier
category: research
keywords: vertex shader | volumetric curve | local frame | VR
github: https://github.com/UkawaJun/Algo-RealTime-VolumetricCurve-Mapping
demo: https://www.bilibili.com/video/BV1YZ421T71J/
summary: Cubes are extruded and twisted along Bézier paths in a vertex shader, giving volumetric curves in real time.
images: assets/projects/vertex-bezier/scene.png | IdeaXR scene. Jump ropes and horn tubes are volumetric curves from the vertex shader.
---

- Project: on IdeaXR (Godot), an HLSL vertex shader extrudes and twists a unit cube along a Bézier path, so VR can show volumetric curves such as jump ropes and horn tubes. Transforms run on the GPU; the CPU sends only 3–4 control points, avoiding per-frame mesh rebuilds and uploads.
- Method: thickness varies with the curve parameter t. A local frame is built by two cross products so the cross-section keeps its orientation under twist. Quadratic Bézier paths are stable.
- Note: cubic paths can still flip the frame. Parallel Transport Frames are the planned replacement. Built 28 May–1 June 2024.

---
id: mine-rover
title: Mine-tunnel 3D recon rover in OpenGL
role: Lead
period: 2024
tags: OpenGL | Arduino | Python
awards: Henan IoT first | Challenge Cup provincial first (A)
category: practice
github: https://github.com/UkawaJun/replace-me-mine-rover
summary: Arduino + OpenGL ultrasound rover. Sphere sampling, convolution denoising, live 3D surface.
---

- Ultrasound depth over serial, OpenGL surface with XYZ colour. Convolution denoise on the software side.

---
id: vr-mechanic
title: VR Mechanic — shaft assembly trainer
role: Lead
period: 2024.06 — 2024.12
tags: IdeaXR | Blender | Substance 3D Painter
awards: 3D contest provincial special | national third (Longding) | Challenge Cup provincial third (B)
category: practice
github: https://github.com/UkawaJun/replace-me-vr-mechanic
demo: https://3dshow.3ddl.net/app/ffdjhh
summary: Shaft-assembly sim, PC and VR. Six versions, 100+ parts, ~30 levels, used in the lab.
---

- Look–learn–drill–test flow. Modelling, levels, VR debug.
