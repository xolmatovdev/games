# ⚡ Counter-Strike 1.6: Web Edition (de_dust2 HD) ⚡

Klassik afsonaviy **Counter-Strike 1.6** o'yinining brauzerda ishlovchi to'liq 3D First-Person Shooter (FPS) talqini. Yuqori aniqlikdagi (HD) renderlash, mukammallashtirilgan PBR materiallar, realistik qurol va personaj shakllari, sahro osmoni gumbazi (Sky Dome) hamda jangovar effektlar bilan ta'minlangan. O'yin hech qanday tashqi internet yoki og'ir kutubxonalarsiz, 100% mustaqil (offline) va tez ishlaydi!

---

## 🎨 Yangilangan grafik va vizual imkoniyatlar (HD & Precision)

- **Yuqori aniqlikdagi renderlash (High-DPI & ACES Filmic Tone Mapping):**
  - Qurilma ekraniga moslashuvchi yuqori piksel nisbati (Retina / 4K / Full HD da qirralar va chiziqlar kristaldek tiniq).
  - Kinematik yorug'lik va sRGB rang balansi, haqiqiy sahro quyoshi va yumshoq soyalar (PCF Soft Shadows).
- **Mukammal de_dust2 atmosferasi & Sky Dome:**
  - Quyosh nuri, tog'lar va shahar siluetiga ega 360° sahro osmoni gumbazi (Sky Dome).
  - Realistik qumtosh g'ishtlar (Sandstone Ashlar) va 3D relyefli bo'rtma xaritalar (Bump Maps).
  - Yog'och tolalari, burchak metall mustahkamlagichlari va stensillariga ega CS 1.6 yuk qutilari (Crates).
  - Ikkala tomonlama ochiladigan sanoat metall eshiklari (Double Doors) va xavfsizlik belgilari.
  - Sahro palmalari (Palm Trees), bozor soyabonlari (Market Awnings) va qizil yonuvchi bochkalar (Fuel Barrels).
- **Aniq va mukammal 3D qurol shakllari:**
  - 💥 **CV-47 (AK-47)** — egilgan 30 o'qli metall magazin, gaz trubkasi, 45° burchakli stvol kompensatori, yog'och stvol qoplamasi va priklad.
  - 🎯 **Maverick M4A1** — taktik A2 tutqichi va optik teshigi, yechiluvchi ovoz so'ndirgich (Suppressor), o'rnatma priklad va sovutgich qobirg'alari.
  - 🔭 **Magnum Sniper (AWP)** — yashil polimer L96 korpusi, bosh suyanchig'i, og'ir stvol tormozi hamda sozlash burama mexanizmlari bo'lgan haqiqiy snayper optikasi.
  - 🔫 **Desert Eagle .50 AE** — jilolangan kumush metall slayd, stvol toji, nishon pichog'i va teksturali tutqich.
  - 🔪 **Tactical Combat Knife** — po'lat dam, arra tishlari, qon oqish kanali (fuller) va taktik himoya gardasi.
  - 💣 **HE Grenade** — M26/Mk2 segmentli granata korpusi, himoya qadog'i va uzuk.
- **Taktik qo'lqoplar va ochiq barmoqlar:**
  - Jangovar zarba himoya qoplamalari (knuckle armor), mato yenglar va harakatga mos barmoqlar.
- **Mukammallashtirilgan personajlar (CT & T):**
  - **CT (Counter-Terrorist):** PASGT ballistik shlemi, ko'zoynak (Goggles), aloqa garniturasi (Headset), patron cho'ntaklari bo'lgan taktik zirhli nimcha (Chest Rig) va tizzakorlar (Knee pads).
  - **T (Terrorist):** Klassik oq/och niqob (Balaclava), qora quyosh ko'zoynaklari, kamuflyaj nimcha va harbiy kiyim.
  - Botlar qo'lida to'liq 3D qurollar hamda oyoq/qo'llarning tabiiy yurish animatsiyasi.
- **Realistik jangovar effektlar (VFX):**
  - 🌟 Otilgan o'qning oltin rangli lazer izlari (High-velocity Bullet Tracers).
  - 🟡 Avtomatdan uchib chiquvchi va yerda sakrovchi latun gilzalar (Brass Shell Casings).
  - 💥 Devor va to'siqlarga tekkan o'q teshiklari (3D Bullet Hole Decals) va uchqunlar.
  - 🔴 Qon sachrashi va yerda hosil bo'luvchi qon izlari (Blood Decals).
  - 🔭 Haqiqiy **Mil-Dot** snayper nishon to'ri (masofa o'lchash doiralari va nuqtalari bilan).

---

## 🎮 O'yinni ishga tushirish

O'yinni ishga tushirishning 3 xil oson usuli bor:

