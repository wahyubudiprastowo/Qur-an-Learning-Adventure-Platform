export interface ExtraDictItem {
  wordIndex: number;
  arabic: string;
  transliteration: string;
  translation: string;
  rootWord: string;
}

export const EXTRA_JUZ30_DICTIONARY: Record<string, ExtraDictItem[]> = {
  // === SURAH 106: QURAISY ===
  '106:1': [
    { wordIndex: 0, arabic: 'لِاِيْلٰفِ', transliteration: "Li'īlāfi", translation: 'Karena kebiasaan', rootWord: 'أ ل ف' },
    { wordIndex: 1, arabic: 'قُرَيْشٍ', transliteration: 'Quraisy', translation: 'Suku Quraisy', rootWord: 'ق ر ش' },
  ],
  '106:2': [
    { wordIndex: 0, arabic: 'اٖلٰفِهِمْ', transliteration: 'Īlāfihim', translation: '(Yaitu) kebiasaan mereka', rootWord: 'أ ل ف' },
    { wordIndex: 1, arabic: 'رِحْلَةَ', transliteration: 'Riḥlata', translation: 'Bepergian / perjalanan', rootWord: 'ر ح ل' },
    { wordIndex: 2, arabic: 'الشِّتَاۤءِ', transliteration: 'Asy-Syitā’', translation: 'Musim dingin', rootWord: 'ش ت و' },
    { wordIndex: 3, arabic: 'وَالصَّيْفِ', transliteration: 'Waṣ-Ṣaif', translation: 'Dan musim panas', rootWord: 'ص ي ف' },
  ],
  '106:3': [
    { wordIndex: 0, arabic: 'فَلْيَعْبُدُوْا', transliteration: "Falya'budū", translation: 'Maka hendaklah mereka menyembah', rootWord: 'ع ب د' },
    { wordIndex: 1, arabic: 'رَبَّ', transliteration: 'Rabba', translation: 'Tuhan (Pemelihara)', rootWord: 'ر ب ب' },
    { wordIndex: 2, arabic: 'هٰذَا', transliteration: 'Hāżal', translation: 'Ini', rootWord: 'ه ذ ا' },
    { wordIndex: 3, arabic: 'الْبَيْتِ', transliteration: 'Al-Bait', translation: "Rumah ini (Ka'bah)", rootWord: 'ب ي ت' },
  ],
  '106:4': [
    { wordIndex: 0, arabic: 'الَّذِيْٓ', transliteration: 'Allażī', translation: 'Tuhan yang', rootWord: 'ا ل ذ' },
    { wordIndex: 1, arabic: 'اَطْعَمَهُمْ', transliteration: "Aṭ'amahum", translation: 'Telah memberi makan mereka', rootWord: 'ط ع م' },
    { wordIndex: 2, arabic: 'مِّنْ', transliteration: 'Min', translation: 'Untuk menghilangkan', rootWord: 'م ن' },
    { wordIndex: 3, arabic: 'جُوْعٍ', transliteration: 'Jū‘', translation: 'Rasa lapar', rootWord: 'ج و ع' },
    { wordIndex: 4, arabic: 'وَّاٰمَنَهُمْ', transliteration: 'Wa āmanahum', translation: 'Dan mengamankan mereka', rootWord: 'أ م ن' },
    { wordIndex: 5, arabic: 'مِّنْ', transliteration: 'Min', translation: 'Dari', rootWord: 'م ن' },
    { wordIndex: 6, arabic: 'خَوْفٍ', transliteration: 'Khauf', translation: 'Rasa takut', rootWord: 'خ و ف' },
  ],

  // === SURAH 105: AL-FIL ===
  '105:1': [
    { wordIndex: 0, arabic: 'اَلَمْ', transliteration: 'Alam', translation: 'Tidakkah', rootWord: 'ل م' },
    { wordIndex: 1, arabic: 'تَرَ', transliteration: 'Tara', translation: 'Engkau memperhatikan', rootWord: 'ر أ ي' },
    { wordIndex: 2, arabic: 'كَيْفَ', transliteration: 'Kaifa', translation: 'Bagaimana', rootWord: 'ك ي ف' },
    { wordIndex: 3, arabic: 'فَعَلَ', transliteration: "Fa'ala", translation: 'Telah bertindak', rootWord: 'ف ع ل' },
    { wordIndex: 4, arabic: 'رَبُّكَ', transliteration: 'Rabbuka', translation: 'Tuhanmu', rootWord: 'ر ب ب' },
    { wordIndex: 5, arabic: 'بِاَصْحٰبِ', transliteration: "Bi'aṣḥābi", translation: 'Terhadap pasukan', rootWord: 'ص ح ب' },
    { wordIndex: 6, arabic: 'الْفِيْلِ', transliteration: 'Al-Fīl', translation: 'Bergajah', rootWord: 'ف ي ل' },
  ],
  '105:2': [
    { wordIndex: 0, arabic: 'اَلَمْ', transliteration: 'Alam', translation: 'Bukankah Dia', rootWord: 'ل م' },
    { wordIndex: 1, arabic: 'يَجْعَلْ', transliteration: "Yaj'al", translation: 'Menjadikan', rootWord: 'ج ع ل' },
    { wordIndex: 2, arabic: 'كَيْدَهُمْ', transliteration: 'Kaidahum', translation: 'Tipu daya mereka', rootWord: 'ك ي د' },
    { wordIndex: 3, arabic: 'فِيْ', transliteration: 'Fī', translation: 'Dalam', rootWord: 'ف ي' },
    { wordIndex: 4, arabic: 'تَضْلِيْلٍ', transliteration: 'Taḍlīl', translation: 'Kesia-siaan / kehancuran', rootWord: 'ض ل ل' },
  ],
  '105:3': [
    { wordIndex: 0, arabic: 'وَّاَرْسَلَ', transliteration: 'Wa arsala', translation: 'Dan Dia mengirimkan', rootWord: 'ر س ل' },
    { wordIndex: 1, arabic: 'عَلَيْهِمْ', transliteration: "'Alaihim", translation: 'Kepada mereka', rootWord: 'ع ل و' },
    { wordIndex: 2, arabic: 'طَيْرًا', transliteration: 'Ṭairan', translation: 'Burung', rootWord: 'ط ي ر' },
    { wordIndex: 3, arabic: 'اَبَابِيْلَ', transliteration: 'Abābīl', translation: 'Yang berbondong-bondong', rootWord: 'أ ب ل' },
  ],
  '105:4': [
    { wordIndex: 0, arabic: 'تَرْمِيْهِمْ', transliteration: 'Tarmīhim', translation: 'Yang melempari mereka', rootWord: 'ر م ي' },
    { wordIndex: 1, arabic: 'بِحِجَارَةٍ', transliteration: 'Biḥijārah', translation: 'Dengan batu', rootWord: 'ح ج ر' },
    { wordIndex: 2, arabic: 'مِّنْ', transliteration: 'Min', translation: 'Dari', rootWord: 'م ن' },
    { wordIndex: 3, arabic: 'سِجِّيْلٍ', transliteration: 'Sijjīl', translation: 'Tanah yang terbakar', rootWord: 'س ج ل' },
  ],
  '105:5': [
    { wordIndex: 0, arabic: 'فَجَعَلَهُمْ', transliteration: "Fa ja'alahum", translation: 'Lalu Dia menjadikan mereka', rootWord: 'ج ع ل' },
    { wordIndex: 1, arabic: 'كَعَصْفٍ', transliteration: "Ka'aṣfin", translation: 'Seperti daun-daun', rootWord: 'ع ص ف' },
    { wordIndex: 2, arabic: 'مَّأْكُوْلٍ', transliteration: 'Ma’kūl', translation: 'Yang dimakan (ulat)', rootWord: 'أ ك ل' },
  ],

  // === SURAH 104: AL-HUMAZAH ===
  '104:1': [
    { wordIndex: 0, arabic: 'وَيْلٌ', transliteration: 'Wailul', translation: 'Celakalah', rootWord: 'و ي ل' },
    { wordIndex: 1, arabic: 'لِّكُلِّ', transliteration: 'Likulli', translation: 'Bagi setiap', rootWord: 'ك ل ل' },
    { wordIndex: 2, arabic: 'هُمَزَةٍ', transliteration: 'Humazah', translation: 'Pengumpat', rootWord: 'ه م ز' },
    { wordIndex: 3, arabic: 'لُّمَزَةٍ', transliteration: 'Lumazah', translation: 'Pencela', rootWord: 'ل م ز' },
  ],
  '104:2': [
    { wordIndex: 0, arabic: 'الَّذِيْ', transliteration: 'Allażī', translation: 'Yang', rootWord: 'ا ل ذ' },
    { wordIndex: 1, arabic: 'جَمَعَ', transliteration: "Jama'a", translation: 'Mengumpulkan', rootWord: 'ج م ع' },
    { wordIndex: 2, arabic: 'مَالًا', transliteration: 'Mālan', translation: 'Harta', rootWord: 'م و ل' },
    { wordIndex: 3, arabic: 'وَّعَدَّدَهٗ', transliteration: "Wa 'addadah", translation: 'Dan menghitung-hitungnya', rootWord: 'ع د د' },
  ],
  '104:3': [
    { wordIndex: 0, arabic: 'يَحْسَبُ', transliteration: 'Yaḥsabu', translation: 'Dia mengira', rootWord: 'ح س ب' },
    { wordIndex: 1, arabic: 'اَنَّ', transliteration: 'Anna', translation: 'Bahwa', rootWord: 'أ ن ن' },
    { wordIndex: 2, arabic: 'مَالَهٗٓ', transliteration: 'Mālahū', translation: 'Hartanya itu', rootWord: 'م و ل' },
    { wordIndex: 3, arabic: 'اَخْلَدَهٗ', transliteration: 'Akhladah', translation: 'Dapat mengekalkannya', rootWord: 'خ ل د' },
  ],
  '104:4': [
    { wordIndex: 0, arabic: 'كَلَّا', transliteration: 'Kallā', translation: 'Sekali-kali tidak!', rootWord: 'ك ل ل' },
    { wordIndex: 1, arabic: 'لَيُنْبَذَنَّ', transliteration: 'Layunbażanna', translation: 'Pasti dia akan dilemparkan', rootWord: 'ن ب ذ' },
    { wordIndex: 2, arabic: 'فِى', transliteration: 'Fil', translation: 'Ke dalam', rootWord: 'ف ي' },
    { wordIndex: 3, arabic: 'الْحُطَمَةِ', transliteration: 'Al-Ḥuṭamah', translation: 'Neraka Huthamah', rootWord: 'ح ط م' },
  ],
  '104:5': [
    { wordIndex: 0, arabic: 'وَمَآ', transliteration: 'Wa mā', translation: 'Dan tahukah kamu', rootWord: 'م ا' },
    { wordIndex: 1, arabic: 'اَدْرٰىكَ', transliteration: 'Adrāk', translation: 'Apakah itu', rootWord: 'د ر ي' },
    { wordIndex: 2, arabic: 'مَا', transliteration: 'Mal', translation: 'Apa itu', rootWord: 'م ا' },
    { wordIndex: 3, arabic: 'الْحُطَمَةُ', transliteration: 'Al-Ḥuṭamah', translation: 'Neraka Huthamah?', rootWord: 'ح ط م' },
  ],
  '104:6': [
    { wordIndex: 0, arabic: 'نَارُ', transliteration: 'Nārul', translation: '(Yaitu) api', rootWord: 'ن و ر' },
    { wordIndex: 1, arabic: 'اللّٰهِ', transliteration: 'Lāhil', translation: '(Siksaan) Allah', rootWord: 'إ ل ه' },
    { wordIndex: 2, arabic: 'الْمُوْقَدَةُ', transliteration: 'Al-Mūqadah', translation: 'Yang dinyalakan', rootWord: 'و ق د' },
  ],
  '104:7': [
    { wordIndex: 0, arabic: 'الَّتِيْ', transliteration: 'Allatī', translation: 'Yang membakar', rootWord: 'ا ل ذ' },
    { wordIndex: 1, arabic: 'تَطَّلِعُ', transliteration: "Taṭṭali'u", translation: 'Sampai naik', rootWord: 'ط ل ع' },
    { wordIndex: 2, arabic: 'عَلَى', transliteration: "'Alal", translation: 'Ke atas', rootWord: 'ع ل و' },
    { wordIndex: 3, arabic: 'الْاَفْـِٕدَةِ', transliteration: "Al-Af'idah", translation: 'Hati nurani', rootWord: 'ف أ د' },
  ],
  '104:8': [
    { wordIndex: 0, arabic: 'اِنَّهَا', transliteration: 'Innahā', translation: 'Sungguh api itu', rootWord: 'إ ن ن' },
    { wordIndex: 1, arabic: 'عَلَيْهِمْ', transliteration: "'Alaihim", translation: 'Atas mereka', rootWord: 'ع ل و' },
    { wordIndex: 2, arabic: 'مُّؤْصَدَةٌ', transliteration: 'Mu’ṣadah', translation: 'Ditutup rapat', rootWord: 'أ ص د' },
  ],
  '104:9': [
    { wordIndex: 0, arabic: 'فِيْ', transliteration: 'Fī', translation: 'Pada', rootWord: 'ف ي' },
    { wordIndex: 1, arabic: 'عَمَدٍ', transliteration: "'Amadin", translation: 'Tiang-tiang', rootWord: 'ع م د' },
    { wordIndex: 2, arabic: 'مُّمَدَّدَةٍ', transliteration: 'Mumaddadah', translation: 'Yang terpancang panjang', rootWord: 'م د د' },
  ],

  // === SURAH 102: AT-TAKATSYUR ===
  '102:1': [
    { wordIndex: 0, arabic: 'اَلْهٰىكُمُ', transliteration: 'Alhākumut', translation: 'Telah melalaikan kamu', rootWord: 'ل ه و' },
    { wordIndex: 1, arabic: 'التَّكَاثُرُ', transliteration: 'At-Takāṡur', translation: 'Bermegah-megahan', rootWord: 'ك ث ر' },
  ],
  '102:2': [
    { wordIndex: 0, arabic: 'حَتّٰى', transliteration: 'Ḥattā', translation: 'Sampai', rootWord: 'ح ت ى' },
    { wordIndex: 1, arabic: 'زُرْتُمُ', transliteration: 'Zurtumul', translation: 'Kamu masuk / mengunjungi', rootWord: 'ز و ر' },
    { wordIndex: 2, arabic: 'الْمَقَابِرَ', transliteration: 'Al-Maqābir', translation: 'Kubur', rootWord: 'ق ب ر' },
  ],
  '102:3': [
    { wordIndex: 0, arabic: 'كَلَّا', transliteration: 'Kallā', translation: 'Sekali-kali tidak!', rootWord: 'ك ل ل' },
    { wordIndex: 1, arabic: 'سَوْفَ', transliteration: 'Saufa', translation: 'Kelak', rootWord: 'س و ف' },
    { wordIndex: 2, arabic: 'تَعْلَمُوْنَ', transliteration: "Ta'lamūn", translation: 'Kamu akan mengetahui', rootWord: 'ع ل م' },
  ],
  '102:4': [
    { wordIndex: 0, arabic: 'ثُمَّ', transliteration: 'Ṡumma', translation: 'Kemudian', rootWord: 'ث م م' },
    { wordIndex: 1, arabic: 'كَلَّا', transliteration: 'Kallā', translation: 'Sekali-kali tidak!', rootWord: 'ك ل ل' },
    { wordIndex: 2, arabic: 'سَوْفَ', transliteration: 'Saufa', translation: 'Kelak', rootWord: 'س و ف' },
    { wordIndex: 3, arabic: 'تَعْلَمُوْنَ', transliteration: "Ta'lamūn", translation: 'Kamu akan mengetahui', rootWord: 'ع ل م' },
  ],
  '102:5': [
    { wordIndex: 0, arabic: 'كَلَّا', transliteration: 'Kallā', translation: 'Sekali-kali tidak!', rootWord: 'ك ل ل' },
    { wordIndex: 1, arabic: 'لَوْ', transliteration: 'Lau', translation: 'Sekiranya', rootWord: 'ل و' },
    { wordIndex: 2, arabic: 'تَعْلَمُوْنَ', transliteration: "Ta'lamūn", translation: 'Kamu mengetahui', rootWord: 'ع ل م' },
    { wordIndex: 3, arabic: 'عِلْمَ', transliteration: "'Ilmal", translation: 'Dengan ilmu', rootWord: 'ع ل م' },
    { wordIndex: 4, arabic: 'الْيَقِيْنِ', transliteration: 'Al-Yaqīn', translation: 'Yang yakin (pasti)', rootWord: 'ي ق ن' },
  ],
  '102:6': [
    { wordIndex: 0, arabic: 'لَتَرَوُنَّ', transliteration: 'Latarawunnal', translation: 'Niscaya kamu benar-benar akan melihat', rootWord: 'ر أ ي' },
    { wordIndex: 1, arabic: 'الْجَحِيْمَ', transliteration: 'Al-Jaḥīm', translation: 'Neraka Jahim', rootWord: 'ج ح م' },
  ],
  '102:7': [
    { wordIndex: 0, arabic: 'ثُمَّ', transliteration: 'Ṡumma', translation: 'Kemudian', rootWord: 'ث م م' },
    { wordIndex: 1, arabic: 'لَتَرَوُنَّهَا', transliteration: 'Latarawunnahā', translation: 'Kamu benar-benar akan melihatnya', rootWord: 'ر أ ي' },
    { wordIndex: 2, arabic: 'عَيْنَ', transliteration: "'Ainal", translation: 'Dengan penglihatan', rootWord: 'ع ي ن' },
    { wordIndex: 3, arabic: 'الْيَقِيْنِ', transliteration: 'Al-Yaqīn', translation: 'Yang pasti', rootWord: 'ي ق ن' },
  ],
  '102:8': [
    { wordIndex: 0, arabic: 'ثُمَّ', transliteration: 'Ṡumma', translation: 'Kemudian', rootWord: 'ث م م' },
    { wordIndex: 1, arabic: 'لَتُسْـَٔلُنَّ', transliteration: 'Latus’alunna', translation: 'Kamu pasti akan ditanyai', rootWord: 'س أ ل' },
    { wordIndex: 2, arabic: 'يَوْمَىِٕذٍ', transliteration: 'Yauma’iżin', translation: 'Pada hari itu', rootWord: 'ي و م' },
    { wordIndex: 3, arabic: 'عَنِ', transliteration: "'Anin", translation: 'Tentang', rootWord: 'ع ن' },
    { wordIndex: 4, arabic: 'النَّعِيْمِ', transliteration: 'An-Na‘īm', translation: 'Kenikmatan hidup', rootWord: 'ن ع م' },
  ],

  // === SURAH 101: AL-QARI'AH ===
  '101:1': [
    { wordIndex: 0, arabic: 'الْقَارِعَةُ', transliteration: 'Al-Qāri‘ah', translation: 'Hari Kiamat yang menggetarkan', rootWord: 'ق ر ع' },
  ],
  '101:2': [
    { wordIndex: 0, arabic: 'مَا', transliteration: 'Mal', translation: 'Apakah itu', rootWord: 'م ا' },
    { wordIndex: 1, arabic: 'الْقَارِعَةُ', transliteration: 'Al-Qāri‘ah', translation: 'Hari Kiamat itu?', rootWord: 'ق ر ع' },
  ],
  '101:3': [
    { wordIndex: 0, arabic: 'وَمَآ', transliteration: 'Wa mā', translation: 'Dan tahukah kamu', rootWord: 'م ا' },
    { wordIndex: 1, arabic: 'اَدْرٰىكَ', transliteration: 'Adrāk', translation: 'Apakah itu', rootWord: 'د ر ي' },
    { wordIndex: 2, arabic: 'مَا', transliteration: 'Mal', translation: 'Apa itu', rootWord: 'م ا' },
    { wordIndex: 3, arabic: 'الْقَارِعَةُ', transliteration: 'Al-Qāri‘ah', translation: 'Hari Kiamat?', rootWord: 'ق ر ع' },
  ],
  '101:4': [
    { wordIndex: 0, arabic: 'يَوْمَ', transliteration: 'Yauma', translation: 'Pada hari', rootWord: 'ي و م' },
    { wordIndex: 1, arabic: 'يَكُوْنُ', transliteration: 'Yakūnu', translation: 'Ketika', rootWord: 'ك و ن' },
    { wordIndex: 2, arabic: 'النَّاسُ', transliteration: 'An-Nāsu', translation: 'Manusia', rootWord: 'أ ن س' },
    { wordIndex: 3, arabic: 'كَالْفَرَاشِ', transliteration: 'Kal-farāsy', translation: 'Seperti laron / anai-anai', rootWord: 'ف ر ش' },
    { wordIndex: 4, arabic: 'الْمَبْثُوْثِ', transliteration: 'Al-Mabṡūṡ', translation: 'Yang berterbangan', rootWord: 'ب ث ث' },
  ],
  '101:5': [
    { wordIndex: 0, arabic: 'وَتَكُوْنُ', transliteration: 'Wa takūnul', translation: 'Dan menjadi', rootWord: 'ك و ن' },
    { wordIndex: 1, arabic: 'الْجِبَالُ', transliteration: 'Al-Jibālu', translation: 'Gunung-gunung', rootWord: 'ج ب ل' },
    { wordIndex: 2, arabic: 'كَالْعِهْنِ', transliteration: "Kal-'ihni", translation: 'Seperti bulu domba', rootWord: 'ع ه ن' },
    { wordIndex: 3, arabic: 'الْمَنْفُوْشِ', transliteration: 'Al-Manfūsy', translation: 'Yang dihambur-hamburkan', rootWord: 'ن ف ش' },
  ],
  '101:6': [
    { wordIndex: 0, arabic: 'فَاَمَّا', transliteration: 'Fa ammā', translation: 'Maka adapun', rootWord: 'أ م م' },
    { wordIndex: 1, arabic: 'مَنْ', transliteration: 'Man', translation: 'Orang yang', rootWord: 'م ن' },
    { wordIndex: 2, arabic: 'ثَقُلَتْ', transliteration: 'Ṡaqulat', translation: 'Berat', rootWord: 'ث ق ل' },
    { wordIndex: 3, arabic: 'مَوَازِينُهٗ', transliteration: 'Mawāzīnuhū', translation: 'Timbangan (kebajikan)nya', rootWord: 'و ز ن' },
  ],
  '101:7': [
    { wordIndex: 0, arabic: 'فَهُوَ', transliteration: 'Fa huwa', translation: 'Maka dia', rootWord: 'ه و' },
    { wordIndex: 1, arabic: 'فِيْ', transliteration: 'Fī', translation: 'Dalam', rootWord: 'ف ي' },
    { wordIndex: 2, arabic: 'عِيْشَةٍ', transliteration: "'Īsyatin", translation: 'Kehidupan', rootWord: 'ع ي ش' },
    { wordIndex: 3, arabic: 'رَّاضِيَةٍ', transliteration: 'Rāḍiyah', translation: 'Yang memuaskan / bahagia', rootWord: 'ر ض ي' },
  ],
  '101:8': [
    { wordIndex: 0, arabic: 'وَاَمَّا', transliteration: 'Wa ammā', translation: 'Dan adapun', rootWord: 'أ م م' },
    { wordIndex: 1, arabic: 'مَنْ', transliteration: 'Man', translation: 'Orang yang', rootWord: 'م ن' },
    { wordIndex: 2, arabic: 'خَفَّتْ', transliteration: 'Khaffat', translation: 'Ringan', rootWord: 'خ ف ف' },
    { wordIndex: 3, arabic: 'مَوَازِينُهٗ', transliteration: 'Mawāzīnuhū', translation: 'Timbangan (kebajikan)nya', rootWord: 'و ز ن' },
  ],
  '101:9': [
    { wordIndex: 0, arabic: 'فَاُمُّهٗ', transliteration: 'Fa ummuhū', translation: 'Maka tempat kembalinya adalah', rootWord: 'أ م م' },
    { wordIndex: 1, arabic: 'هَاوِيَةٌ', transliteration: 'Hāwiyah', translation: 'Neraka Hawiyah', rootWord: 'ه و ي' },
  ],
  '101:10': [
    { wordIndex: 0, arabic: 'وَمَآ', transliteration: 'Wa mā', translation: 'Dan tahukah kamu', rootWord: 'م ا' },
    { wordIndex: 1, arabic: 'اَدْرٰىكَ', transliteration: 'Adrāk', translation: 'Apakah itu', rootWord: 'د ر ي' },
    { wordIndex: 2, arabic: 'مَا', transliteration: 'Mā', translation: 'Apa itu', rootWord: 'م ا' },
    { wordIndex: 3, arabic: 'هِيَهْ', transliteration: 'Hiyah', translation: 'Neraka itu?', rootWord: 'ه ي' },
  ],
  '101:11': [
    { wordIndex: 0, arabic: 'نَارٌ', transliteration: 'Nārun', translation: '(Yaitu) api', rootWord: 'ن و ر' },
    { wordIndex: 1, arabic: 'حَامِيَةٌ', transliteration: 'Ḥāmiyah', translation: 'Yang sangat panas membara', rootWord: 'ح م ي' },
  ],

  // === SURAH 99: AZ-ZALZALAH ===
  '99:1': [
    { wordIndex: 0, arabic: 'اِذَا', transliteration: 'Iżā', translation: 'Apabila', rootWord: 'إ ذ ا' },
    { wordIndex: 1, arabic: 'زُلْزِلَتِ', transliteration: 'Zulzilatil', translation: 'Digoncangkan', rootWord: 'ز ل ز ل' },
    { wordIndex: 2, arabic: 'الْاَرْضُ', transliteration: 'Al-Arḍu', translation: 'Bumi', rootWord: 'أ ر ض' },
    { wordIndex: 3, arabic: 'زِلْزَالَهَا', transliteration: 'Zilzālahā', translation: 'Dengan goncangan dahsyatnya', rootWord: 'ز ل ز ل' },
  ],
  '99:2': [
    { wordIndex: 0, arabic: 'وَاَخْرَجَتِ', transliteration: 'Wa akhrajatil', translation: 'Dan mengeluarkan', rootWord: 'خ ر ج' },
    { wordIndex: 1, arabic: 'الْاَرْضُ', transliteration: 'Al-Arḍu', translation: 'Bumi', rootWord: 'أ ر ض' },
    { wordIndex: 2, arabic: 'اَثْقَالَهَا', transliteration: 'Aṡqālahā', translation: 'Beban-beban berat (isi perut)nya', rootWord: 'ث ق ل' },
  ],
  '99:3': [
    { wordIndex: 0, arabic: 'وَقَالَ', transliteration: 'Wa qālal', translation: 'Dan berkata', rootWord: 'ق و ل' },
    { wordIndex: 1, arabic: 'الْاِنْسَانُ', transliteration: 'Al-Insānu', translation: 'Manusia', rootWord: 'أ ن س' },
    { wordIndex: 2, arabic: 'مَا', transliteration: 'Mā', translation: 'Ada apa', rootWord: 'م ا' },
    { wordIndex: 3, arabic: 'لَهَا', transliteration: 'Lahā', translation: 'Dengan bumi ini?', rootWord: 'ل' },
  ],
  '99:4': [
    { wordIndex: 0, arabic: 'يَوْمَىِٕذٍ', transliteration: 'Yauma’iżin', translation: 'Pada hari itu', rootWord: 'ي و م' },
    { wordIndex: 1, arabic: 'تُحَدِّثُ', transliteration: 'Tuḥaddiṡu', translation: 'Bumi menceritakan', rootWord: 'ح د ث' },
    { wordIndex: 2, arabic: 'اَخْبَارَهَا', transliteration: 'Akhbārahā', translation: 'Berita-beritanya', rootWord: 'خ ب ر' },
  ],
  '99:5': [
    { wordIndex: 0, arabic: 'بِاَنَّ', transliteration: 'Bianna', translation: 'Karena sesungguhnya', rootWord: 'إ ن ن' },
    { wordIndex: 1, arabic: 'رَبَّكَ', transliteration: 'Rabbaka', translation: 'Tuhanmu', rootWord: 'ر ب ب' },
    { wordIndex: 2, arabic: 'اَوْحٰى', transliteration: 'Auḥā', translation: 'Telah memerintahkan', rootWord: 'و ح ي' },
    { wordIndex: 3, arabic: 'لَهَا', transliteration: 'Lahā', translation: 'Kepadanya', rootWord: 'ل' },
  ],
  '99:6': [
    { wordIndex: 0, arabic: 'يَوْمَىِٕذٍ', transliteration: 'Yauma’iżin', translation: 'Pada hari itu', rootWord: 'ي و م' },
    { wordIndex: 1, arabic: 'يَّصْدُرُ', transliteration: 'Yaṣdurun', translation: 'Keluar', rootWord: 'ص د ر' },
    { wordIndex: 2, arabic: 'النَّاسُ', transliteration: 'An-Nāsu', translation: 'Manusia', rootWord: 'أ ن س' },
    { wordIndex: 3, arabic: 'اَشْتَاتًا', transliteration: 'Asytātā', translation: 'Berkelompok-kelompok', rootWord: 'ش ت ت' },
    { wordIndex: 4, arabic: 'لِّيُرَوْا', transliteration: 'Liyurau', translation: 'Untuk diperlihatkan', rootWord: 'ر أ ي' },
    { wordIndex: 5, arabic: 'اَعْمَالَهُمْ', transliteration: "A'mālahum", translation: 'Amalan-amalan mereka', rootWord: 'ع م ل' },
  ],
  '99:7': [
    { wordIndex: 0, arabic: 'فَمَنْ', transliteration: 'Faman', translation: 'Maka barang siapa', rootWord: 'م ن' },
    { wordIndex: 1, arabic: 'يَّعْمَلْ', transliteration: "Ya'mal", translation: 'Mengerjakan', rootWord: 'ع م ل' },
    { wordIndex: 2, arabic: 'مِثْقَالَ', transliteration: 'Miṡqāla', translation: 'Sebesar', rootWord: 'ث ق ل' },
    { wordIndex: 3, arabic: 'ذَرَّةٍ', transliteration: 'Żarratin', translation: 'Biji zarrah', rootWord: 'ذ ر ر' },
    { wordIndex: 4, arabic: 'خَيْرًا', transliteration: 'Khairan', translation: 'Kebaikan', rootWord: 'خ ي ر' },
    { wordIndex: 5, arabic: 'يَّرَهٗ', transliteration: 'Yarah', translation: 'Niscaya dia akan melihatnya', rootWord: 'ر أ ي' },
  ],
  '99:8': [
    { wordIndex: 0, arabic: 'وَمَنْ', transliteration: 'Wa man', translation: 'Dan barang siapa', rootWord: 'م ن' },
    { wordIndex: 1, arabic: 'يَّعْمَلْ', transliteration: "Ya'mal", translation: 'Mengerjakan', rootWord: 'ع م ل' },
    { wordIndex: 2, arabic: 'مِثْقَالَ', transliteration: 'Miṡqāla', translation: 'Sebesar', rootWord: 'ث ق ل' },
    { wordIndex: 3, arabic: 'ذَرَّةٍ', transliteration: 'Żarratin', translation: 'Biji zarrah', rootWord: 'ذ ر ر' },
    { wordIndex: 4, arabic: 'شَرًّا', transliteration: 'Syarran', translation: 'Kejahatan', rootWord: 'ش ر ر' },
    { wordIndex: 5, arabic: 'يَّرَهٗ', transliteration: 'Yarah', translation: 'Niscaya dia akan melihatnya', rootWord: 'ر أ ي' },
  ],

  // === SURAH 95: AT-TIN ===
  '95:1': [
    { wordIndex: 0, arabic: 'وَالتِّيْنِ', transliteration: 'Wat-Tīn', translation: 'Demi buah Tin', rootWord: 'ت ي ن' },
    { wordIndex: 1, arabic: 'وَالزَّيْتُوْنِ', transliteration: 'Waz-Zaitūn', translation: 'Dan buah Zaitun', rootWord: 'ز ي ت' },
  ],
  '95:2': [
    { wordIndex: 0, arabic: 'وَطُوْرِ', transliteration: 'Wa Ṭūri', translation: 'Dan demi bukit', rootWord: 'ط و ر' },
    { wordIndex: 1, arabic: 'سِيْنِيْنَ', transliteration: 'Sīnīn', translation: 'Sinai', rootWord: 'س ن ن' },
  ],
  '95:3': [
    { wordIndex: 0, arabic: 'وَهٰذَا', transliteration: 'Wa hāżal', translation: 'Dan demi negeri', rootWord: 'ه ذ ا' },
    { wordIndex: 1, arabic: 'الْبَلَدِ', transliteration: 'Al-Balad', translation: 'Kota (Makkah)', rootWord: 'ب ل د' },
    { wordIndex: 2, arabic: 'الْاَمِيْنِ', transliteration: 'Al-Amīn', translation: 'Yang aman ini', rootWord: 'أ م ن' },
  ],
  '95:4': [
    { wordIndex: 0, arabic: 'لَقَدْ', transliteration: 'Laqad', translation: 'Sungguh', rootWord: 'ق د' },
    { wordIndex: 1, arabic: 'خَلَقْنَا', transliteration: 'Khalaqnal', translation: 'Kami telah menciptakan', rootWord: 'خ ل ق' },
    { wordIndex: 2, arabic: 'الْاِنْسَانَ', transliteration: 'Al-Insāna', translation: 'Manusia', rootWord: 'أ ن س' },
    { wordIndex: 3, arabic: 'فِيْٓ', transliteration: 'Fī', translation: 'Dalam', rootWord: 'ف ي' },
    { wordIndex: 4, arabic: 'اَحْسَنِ', transliteration: 'Aḥsani', translation: 'Sebaik-baik', rootWord: 'ح س ن' },
    { wordIndex: 5, arabic: 'تَقْوِيْمٍ', transliteration: 'Taqwīm', translation: 'Bentuk ciptaan', rootWord: 'ق و م' },
  ],
  '95:5': [
    { wordIndex: 0, arabic: 'ثُمَّ', transliteration: 'Ṡumma', translation: 'Kemudian', rootWord: 'ث م م' },
    { wordIndex: 1, arabic: 'رَدَدْنٰهُ', transliteration: 'Radadnāhu', translation: 'Kami kembalikan dia', rootWord: 'ر د د' },
    { wordIndex: 2, arabic: 'اَسْفَلَ', transliteration: 'Asfala', translation: 'Ke tempat yang serendah-rendah', rootWord: 'س ف ل' },
    { wordIndex: 3, arabic: 'سَافِلِيْنَ', transliteration: 'Sāfilīn', translation: 'Tempat yang rendah (neraka)', rootWord: 'س ف ل' },
  ],
  '95:6': [
    { wordIndex: 0, arabic: 'اِلَّا', transliteration: 'Illal', translation: 'Kecuali', rootWord: 'إ ل ل' },
    { wordIndex: 1, arabic: 'الَّذِيْنَ', transliteration: 'Allażīna', translation: 'Orang-orang yang', rootWord: 'ا ل ذ' },
    { wordIndex: 2, arabic: 'اٰمَنُوْا', transliteration: 'Āmanū', translation: 'Beriman', rootWord: 'أ م ن' },
    { wordIndex: 3, arabic: 'وَعَمِلُوا', transliteration: "Wa 'amiluṣ", translation: 'Dan mengerjakan', rootWord: 'ع م ل' },
    { wordIndex: 4, arabic: 'الصّٰلِحٰتِ', transliteration: 'Ṣāliḥāt', translation: 'Kebajikan', rootWord: 'ص ل ح' },
    { wordIndex: 5, arabic: 'فَلَهُمْ', transliteration: 'Falahum', translation: 'Maka bagi mereka', rootWord: 'ل' },
    { wordIndex: 6, arabic: 'اَجْرٌ', transliteration: 'Ajrun', translation: 'Pahala', rootWord: 'أ ج ر' },
    { wordIndex: 7, arabic: 'غَيْرُ', transliteration: 'Gairu', translation: 'Yang tidak', rootWord: 'غ ي ر' },
    { wordIndex: 8, arabic: 'مَمْنُوْنٍ', transliteration: 'Mamnūn', translation: 'Putus-putusnya', rootWord: 'م ن ن' },
  ],
  '95:7': [
    { wordIndex: 0, arabic: 'فَمَا', transliteration: 'Famā', translation: 'Maka apakah yang', rootWord: 'م ا' },
    { wordIndex: 1, arabic: 'يُكَذِّبُكَ', transliteration: 'Yukażżibuka', translation: 'Menyebabkan engkau mendustakan', rootWord: 'ك ذ ب' },
    { wordIndex: 2, arabic: 'بَعْدُ', transliteration: "Ba'du", translation: 'Setelah itu', rootWord: 'ب ع د' },
    { wordIndex: 3, arabic: 'بِالدِّيْنِ', transliteration: 'Bid-Dīn', translation: 'Hari Pembalasan?', rootWord: 'د ي ن' },
  ],
  '95:8': [
    { wordIndex: 0, arabic: 'اَلَيْسَ', transliteration: 'Alaisallāhu', translation: 'Bukankah Allah', rootWord: 'ل ي س' },
    { wordIndex: 1, arabic: 'اللّٰهُ', transliteration: 'Allāh', translation: 'Allah', rootWord: 'إ ل ه' },
    { wordIndex: 2, arabic: 'بِاَحْكَمِ', transliteration: "Bi'aḥkamil", translation: 'Hakim yang paling adil', rootWord: 'ح ك م' },
    { wordIndex: 3, arabic: 'الْحٰكِمِيْنَ', transliteration: 'Ḥākimīn', translation: 'Di antara para hakim?', rootWord: 'ح ك م' },
  ],

  // === SURAH 94: AL-INSYIRAH ===
  '94:1': [
    { wordIndex: 0, arabic: 'اَلَمْ', transliteration: 'Alam', translation: 'Bukankah', rootWord: 'ل م' },
    { wordIndex: 1, arabic: 'نَشْرَحْ', transliteration: 'Nasyraḥ', translation: 'Kami telah melapangkan', rootWord: 'ش ر ح' },
    { wordIndex: 2, arabic: 'لَكَ', transliteration: 'Laka', translation: 'Untukmu', rootWord: 'ل' },
    { wordIndex: 3, arabic: 'صَدْرَكَ', transliteration: 'Ṣadrak', translation: 'Dadamu?', rootWord: 'ص د ر' },
  ],
  '94:2': [
    { wordIndex: 0, arabic: 'وَوَضَعْنَا', transliteration: 'Wa waḍa‘nā', translation: 'Dan Kami telah meringankan', rootWord: 'و ض ع' },
    { wordIndex: 1, arabic: 'عَنْكَ', transliteration: "'Anka", translation: 'Darimu', rootWord: 'ع ن' },
    { wordIndex: 2, arabic: 'وِزْرَكَ', transliteration: 'Wizrak', translation: 'Bebanmu', rootWord: 'و ز ر' },
  ],
  '94:3': [
    { wordIndex: 0, arabic: 'الَّذِيْٓ', transliteration: 'Allażī', translation: 'Yang', rootWord: 'ا ل ذ' },
    { wordIndex: 1, arabic: 'اَنْقَضَ', transliteration: 'Anqaḍa', translation: 'Memberatkan', rootWord: 'ن ق ض' },
    { wordIndex: 2, arabic: 'ظَهْرَكَ', transliteration: 'Ẓahrak', translation: 'Punggungmu', rootWord: 'ظ ه ر' },
  ],
  '94:4': [
    { wordIndex: 0, arabic: 'وَرَفَعْنَا', transliteration: "Wa rafa'nā", translation: 'Dan Kami tinggikan', rootWord: 'ر ف ع' },
    { wordIndex: 1, arabic: 'لَكَ', transliteration: 'Laka', translation: 'Bagimu', rootWord: 'ل' },
    { wordIndex: 2, arabic: 'ذِكْرَكَ', transliteration: 'Żikrak', translation: 'Kemuliaan sebutan namamu', rootWord: 'ذ ك ر' },
  ],
  '94:5': [
    { wordIndex: 0, arabic: 'فَاِنَّ', transliteration: 'Fa inna', translation: 'Maka sesungguhnya', rootWord: 'إ ن ن' },
    { wordIndex: 1, arabic: 'مَعَ', transliteration: "Ma'al", translation: 'Beserta', rootWord: 'م ع' },
    { wordIndex: 2, arabic: 'الْعُسْرِ', transliteration: "'Usri", translation: 'Kesulitan itu', rootWord: 'ع س ر' },
    { wordIndex: 3, arabic: 'يُسْرًا', transliteration: 'Yusrā', translation: 'Ada kemudahan', rootWord: 'ي س ر' },
  ],
  '94:6': [
    { wordIndex: 0, arabic: 'اِنَّ', transliteration: 'Inna', translation: 'Sesungguhnya', rootWord: 'إ ن ن' },
    { wordIndex: 1, arabic: 'مَعَ', transliteration: "Ma'al", translation: 'Beserta', rootWord: 'م ع' },
    { wordIndex: 2, arabic: 'الْعُسْرِ', transliteration: "'Usri", translation: 'Kesulitan itu', rootWord: 'ع س ر' },
    { wordIndex: 3, arabic: 'يُسْرًا', transliteration: 'Yusrā', translation: 'Ada kemudahan', rootWord: 'ي س ر' },
  ],
  '94:7': [
    { wordIndex: 0, arabic: 'فَاِذَا', transliteration: 'Fa iżā', translation: 'Maka apabila', rootWord: 'إ ذ ا' },
    { wordIndex: 1, arabic: 'فَرَغْتَ', transliteration: 'Faragta', translation: 'Engkau telah selesai (suatu urusan)', rootWord: 'ف ر غ' },
    { wordIndex: 2, arabic: 'فَانْصَبْ', transliteration: 'Fanṣab', translation: 'Maka tetaplah bersungguh-sungguh (beribadah)', rootWord: 'ن ص ب' },
  ],
  '94:8': [
    { wordIndex: 0, arabic: 'وَاِلٰى', transliteration: 'Wa ilā', translation: 'Dan hanya kepada', rootWord: 'إ ل ى' },
    { wordIndex: 1, arabic: 'رَبِّكَ', transliteration: 'Rabbika', translation: 'Tuhanmu', rootWord: 'ر ب ب' },
    { wordIndex: 2, arabic: 'فَارْغَبْ', transliteration: 'Fargab', translation: 'Berharaplah', rootWord: 'ر غ ب' },
  ],

  // === SURAH 93: AD-DUHA ===
  '93:1': [
    { wordIndex: 0, arabic: 'وَالضُّحٰى', transliteration: 'Waḍ-Ḍuḥā', translation: 'Demi waktu duha (matahari naik)', rootWord: 'ض ح و' },
  ],
  '93:2': [
    { wordIndex: 0, arabic: 'وَالَّيْلِ', transliteration: 'Wal-Laili', translation: 'Dan demi malam', rootWord: 'ل ي ل' },
    { wordIndex: 1, arabic: 'اِذَا', transliteration: 'Iżā', translation: 'Apabila', rootWord: 'إ ذ ا' },
    { wordIndex: 2, arabic: 'سَجٰى', transliteration: 'Sajā', translation: 'Telah sunyi senyap', rootWord: 'س ج و' },
  ],
  '93:3': [
    { wordIndex: 0, arabic: 'مَا', transliteration: 'Mā', translation: 'Tidaklah', rootWord: 'م ا' },
    { wordIndex: 1, arabic: 'وَدَّعَكَ', transliteration: "Wadda'aka", translation: 'Meninggalkanmu', rootWord: 'و د ع' },
    { wordIndex: 2, arabic: 'رَبُّكَ', transliteration: 'Rabbuka', translation: 'Tuhanmu', rootWord: 'ر ب ب' },
    { wordIndex: 3, arabic: 'وَمَا', transliteration: 'Wa mā', translation: 'Dan tidak pula', rootWord: 'م ا' },
    { wordIndex: 4, arabic: 'قَلٰى', transliteration: 'Qalā', translation: 'Membencimu', rootWord: 'ق ل ي' },
  ],
  '93:4': [
    { wordIndex: 0, arabic: 'وَلَلْاٰخِرَةُ', transliteration: 'Wa lal-Ākhiratu', translation: 'Dan sungguh akhirat itu', rootWord: 'أ خ ر' },
    { wordIndex: 1, arabic: 'خَيْرٌ', transliteration: 'Khairun', translation: 'Lebih baik', rootWord: 'خ ي ر' },
    { wordIndex: 2, arabic: 'لَّكَ', transliteration: 'Laka', translation: 'Bagimu', rootWord: 'ل' },
    { wordIndex: 3, arabic: 'مِنَ', transliteration: 'Minal', translation: 'Daripada', rootWord: 'م ن' },
    { wordIndex: 4, arabic: 'الْاُوْلٰى', transliteration: 'Ūlā', translation: 'Permulaan (kehidupan dunia)', rootWord: 'أ و ل' },
  ],
  '93:5': [
    { wordIndex: 0, arabic: 'وَلَسَوْفَ', transliteration: 'Wa lasaufa', translation: 'Dan kelak pasti', rootWord: 'س و ف' },
    { wordIndex: 1, arabic: 'يُعْطِيْكَ', transliteration: "Yu'ṭīka", translation: 'Memberimu', rootWord: 'ع ط ي' },
    { wordIndex: 2, arabic: 'رَبُّكَ', transliteration: 'Rabbuka', translation: 'Tuhanmu', rootWord: 'ر ب ب' },
    { wordIndex: 3, arabic: 'فَتَرْضٰى', transliteration: 'Fatardā', translation: 'Lalu engkau menjadi puas', rootWord: 'ر ض ي' },
  ],
  '93:6': [
    { wordIndex: 0, arabic: 'اَلَمْ', transliteration: 'Alam', translation: 'Bukankah', rootWord: 'ل م' },
    { wordIndex: 1, arabic: 'يَجِدْكَ', transliteration: 'Yajidka', translation: 'Dia mendapatimu', rootWord: 'و ج د' },
    { wordIndex: 2, arabic: 'يَتِيْمًا', transliteration: 'Yatīman', translation: 'Sebagai anak yatim', rootWord: 'ي ت م' },
    { wordIndex: 3, arabic: 'فَاٰوٰى', transliteration: 'Fa āwā', translation: 'Lalu Dia melindungimu?', rootWord: 'أ و ي' },
  ],
  '93:7': [
    { wordIndex: 0, arabic: 'وَوَجَدَكَ', transliteration: 'Wa wajadaka', translation: 'Dan Dia mendapatimu', rootWord: 'و ج د' },
    { wordIndex: 1, arabic: 'ضَاۤلًّا', transliteration: 'Ḍāllan', translation: 'Bingung (mencari petunjuk)', rootWord: 'ض ل ل' },
    { wordIndex: 2, arabic: 'فَهَدٰى', transliteration: 'Fahadā', translation: 'Lalu Dia memberi petunjuk?', rootWord: 'ه د ي' },
  ],
  '93:8': [
    { wordIndex: 0, arabic: 'وَوَجَدَكَ', transliteration: 'Wa wajadaka', translation: 'Dan Dia mendapatimu', rootWord: 'و ج د' },
    { wordIndex: 1, arabic: 'عَاۤىِٕلًا', transliteration: "‘Ā’ilan", translation: 'Kekurangan', rootWord: 'ع ي ل' },
    { wordIndex: 2, arabic: 'فَاَغْنٰى', transliteration: 'Fa agnā', translation: 'Lalu Dia mencukupkanmu?', rootWord: 'غ ن ي' },
  ],
  '93:9': [
    { wordIndex: 0, arabic: 'فَاَمَّا', transliteration: 'Fa ammal', translation: 'Maka adapun terhadap', rootWord: 'أ م م' },
    { wordIndex: 1, arabic: 'الْيَتِيْمَ', transliteration: 'Yatīma', translation: 'Anak yatim', rootWord: 'ي ت م' },
    { wordIndex: 2, arabic: 'فَلَا', transliteration: 'Falā', translation: 'Maka janganlah', rootWord: 'ل ا' },
    { wordIndex: 3, arabic: 'تَقْهَرْ', transliteration: 'Taqhar', translation: 'Engkau berlaku sewenang-wenang', rootWord: 'ق ه ر' },
  ],
  '93:10': [
    { wordIndex: 0, arabic: 'وَاَمَّا', transliteration: 'Wa ammas', translation: 'Dan adapun terhadap', rootWord: 'أ م م' },
    { wordIndex: 1, arabic: 'السَّاۤىِٕلَ', transliteration: 'Sā’ila', translation: 'Orang yang meminta-minta', rootWord: 'س أ ل' },
    { wordIndex: 2, arabic: 'فَلَا', transliteration: 'Falā', translation: 'Maka janganlah', rootWord: 'ل ا' },
    { wordIndex: 3, arabic: 'تَنْهَرْ', transliteration: 'Tanhar', translation: 'Engkau menghardiknya', rootWord: 'ن ه ر' },
  ],
  '93:11': [
    { wordIndex: 0, arabic: 'وَاَمَّا', transliteration: 'Wa ammā', translation: 'Dan adapun terhadap', rootWord: 'أ م م' },
    { wordIndex: 1, arabic: 'بِنِعْمَةِ', transliteration: "Bini'mati", translation: 'Nikmat', rootWord: 'ن ع م' },
    { wordIndex: 2, arabic: 'رَبِّكَ', transliteration: 'Rabbika', translation: 'Tuhanmu', rootWord: 'ر ب ب' },
    { wordIndex: 3, arabic: 'فَحَدِّثْ', transliteration: 'Fa ḥaddiṡ', translation: 'Maka ceritakanlah (dengan bersyukur)', rootWord: 'ح د ث' },
  ],

  // === SURAH 91: ASY-SYAMS ===
  '91:1': [
    { wordIndex: 0, arabic: 'وَالشَّمْسِ', transliteration: 'Wasy-Syams', translation: 'Demi matahari', rootWord: 'ش م س' },
    { wordIndex: 1, arabic: 'وَضُحٰىهَا', transliteration: 'Wa ḍuḥāhā', translation: 'Dan cahayanya di pagi hari', rootWord: 'ض ح و' },
  ],
  '91:2': [
    { wordIndex: 0, arabic: 'وَالْقَمَرِ', transliteration: 'Wal-Qamari', translation: 'Dan demi bulan', rootWord: 'ق م ر' },
    { wordIndex: 1, arabic: 'اِذَا', transliteration: 'Iżā', translation: 'Apabila', rootWord: 'إ ذ ا' },
    { wordIndex: 2, arabic: 'تَلٰىهَا', transliteration: 'Talāhā', translation: 'Mengiringinya', rootWord: 'ت ل و' },
  ],
  '91:3': [
    { wordIndex: 0, arabic: 'وَالنَّهَارِ', transliteration: 'Wan-Nahāri', translation: 'Dan demi siang', rootWord: 'ن ه ر' },
    { wordIndex: 1, arabic: 'اِذَا', transliteration: 'Iżā', translation: 'Apabila', rootWord: 'إ ذ ا' },
    { wordIndex: 2, arabic: 'جَلّٰىهَا', transliteration: 'Jallāhā', translation: 'Menampakkannya', rootWord: 'ج ل و' },
  ],
  '91:4': [
    { wordIndex: 0, arabic: 'وَالَّيْلِ', transliteration: 'Wal-Laili', translation: 'Dan demi malam', rootWord: 'ل ي ل' },
    { wordIndex: 1, arabic: 'اِذَا', transliteration: 'Iżā', translation: 'Apabila', rootWord: 'إ ذ ا' },
    { wordIndex: 2, arabic: 'يَغْشٰىهَا', transliteration: 'Yagsyāhā', translation: 'Menutupinya', rootWord: 'غ ش ي' },
  ],
  '91:5': [
    { wordIndex: 0, arabic: 'وَالسَّمَاۤءِ', transliteration: 'Was-Samā’i', translation: 'Dan demi langit', rootWord: 'س م و' },
    { wordIndex: 1, arabic: 'وَمَا', transliteration: 'Wa mā', translation: 'Serta penciptaannya', rootWord: 'م ا' },
    { wordIndex: 2, arabic: 'بَنٰىهَا', transliteration: 'Banāhā', translation: 'Yang membangunkannya', rootWord: 'ب ن ي' },
  ],
  '91:6': [
    { wordIndex: 0, arabic: 'وَالْاَرْضِ', transliteration: 'Wal-Arḍi', translation: 'Dan demi bumi', rootWord: 'أ ر ض' },
    { wordIndex: 1, arabic: 'وَمَا', transliteration: 'Wa mā', translation: 'Serta penghamparannya', rootWord: 'م ا' },
    { wordIndex: 2, arabic: 'طَحٰىهَا', transliteration: 'Ṭaḥāhā', translation: 'Yang menghamparkannya', rootWord: 'ط ح و' },
  ],
  '91:7': [
    { wordIndex: 0, arabic: 'وَنَفْسٍ', transliteration: 'Wa nafsin', translation: 'Dan demi jiwa', rootWord: 'ن ف س' },
    { wordIndex: 1, arabic: 'وَمَا', transliteration: 'Wa mā', translation: 'Serta penyempurnaannya', rootWord: 'م ا' },
    { wordIndex: 2, arabic: 'سَوّٰىهَا', transliteration: 'Sawwāhā', translation: 'Yang menyempurnakannya', rootWord: 'س و ي' },
  ],
  '91:8': [
    { wordIndex: 0, arabic: 'فَاَلْهَمَهَا', transliteration: 'Fa alhamahā', translation: 'Maka Dia mengilhamkan kepadanya', rootWord: 'ل ه م' },
    { wordIndex: 1, arabic: 'فُجُوْرَهَا', transliteration: 'Fujūrahā', translation: '(Jalan) kefasikan', rootWord: 'ف ج ر' },
    { wordIndex: 2, arabic: 'وَتَقْوٰىهَا', transliteration: 'Wa taqwāhā', translation: 'Dan ketakwaannya', rootWord: 'و ق ي' },
  ],
  '91:9': [
    { wordIndex: 0, arabic: 'قَدْ', transliteration: 'Qad', translation: 'Sungguh', rootWord: 'ق د' },
    { wordIndex: 1, arabic: 'اَفْلَحَ', transliteration: 'Aflaḥa', translation: 'Beruntunglah', rootWord: 'ف ل ح' },
    { wordIndex: 2, arabic: 'مَنْ', transliteration: 'Man', translation: 'Orang yang', rootWord: 'م ن' },
    { wordIndex: 3, arabic: 'زَكّٰىهَا', transliteration: 'Zakkāhā', translation: 'Menyucikan jiwa itu', rootWord: 'ز ك و' },
  ],
  '91:10': [
    { wordIndex: 0, arabic: 'وَقَدْ', transliteration: 'Wa qad', translation: 'Dan sungguh', rootWord: 'ق د' },
    { wordIndex: 1, arabic: 'خَابَ', transliteration: 'Khāba', translation: 'Rugilah', rootWord: 'خ ي ب' },
    { wordIndex: 2, arabic: 'مَنْ', transliteration: 'Man', translation: 'Orang yang', rootWord: 'م ن' },
    { wordIndex: 3, arabic: 'دَسّٰىهَا', transliteration: 'Dassāhā', translation: 'Mengotori jiwa itu', rootWord: 'د س س' },
  ],
  '91:11': [
    { wordIndex: 0, arabic: 'كَذَّبَتْ', transliteration: 'Każżabat', translation: 'Telah mendustakan', rootWord: 'ك ذ ب' },
    { wordIndex: 1, arabic: 'ثَمُوْدُ', transliteration: 'Ṡamūdu', translation: 'Kaum Tsamud', rootWord: 'ث م د' },
    { wordIndex: 2, arabic: 'بِطَغْوٰىهَا', transliteration: 'Biṭagwāhā', translation: 'Karena melampaui batas', rootWord: 'ط غ ي' },
  ],
  '91:12': [
    { wordIndex: 0, arabic: 'اِذِ', transliteration: 'Iżim', translation: 'Ketika bangkit', rootWord: 'إ ذ' },
    { wordIndex: 1, arabic: 'انْۢبَعَثَ', transliteration: 'Imba‘aṡa', translation: 'Bangkit dengan cepat', rootWord: 'ب ع ث' },
    { wordIndex: 2, arabic: 'اَشْقٰىهَا', transliteration: 'Asyqāhā', translation: 'Orang yang paling celaka di antara mereka', rootWord: 'ش ق ي' },
  ],
  '91:13': [
    { wordIndex: 0, arabic: 'فَقَالَ', transliteration: 'Fa qāla', translation: 'Lalu berkata', rootWord: 'ق و ل' },
    { wordIndex: 1, arabic: 'لَهُمْ', transliteration: 'Lahum', translation: 'Kepada mereka', rootWord: 'ل' },
    { wordIndex: 2, arabic: 'رَسُوْلُ', transliteration: 'Rasūlu', translation: 'Rasul', rootWord: 'ر س ل' },
    { wordIndex: 3, arabic: 'اللّٰهِ', transliteration: 'Lāhi', translation: 'Allah (Nabi Saleh)', rootWord: 'إ ل ه' },
    { wordIndex: 4, arabic: 'نَاقَةَ', transliteration: 'Nāqata', translation: '(Biarkanlah) unta betina', rootWord: 'ن و ق' },
    { wordIndex: 5, arabic: 'اللّٰهِ', transliteration: 'Allāh', translation: 'Allah', rootWord: 'إ ل ه' },
    { wordIndex: 6, arabic: 'وَسُقْيٰهَا', transliteration: 'Wa suqyāhā', translation: 'Dan minumannya', rootWord: 'س ق ي' },
  ],
  '91:14': [
    { wordIndex: 0, arabic: 'فَكَذَّبُوْهُ', transliteration: 'Fa każżabūhu', translation: 'Maka mereka mendustakannya', rootWord: 'ك ذ ب' },
    { wordIndex: 1, arabic: 'فَعَقَرُوْهَا', transliteration: "Fa 'aqarūhā", translation: 'Lalu menyembelih unta itu', rootWord: 'ع ق ر' },
    { wordIndex: 2, arabic: 'فَدَمْدَمَ', transliteration: 'Fa damdama', translation: 'Maka membinasakan mereka', rootWord: 'د م د م' },
    { wordIndex: 3, arabic: 'عَلَيْهِمْ', transliteration: "'Alaihim", translation: 'Atas mereka', rootWord: 'ع ل و' },
    { wordIndex: 4, arabic: 'رَبُّهُمْ', transliteration: 'Rabbuhum', translation: 'Tuhan mereka', rootWord: 'ر ب ب' },
    { wordIndex: 5, arabic: 'بِذَنْۢبِهِمْ', transliteration: 'Biżambihim', translation: 'Karena dosa mereka', rootWord: 'ذ ن ب' },
    { wordIndex: 6, arabic: 'فَسَوّٰىهَا', transliteration: 'Fa sawwāhā', translation: 'Lalu meratakan mereka (dengan tanah)', rootWord: 'س و ي' },
  ],
  '91:15': [
    { wordIndex: 0, arabic: 'وَلَا', transliteration: 'Wa lā', translation: 'Dan Dia tidak', rootWord: 'ل ا' },
    { wordIndex: 1, arabic: 'يَخَافُ', transliteration: 'Yakhāfu', translation: 'Takut akan', rootWord: 'خ و ف' },
    { wordIndex: 2, arabic: 'عُقْبٰهَا', transliteration: "'Uqbāhā", translation: 'Akibat perbuatan-Nya itu', rootWord: 'ع ق ب' },
  ],
};
