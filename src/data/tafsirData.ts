export interface TafsirSurahEntry {
  surahNumber: number;
  surahName: string;
  sourceAttribution: string;
  shortOverview: string;
  ayahTafsirs: {
    ayahNumber: number;
    arabicText: string;
    translation: string;
    tafsirRingkas: string;
    hikmahAnak: string;
  }[];
}

export const SCHOLARLY_TAFSIR_DATA: Record<number, TafsirSurahEntry> = {
  1: {
    surahNumber: 1,
    surahName: 'Al-Fatihah',
    sourceAttribution: 'Tafsir Ringkas Kementerian Agama Republik Indonesia (Kemenag RI)',
    shortOverview: 'Surah Al-Fatihah adalah induk Al-Qur\'an (Ummul Kitab). Berisi pujian agung kepada Allah, penegasan tauhid, dan doa memohon jalan yang lurus.',
    ayahTafsirs: [
      {
        ayahNumber: 1,
        arabicText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        translation: 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.',
        tafsirRingkas: 'Memulai setiap perbuatan baik dengan menyebut asma Allah Swt. agar perbuatan tersebut bernilai ibadah dan dilimpahi keberkahan.',
        hikmahAnak: 'Biasakan membaca basmalah sebelum makan, belajar, dan bermain agar selalu dilindungi Allah.',
      },
      {
        ayahNumber: 2,
        arabicText: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
        translation: 'Segala puji bagi Allah, Tuhan seluruh alam.',
        tafsirRingkas: 'Segala ungkapan sanjungan yang hakiki hanya milik Allah semata, Pengatur, Pemelihara, dan Pendidik semesta alam semesta.',
        hikmahAnak: 'Ucapkan "Alhamdulillah" saat selesai makan atau mendapatkan nikmat dan kemudahan.',
      },
      {
        ayahNumber: 3,
        arabicText: 'الرَّحْمَٰنِ الرَّحِيمِ',
        translation: 'Yang Maha Pengasih, Maha Penyayang.',
        tafsirRingkas: 'Kasih sayang Allah tercurah luas kepada seluruh makhluk di dunia, dan secara istimewa kepada hamba-hamba yang beriman di akhirat.',
        hikmahAnak: 'Allah sangat menyayangi kita, maka sayangi juga orang tua, guru, teman, dan hewan.',
      },
      {
        ayahNumber: 4,
        arabicText: 'مَالِكِ يَوْمِ الدِّينِ',
        translation: 'Pemilik hari pembalasan.',
        tafsirRingkas: 'Allah adalah Raja dan Penguasa mutlak pada Hari Kiamat, hari saat seluruh amal perbuatan manusia dihisab dengan seadil-adilnya.',
        hikmahAnak: 'Rajin berbuat baik karena setiap kebaikan kecil pasti akan dibalas pahala dan surga oleh Allah.',
      },
      {
        ayahNumber: 5,
        arabicText: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
        translation: 'Hanya kepada Engkaulah kami menyembah dan hanya kepada Engkaulah kami memohon pertolongan.',
        tafsirRingkas: 'Pengakuan ketundukan bahwa ibadah hanya dipersembahkan kepada Allah dan pertolongan dalam urusan dunia-akhirat hanya dimohonkan kepada-Nya.',
        hikmahAnak: 'Bila menghadapi kesulitan belajar atau ketakutan, segera berdoa dan minta tolong kepada Allah.',
      },
      {
        ayahNumber: 6,
        arabicText: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
        translation: 'Tunjukilah kami jalan yang lurus,',
        tafsirRingkas: 'Permohonan tulus agar Allah senantiasa membimbing hati kita di atas jalan kebenaran Islam yang terang tanpa kesesatan.',
        hikmahAnak: 'Minta bimbingan Allah agar selalu patuh pada kebenaran dan menjadi anak saleh/salehah.',
      },
      {
        ayahNumber: 7,
        arabicText: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
        translation: '(yaitu) jalan orang-orang yang telah Engkau beri nikmat kepadanya; bukan (jalan) mereka yang dimurkai, dan bukan (pula jalan) mereka yang sesat.',
        tafsirRingkas: 'Jalan para nabi, syuhada, dan orang-orang saleh terdahulu yang selamat; bukan jalan orang yang tahu kebenaran tapi membangkang atau tersesat dalam kebodohan.',
        hikmahAnak: 'Teladani akhlak mulia para Nabi dan orang-orang baik di sekitar kita.',
      },
    ],
  },
  112: {
    surahNumber: 112,
    surahName: 'Al-Ikhlas',
    sourceAttribution: 'Tafsir Ringkas Kementerian Agama Republik Indonesia (Kemenag RI)',
    shortOverview: 'Surah Al-Ikhlas memurnikan ketauhidan dan mengesakan Allah Swt. Nilai pahala membacanya setara sepertiga Al-Qur\'an.',
    ayahTafsirs: [
      {
        ayahNumber: 1,
        arabicText: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
        translation: 'Katakanlah: "Dialah Allah, Yang Maha Esa.',
        tafsirRingkas: 'Katakanlah wahai Muhammad kepada mereka: Allah itu Esa, Tunggal dalam zat, sifat, dan perbuatan-Nya.',
        hikmahAnak: 'Tiada tuhan selain Allah yang menciptakan langit, bumi, dan diri kita.',
      },
      {
        ayahNumber: 2,
        arabicText: 'اللَّهُ الصَّمَدُ',
        translation: 'Allah tempat meminta segala sesuatu.',
        tafsirRingkas: 'Allah adalah As-Shamad, Dzat yang dituju oleh seluruh makhluk untuk memohon segala hajat dan kebutuhan mereka.',
        hikmahAnak: 'Allah selalu mendengar doa kita kapan saja dan di mana saja.',
      },
      {
        ayahNumber: 3,
        arabicText: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
        translation: 'Dia tidak beranak dan tidak pula diperanakkan,',
        tafsirRingkas: 'Allah Maha Suci dari memiliki anak atau diperanakkan dari siapa pun.',
        hikmahAnak: 'Allah tidak sama dengan makhluk mana pun di dunia ini.',
      },
      {
        ayahNumber: 4,
        arabicText: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
        translation: 'dan tidak ada seorang pun yang setara dengan Dia."',
        tafsirRingkas: 'Tidak ada sekutu, tandingan, ataupun yang setara dengan keagungan Allah Swt.',
        hikmahAnak: 'Hanya Allah yang paling kita cintai dan patuhi di atas segalanya.',
      },
    ],
  },
  114: {
    surahNumber: 114,
    surahName: 'An-Nas',
    sourceAttribution: 'Tafsir Ringkas Kementerian Agama Republik Indonesia (Kemenag RI)',
    shortOverview: 'Surah An-Nas adalah doa perlindungan (Al-Mu\'awwidzatain) dari bisikan jahat setan dan manusia yang merusak hati.',
    ayahTafsirs: [
      {
        ayahNumber: 1,
        arabicText: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
        translation: 'Katakanlah: "Aku berlindung kepada Tuhannya manusia,',
        tafsirRingkas: 'Perintah memohon perlindungan kepada Allah yang memelihara dan mendidik seluruh manusia.',
        hikmahAnak: 'Jangan takut kegelapan atau mimpi buruk, bacalah surah An-Nas sebagai benteng diri.',
      },
      {
        ayahNumber: 2,
        arabicText: 'مَلِكِ النَّاسِ',
        translation: 'Raja manusia,',
        tafsirRingkas: 'Raja yang sesungguhnya berkuasa dan mengatur kehidupan manusia.',
        hikmahAnak: 'Semua pemimpin di dunia berada di bawah kekuasaan Allah yang Maha Adil.',
      },
      {
        ayahNumber: 3,
        arabicText: 'إِلَٰهِ النَّاسِ',
        translation: 'Sembahan manusia,',
        tafsirRingkas: 'Satu-satunya sesembahan yang berhak diibadahi dengan penuh rasa cinta dan tawadhu.',
        hikmahAnak: 'Salat dan ibadah kita hanya kita persembahkan untuk Allah semata.',
      },
      {
        ayahNumber: 4,
        arabicText: 'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ',
        translation: 'dari kejahatan (bisikan) setan yang bersembunyi,',
        tafsirRingkas: 'Setan membisikkan ragu dan malas saat manusia lalai, namun mundur bersembunyi saat manusia mengingat Allah.',
        hikmahAnak: 'Bila merasa malas salat atau belajar, segera sebut nama Allah agar setan lari.',
      },
      {
        ayahNumber: 5,
        arabicText: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ',
        translation: 'yang membisikkan (kejahatan) ke dalam dada manusia,',
        tafsirRingkas: 'Setan meniupkan bisikan jahat, iri hati, dan amarah ke dalam dada manusia.',
        hikmahAnak: 'Jaga hati dari rasa marah dan iri kepada sesama teman.',
      },
      {
        ayahNumber: 6,
        arabicText: 'مِنَ الْجِنَّةِ وَالنَّاسِ',
        translation: 'dari (golongan) jin dan manusia.',
        tafsirRingkas: 'Godaan kejahatan bisa datang dari setan bangsa jin maupun ajakan buruk teman berwujud manusia.',
        hikmahAnak: 'Pilihlah teman-teman yang suka berbuat baik dan saling mengingatkan dalam kebaikan.',
      },
    ],
  },
};
