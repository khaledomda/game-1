// Bilingual (Arabic / English) strings, voice phrases, facts and quiz content.
// Phrases may be a plain string or {m, f} for gendered Arabic forms.

export const STRINGS = {
  en: {
    appName: 'Vitaland',
    tagline: 'Fly high. Eat smart. Beat the Junk Fog!',
    play: 'Play',
    start: 'Start',
    players: 'Who is playing?',
    addPlayer: 'New hero',
    newHero: 'Create your hero',
    yourName: 'Your name',
    namePh: 'Type your name…',
    age: 'Age',
    years: 'years',
    iAm: 'I am a',
    boy: 'Boy',
    girl: 'Girl',
    chooseHero: 'Choose your hero',
    save: 'Save',
    back: 'Back',
    next: 'Next',
    done: 'Done',
    cancel: 'Cancel',
    del: 'Delete',
    checkinTitle: 'Daily Hero Check-in',
    checkinSub: 'In the last 24 hours, how many times did you eat…',
    honest: 'Real heroes always tell the truth!',
    junkStep: 'Junk food',
    healthyStep: 'Healthy food',
    resultTitle: 'Your Vitality today',
    effects: 'In the game today:',
    hearts: 'Hearts',
    speed: 'Agility',
    charge: 'Power charge',
    letsFly: "Let's fly!",
    editCheckin: 'Edit today’s check-in',
    checkinDone: 'Checked in today',
    needCheckin: 'Do your daily check-in to fly!',
    checkinNeeded: 'Check-in today',
    best: 'Best',
    streak: 'Healthy streak',
    days: 'days',
    badges: 'Badges',
    leaderboard: 'Family leaderboard',
    week: 'My last 7 days',
    share: 'Share',
    switchPlayer: 'Switch hero',
    settings: 'Settings',
    language: 'Language',
    sound: 'Sound effects',
    music: 'Music',
    voice: 'Voice phrases',
    howTo: 'How to play',
    howTo1: 'Drag your finger (or use ← →) to steer your leaf glider.',
    howTo2: 'Catch healthy food to fill your power and score points.',
    howTo3: 'Dodge the junk-food monsters — they steal your hearts!',
    howTo4: 'When your power ring is full, tap the power button (or Space).',
    howTo5: 'Eat healthy in real life → your hero starts stronger tomorrow!',
    score: 'Score',
    level: 'World',
    paused: 'Paused',
    resume: 'Resume',
    home: 'Home',
    restart: 'Play again',
    gameOver: 'The Junk Fog got you!',
    worldClear: 'World cleared!',
    funFact: 'Did you know?',
    quiz: 'Quick quiz',
    correct: 'Correct! +100',
    wrong: 'Not this time!',
    continue: 'Continue',
    newBest: 'New best score!',
    resetData: 'Delete all data',
    confirmReset: 'Delete all heroes and scores on this device?',
    confirmDelete: 'Delete this hero?',
    installApp: 'Install app',
    shareText: 'I scored {score} in Vitaland and chose healthy food today! Can you beat me?',
    vitalityLabels: ['Very tired', 'Tired', 'Okay', 'Strong', 'Super hero!'],
    power: 'Power',
    ready: 'READY!',
    today: 'Today',
    noScores: 'No scores yet — be the first!',
    parentsNote: 'For parents: Vitaland has no ads, no accounts and keeps all data on this device only.',
    abilityReady: 'Power ready!',
    of: 'of',
  },
  ar: {
    appName: 'فيتالاند',
    tagline: 'حلّق عالياً. كُل بذكاء. اهزم ضباب الأكل الضار!',
    play: 'العب',
    start: 'ابدأ',
    players: 'من سيلعب؟',
    addPlayer: 'بطل جديد',
    newHero: 'اصنع بطلك',
    yourName: 'اسمك',
    namePh: 'اكتب اسمك…',
    age: 'العمر',
    years: 'سنة',
    iAm: 'أنا',
    boy: 'ولد',
    girl: 'بنت',
    chooseHero: 'اختر بطلك',
    save: 'حفظ',
    back: 'رجوع',
    next: 'التالي',
    done: 'تم',
    cancel: 'إلغاء',
    del: 'حذف',
    checkinTitle: 'تسجيل البطل اليومي',
    checkinSub: 'خلال آخر ٢٤ ساعة، كم مرة أكلت…',
    honest: 'الأبطال الحقيقيون يقولون الصدق دائماً!',
    junkStep: 'أكل غير صحي',
    healthyStep: 'أكل صحي',
    resultTitle: 'طاقتك الصحية اليوم',
    effects: 'في اللعبة اليوم:',
    hearts: 'القلوب',
    speed: 'الرشاقة',
    charge: 'شحن القوة',
    letsFly: 'هيا نطير!',
    editCheckin: 'تعديل تسجيل اليوم',
    checkinDone: 'تم التسجيل اليوم',
    needCheckin: 'سجّل أكلك اليومي لتطير!',
    checkinNeeded: 'سجّل اليوم',
    best: 'الأفضل',
    streak: 'أيام صحية متتالية',
    days: 'أيام',
    badges: 'الأوسمة',
    leaderboard: 'ترتيب العائلة',
    week: 'آخر ٧ أيام',
    share: 'مشاركة',
    switchPlayer: 'تغيير البطل',
    settings: 'الإعدادات',
    language: 'اللغة',
    sound: 'المؤثرات الصوتية',
    music: 'الموسيقى',
    voice: 'العبارات الصوتية',
    howTo: 'طريقة اللعب',
    howTo1: 'اسحب إصبعك (أو استخدم ← →) لتوجيه ورقة الطيران.',
    howTo2: 'التقط الأكل الصحي لتملأ قوتك وتجمع النقاط.',
    howTo3: 'تجنّب وحوش الأكل الضار — إنها تسرق قلوبك!',
    howTo4: 'عندما تمتلئ دائرة القوة، اضغط زر القوة (أو المسافة).',
    howTo5: 'كُل صحياً في الحقيقة ← يبدأ بطلك أقوى غداً!',
    score: 'النقاط',
    level: 'العالم',
    paused: 'إيقاف مؤقت',
    resume: 'استمرار',
    home: 'الرئيسية',
    restart: 'العب مجدداً',
    gameOver: 'أمسك بك ضباب الأكل الضار!',
    worldClear: 'أنهيت العالم!',
    funFact: 'هل تعلم؟',
    quiz: 'سؤال سريع',
    correct: 'صحيح! +١٠٠',
    wrong: 'ليس هذه المرة!',
    continue: 'متابعة',
    newBest: 'رقم قياسي جديد!',
    resetData: 'حذف كل البيانات',
    confirmReset: 'حذف كل الأبطال والنتائج من هذا الجهاز؟',
    confirmDelete: 'حذف هذا البطل؟',
    installApp: 'تثبيت التطبيق',
    shareText: 'حصلت على {score} نقطة في فيتالاند واخترت الأكل الصحي اليوم! هل تستطيع هزيمتي؟',
    vitalityLabels: ['متعب جداً', 'متعب', 'لا بأس', 'قوي', 'بطل خارق!'],
    power: 'القوة',
    ready: 'جاهز!',
    today: 'اليوم',
    noScores: 'لا توجد نتائج بعد — كن الأول!',
    parentsNote: 'للأهل: فيتالاند بلا إعلانات وبلا حسابات، وكل البيانات محفوظة على هذا الجهاز فقط.',
    abilityReady: 'القوة جاهزة!',
    of: 'من',
  },
};

