# Collection App

6-oy loyihasi — shaxsiy kolleksiya ilovasi.

## Tuzilishi

- `backend/` — Express + Prisma + Clerk backend
- `frontend/` — Vite + React + Tailwind + Clerk frontend

## Kitob muqovasini yuklash

Kitobni tahrirlash oynasida muqovani JPG, PNG yoki WebP fayl sifatida (5 MB gacha)
yuklash yoki rasm URL manzilini kiritish mumkin. Cloudinary sozlanmagan bo‘lsa
yoki unga yuklash muvaffaqiyatsiz tugasa, rasm `backend/uploads/book-covers/`
papkasida saqlanadi va backend orqali ko‘rsatiladi.

Cloudinary'dan foydalanmoqchi bo‘lsangiz, `CLOUDINARY_URL` yoki `CLOUD_NAME`,
`CLOUD_API_KEY`, `CLOUD_API_SECRET` qiymatlarini `backend/.env` ga kiriting.
Maxfiy qiymatlarni repoga qo‘shmang. O‘z serveringizda joylashtirganda lokal
rasmlar saqlanib qolishi uchun `backend/uploads/` papkasiga doimiy disk biriktiring.

Rasm yuklashda JPG, PNG yoki WebP fayllari 5 MB gacha qabul qilinadi.

## Kitobxonlar platformasi

- `/discover` — ommaga ulashilgan kitoblarni qidirish.
- `/recommendations` — yoqtirgan janrlarni tanlab, ko‘p ko‘rilgan va sharhlangan
  kitoblarni topish.
- `/community` — kitobxon profilini ixtiyoriy ochish, hamroh izlash, o‘qish
  guruhi yaratish va guruhlarga qo‘shilish.
- `/chat` — faqat qo‘shilgan hamrohlar va a’zo bo‘lgan guruhlar bilan xabar
  almashish.
- `/book/:id` — ommaga ulashilgan kitob sahifasi, sharhlar, kitobga tegishli
  postlar kanali va mavjud bo‘lsa ochiq manbadagi PDF havolasi.

Kitoblar dastlab shaxsiy saqlanadi. “Ulashish” tugmasi kitobni ommaviy qiladi va
ulashish havolasini beradi. Yangi kitob uchun ochiq manbadagi PDF URL hamda
public domain/ochiq litsenziya bo‘yicha tasdiq majburiy. Sayt litsenziyani
avtomatik tekshirmaydi; foydalanuvchi manbani tekshirib tasdiqlashi kerak.
Ko‘rishlar soni ochiq kitob sahifasi ochilganda, sharhlar esa tizimga kirgan
kitobxon tomonidan yozilganda yangilanadi. Har bir ochiq kitobning o‘z kanalida
tizimga kirgan istalgan foydalanuvchi fikr yoki kitobdan parcha
ulashishi, sahifa yoki bobni ko‘rsatishi mumkin.

Hamroh izlash uchun foydalanuvchi tugmani bosib, o‘z kutubxonasidan kitob tanlaydi.
Shu kitobga qiziqqan o‘quvchi bilan hamroh bo‘linganda, unga bildirishnoma yuboriladi.
Guruhga yangi a'zo qo‘shilganda, guruh egasiga bildirishnoma boradi. Navbar'dagi bildirishnomalar har 15 soniyada yangilanadi. Chat xabarlari har
5 soniyada yangilanadi; hozircha real vaqtli socket ulanishi ishlatilmaydi.
Kitob tafsilotlarini ommaga ulashilgan sahifada hamma, shaxsiy kitob egasi esa
faqat tizimga kirgandan keyin ko‘radi. Kitob sahifasining ko‘rishlari va
“Kitobni o‘qish” havolasi bosilgan son alohida hisoblanadi.

Guruhni faqat uning egasi tahrirlashi yoki o‘chirishi mumkin. Guruh o‘chirilganda
uning chat xabarlari ham o‘chadi. Chat xabarini faqat uni yuborgan foydalanuvchi
tahrirlashi yoki o‘chirishi mumkin.