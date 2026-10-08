export interface HijaiyahLetter {
  id: string;
  glyph: string;
  name: string;
  nameArabic: string;
  pronunciationLatin: string;
  explanation: string;
  kind: "letter" | "extra";
}

// Introductory letter-name material, not Quran text or verse transliteration.
// Latin names use Indonesian-friendly spelling; they are not phonetic equivalents.
// References are displayed on the learning page for parents and teachers.
export const hijaiyahLetters: readonly HijaiyahLetter[] = [
  { id: "alif", glyph: "ا", name: "Alif", nameArabic: "أَلِف", pronunciationLatin: "Alif", explanation: "Bentuknya tegak, tanpa titik. Alif dapat memanjangkan bunyi a. Alif dan hamzah bukan hal yang sama.", kind: "letter" },
  { id: "ba", glyph: "ب", name: "Ba", nameArabic: "بَاء", pronunciationLatin: "Baa", explanation: "Lihat satu titik di bawah. Perhatikan titiknya agar tidak tertukar dengan Ta dan Tsa.", kind: "letter" },
  { id: "ta", glyph: "ت", name: "Ta", nameArabic: "تَاء", pronunciationLatin: "Taa", explanation: "Ada dua titik di atas. Bentuk dasarnya mirip Ba, tetapi letak dan jumlah titiknya berbeda.", kind: "letter" },
  { id: "tsa", glyph: "ث", name: "Tsa", nameArabic: "ثَاء", pronunciationLatin: "Tsaa", explanation: "Hitung tiga titik di atas. Bunyi Tsa berbeda dari Ta dan Sin; ikuti contoh guru saat melafalkannya.", kind: "letter" },
  { id: "jim", glyph: "ج", name: "Jim", nameArabic: "جِيم", pronunciationLatin: "Jiim", explanation: "Ada satu titik di bawah lengkungannya. Bandingkan dengan Ha dan Kha yang bentuknya mirip.", kind: "letter" },
  { id: "ha-throat", glyph: "ح", name: "Ha (ح)", nameArabic: "حَاء", pronunciationLatin: "Haa (ḥā’)", explanation: "Bentuknya mirip Jim, tanpa titik. Ha ini berbunyi dari tenggorokan dan berbeda dari ه. Minta guru mencontohkan perbedaannya.", kind: "letter" },
  { id: "kha", glyph: "خ", name: "Kha", nameArabic: "خَاء", pronunciationLatin: "Khaa", explanation: "Ada satu titik di atas. Jim, Ha, dan Kha memiliki bentuk mirip, tetapi titik dan bunyinya berbeda.", kind: "letter" },
  { id: "dal", glyph: "د", name: "Dal", nameArabic: "دَال", pronunciationLatin: "Daal", explanation: "Bentuknya melengkung kecil, tanpa titik. Bandingkan dengan Dzal yang memiliki titik di atas.", kind: "letter" },
  { id: "dzal", glyph: "ذ", name: "Dzal", nameArabic: "ذَال", pronunciationLatin: "Dzaal", explanation: "Mirip Dal dengan satu titik di atas. Bunyi Dzal tidak sama dengan Dal atau Zai.", kind: "letter" },
  { id: "ra", glyph: "ر", name: "Ra", nameArabic: "رَاء", pronunciationLatin: "Raa", explanation: "Lengkungannya turun ke bawah, tanpa titik. Perhatikan bedanya dengan Zai.", kind: "letter" },
  { id: "zai", glyph: "ز", name: "Zai", nameArabic: "زَاي", pronunciationLatin: "Zai", explanation: "Bentuknya mirip Ra dengan satu titik di atas. Titik itu membantu kita mengenali Zai.", kind: "letter" },
  { id: "sin", glyph: "س", name: "Sin", nameArabic: "سِين", pronunciationLatin: "Siin", explanation: "Perhatikan lekukan-lekukan kecilnya. Sin tidak memiliki titik; Syin memiliki tiga titik.", kind: "letter" },
  { id: "syin", glyph: "ش", name: "Syin", nameArabic: "شِين", pronunciationLatin: "Syiin", explanation: "Bentuknya seperti Sin dengan tiga titik di atas. Bunyi Syin berbeda dari Sin.", kind: "letter" },
  { id: "shad", glyph: "ص", name: "Shad", nameArabic: "صَاد", pronunciationLatin: "Shaad (ṣād)", explanation: "Ada bagian lebar di depan dan lengkungan di belakang. Shad tidak bertitik dan bunyinya lebih tebal daripada Sin.", kind: "letter" },
  { id: "dhad", glyph: "ض", name: "Dhad", nameArabic: "ضَاد", pronunciationLatin: "Dhaad (ḍād)", explanation: "Bentuknya seperti Shad dengan satu titik di atas. Bunyi Dhad berbeda dari Dal; Latin saja belum dapat menggambarkannya dengan tepat.", kind: "letter" },
  { id: "tha", glyph: "ط", name: "Tha", nameArabic: "طَاء", pronunciationLatin: "Thaa (ṭā’)", explanation: "Ada batang tinggi di atas bentuk melengkung. Tha tidak bertitik dan bunyinya lebih tebal daripada Ta.", kind: "letter" },
  { id: "zha", glyph: "ظ", name: "Zha", nameArabic: "ظَاء", pronunciationLatin: "Zhaa (ẓā’)", explanation: "Bentuknya seperti Tha dengan satu titik di atas. Zha dan Dzal memiliki bunyi berbeda; berlatihlah bersama guru.", kind: "letter" },
  { id: "ain", glyph: "ع", name: "‘Ain", nameArabic: "عَيْن", pronunciationLatin: "‘Ain", explanation: "Lihat lengkungan kecil di bagian atas, tanpa titik. Bunyi ‘Ain tidak memiliki padanan tepat dalam bahasa Indonesia.", kind: "letter" },
  { id: "ghain", glyph: "غ", name: "Ghain", nameArabic: "غَيْن", pronunciationLatin: "Ghain", explanation: "Mirip ‘Ain dengan satu titik di atas. Jangan hilangkan bunyi khasnya saat membaca; ikuti contoh guru.", kind: "letter" },
  { id: "fa", glyph: "ف", name: "Fa", nameArabic: "فَاء", pronunciationLatin: "Faa", explanation: "Ada satu titik di atas kepala kecilnya. Bandingkan dengan Qaf yang memiliki dua titik.", kind: "letter" },
  { id: "qaf", glyph: "ق", name: "Qaf", nameArabic: "قَاف", pronunciationLatin: "Qaaf", explanation: "Ada dua titik di atas. Qaf dan Kaf adalah dua huruf dengan bunyi berbeda, bukan dua cara menulis huruf yang sama.", kind: "letter" },
  { id: "kaf", glyph: "ك", name: "Kaf", nameArabic: "كَاف", pronunciationLatin: "Kaaf", explanation: "Bentuk tunggalnya memiliki batang tinggi dan tanda kecil di dalam. Bandingkan bentuk serta bunyinya dengan Qaf.", kind: "letter" },
  { id: "lam", glyph: "ل", name: "Lam", nameArabic: "لَام", pronunciationLatin: "Laam", explanation: "Batangnya tinggi dengan lengkungan di bawah. Lam dapat bergabung dengan Alif menjadi لا.", kind: "letter" },
  { id: "mim", glyph: "م", name: "Mim", nameArabic: "مِيم", pronunciationLatin: "Miim", explanation: "Perhatikan kepala kecil dan ekornya. Bentuk huruf dapat berubah ketika tersambung dalam kata.", kind: "letter" },
  { id: "nun", glyph: "ن", name: "Nun", nameArabic: "نُون", pronunciationLatin: "Nuun", explanation: "Ada satu titik di atas lengkungannya. Perhatikan perbedaannya dengan Ba yang bertitik di bawah.", kind: "letter" },
  { id: "ha", glyph: "ه", name: "Ha (ه)", nameArabic: "هَاء", pronunciationLatin: "Haa (hā’)", explanation: "Bentuk tunggalnya seperti lingkaran kecil. Ha ini berbeda dari ح; keduanya perlu dikenali dan dilafalkan dengan benar.", kind: "letter" },
  { id: "wau", glyph: "و", name: "Wau", nameArabic: "وَاو", pronunciationLatin: "Waaw", explanation: "Ada kepala kecil dengan ekor melengkung. Wau tidak memiliki titik.", kind: "letter" },
  { id: "ya", glyph: "ي", name: "Ya", nameArabic: "يَاء", pronunciationLatin: "Yaa", explanation: "Perhatikan dua titik di bawah. Letak titik membantu membedakannya dari huruf lain yang mirip.", kind: "letter" },
  { id: "hamzah", glyph: "ء", name: "Hamzah", nameArabic: "هَمْزَة", pronunciationLatin: "Hamzah", explanation: "Hamzah berbeda dari Alif. Selain berdiri sendiri, hamzah dapat ditulis di atas atau di bawah Alif, seperti أ dan إ.", kind: "extra" },
  { id: "lam-alif", glyph: "لا", name: "Lam-alif", nameArabic: "لَام أَلِف", pronunciationLatin: "Laam–alif", explanation: "Ini gabungan Lam (ل) dan Alif (ا), bukan huruf dasar tambahan. Nama gabungannya Lam-alif; cara membacanya mengikuti harakat dalam kata.", kind: "extra" },
];

export const hijaiyahSources = [
  { title: "Madinah Arabic — nama dan bentuk huruf", url: "https://madinaharabic.com/free-content/reading/lesson-1/part-1" },
  { title: "Quranic Arabic Corpus — rujukan transliterasi", url: "https://corpus.quran.com/documentation/phonetic.jsp" },
  { title: "Al Jazeera Learning — perbedaan Alif dan Hamzah", url: "https://learning.aljazeera.net/ar/node/19415" },
] as const;