// Daily check-in categories. `w` is the weight used in the vitality formula.
export const JUNK_ITEMS = [
  { id: 'chips', icon: 'chips', w: 1, en: 'Chips', ar: 'شيبس' },
  { id: 'choco', icon: '🍫', w: 1, en: 'Chocolate', ar: 'شوكولاتة' },
  { id: 'fast', icon: '🍔', w: 1.5, en: 'Fast food', ar: 'وجبات سريعة' },
  { id: 'soda', icon: '🥤', w: 1.2, en: 'Soda / sugary drinks', ar: 'مشروبات غازية / سكرية' },
  { id: 'candy', icon: '🍭', w: 1, en: 'Candy / sweets', ar: 'حلوى' },
  { id: 'cake', icon: '🍩', w: 1, en: 'Donuts / cake', ar: 'دونات / كيك' },
];

export const HEALTHY_ITEMS = [
  { id: 'fruit', icon: '🍎', w: 1, en: 'Fruits', ar: 'فواكه' },
  { id: 'veg', icon: '🥦', w: 1.2, en: 'Vegetables', ar: 'خضار' },
  { id: 'water', icon: '💧', w: 0.5, en: 'Glasses of water', ar: 'أكواب ماء' },
  { id: 'milk', icon: '🥛', w: 0.8, en: 'Milk / yogurt', ar: 'حليب / زبادي' },
  { id: 'home', icon: '🍲', w: 1.2, en: 'Home-cooked meal', ar: 'وجبة منزلية' },
  { id: 'protein', icon: '🥚', w: 0.8, en: 'Eggs / fish / nuts', ar: 'بيض / سمك / مكسرات' },
];

