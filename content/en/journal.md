---
id: j-sennpai
date: 2026-06
title: Left SennPAI, back to Changchun for the graduate exam
---

From February to June I worked remotely with UTokyo’s SennPAI team on materials for Japan’s master’s exams. The product recommends schools, advisors, and past papers. I did not touch the front end; I ran the backend data.

We started with hand curation. Direct LLM scraping leaked and misread pages. I turned each university site into a graph — pages, buttons, and links as nodes — walked it depth-first, and filled a table of majors × dates / exam rules / fees / foreigner policy. The model scored node summaries and we pruned the rest. A structure tree sat in the cloud; daily checks used Selenium only, and the agent patched nodes that had changed. About 860 schools: first crawl a few hundred yuan; later 0.2–0.3 yuan a day, one yuan at the high end.

I left in June for the exam. Graph modelling and the keyword lists cost more than the model. Once a site goes deep, cache and money both fail first — more engineering than algorithm.

![Structure modelling inside university sites](/assets/work/sennpai-tree-overview.png)

---
id: j-books
date: 2025-11
title: Book-screener for the Zhengzhou ecommerce desk, delivered
---

Project: I built a Requests / Selenium crawler that screens Duozhuayu and Kongfuzi Old Book for titles with sales and margin, then buys or flags them. After several delivery rounds it supports multi-instance runs, encrypted storage, and anti-bot handling.

Result: time per book from about 12 s by hand to about 6 s. The client went from three people screening by hand to twenty-odd people running the tool on multiple machines.

This round ran July to November. Requirements moved more than once. What we handed over was no longer the first one-pass script.

---
id: j-squarediff
date: 2025-07
title: SquareDiff, O(√N) for a square difference
---

This project finds all positive integer pairs (a, b) for C = a² − b², with the search bound taken from graphical analysis of the check-mark function. Set i = a − b, a = ½(i + C/i), iterate i to √C; beyond that bound b is negative. Time complexity O(√N).

Equivalent to integer factorisation. Repository: Algo-Fast-SquareDiff-Solve.

---
id: j-jlpt
date: 2025-07
title: JLPT N2, 91
---

I started Japanese from zero in January, sat JLPT N2 in July, and passed with 91 (CEFR B1+).

Vocabulary and grammar were daily work for half a year. Listening was tighter than reading. The paper met the pass line. That half year of Japanese sat under the later Tokyo internship and the exam-materials work.

---
id: j-thesis
date: 2025-07
title: Thesis done: 90.5, third in the major
---

March to July, undergraduate thesis: flavonoids in star anise against gastric-cancer targets. Quercetin, luteolin, and kaempferol are reported in the literature; the material basis is not clear.

Method: network pharmacology plus docking. TCMSP for three flavonoids; multi-database targets intersected with gastric cancer — 243 shared targets. STRING for PPI, Cytoscape down to seven hubs, enrichment mainly on PI3K-Akt. Kaempferol docked to AKT1 and TP53; PyMOL for the pose.

At the defence I put the PPI network on the wall. Score 90.5, third in the major, outstanding thesis. First time I finished a pharmacology-and-graph piece properly, coming from chemistry.

![Core-target PPI network](/assets/projects/thesis/ppi.png)

---
id: j-3dv5
date: 2024-12
title: Passed the 3DV5 exam and received the certificate
---

A year of 3D work in the lab, so I sat 3DV5 and passed. Under the national 3D capability scheme I received Senior 3D Data Engineer, attesting SolidWorks modelling. Issued by the National Manufacturing Informatization Training Center, the 3D certification office, and the national 3D training alliance.

The paper was not the point. VR Mechanic and the mine rover were both wrapping up; modelling, topology, and PBR were daily. The exam was a check on that year’s hands.

---
id: j-mcm-24
date: 2024-11
title: CUMCM the second time: the bench dragon
---

2024 CUMCM, problem A: the Fujian–Zhejiang New Year “bench dragon.” The head follows a spiral; position from arc-length integrals. The tail by bisection. For collisions each bench got its own frame, treated as a rigid body in graphics, cleaner than intersecting in the plane. Provincial first.

The year before, 2023, was a heliostat field. On site I swapped ray tracing for raymarching plus SDF and took provincial second. The graphics base is mostly Games 101. Same idea both times: if you can draw it, it tunes better than a formula alone.

---
id: j-sign
date: 2024-08
title: Sign-language recognition: provincial second, national second
---

A friend at a sign-language college recorded 0.5–2 s clips. OpenCV for hand landmarks; NumPy and Pandas for mirror, noise, and lighting; TensorFlow LSTM for continuous signs. I did the cleaning, visualisation, and parameter dumps.

Fast signs lag about 0.5–1 s. Not real-time perfect, but sequences track. Henan second; national second in August. Dirty data was harder than the model; labelling and alignment took the longest.

---
id: j-plant
date: 2024-08
title: A chemical plant, and a set of light switches
---

July–August, two hard-surface jobs. The plant from CAD: tanks and reactors in Blender — a 10TPD refinery and an oil press. Switches from orthographic photos to promo quality; Blender models, Unreal animation.

No contest noise on these two, but they forced clean sizes and topology. Some of the hand for the hundred-odd VR Mechanic parts came from here.

---
id: j-vertex-bezier
date: 2024-06
title: Vertex-Bezier: volumetric curves on the GPU
---

On IdeaXR with an HLSL vertex shader, cubes are extruded and twisted along Bézier paths to give volumetric curves in VR (jump ropes, horn tubes). The CPU sends control points only; transforms run on the GPU.

Quadratic paths are stable; cubic paths can still flip the local frame. Repository: Algo-RealTime-VolumetricCurve-Mapping.

---
id: j-houses
date: 2024-06
title: Fourteen house tours, plus a circuit sandbox
---

The lab team built fourteen VR house tours with lighting control. In parallel I used IdeaXR for a 3D digital/analog sandbox: AND/OR/NOT, custom modules, move, rotate, wire — planar and spatial circuits.

The tours were for display. The sandbox was for interaction: parts you can pick up and join, so the later VR Mechanic levels had somewhere to start.

---
id: j-epics
date: 2023-09
title: Engineering practice: fourth to third in the last five minutes
---

China Undergraduate Engineering Practice and Innovation contest, aircraft-design VR track. Four people on a rescue plan. I coded; Python classes wrapped the best route so the team stopped doing it by hand.

Five minutes before submit: fourth in the province to third. That year only three provincial firsts. Small team; the usable move was to freeze the calculation in advance, not flip formulas in the hall.
