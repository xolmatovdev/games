# 🎮 Tank 1990 — Battle City (Full Screen Arcade Edition)

Klassik **Dendy / NES Tank 1990 (Battle City)** o'yinining JavaScript va HTML5 Canvas yordamida noldan yaratilgan to'liq ekranli (**Full Screen Arcade**) talqini.

O'yin hech qanday tashqi kutubxona yoki og'ir freymvorklarsiz, 100% toza Vanilla JavaScript va Web Audio API asosida ishlaydi.

---

## 🚀 Qanday ishga tushiriladi?

Hech qanday o'rnatish (`npm`, `node` va h.k.) talab qilinmaydi!
Shunchaki papkadagi **`index.html`** faylini istalgan brauzerda (Chrome, Edge, Firefox, Safari yoki mobil brauzerda) oching.

---

## 🕹️ Boshqaruv tugmalari

### 💻 Kompyuter (Klaviatura):
- **Harakatlanish:** `W`, `A`, `S`, `D` yoki Strelkalar (`↑`, `←`, `↓`, `→`)
- **O'q uzish:** `Space` (Bo'sh joy) yoki `J` / `Z`
- **Boshlash (Start):** `Enter` yoki `Space`
- **Bosqichni tanlash:** Bosh menyuda `S` yoki `Tab`
- **Pauza:** `P` yoki `Esc`
- **Ovozni yoqish / o'chirish:** `M`
- **To'liq ekran (Fullscreen):** `F` yoki `F11`

### 📱 Telefon va Sensorli ekran (Touch Controls):
- **🎮 Sensor tugmalar:** Yuqori paneldagi "Sensor" tugmasi orqali ekran tugmalarini yoqish/o'chirish mumkin (mobil qurilmalarda avtomatik ko'rinadi).
- **D-Pad (Krestovina):** Yuqoriga, Pastga, Chapga, O'ngga
- **A / B / X / Y tugmalari:** O't ochish va turbo o'qlar
- **START:** O'yinni boshlash / Pauza
- **SELECT:** Bosqichni almashtirish
- **⛶ To'liq ekran:** Butun displey bo'ylab to'liq ekran rejimiga o'tish

---

## 🌟 O'yin xususiyatlari

1. **To'liq Ekran Arkada Displeyi (Full Screen Arcade):**
   - Katta ekran bo'ylab maksimal kattalashuvchi piksel-aniq Canvas (aspect ratio: 480:416).
   - Haqiqiy brauzer Fullscreen API qo'llab-quvvatlovi (`F` tugmasi).
   - CRT Scanlines va retro nur effekti.
2. **Retro 8-bit Audio Sintezatori (Web Audio API):**
   - O'q otish, devorlarga urilish, metall aks-sadosi, tank portlashlari, dvigatel shovqini va afsonaviy Dendy musiqalari real vaqt rejimida brauzerning o'zida sintez qilinadi (tashqi audio fayllar kerak emas).
3. **Klassik xaritalar va to'siqlar:**
   - 🧱 **G'isht devor:** O'qlar bilan bosqichma-bosqich buziladi.
   - 🛡️ **Po'lat devor:** Oddiy o'qlar qaytadi, faqat 4-darajali tank teshib o'ta oladi.
   - 🌲 **O'rmon / Daraxtlar:** Tanklar daraxtlar ostida yashirinib o'tishi mumkin.
   - 🌊 **Suv:** O'qlar suv ustidan uchib o'tadi, lekin tanklar kesib o'tolmaydi.
   - ❄️ **Muz:** Tankning harakatlanishida sirpanish effekti.
   - 🦅 **Shtab (Qal'a burguti):** O'z shtabingizni asrang! Agar dushman o'qi burgutga tegsa — o'yin tugaydi.
4. **Dushman tanklari va Sun'iy Intellekt (AI):**
   - ⚪ **Oddiy tank (Basic):** 100 ball, standart tezlik.
   - 🔵 **Tezkor tank (Fast Scout):** 200 ball, yuqori manyovr.
   - 🟡 **Kuchli to'pli tank (Power Tank):** 300 ball, juda tezkor o'qlar.
   - 🟢 **Og'ir zirhli tank (Armor Tank):** 400 ball, 4 marta o'q tegishi kerak (zarar ko'rgan sari rangi o'zgaradi).
   - 🔴 **Bonus tashuvchi dushmanlar:** Qizil miltillovchi tanklar yo'q qilinganda maydonga tasodifiy super-bonus tashlaydi.
5. **Klassik bonuslar (Power-ups):**
   - ⭐ **Yulduzcha (Star):** Tank darajasini oshiradi (2 ta o'q, yuqori tezlik, temir devorlarni buzish).
   - 🛡️ **Qalqon (Helmet):** 10 soniyalik daxlsizlik nuri.
   - ⏱️ **Soat (Clock):** Barcha dushmanlarni 10 soniyaga muzlatadi.
   - 💣 **Granata (Bomb):** Ekranda turgan barcha dushmanlarni bir zumda yo'q qiladi.
   - ⛏️ **Kurak (Shovel):** Shtab atrofiga vaqtincha mustahkam po'lat devor tortadi.
   - 🪖 **Tank (1-UP):** Qo'shimcha hayot (jon).
   - 🔫 **Qurol (Gun):** Tankni birdaniga eng yuqori darajaga olib chiqadi.
6. **Natijalar jadvali va Bosqichlar (Stage Clear Tally):**
   - Har bir bosqich yakunida yo'q qilingan dushman tanklari soni va to'plangan ballar retro hisoblagich bilan ko'rsatiladi.
   - Rekord (High Score) brauzer xotirasida (`localStorage`) saqlanib qoladi.