export const PHRASES = {
  praise: {
    en: [
      'Amazing, {name}! You are a real healthy hero!',
      'Wow {name}! Fruits and veggies make you super strong!',
      'Great job, {name}! Your body says thank you!',
      'Fantastic! Your energy is at the top today!',
      'High five, {name}! Healthy choices make champions!',
    ],
    ar: [
      { m: 'رائع يا {name}! أنت بطل صحي حقيقي!', f: 'رائعة يا {name}! أنتِ بطلة صحية حقيقية!' },
      { m: 'واو يا {name}! الخضار والفواكه تجعلك قوياً جداً!', f: 'واو يا {name}! الخضار والفواكه تجعلكِ قوية جداً!' },
      { m: 'أحسنت يا {name}! جسمك يقول لك شكراً!', f: 'أحسنتِ يا {name}! جسمكِ يقول لكِ شكراً!' },
      { m: 'ممتاز! طاقتك في القمة اليوم!', f: 'ممتازة! طاقتكِ في القمة اليوم!' },
      { m: 'كفّك يا {name}! الاختيارات الصحية تصنع الأبطال!', f: 'كفّكِ يا {name}! الاختيارات الصحية تصنع البطلات!' },
    ],
  },
  okay: {
    en: [
      'Not bad, {name}! A bit more fruit and you will be unstoppable!',
      'Good effort! Swap one sweet for an apple tomorrow!',
    ],
    ar: [
      { m: 'ليس سيئاً يا {name}! قليل من الفاكهة وستصبح لا يُهزم!', f: 'ليس سيئاً يا {name}! قليل من الفاكهة وستصبحين لا تُهزمين!' },
      { m: 'محاولة جيدة! بدّل قطعة حلوى بتفاحة غداً!', f: 'محاولة جيدة! بدّلي قطعة حلوى بتفاحة غداً!' },
    ],
  },
  sad: {
    en: [
      'Oh no, {name}… the chips and chocolate stole your energy!',
      'Hmm, I am a little sad. Fast food makes heroes tired. Tomorrow we choose better, okay?',
      'That is a lot of sugar! Your body needs fruit and water.',
      'Heroes never give up! Try an apple instead of candy tomorrow.',
    ],
    ar: [
      { m: 'أوه لا يا {name}… الشيبس والشوكولاتة سرقوا طاقتك!', f: 'أوه لا يا {name}… الشيبس والشوكولاتة سرقوا طاقتكِ!' },
      { m: 'همم، أنا حزين قليلاً. الأكل السريع يُتعب الأبطال. غداً نختار الأفضل، اتفقنا؟', f: 'همم، أنا حزين قليلاً. الأكل السريع يُتعب البطلات. غداً نختار الأفضل، اتفقنا؟' },
      { m: 'هذا سكر كثير! جسمك يحتاج فاكهة وماء.', f: 'هذا سكر كثير! جسمكِ يحتاج فاكهة وماء.' },
      { m: 'البطل لا يستسلم! جرّب تفاحة بدل الحلوى غداً.', f: 'البطلة لا تستسلم! جرّبي تفاحة بدل الحلوى غداً.' },
    ],
  },
  yum: {
    en: ['Yummy!', 'Super choice!', 'Power up!', 'Healthy hero!', 'Crunchy and strong!', 'Keep going!'],
    ar: ['لذيذ!', 'اختيار خارق!', 'طاقة!', { m: 'بطل صحي!', f: 'بطلة صحية!' }, 'مقرمش ومفيد!', { m: 'استمر!', f: 'استمري!' }],
  },
  oops: {
    en: ['Oops! Junk food!', 'Yuck, too much sugar!', 'Oh no, greasy!', 'That makes you slow!'],
    ar: ['أوبس! أكل ضار!', 'يع! سكر كثير!', 'أوه لا، دهون كثيرة!', { m: 'هذا يجعلك بطيئاً!', f: 'هذا يجعلكِ بطيئة!' }],
  },
  level: {
    en: ['World cleared! You are amazing!', 'Wonderful! On to the next world!'],
    ar: [{ m: 'أنهيت العالم! أنت مدهش!', f: 'أنهيتِ العالم! أنتِ مدهشة!' }, 'رائع! هيا إلى العالم التالي!'],
  },
  over: {
    en: ['Good try! Eat healthy and come back stronger!', 'The Junk Fog won this time… but heroes always return!'],
    ar: [{ m: 'محاولة جيدة! كُل صحياً وارجع أقوى!', f: 'محاولة جيدة! كُلي صحياً وارجعي أقوى!' }, { m: 'فاز الضباب هذه المرة… لكن الأبطال يعودون دائماً!', f: 'فاز الضباب هذه المرة… لكن البطلات يعدن دائماً!' }],
  },
  power: {
    en: ['Super power!', 'Here we go!'],
    ar: ['قوة خارقة!', 'هيا بنا!'],
  },
};

