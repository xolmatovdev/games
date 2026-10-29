# 🎮 Tetris Pro (HTML5 & JavaScript)

Zamonaviy retro-neon dizayndagi, hech qanday qo'shimcha kutubxonalarsiz (Pure JavaScript, HTML5 Canvas va CSS3) yaratilgan klassik Tetris o'yini.

---

## ✨ Imkoniyatlar va Xususiyatlar

- **Klassik Tetris mexanikasi**: 7 xil rasmiy tetromino (I, J, L, O, S, T, Z) va 7-bag random generator (barcha figuralar teng taqsimlanadi).
- **SRS Wall-Kick aylantirish**: Figuralar devorga yoki boshqa bloklarga yaqin turganda ham qulay aylanadi.
- **Ghost Piece (Soya)**: Figura qayerga tushishini oldindan ko'rsatib turuvchi soya konturi.
- **Hold (Zaxiraga olish)**: Kerakli figurani `C` yoki `Shift` tugmasi orqali vaqtincha saqlab turish imkoniyati.
- **Next Preview**: Navbatdagi figurani oldindan ko'rish.
- **8-Bit Retrosound (Web Audio API)**: Hech qanday mp3 yoki tashqi fayllarsiz toza JavaScript orqali hosil qilingan tovush effektlari (harakat, burish, qator o'chirish, tetris va o'yin tugashi).
- **Zarralar (Particle FX)**: Qatorlar o'chirilganda chiroyli neon portlash effekti.
- **Bosqichlar va Tezlashuv**: Har 10 ta qator o'chirilganda yangi bosqichga o'tadi va o'yin tezlashadi.
- **High Score (Rekord)**: Eng yuqori ball `localStorage` da saqlanadi.
- **Moslashuvchan (Responsive) & Mobil sensor boshqaruvi**: Telefon va planshetlarda o'ynash uchun ekran tugmalari mavjud.

---

## 🕹️ Boshqaruv tugmalari

| Tugma | Harakat |
|---|---|
| ⬅️ yoki `A` | Chapga siljitish |
| ➡️ yoki `D` | O'ngga siljitish |
| ⬆️ yoki `W` | Soat mili bo'yicha aylantirish |
| ⬇️ yoki `S` | Sekin tushirish (Soft Drop, +1 ball) |
| `Space` | Birdaniga tushirish (Hard Drop, +2 ball) |
| `C` yoki `Shift` | Hold (Figurani saqlash / almashtirish) |
| `P` yoki `Esc` | O'yinni to'xtatish (Pause / Resume) |

---

## 🚀 Qanday ishga tushiriladi?

Faylni to'g'ridan-to'g'ri istalgan zamonaviy brauzerda (Chrome, Edge, Firefox, Safari) ochishingiz mumkin:

1. `index.html` faylini ikki marta bosing yoki brauzerga sudrab tashlang.
2. Yoki VS Code / Live Server orqali oching.