1. **Eng oson usul:** Papkadagi [run_game.bat](file:///C:/Users/User/Desktop/Gemini/cs/run_game.bat) faylini sichqoncha bilan ikki marta bosing.
2. **Brauzerda to'g'ridan-to'g'ri ochish:** [index.html](file:///C:/Users/User/Desktop/Gemini/cs/index.html) faylini istalgan brauzerda (Chrome, Edge, Opera, Firefox) oching.
3. **Mahalliy server orqali ochish:**
   ```bash
   python server.py
   ```
   Brauzeringizda avtomatik ravishda `http://localhost:8000/index.html` ochiladi.

---

## 🎯 Asosiy imkoniyatlar

- **Klassik de_dust2 xaritasi:**
  - Bombsite A (baland platforma va nishon belgilari)
  - Bombsite B (tunnel va himoyalangan zona)
  - Mid va qo'shaloq temir eshiklar (Double Doors)
  - Long A yo'lagi
  - CS 1.6 yog'och qutilari (Crates) va yashirinish joylari
- **Qurollar va animatsiyalar:**
  - 🔪 **Tactical Knife** (Pichoq) — yaqin masofadan kesish zarbasi
  - 🔫 **Desert Eagle (Deagle)** — yuqori zararli yarim-avtomat to'pponcha
  - 💥 **CV-47 (AK-47)** — kuchli va klassik o'q tarqalishi (recoil) bilan
  - 🎯 **Maverick M4A1** — aniq va tezkor shturm miltig'i
  - 🔭 **Magnum Sniper (AWP)** — o'ng tugma bilan 4x optik zum (zoom scope), 1 o'q bilan dushmanni yo'q qilish
  - 💣 **HE Grenade** — devorlardan sakrovchi va 2.2 soniyada portlovchi granata
- **Aqlli botlar (AI):**
  - Terroristlar va maxsus kuchlar (CT)
  - Xarita bo'ylab patrul, dushmanni ko'rish (Line-of-Sight) va oraliq masofadan otish
  - Boshga tegish (Headshot — 3.5x zarar) va tana zararlari
  - Qon sachrash va yiqilish fizikasi
- **Haqiqiy CS 1.6 interfeysi (HUD):**
  - Dinamik nishon (yurish va otishda kengayuvchi crosshair)
  - Mini-xarita / Radar (o'yinchi, do'stlar va aniqlangan dushmanlar)
  - Jon (+ 100), Bronjilet (🛡️ 100), Pul ($16000), Vaqt (⏱️) va O'q hisoblagichi
  - O'ng tomonda Killfeed (boshga tegish belgisi bilan)
  - [B] Quroldozlik do'koni (Buy menu)
  - [TAB] Natijalar jadvali (Scoreboard — CT vs T g'alabalari)
- **Web Audio API Ovoz tizimi:**
  - Barcha qurol o'qlari, qayta to'ldirish (reload), oyoq tovushlari, portlashlar, radio buyruqlar va "Headshot!" ovozlari real vaqt rejimida generatsiya qilinadi (tashqi mp3 fayllarsiz).

---

## ⌨️ Boshqaruv tugmalari

| Tugma | Vazifasi |
| :--- | :--- |
| **W, A, S, D** | Oldinga, orqaga, chapga, o'ngga harakat |
| **Sichqoncha** | Atrofga qarash (Pointer Lock) |
| **Sichqoncha chap tugmasi** | Otish / Hujum qilish |
| **Sichqoncha o'ng tugmasi** | AWP snayper zumini ochish / yopish |
| **Space (Probel)** | Sakrash |
| **Shift** | Sekin va ovozsiz yurish |
| **Ctrl** | O'tirish (Aniqlik oshadi) |
| **R** | O'qni qayta to'ldirish (Reload) |
| **1, 2, 3, 4** | Qurollarni almashtirish (1: Asosiy, 2: Pistolet, 3: Pichoq, 4: Grenada) |
| **B** | Quroldozlik do'koni (Buy Menu) |
| **TAB** | Jamoalar jadvali (Scoreboard) |
| **Space / Enter** | Halok bo'lganda raundni darhol qayta boshlash |
| **P / ESC** | Pauza va sozlamalar (Sezgirlik, ovoz, botlar soni) |

---

## 🛠️ Texnologiyalar

- **Three.js** — 3D renderlash, yorug'lik, soyalar va kameralar.
- **HTML5 Canvas Procedural Textures** — Quti, devor, yer va eshik teksturalari dasturiy generatsiya qilingan (CORS xatoligisiz to'liq oflayn ishlaydi).
- **Web Audio API** — Sintezlangan real vaqt ovoz effektlari.
- **Pointer Lock API** — Silliq sichqoncha boshqaruvi.