export const FACTS = [
  { en: 'Carrots have vitamin A, which helps your eyes see well.', ar: 'الجزر فيه فيتامين أ الذي يساعد عينيك على الرؤية جيداً.' },
  { en: 'Water helps your brain think and keeps your body cool when you play.', ar: 'الماء يساعد دماغك على التفكير ويبرّد جسمك عندما تلعب.' },
  { en: 'Bananas have potassium that helps your muscles work.', ar: 'الموز فيه البوتاسيوم الذي يساعد عضلاتك على العمل.' },
  { en: 'Milk and yogurt have calcium for strong bones and teeth.', ar: 'الحليب والزبادي فيهما الكالسيوم لعظام وأسنان قوية.' },
  { en: 'Sugary drinks can hurt your teeth. Water is the best drink!', ar: 'المشروبات السكرية تضر أسنانك. الماء هو أفضل مشروب!' },
  { en: 'Chips have lots of salt and oil. Too much is not good for your heart.', ar: 'الشيبس فيه ملح وزيت كثير، والإكثار منه ليس جيداً لقلبك.' },
  { en: 'Broccoli has vitamin C and fiber that help your body grow.', ar: 'البروكلي فيه فيتامين سي والألياف التي تساعد جسمك على النمو.' },
  { en: 'Fish has omega-3, which is good for your brain.', ar: 'السمك فيه أوميغا ٣ المفيد لدماغك.' },
  { en: 'Oranges have vitamin C that helps your body fight germs.', ar: 'البرتقال فيه فيتامين سي الذي يساعد جسمك على مقاومة الجراثيم.' },
  { en: 'Eating fruits and veggies of many colors gives you many different vitamins.', ar: 'أكل فواكه وخضار بألوان كثيرة يعطيك فيتامينات مختلفة كثيرة.' },
  { en: 'Home-cooked meals usually have less salt and fat than fast food.', ar: 'الأكل المنزلي عادة فيه ملح ودهون أقل من الوجبات السريعة.' },
  { en: 'Eggs have protein that helps build strong muscles.', ar: 'البيض فيه بروتين يساعد على بناء عضلات قوية.' },
  { en: 'Sleeping well and moving every day also keep you healthy.', ar: 'النوم الجيد والحركة كل يوم يحافظان على صحتك أيضاً.' },
  { en: 'Dates give quick natural energy and also have fiber.', ar: 'التمر يعطي طاقة طبيعية سريعة وفيه ألياف أيضاً.' },
];

