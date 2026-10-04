const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Game = require("../models/Game");

const games = [
  {
    key: "caesar",
    title: "Cifrul lui Cezar",
    subtitle: "Descifrează mesajul secret",
    difficulty: "Ușor",
    estimatedMinutes: 5,
    icon: "🕵️",
    order: 1,
    story:
      "Un detectiv digital găsește un mesaj criptat într-un chat de joc online. Mesajul pare să ascundă o regulă importantă de siguranță.",
    explanation:
      "Cifrul lui Cezar mută fiecare literă cu un anumit număr de poziții în alfabet. În această misiune, mesajul a fost criptat cu deplasare +3. Pentru a-l descifra, mergi cu 3 litere înapoi.",
    encodedLabel: "Mesaj criptat",
    encodedMessage: "QX GD SDUROD",
    hint: "Q devine N, X devine U. Continuă în același mod.",
    task: "Descifrează mesajul și scrie răspunsul corect.",
    correctAnswer: "NU DA PAROLA",
    acceptedAnswers: ["NU DA PAROLA"],
    successText:
      "Corect! Ai descifrat mesajul. Regula este importantă: nu da parola nimănui.",
    failText:
      "Nu este încă răspunsul corect. Verifică fiecare literă și mergi cu 3 poziții înapoi.",
    isActive: true,
  },

  {
    key: "morse",
    title: "Cod Morse",
    subtitle: "Transformă punctele și liniile în text",
    difficulty: "Ușor",
    estimatedMinutes: 5,
    icon: "📡",
    order: 2,
    story:
      "Primești un semnal misterios format din puncte și linii. Pare un mesaj de avertizare trimis de un prieten.",
    explanation:
      "Codul Morse folosește puncte și linii pentru a reprezenta litere. Fiecare grup reprezintă o literă, iar spațiul cu / separă cuvintele.",
    encodedLabel: "Mesaj Morse",
    encodedMessage: "-.-. . .-. . / .- .--- ..- - --- .-.",
    hint:
      "Folosește cheia Morse de pe ecran. De exemplu, -.-. = C, . = E, .-. = R.",
    task: "Descifrează mesajul Morse.",
    helperTable: [
      { code: ".-", letter: "A" },
      { code: "-.-.", letter: "C" },
      { code: ".", letter: "E" },
      { code: ".---", letter: "J" },
      { code: "---", letter: "O" },
      { code: ".-.", letter: "R" },
      { code: "-", letter: "T" },
      { code: "..-", letter: "U" },
    ],
    correctAnswer: "CERE AJUTOR",
    acceptedAnswers: ["CERE AJUTOR"],
    successText:
      "Corect! Ai descifrat mesajul. Când ceva pare suspect online, este bine să ceri ajutor.",
    failText:
      "Mai încearcă. Fiecare grup de puncte și linii reprezintă o literă.",
    isActive: true,
  },

  {
    key: "binary",
    title: "Cod binar",
    subtitle: "Transformă 0 și 1 în litere",
    difficulty: "Mediu",
    estimatedMinutes: 6,
    icon: "💻",
    order: 3,
    story:
      "Pe ecran apare un cod format doar din 0 și 1. Detectivul digital trebuie să îl transforme în text pentru a afla avertismentul.",
    explanation:
      "Calculatoarele pot reprezenta literele folosind cod binar. În această misiune, fiecare grup de 8 cifre reprezintă o literă.",
    encodedLabel: "Mesaj binar",
    encodedMessage:
      "01001110 01010101 00100000 01000100 01000101 01010011 01000011 01001000 01001001 01000100 01000101",
    hint:
      "01001110 = N, 01010101 = U, iar 00100000 reprezintă spațiul dintre cuvinte.",
    task: "Descifrează mesajul binar.",
    helperTable: [
      { code: "01001110", letter: "N" },
      { code: "01010101", letter: "U" },
      { code: "00100000", letter: "spațiu" },
      { code: "01000100", letter: "D" },
      { code: "01000101", letter: "E" },
      { code: "01010011", letter: "S" },
      { code: "01000011", letter: "C" },
      { code: "01001000", letter: "H" },
      { code: "01001001", letter: "I" },
    ],
    correctAnswer: "NU DESCHIDE",
    acceptedAnswers: ["NU DESCHIDE"],
    successText:
      "Corect! Ai descifrat avertismentul. Nu deschide fișiere suspecte sau primite de la necunoscuți.",
    failText:
      "Nu este încă răspunsul corect. Verifică fiecare grup de 8 cifre.",
    isActive: true,
  },
];

async function seedGames() {
  try {
    await connectDB();

    for (const game of games) {
      await Game.findOneAndUpdate(
        { key: game.key },
        game,
        {
          upsert: true,
          new: true,
          runValidators: true,
        }
      );
    }

    console.log("Jocurile au fost adăugate/actualizate cu succes.");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("seedGames error:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedGames();