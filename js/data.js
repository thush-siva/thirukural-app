/*
 * Prototype content for three sample chapters.
 * Word splits, transliterations and glosses are working drafts and need
 * review by a Tamil scholar before release.
 * Each kural: n (number), tr (transliteration), m (meaning),
 * l (two lines, each a list of [tamil word, transliteration, gloss]).
 */
window.KURAL_DATA = {
  sections: [
    {
      id: 'virtue', num: 'I', ta: 'அறம்', taBook: 'அறத்துப்பால்', en: 'Virtue',
      chCount: 38, range: '1–38', kurals: '1–380', more: 30,
      cover: '#1E5E4A', spine: '#154535', deep: '#0B1F18', glow: '#2E8A6B', card: '#1E5E4A', cardRgb: '30,94,74',
      ground: '#0B1F18', resume: 'Start at Kural 1', sample: '1', hov: 0,
      chapters: [
        { n: 1, ta: 'கடவுள் வாழ்த்து', en: 'In Praise of God', read: 10 },
        { n: 2, ta: 'வான்சிறப்பு', en: 'The Excellence of Rain', read: 10 },
        { n: 3, ta: 'நீத்தார் பெருமை', en: 'The Greatness of Ascetics', read: 10 },
        { n: 4, ta: 'அறன்வலியுறுத்தல்', en: 'The Strength of Virtue', read: 10 },
        { n: 5, ta: 'இல்வாழ்க்கை', en: 'Domestic Life', read: 10 },
        { n: 6, ta: 'வாழ்க்கைத்துணைநலம்', en: 'The Good Spouse', read: 10 },
        { n: 7, ta: 'மக்கட்பேறு', en: 'Children', read: 10 },
        { n: 8, ta: 'அன்புடைமை', en: 'The Possession of Love', read: 10 }
      ]
    },
    {
      id: 'wealth', num: 'II', ta: 'பொருள்', taBook: 'பொருட்பால்', en: 'Wealth',
      chCount: 70, range: '39–108', kurals: '381–1080', more: 62,
      cover: '#99581A', spine: '#744112', deep: '#211508', glow: '#C9822B', card: '#8F5318', cardRgb: '143,83,24',
      ground: '#211508', resume: 'Continue chapter 40', sample: '40', hov: 1,
      chapters: [
        { n: 39, ta: 'இறைமாட்சி', en: 'The Greatness of a King', read: 10 },
        { n: 40, ta: 'கல்வி', en: 'Learning', read: 3, reading: true },
        { n: 41, ta: 'கல்லாமை', en: 'Ignorance', read: 0 },
        { n: 42, ta: 'கேள்வி', en: 'Listening', read: 0 },
        { n: 43, ta: 'அறிவுடைமை', en: 'Possession of Knowledge', read: 0 },
        { n: 44, ta: 'குற்றங்கடிதல்', en: 'The Correction of Faults', read: 0 },
        { n: 45, ta: 'பெரியாரைத் துணைக்கோடல்', en: 'Seeking Wise Counsel', read: 0 },
        { n: 46, ta: 'சிற்றினம் சேராமை', en: 'Avoiding Mean Company', read: 0 }
      ]
    },
    {
      id: 'love', num: 'III', ta: 'இன்பம்', taBook: 'காமத்துப்பால்', en: 'Love',
      chCount: 25, range: '109–133', kurals: '1081–1330', more: 17,
      cover: '#8E2F45', spine: '#6C2133', deep: '#1F0910', glow: '#BF4864', card: '#8E2F45', cardRgb: '142,47,69',
      ground: '#1F0910', resume: 'Start at Kural 1081', sample: '109', hov: 0,
      chapters: [
        { n: 109, ta: 'தகையணங்குறுத்தல்', en: 'Beauty That Unsettles', read: 0 },
        { n: 110, ta: 'குறிப்பறிதல்', en: 'Reading the Signs', read: 0 },
        { n: 111, ta: 'புணர்ச்சிமகிழ்தல்', en: 'The Joy of Union', read: 0 },
        { n: 112, ta: 'நலம்புனைந்துரைத்தல்', en: 'Praising Her Beauty', read: 0 },
        { n: 113, ta: 'காதற்சிறப்புரைத்தல்', en: 'The Excellence of Love', read: 0 },
        { n: 114, ta: 'நாணுத்துறவுரைத்தல்', en: 'Casting Off Reserve', read: 0 },
        { n: 115, ta: 'அலரறிவுறுத்தல்', en: 'When Rumour Spreads', read: 0 },
        { n: 116, ta: 'பிரிவாற்றாமை', en: 'Unbearable Separation', read: 0 }
      ]
    }
  ],

  chapters: {
    '1': {
      num: 1, ta: 'கடவுள் வாழ்த்து', en: 'In Praise of God', section: 'Virtue', read: 10,
      kurals: [
        { n: 1, tr: 'Akara mudhala ezhuththellaam aadhi / bhagavan mudhatre ulagu.', m: 'As the letter A is the first of all letters, the Primal God is the first of the world.',
          l: [[['அகர', 'akara', 'the letter A'], ['முதல', 'mudhala', 'is first of'], ['எழுத்தெல்லாம்', 'ezhuththellaam', 'all letters'], ['ஆதி', 'aadhi', 'the Primal One']],
              [['பகவன்', 'bhagavan', 'God'], ['முதற்றே', 'mudhatre', 'is first of'], ['உலகு.', 'ulagu', 'the world']]] },
        { n: 2, tr: 'Katradhanaal aaya payanenkol vaalarivan / natraal thozhaaar enin.', m: 'What use is all one’s learning if one does not bow at the feet of the One of pure knowledge?',
          l: [[['கற்றதனால்', 'katradhanaal', 'from all one has learnt'], ['ஆய', 'aaya', 'that comes'], ['பயனென்கொல்', 'payanenkol', 'what is the use'], ['வாலறிவன்', 'vaalarivan', 'the One of pure knowledge']],
              [['நற்றாள்', 'natraal', 'holy feet'], ['தொழாஅர்', 'thozhaaar', 'do not worship'], ['எனின்.', 'enin', 'if']]] },
        { n: 3, tr: 'Malarmisai eginaan maanadi serndhaar / nilamisai needuvaazh vaar.', m: 'Those who reach the glorious feet of the One who walks upon the flower of the heart live long on this earth.',
          l: [[['மலர்மிசை', 'malarmisai', 'upon the flower'], ['ஏகினான்', 'eginaan', 'the One who walked'], ['மாணடி', 'maanadi', 'glorious feet'], ['சேர்ந்தார்', 'serndhaar', 'those who reach']],
              [['நிலமிசை', 'nilamisai', 'on this earth'], ['நீடுவாழ் வார்.', 'needuvaazhvaar', 'will live long']]] },
        { n: 4, tr: 'Venduthal vendaamai ilaanadi serndhaarkku / yaandum idumbai ila.', m: 'Those who reach the feet of the One free of desire and aversion never suffer.',
          l: [[['வேண்டுதல்', 'venduthal', 'desire'], ['வேண்டாமை', 'vendaamai', 'aversion'], ['இலானடி', 'ilaanadi', 'feet of the One without'], ['சேர்ந்தார்க்கு', 'serndhaarkku', 'for those who reach']],
              [['யாண்டும்', 'yaandum', 'at any time'], ['இடும்பை', 'idumbai', 'suffering'], ['இல.', 'ila', 'there is none']]] },
        { n: 5, tr: 'Irulser iruvinaiyum seraa iraivan / porulser pugazhpurindhaar maattu.', m: 'The dark fruits of good and bad deeds do not cling to those who truly praise God.',
          l: [[['இருள்சேர்', 'irulser', 'born of darkness'], ['இருவினையும்', 'iruvinaiyum', 'both kinds of deeds'], ['சேரா', 'seraa', 'do not cling'], ['இறைவன்', 'iraivan', 'God']],
              [['பொருள்சேர்', 'porulser', 'true, meaningful'], ['புகழ்புரிந்தார்', 'pugazhpurindhaar', 'those who praise'], ['மாட்டு.', 'maattu', 'to them']]] },
        { n: 6, tr: 'Porivaayil aindhaviththaan poidheer ozhukka / nerinindraar needuvaazh vaar.', m: 'Those who keep to the true path of the One who mastered the five senses live long.',
          l: [[['பொறிவாயில்', 'porivaayil', 'the gates of the senses'], ['ஐந்தவித்தான்', 'aindhaviththaan', 'the One who stilled all five'], ['பொய்தீர்', 'poidheer', 'free of falsehood'], ['ஒழுக்க', 'ozhukka', 'of conduct']],
              [['நெறிநின்றார்', 'nerinindraar', 'those who keep to the path'], ['நீடுவாழ் வார்.', 'needuvaazhvaar', 'will live long']]] },
        { n: 7, tr: 'Thanakkuvamai illaadhaan thaalserndhaark kallaal / manakkavalai maatral aridhu.', m: 'Only those who reach the feet of the One beyond compare can be free of worry.',
          l: [[['தனக்குவமை', 'thanakkuvamai', 'a likeness to Him'], ['இல்லாதான்', 'illaadhaan', 'the One without'], ['தாள்சேர்ந்தார்க்', 'thaalserndhaark', 'for those who reach His feet'], ['கல்லால்', 'kallaal', 'except']],
              [['மனக்கவலை', 'manakkavalai', 'worry of the mind'], ['மாற்றல்', 'maatral', 'to remove'], ['அரிது.', 'aridhu', 'is hard']]] },
        { n: 8, tr: 'Aravaazhi andhanan thaalserndhaark kallaal / piravaazhi neendhal aridhu.', m: 'Only those who reach the feet of the Gracious One, the sea of virtue, can cross the other seas of life.',
          l: [[['அறவாழி', 'aravaazhi', 'the sea of virtue'], ['அந்தணன்', 'andhanan', 'the Gracious One'], ['தாள்சேர்ந்தார்க்', 'thaalserndhaark', 'for those who reach His feet'], ['கல்லால்', 'kallaal', 'except']],
              [['பிறவாழி', 'piravaazhi', 'the other seas'], ['நீந்தல்', 'neendhal', 'to swim across'], ['அரிது.', 'aridhu', 'is hard']]] },
        { n: 9, tr: 'Kolil poriyin gunamilave enkunaththaan / thaalai vanangaath thalai.', m: 'A head that does not bow to the One of eight virtues is as useless as a sense that cannot perceive.',
          l: [[['கோளில்', 'kolil', 'unable to perceive'], ['பொறியின்', 'poriyin', 'like a sense'], ['குணமிலவே', 'gunamilave', 'is without worth'], ['எண்குணத்தான்', 'enkunaththaan', 'the One of eight virtues']],
              [['தாளை', 'thaalai', 'the feet'], ['வணங்காத்', 'vanangaa', 'that does not bow to'], ['தலை.', 'thalai', 'a head']]] },
        { n: 10, tr: 'Piravip perungadal neendhuvar neendhaar / iraivan adiseraa dhaar.', m: 'Those who reach God’s feet cross the great sea of births. Those who do not, cannot.',
          l: [[['பிறவிப்', 'piravi', 'of births'], ['பெருங்கடல்', 'perungadal', 'the great sea'], ['நீந்துவர்', 'neendhuvar', 'will swim across'], ['நீந்தார்', 'neendhaar', 'will not swim across']],
              [['இறைவன்', 'iraivan', 'God'], ['அடிசேரா தார்.', 'adiseraadhaar', 'those who do not reach the feet']]] }
      ]
    },

    '40': {
      num: 40, ta: 'கல்வி', en: 'Learning', section: 'Wealth', read: 3,
      kurals: [
        { n: 391, tr: 'Karka kasadarak karpavai katrapin / nirka atharkuth thaga.', m: 'Learn thoroughly what is worth learning. Then live by it.',
          l: [[['கற்க', 'karka', 'learn'], ['கசடறக்', 'kasadara', 'without flaw; thoroughly'], ['கற்பவை', 'karpavai', 'what ought to be learnt'], ['கற்றபின்', 'katrapin', 'after learning it']],
              [['நிற்க', 'nirka', 'stand firm; live'], ['அதற்குத்', 'atharku', 'by it; true to it'], ['தக.', 'thaga', 'fittingly']]] },
        { n: 392, tr: 'Ennenba yenai ezhuthenba ivvirandum / kannenba vaazhum uyirkku.', m: 'Numbers and letters are the two eyes of every living being.',
          l: [[['எண்ணென்ப', 'ennenba', 'what is called number'], ['ஏனை', 'enai', 'and the other'], ['எழுத்தென்ப', 'ezhuthenba', 'what is called letters'], ['இவ்விரண்டும்', 'ivvirandum', 'these two together']],
              [['கண்ணென்ப', 'kannenba', 'are called eyes'], ['வாழும்', 'vaazhum', 'living'], ['உயிர்க்கு.', 'uyirkku', 'to every being']]] },
        { n: 393, tr: 'Kannudaiyar enbavar katror mugaththirandu / punnudaiyar kalla thavar.', m: 'Only the learned truly have eyes. The unlearned have two sores on their face.',
          l: [[['கண்ணுடையர்', 'kannudaiyar', 'those who have eyes'], ['என்பவர்', 'enbavar', 'are said to be'], ['கற்றோர்', 'katror', 'the learned'], ['முகத்திரண்டு', 'mugaththirandu', 'two on the face']],
              [['புண்ணுடையர்', 'punnudaiyar', 'have sores'], ['கல்லா தவர்.', 'kallaadhavar', 'those who have not learnt']]] },
        { n: 394, tr: 'Uvappath thalaikkoodi ullap pirithal / anaiththe pulavar thozhil.', m: 'The scholar’s way: meet people with joy, and part leaving them thinking fondly of you.',
          l: [[['உவப்பத்', 'uvappa', 'gladly'], ['தலைக்கூடி', 'thalaikkoodi', 'coming together'], ['உள்ளப்', 'ulla', 'to be remembered'], ['பிரிதல்', 'pirithal', 'parting']],
              [['அனைத்தே', 'anaiththe', 'such indeed is'], ['புலவர்', 'pulavar', 'of scholars'], ['தொழில்.', 'thozhil', 'the way; the work']]] },
        { n: 395, tr: 'Udaiyaarmun illaarpol ekkattrung katraar / kadaiyare kalla thavar.', m: 'The learned stand humbly before teachers, as the poor stand before the rich. Those who will not learn are the lowest.',
          l: [[['உடையார்முன்', 'udaiyaarmun', 'before those who have'], ['இல்லார்போல்', 'illaarpol', 'like those who have not'], ['ஏக்கற்றுங்', 'ekkattrum', 'humbly, with longing'], ['கற்றார்', 'katraar', 'those who learn']],
              [['கடையரே', 'kadaiyare', 'are surely the lowest'], ['கல்லா தவர்.', 'kallaadhavar', 'those who have not learnt']]] },
        { n: 396, tr: 'Thottanaith thoorum manarkeni maandharkkuk / katranaith thoorum arivu.', m: 'The deeper you dig a well in sand, the more water flows. The more you learn, the more wisdom flows.',
          l: [[['தொட்டனைத்', 'thottanai', 'as deep as it is dug'], ['தூறும்', 'thoorum', 'springs up'], ['மணற்கேணி', 'manarkeni', 'a well in sand'], ['மாந்தர்க்குக்', 'maandharkku', 'for people']],
              [['கற்றனைத்', 'katranai', 'as much as is learnt'], ['தூறும்', 'thoorum', 'springs up'], ['அறிவு.', 'arivu', 'knowledge; wisdom']]] },
        { n: 397, tr: 'Yaadhaanum naadaamaal ooraamaal ennoruvan / saandhunaiyung kallaadha vaaru.', m: 'To the learned, every land and every town is home. Why would anyone stay unlearned until death?',
          l: [[['யாதானும்', 'yaadhaanum', 'any place at all'], ['நாடாமால்', 'naadaamaal', 'becomes one’s own land'], ['ஊராமால்', 'ooraamaal', 'becomes one’s own town'], ['என்னொருவன்', 'ennoruvan', 'why would anyone']],
              [['சாந்துணையுங்', 'saandhunaiyum', 'right up to death'], ['கல்லாத', 'kallaadha', 'not learning'], ['வாறு.', 'vaaru', 'remain so']]] },
        { n: 398, tr: 'Orumaikkan thaankatra kalvi oruvarku / ezhumaiyum emaap pudaiththu.', m: 'Learning gained in one life protects a person through seven births.',
          l: [[['ஒருமைக்கண்', 'orumaikkan', 'in one birth'], ['தான்கற்ற', 'thaankatra', 'that one has learnt'], ['கல்வி', 'kalvi', 'learning'], ['ஒருவற்கு', 'oruvarku', 'for a person']],
              [['எழுமையும்', 'ezhumaiyum', 'through seven births'], ['ஏமாப்', 'emaa', 'protection'], ['புடைத்து.', 'pudaiththu', 'it holds; it gives']]] },
        { n: 399, tr: 'Thaamin puruvadhu ulagin purakkandu / kaamuruvar katrarin dhaar.', m: 'When the learned see that what delights them also delights the world, they love learning all the more.',
          l: [[['தாமின் புறுவது', 'thaam inburuvadhu', 'what they delight in'], ['உலகின் புறக்கண்டு', 'ulagu inburak kandu', 'seeing it delight the world']],
              [['காமுறுவர்', 'kaamuruvar', 'they long for it more'], ['கற்றறிந் தார்.', 'katrarindhaar', 'those who have learnt']]] },
        { n: 400, tr: 'Kedil vizhuchchelvam kalvi yoruvarku / maadalla matrai yavai.', m: 'Learning is the one wealth that cannot be lost. Every other kind of riches falls short of it.',
          l: [[['கேடில்', 'kedil', 'imperishable'], ['விழுச்செல்வம்', 'vizhuchchelvam', 'excellent wealth'], ['கல்வி', 'kalvi', 'learning'], ['யொருவற்கு', 'oruvarku', 'for a person']],
              [['மாடல்ல', 'maadalla', 'are not true wealth'], ['மற்றை யவை.', 'matraiyavai', 'all other things']]] }
      ]
    },

    '109': {
      num: 109, ta: 'தகையணங்குறுத்தல்', en: 'Beauty That Unsettles', section: 'Love', read: 0,
      kurals: [
        { n: 1081, tr: 'Anangukol aaymayil kollo kanangkuzhai / maadharkol maalumen nenju.', m: 'Is she a goddess, a peacock, or a woman wearing heavy earrings? My heart is bewildered.',
          l: [[['அணங்குகொல்', 'anangukol', 'is she a goddess'], ['ஆய்மயில்', 'aaymayil', 'a fine peacock'], ['கொல்லோ', 'kollo', 'or perhaps'], ['கனங்குழை', 'kanangkuzhai', 'with heavy earrings']],
              [['மாதர்கொல்', 'maadharkol', 'is she a woman'], ['மாலுமென்', 'maalumen', 'bewildered is my'], ['நெஞ்சு.', 'nenju', 'heart']]] },
        { n: 1082, tr: 'Nokkinaal nokkedhir nokkudhal thaakkanangu / thaanaik kondanna dhudaiththu.', m: 'When she returns my look, it is as if a goddess attacked with an army behind her.',
          l: [[['நோக்கினாள்', 'nokkinaal', 'she who looked'], ['நோக்கெதிர்', 'nokkedhir', 'in answer to my look'], ['நோக்குதல்', 'nokkudhal', 'her glancing back'], ['தாக்கணங்கு', 'thaakkanangu', 'an attacking goddess']],
              [['தானைக்கொண் டன்ன', 'thaanaik kondanna', 'as if leading an army'], ['துடைத்து.', 'udaiththu', 'it is so']]] },
        { n: 1083, tr: 'Pandariyen kootren badhanai iniyarindhen / pendagaiyaal peramark kattu.', m: 'I never knew what Death was. Now I know: it is a lovely woman with eyes that wage war.',
          l: [[['பண்டறியேன்', 'pandariyen', 'I never knew before'], ['கூற்றென்', 'kootren', 'what is called Death'], ['பதனை', 'badhanai', 'that thing'], ['இனியறிந்தேன்', 'iniyarindhen', 'now I know']],
              [['பெண்டகையால்', 'pendagaiyaal', 'it is a graceful woman'], ['பேரமர்க்', 'peramark', 'waging great battle'], ['கட்டு.', 'kattu', 'with eyes']]] },
        { n: 1084, tr: 'Kandaar uyirunnum thotraththaal pendagaip / pedhaik kamarththana kan.', m: 'This innocent girl’s eyes take the life of all who see them. They are at odds with her gentle nature.',
          l: [[['கண்டார்', 'kandaar', 'of those who see'], ['உயிருண்ணும்', 'uyirunnum', 'that consumes the life'], ['தோற்றத்தால்', 'thotraththaal', 'by their look'], ['பெண்டகைப்', 'pendagai', 'of the graceful woman']],
              [['பேதைக்', 'pedhai', 'the innocent one'], ['கமர்த்தன', 'amarththana', 'are at odds with'], ['கண்.', 'kan', 'her eyes']]] },
        { n: 1085, tr: 'Kootramo kanno pinaiyo madavaral / nokkamim moondrum udaiththu.', m: 'Death, eyes, or a doe? Her glance holds all three.',
          l: [[['கூற்றமோ', 'kootramo', 'is it Death'], ['கண்ணோ', 'kanno', 'or eyes'], ['பிணையோ', 'pinaiyo', 'or a doe'], ['மடவரல்', 'madavaral', 'of the young woman']],
              [['நோக்கமிம்', 'nokkamim', 'the glance, these'], ['மூன்றும்', 'moondrum', 'all three'], ['உடைத்து.', 'udaiththu', 'it holds']]] },
        { n: 1086, tr: 'Kodumpuruvam kodaa maraippin nadunganjar / seyyala manival kan.', m: 'If her arched brows stood straight and shielded them, her eyes would not make me tremble.',
          l: [[['கொடும்புருவம்', 'kodumpuruvam', 'the arched brows'], ['கோடா', 'kodaa', 'without bending'], ['மறைப்பின்', 'maraippin', 'if they shielded'], ['நடுங்கஞர்', 'nadunganjar', 'trembling pain']],
              [['செய்யல', 'seyyala', 'would not cause'], ['மன்இவள்', 'manival', 'surely her'], ['கண்.', 'kan', 'eyes']]] },
        { n: 1087, tr: 'Kadaaak kalitrinmer katpadaam maadhar / padaaa mulaimel thugil.', m: 'The cloth across her breast is like the cloth that covers a raging elephant’s eyes.',
          l: [[['கடாஅக்', 'kadaaa', 'in rut'], ['களிற்றின்மேற்', 'kalitrinmer', 'upon a bull elephant'], ['கட்படாம்', 'katpadaam', 'the cloth over the face'], ['மாதர்', 'maadhar', 'of the woman']],
              [['படாஅ', 'padaaa', 'firm'], ['முலைமேல்', 'mulaimel', 'on the breast'], ['துகில்.', 'thugil', 'the garment']]] },
        { n: 1088, tr: 'Onnudhar koo udaindhadhe gnaatpinul / nannaarum utkumen peedu.', m: 'Alas, my strength, which even enemies feared in battle, has broken before her bright forehead.',
          l: [[['ஒண்ணுதற்', 'onnudhar', 'to her bright forehead'], ['கோஒ', 'koo', 'alas'], ['உடைந்ததே', 'udaindhadhe', 'has broken'], ['ஞாட்பினுள்', 'gnaatpinul', 'in battle']],
              [['நண்ணாரும்', 'nannaarum', 'even enemies'], ['உட்குமென்', 'utkumen', 'feared, my'], ['பீடு.', 'peedu', 'strength']]] },
        { n: 1089, tr: 'Pinaiyer madanokkum naanum udaiyaatku / aniyevano edhila thandhu.', m: 'With a doe’s gentle glance and modesty, what need does she have for jewellery?',
          l: [[['பிணையேர்', 'pinaiyer', 'doe-like'], ['மடநோக்கும்', 'madanokkum', 'innocent glance'], ['நாணும்', 'naanum', 'and modesty'], ['உடையாட்கு', 'udaiyaatku', 'for her who has']],
              [['அணியெவனோ', 'aniyevano', 'why adornment'], ['ஏதில', 'edhila', 'foreign things'], ['தந்து.', 'thandhu', 'bringing']]] },
        { n: 1090, tr: 'Undaarkan alladhu adunaraak kaamampol / kandaar magizhseydhal indru.', m: 'Wine delights only those who drink it. Love delights just by being seen.',
          l: [[['உண்டார்கண்', 'undaarkan', 'in those who drink'], ['அல்லது', 'alladhu', 'only'], ['அடுநறாக்', 'adunaraa', 'brewed wine'], ['காமம்போல்', 'kaamampol', 'unlike love']],
              [['கண்டார்', 'kandaar', 'in those who see'], ['மகிழ்செய்தல்', 'magizhseydhal', 'causing delight'], ['இன்று.', 'indru', 'it does not']]] }
      ]
    }
  }
};
