const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const catalogUserId = "bookwork-public-catalog";

const books = [
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    type: "Badiiy adabiyot",
    description: "Muhabbat, oila va jamiyat haqidagi mashhur klassik roman.",
    language: "English",
    pages: "432",
  },
  {
    title: "Jane Eyre",
    author: "Charlotte Bronte",
    type: "Badiiy adabiyot",
    description: "Mustaqillik va muhabbat yo‘lini izlagan Jane Eyre hikoyasi.",
    language: "English",
    pages: "500",
  },
  {
    title: "Great Expectations",
    author: "Charles Dickens",
    type: "Badiiy adabiyot",
    description: "Pip ismli bolaning ulg‘ayishi va hayotdagi o‘rnini topishi haqida roman.",
    language: "English",
    pages: "544",
  },
  {
    title: "The Picture of Dorian Gray",
    author: "Oscar Wilde",
    type: "Badiiy adabiyot",
    description: "Go‘zallik, vijdon va tanlovlar oqibatlari haqida falsafiy roman.",
    language: "English",
    pages: "254",
  },
  {
    title: "The Adventures of Tom Sawyer",
    author: "Mark Twain",
    type: "Badiiy adabiyot",
    description: "Tom Sawyerning bolalik sarguzashtlari va do‘stligi haqida asar.",
    language: "English",
    pages: "274",
  },
  {
    title: "Treasure Island",
    author: "Robert Louis Stevenson",
    type: "Sarguzasht",
    description: "Jim Hawkins va xazina xaritasi ortidan boshlangan dengiz sarguzashti.",
    language: "English",
    pages: "292",
  },
  {
    title: "Around the World in Eighty Days",
    author: "Jules Verne",
    type: "Sarguzasht",
    description: "Phileas Foggning sakson kunda dunyoni aylanib chiqish poygasi.",
    language: "English",
    pages: "256",
  },
  {
    title: "The Three Musketeers",
    author: "Alexandre Dumas",
    type: "Sarguzasht",
    description: "D’Artagnan va mushketyorlarning do‘stlik hamda jasoratga boy hikoyasi.",
    language: "English",
    pages: "700",
  },
  {
    title: "King Solomon's Mines",
    author: "H. Rider Haggard",
    type: "Sarguzasht",
    description: "Afrika ichkarisidagi sirli xazina izidan kechgan ekspeditsiya.",
    language: "English",
    pages: "320",
  },
  {
    title: "The Call of the Wild",
    author: "Jack London",
    type: "Sarguzasht",
    description: "Buck ismli itning shimoliy tabiatdagi sinovlari va omon qolishi.",
    language: "English",
    pages: "172",
  },
  {
    title: "Frankenstein",
    author: "Mary Shelley",
    type: "Fantastika",
    description: "Olim yaratgan mavjudot va uning insoniyat bilan murakkab munosabati.",
    language: "English",
    pages: "280",
  },
  {
    title: "The Time Machine",
    author: "H. G. Wells",
    type: "Fantastika",
    description: "Vaqt mashinasida uzoq kelajakka sayohat qilgan ixtirochi hikoyasi.",
    language: "English",
    pages: "118",
  },
  {
    title: "The War of the Worlds",
    author: "H. G. Wells",
    type: "Fantastika",
    description: "Yerga kelgan marsliklar va insoniyatning omon qolish kurashi.",
    language: "English",
    pages: "287",
  },
  {
    title: "The Invisible Man",
    author: "H. G. Wells",
    type: "Fantastika",
    description: "Ko‘rinmaslik sirini topgan olimning kutilmagan oqibatlarga duch kelishi.",
    language: "English",
    pages: "190",
  },
  {
    title: "Twenty Thousand Leagues Under the Seas",
    author: "Jules Verne",
    type: "Fantastika",
    description: "Nautilus suvosti kemasida okean qa’riga qilingan ilmiy sayohat.",
    language: "English",
    pages: "496",
  },
  {
    title: "The Histories",
    author: "Herodotus",
    type: "Tarix",
    description: "Qadimgi xalqlar va yunon-fors urushlari haqida tarixiy manba.",
    language: "English",
    pages: "800",
  },
  {
    title: "The History of the Peloponnesian War",
    author: "Thucydides",
    type: "Tarix",
    description: "Afina va Sparta o‘rtasidagi urush hamda uning sabablari tahlili.",
    language: "English",
    pages: "600",
  },
  {
    title: "The Prince",
    author: "Niccolo Machiavelli",
    type: "Tarix",
    description: "Uyg‘onish davri siyosati va davlat boshqaruvi haqida risola.",
    language: "English",
    pages: "140",
  },
  {
    title: "The Art of War",
    author: "Sun Tzu",
    type: "Tarix",
    description: "Harbiy strategiya va rejalashtirishga oid qadimiy risola.",
    language: "English",
    pages: "120",
  },
  {
    title: "The Federalist Papers",
    author: "Alexander Hamilton, James Madison, John Jay",
    type: "Tarix",
    description: "AQSh konstitutsiyasi va davlat tuzilishi haqidagi tarixiy maqolalar.",
    language: "English",
    pages: "600",
  },
  {
    title: "On the Origin of Species",
    author: "Charles Darwin",
    type: "Ilm-fan",
    description: "Tabiiy tanlanish va turlar evolyutsiyasi nazariyasining bayoni.",
    language: "English",
    pages: "502",
  },
  {
    title: "The Voyage of the Beagle",
    author: "Charles Darwin",
    type: "Ilm-fan",
    description: "Darwinning tabiat kuzatuvlari va ilmiy safar xotiralari.",
    language: "English",
    pages: "500",
  },
  {
    title: "The Descent of Man",
    author: "Charles Darwin",
    type: "Ilm-fan",
    description: "Inson evolyutsiyasi va tabiiy tanlanish haqidagi ilmiy asar.",
    language: "English",
    pages: "700",
  },
  {
    title: "The Expression of the Emotions in Man and Animals",
    author: "Charles Darwin",
    type: "Ilm-fan",
    description: "Inson va hayvonlarda hissiyotlarning namoyon bo‘lishi bo‘yicha tadqiqot.",
    language: "English",
    pages: "374",
  },
  {
    title: "The Chemical History of a Candle",
    author: "Michael Faraday",
    type: "Ilm-fan",
    description: "Kundalik sham misolida kimyo va fizikani tushuntiruvchi ma’ruzalar.",
    language: "English",
    pages: "160",
  },
].map((book) => ({
  ...book,
  userId: catalogUserId,
  isPublic: true,
  licenseConfirmed: true,
  pdfUrl: null,
  imageUrl: null,
  status: "read",
  cost: "0",
  maslahatBeraman: true,
}));

async function main() {
  const existingBooks = await prisma.book.findMany({
    where: { userId: catalogUserId },
    select: { title: true },
  });
  const existingTitles = new Set(existingBooks.map(({ title }) => title));
  const newBooks = books.filter(({ title }) => !existingTitles.has(title));

  if (newBooks.length) {
    await prisma.book.createMany({ data: newBooks });
  }

  const counts = await prisma.book.groupBy({
    by: ["type"],
    where: { userId: catalogUserId },
    _count: { _all: true },
    orderBy: { type: "asc" },
  });

  console.log(
    `Katalog tayyor: ${newBooks.length} ta yangi kitob qo‘shildi. Janrlar:`,
    counts.map(({ type, _count }) => `${type}: ${_count._all}`).join(", "),
  );
}

main()
  .catch((error) => {
    console.error("Kitoblar katalogini to‘ldirib bo‘lmadi:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
