const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.book.deleteMany();
  await prisma.book.createMany({
    data: [
      {
        title: "Atomic habits",
        description:
          "It`s like th diemond for people who want to improve any habit!",
        imageUrl:
          "https://www.google.com/imgres?q=Atomic%20habits%20bok&imgurl=https%3A%2F%2Fm.media-amazon.com%2Fimages%2FI%2F8106lPWfXpL._AC_UF1000%2C1000_QL80_.jpg&imgrefurl=https%3A%2F%2Fwww.amazon.com%2FAtomic-Habits-Proven-Build-Break%2Fdp%2F0735211299&docid=6KofreUAPSQuIM&tbnid=9PN0RRTcV0TCLM&vet=12ahUKEwj3r6-RkZuXAxU1S_EDHa53PL0QnPAOegQIOhAA..i&w=663&h=1000&hcb=2&itg=1&ved=2ahUKEwj3r6-RkZuXAxU1S_EDHa53PL0QnPAOegQIOhAA",
        author: "Cal Newport",
        language: "English",
        // rating:      Int?
        userId: "userid test",
        type: "Self improvement",
        hooks: "Habit",
        pages: "300",
        maslahatBeraman: true,
        cost: "10",
      },
      {
        title: "Shum bola",
        description: "The story of the boy",
        imageUrl:
          "https://www.google.com/imgres?q=shum%20bola%20kitobi&imgurl=https%3A%2F%2Fasarlar-assets-prod.s3.eu-north-1.amazonaws.com%2Fcovers%2Fmedium%2Fshum-bola_69b7ed5a7a5c8_1773661530.webp&imgrefurl=https%3A%2F%2Fasarlar.uz%2Fkitob%2Fshum-bola&docid=szm0dk5d8kC6UM&tbnid=nxO7T9FqNHfAQM&vet=12ahUKEwjK6MiukpuXAxUVVqQEHT-8KZ8QnPAOegUIwwEQAA..i&w=400&h=628&hcb=2&ved=2ahUKEwjK6MiukpuXAxUVVqQEHT-8KZ8QnPAOegUIwwEQAA",
        author: "Gafur Gulom",
        language: "Uzbek",
        // rating:      Int?
        userId: "user_test_001",
        type: "Literature",
        hooks: "Story",
        pages: "221",
        maslahatBeraman: true,
        cost: "22",
      },
      {
        title: "Bir vijdon uyg`onur",
        description:
          "Har qanday inson u qay darajadagi yomon bo'lsada vijdon uyg'otilsa uni bu yo'ldan qaytarsa bo'ladi!",
        imageUrl:
          "https://www.google.com/imgres?q=shum%20bola%20kitobi&imgurl=https%3A%2F%2Fasarlar-assets-prod.s3.eu-north-1.amazonaws.com%2Fcovers%2Fmedium%2Fshum-bola_69b7ed5a7a5c8_1773661530.webp&imgrefurl=https%3A%2F%2Fasarlar.uz%2Fkitob%2Fshum-bola&docid=szm0dk5d8kC6UM&tbnid=nxO7T9FqNHfAQM&vet=12ahUKEwjK6MiukpuXAxUVVqQEHT-8KZ8QnPAOegUIwwEQAA..i&w=400&h=628&hcb=2&ved=2ahUKEwjK6MiukpuXAxUVVqQEHT-8KZ8QnPAOegUIwwEQAA",
        author: "Ahamad Lutfiy Qozonchi",
        language: "Uzbek",
        // rating:      Int?
        userId: "user_test_002",
        type: "Literature",
        hooks: "Story",
        pages: "221",
        maslahatBeraman: true,
        cost: "22",
      },
      {
        title: "Qora Ko'z Majnun",
        description: "Hayvonlarni insonlarga nisbatan muhabbati haqida",
        imageUrl:
          "https://www.google.com/imgres?q=shum%20bola%20kitobi&imgurl=https%3A%2F%2Fasarlar-assets-prod.s3.eu-north-1.amazonaws.com%2Fcovers%2Fmedium%2Fshum-bola_69b7ed5a7a5c8_1773661530.webp&imgrefurl=https%3A%2F%2Fasarlar.uz%2Fkitob%2Fshum-bola&docid=szm0dk5d8kC6UM&tbnid=nxO7T9FqNHfAQM&vet=12ahUKEwjK6MiukpuXAxUVVqQEHT-8KZ8QnPAOegUIwwEQAA..i&w=400&h=628&hcb=2&ved=2ahUKEwjK6MiukpuXAxUVVqQEHT-8KZ8QnPAOegUIwwEQAA",
        author: "Gafur Gulom",
        language: "Uzbek",
        // rating:      Int?
        userId: "user_test_003",
        type: "Literature",
        hooks: "Story",
        pages: "194",
        maslahatBeraman: true,
        cost: "12",
      },
      {
        title: "Shum bola",
        description: "The story of the boy",
        imageUrl:
          "https://www.google.com/imgres?q=shum%20bola%20kitobi&imgurl=https%3A%2F%2Fasarlar-assets-prod.s3.eu-north-1.amazonaws.com%2Fcovers%2Fmedium%2Fshum-bola_69b7ed5a7a5c8_1773661530.webp&imgrefurl=https%3A%2F%2Fasarlar.uz%2Fkitob%2Fshum-bola&docid=szm0dk5d8kC6UM&tbnid=nxO7T9FqNHfAQM&vet=12ahUKEwjK6MiukpuXAxUVVqQEHT-8KZ8QnPAOegUIwwEQAA..i&w=400&h=628&hcb=2&ved=2ahUKEwjK6MiukpuXAxUVVqQEHT-8KZ8QnPAOegUIwwEQAA",
        author: "Gafur Gulom",
        language: "Uzbek",
        // rating:      Int?
        userId: "user_test_004",
        type: "Literature",
        hooks: "Story",
        pages: "221",
        maslahatBeraman: true,
        cost: "22",
      },
    ],
  });

  console.log("Seed data muvaffaqiyatli qo'shildi");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