// Each quiz: two options, `good` is the index of the healthy answer.
export const QUIZZES = [
  { en: 'Best drink when you are thirsty?', ar: 'ما أفضل مشروب عندما تعطش؟', opts: [['💧', 'Water', 'ماء'], ['🥤', 'Soda', 'مشروب غازي']], good: 0 },
  { en: 'Which snack helps your eyes?', ar: 'أي وجبة خفيفة تساعد عينيك؟', opts: [['🥕', 'Carrot', 'جزر'], ['🍫', 'Chocolate', 'شوكولاتة']], good: 0 },
  { en: 'Which gives long energy for sport?', ar: 'أيهما يعطي طاقة طويلة للرياضة؟', opts: [['🍭', 'Lollipop', 'مصاصة'], ['🍌', 'Banana', 'موز']], good: 1 },
  { en: 'Which keeps your teeth strong?', ar: 'أيهما يحافظ على قوة أسنانك؟', opts: [['🥛', 'Milk', 'حليب'], ['🍬', 'Candy', 'حلوى']], good: 0 },
  { en: 'Better lunch for a hero?', ar: 'أي غداء أفضل للبطل؟', opts: [['🍔', 'Burger & fries', 'برغر وبطاطس'], ['🍲', 'Home-cooked meal', 'طبخ البيت']], good: 1 },
  { en: 'Best school snack?', ar: 'أفضل وجبة خفيفة للمدرسة؟', opts: [['🍎', 'Apple', 'تفاحة'], ['🍩', 'Donut', 'دونات']], good: 0 },
  { en: 'Which helps fight germs?', ar: 'أيهما يساعد على مقاومة الجراثيم؟', opts: [['🍊', 'Orange', 'برتقالة'], ['🍟', 'Fries', 'بطاطس مقلية']], good: 0 },
  { en: 'Which is good for your brain?', ar: 'أيهما مفيد لدماغك؟', opts: [['🍕', 'Pizza', 'بيتزا'], ['🐟', 'Fish', 'سمك']], good: 1 },
];

export const WORLDS = [
  { en: 'Sunny Meadow', ar: 'المرج المشمس' },
  { en: 'Orchard Sunset', ar: 'بستان الغروب' },
  { en: 'Ocean Breeze', ar: 'نسيم المحيط' },
  { en: 'Starry Night', ar: 'ليلة النجوم' },
  { en: 'Rainbow Peaks', ar: 'قمم قوس قزح' },
];

export const BADGES = [
  { id: 'first', icon: '🌱', en: 'First check-in', ar: 'أول تسجيل' },
  { id: 'clean', icon: '✨', en: 'Junk-free day', ar: 'يوم بلا أكل ضار' },
  { id: 'streak3', icon: '🔥', en: '3 healthy days', ar: '٣ أيام صحية' },
  { id: 'streak7', icon: '🏆', en: '7 healthy days', ar: '٧ أيام صحية' },
  { id: 'score1k', icon: '⭐', en: '1,000 points', ar: '١٠٠٠ نقطة' },
  { id: 'score5k', icon: '🌟', en: '5,000 points', ar: '٥٠٠٠ نقطة' },
  { id: 'world3', icon: '🗺️', en: 'Reached world 3', ar: 'وصلت للعالم ٣' },
  { id: 'world5', icon: '🌈', en: 'All 5 worlds', ar: 'كل العوالم الخمسة' },
  { id: 'quiz5', icon: '🧠', en: '5 quiz answers', ar: '٥ إجابات صحيحة' },
  { id: 'combo20', icon: '⚡', en: '20 combo', ar: 'سلسلة ٢٠' },
];

let lang = 'ar';
export const getLang = () => lang;
export function setLang(l) {
  lang = l === 'en' ? 'en' : 'ar';
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
}

export function t(key, vars) {
  let s = STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
  if (typeof s === 'string' && vars) {
    for (const k in vars) s = s.replaceAll(`{${k}}`, vars[k]);
  }
  return s;
}

// Localised text from an {en, ar} object.
export const L = (obj) => obj[lang] ?? obj.en;

// Arabic-Indic digits for Arabic UI.
export function num(n) {
  const s = Math.round(n).toLocaleString('en-US');
  if (lang !== 'ar') return s;
  return s.replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]).replace(/,/g, '٬');
}

// Pick a random phrase from a category, resolving gender and name.
export function phrase(cat, player) {
  const list = PHRASES[cat][lang];
  let p = list[(Math.random() * list.length) | 0];
  if (typeof p === 'object') p = p[player?.gender === 'm' ? 'm' : 'f'];
  return p.replaceAll('{name}', player?.name ?? '');
}
