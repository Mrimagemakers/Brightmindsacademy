
// ═════════════════════════════════════════════════════════════════════════════
//  BRIGHT MINDS EXPLORERS ACADEMY — the K–5 expansion
//  Five new places around Nia's garden, six new friends, grade-aware games,
//  five Reading Crystals that chase away the Silence Shadow, and a grown-ups view.
// ═════════════════════════════════════════════════════════════════════════════
const GRADES = ['K', '1', '2', '3', '4', '5'];
const gradeName = (g) => g === 0 ? 'Kindergarten' : ['', '1st', '2nd', '3rd', '4th', '5th'][g] + ' grade';
const grade = () => (PROG.grade ?? 1);
const band = () => grade() <= 1 ? 0 : grade() <= 3 ? 1 : 2;          // K–1, 2–3, 4–5
PROG.crystals = PROG.crystals || {}; PROG.stats = PROG.stats || {}; PROG.seconds = PROG.seconds || 0;
const brng = (() => { let s = 90210; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
const brr = (a, b) => a + brng() * (b - a);
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
// Pick n−1 wrong answers from a pool, then shuffle in the right one
const optsFrom = (ans, pool, n = 4) => choicesStr(ans, shuffle(pool.filter(p => p !== ans)).slice(0, n - 1));
const nOpt = () => grade() <= 1 ? 3 : 4;
// Math games start at the level that matches the explorer's grade
function gradeStartLevel(key) { if (GAMES[key]?.graded) return 0; const g = grade(); return g === 0 ? 0 : g <= 2 ? 1 : 2; }

// ─── Question-picture helpers ────────────────────────────────────────────────
const DX = {
  emoji(x, e, X, Y, px) { x.font = `${px}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(e, X, Y); },
  picWord(x, w, h, emoji, word, c1 = '#FFF6DC', c2 = '#FFE3A3') {
    D.bg(x, w, h, c1, c2); DX.emoji(x, emoji, w * 0.27, h / 2, 130);
    D.font(x, 84); x.fillStyle = '#5A2E10'; x.textAlign = 'center'; x.textBaseline = 'middle';
    const s = word.length > 7 ? 0.7 : 1; x.save(); x.translate(w * 0.68, h / 2 + 6); x.scale(s, 1); x.fillText(word.split('').join(' '), 0, 0); x.restore();
  },
  passage(x, w, h, text, c1, c2) {
    D.bg(x, w, h, c1, c2); const px = text.length > 260 ? 16 : text.length > 160 ? 19 : 23;
    x.font = `700 ${px}px "Nunito", Arial`; x.fillStyle = '#23324A'; x.textAlign = 'left'; x.textBaseline = 'alphabetic';
    const words = text.split(' '); let line = '', y = 22 + px; const lh = px * 1.32;
    for (const wd of words) { const t = line ? line + ' ' + wd : wd; if (x.measureText(t).width > w - 44) { x.fillText(line, 22, y); line = wd; y += lh; } else line = t; }
    x.fillText(line, 22, y);
  },
  big(x, w, h, text, c1, c2, col = '#3B1F5C') {
    D.bg(x, w, h, c1, c2); D.font(x, 60); let s = 1; const mw = x.measureText(text).width; if (mw > w - 40) s = (w - 40) / mw;
    x.save(); x.translate(w / 2, h / 2); x.scale(s, s); x.fillStyle = col; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 0, 0); x.restore();
  },
  grid(x, w, h, n, robot, goal) {
    D.bg(x, w, h, '#0F2F36', '#123E47'); const s = Math.min((h - 30) / n, 52), ox = (w - s * n) / 2, oy = (h - s * n) / 2;
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) { x.fillStyle = (r + c) % 2 ? '#1C5561' : '#17495A'; x.fillRect(ox + c * s, oy + r * s, s - 3, s - 3); }
    const gx = ox + goal[1] * s + s / 2 - 1.5, gy = oy + goal[0] * s + s / 2 - 1.5;
    x.fillStyle = '#FFC83A'; x.beginPath(); x.moveTo(gx, gy - s * 0.36); x.lineTo(gx + s * 0.26, gy); x.lineTo(gx, gy + s * 0.36); x.lineTo(gx - s * 0.26, gy); x.closePath(); x.fill();
    const rx = ox + robot[1] * s + s * 0.14, ry = oy + robot[0] * s + s * 0.14, rs = s * 0.66;
    x.fillStyle = '#2EE6E3'; x.beginPath(); x.roundRect(rx, ry, rs, rs, 8); x.fill();
    x.fillStyle = '#0F2F36'; x.beginPath(); x.arc(rx + rs * 0.32, ry + rs * 0.42, rs * 0.1, 0, TAU); x.arc(rx + rs * 0.68, ry + rs * 0.42, rs * 0.1, 0, TAU); x.fill();
    D.text(x, 'Gizmo', ox - 50, h / 2 - 12, 20, '#2EE6E3'); D.text(x, 'Crystal', ox + n * s + 50, h / 2 - 12, 20, '#FFC83A');
  },
};

// ─── Word banks ──────────────────────────────────────────────────────────────
const PICS = [['🐱', 'cat'], ['🐶', 'dog'], ['☀️', 'sun'], ['🐟', 'fish'], ['🎩', 'hat'], ['🐝', 'bee'], ['🦁', 'lion'], ['🐸', 'frog'], ['🌙', 'moon'], ['🚗', 'car'], ['🐮', 'cow'], ['🦊', 'fox'], ['🐷', 'pig'], ['🐻', 'bear'], ['⭐', 'star'], ['🍌', 'banana'], ['🪁', 'kite'], ['🐢', 'turtle'], ['🥚', 'egg'], ['🍎', 'apple'], ['🐙', 'octopus'], ['☂️', 'umbrella'], ['🦒', 'giraffe'], ['🐘', 'elephant']];
const ENDS = [['🐱', 'cat'], ['🐶', 'dog'], ['☀️', 'sun'], ['🎩', 'hat'], ['🦁', 'lion'], ['🐸', 'frog'], ['🌙', 'moon'], ['🚗', 'car'], ['🐷', 'pig'], ['🐻', 'bear'], ['⭐', 'star'], ['🚌', 'bus'], ['🛏️', 'bed'], ['🐛', 'bug']];
const CVC = [['🐱', 'cat'], ['🐶', 'dog'], ['☀️', 'sun'], ['🐷', 'pig'], ['🛏️', 'bed'], ['🦊', 'fox'], ['☕', 'cup'], ['🐔', 'hen'], ['🐛', 'bug'], ['🗺️', 'map'], ['🥅', 'net'], ['🎩', 'hat'], ['🚌', 'bus'], ['📌', 'pin'], ['🐜', 'ant'], ['🪵', 'log']];
const DIGRAPH = [['🐑', 'sheep', 'sh'], ['🧀', 'cheese', 'ch'], ['👍', 'thumb', 'th'], ['🐋', 'whale', 'wh'], ['🐚', 'shell', 'sh'], ['🍒', 'cherry', 'ch'], ['🚢', 'ship', 'sh'], ['🐥', 'chick', 'ch'], ['🧵', 'thread', 'th'], ['🛞', 'wheel', 'wh']];
const RHYME = [['cake', 'lake', ['cat', 'book', 'cap']], ['star', 'car', ['stop', 'sun', 'step']], ['moon', 'spoon', ['mud', 'man', 'map']], ['night', 'light', ['nest', 'nap', 'note']], ['frog', 'log', ['fish', 'flag', 'fun']], ['bear', 'chair', ['bean', 'bed', 'ball']], ['tree', 'bee', ['top', 'tray', 'ten']], ['king', 'ring', ['kite', 'cake', 'rock']], ['boat', 'coat', ['bat', 'bed', 'bird']], ['sock', 'rock', ['sun', 'sit', 'sack']], ['hill', 'grill', ['hat', 'hug', 'hole']], ['snail', 'tail', ['snake', 'sand', 'toe']]];
const MORPH = [
  ['Which word means "not happy"?', 'unhappy', ['happyful', 'rehappy', 'happiest'], 'The prefix un- means "not."'],
  ['Which word means "read again"?', 'reread', ['unread', 'reader', 'readful'], 'The prefix re- means "again."'],
  ['Which word means "full of care"?', 'careful', ['careless', 'uncare', 'recare'], 'The suffix -ful means "full of."'],
  ['Which word means "without fear"?', 'fearless', ['fearful', 'unfear', 'refear'], 'The suffix -less means "without."'],
  ['sun + flower = ?', 'sunflower', ['flowersun', 'sunflour', 'sunnyflower'], 'Put the two small words together to make a compound word.'],
  ['rain + bow = ?', 'rainbow', ['bowrain', 'rainbowl', 'rainybow'], 'Put the two small words together to make a compound word.'],
  ['One mouse, two ___', 'mice', ['mouses', 'mices', 'meese'], 'Some plurals change the whole word: mouse becomes mice.'],
  ['One child, three ___', 'children', ['childs', 'childrens', 'childes'], 'Child becomes children when there is more than one.'],
  ['Which word means "a person who teaches"?', 'teacher', ['teaching', 'reteach', 'teachful'], 'The suffix -er can mean "a person who."'],
  ['Which word means "to build again"?', 'rebuild', ['unbuild', 'builder', 'buildless'], 'The prefix re- means "again."'],
  ['One leaf, two ___', 'leaves', ['leafs', 'leafes', 'leavs'], 'Words ending in f often change to -ves: leaf, leaves.'],
];
const SYN = [
  ['Which word means the same as "enormous"?', 'huge', ['tiny', 'quiet', 'early']], ['Which word means the same as "rapid"?', 'fast', ['slow', 'loud', 'soft']],
  ['Which word means the same as "glad"?', 'happy', ['angry', 'tired', 'sad']], ['Which word means the same as "begin"?', 'start', ['finish', 'stop', 'close']],
  ['Which word is the opposite of "ancient"?', 'modern', ['old', 'broken', 'famous']], ['Which word is the opposite of "generous"?', 'selfish', ['kind', 'giving', 'brave']],
  ['Which word is the opposite of "shallow"?', 'deep', ['wet', 'narrow', 'low']], ['Which word means the same as "observe"?', 'watch', ['ignore', 'forget', 'hide']],
  ['Which word is the opposite of "expand"?', 'shrink', ['grow', 'stretch', 'spread']], ['Which word means the same as "courageous"?', 'brave', ['scared', 'gentle', 'careful']],
  ['Which word means the same as "exhausted"?', 'very tired', ['very hungry', 'very fast', 'very tall']], ['Which word is the opposite of "rough"?', 'smooth', ['bumpy', 'hard', 'sharp']],
];
const CTX = [
  ['The desert was so arid that no plants could grow. What does "arid" mean?', 'very dry', ['very cold', 'very crowded', 'very noisy']],
  ['Leo was famished after the long hike, so he ate two sandwiches. What does "famished" mean?', 'very hungry', ['very tired', 'very lost', 'very happy']],
  ['The library was so tranquil you could hear a page turn. What does "tranquil" mean?', 'calm and quiet', ['messy', 'bright', 'crowded']],
  ['Oliver was reluctant to fly in the storm, so he stayed on his branch. What does "reluctant" mean?', 'not wanting to', ['in a hurry to', 'proud to', 'ready to']],
  ['The tiny seed grew into a colossal tree that towered over the garden. What does "colossal" mean?', 'extremely large', ['very old', 'bright green', 'broken']],
  ['Sloth Sage gave a brief talk, only one minute long. What does "brief" mean?', 'short', ['loud', 'boring', 'funny']],
  ['Katie felt elated when her robot finally worked, and she jumped for joy. What does "elated" mean?', 'very happy', ['confused', 'sleepy', 'worried']],
  ['Choose the right word: The explorers packed ___ backpacks.', 'their', ['there', "they're", 'thier']],
  ['Choose the right word: ___ going to the Sky Observatory today.', "They're", ['Their', 'There', 'Theyre']],
  ['Choose the right word: Nia wanted ___ plant more flowers.', 'to', ['too', 'two', 'tow']],
  ['Choose the right word: The wind blew ___ the open window.', 'through', ['threw', 'thru', 'thorough']],
];
const SIGHT = [
  [['the', ['then', 'they']], ['and', ['an', 'end']], ['see', ['she', 'so']], ['you', ['your', 'yes']], ['said', ['sad', 'sand']], ['look', ['like', 'lock']], ['come', ['came', 'some']], ['play', ['pay', 'plan']], ['little', ['litter', 'title']], ['where', ['were', 'there']], ['can', ['cat', 'car']], ['big', ['bag', 'dig']]],
  [['what', ['want', 'that']], ['they', ['then', 'the']], ['could', ['cold', 'cloud']], ['from', ['form', 'frog']], ['once', ['ounce', 'one']], ['every', ['very', 'ever']], ['know', ['now', 'knot']], ['after', ['other', 'water']], ['thank', ['think', 'tank']], ['were', ['where', 'wear']], ['going', ['gone', 'giving']], ['many', ['may', 'money']]],
];
const SPELL = [null, null,
  ['because', 'friend', 'people', 'again', 'animal', 'school', 'would', 'about', 'laugh', 'write', 'pretty', 'answer'],
  ['beautiful', 'different', 'favorite', 'through', 'enough', 'believe', 'library', 'minute', 'surprise', 'thought', 'question', 'neighbor'],
  ['island', 'receive', 'calendar', 'February', 'separate', 'scissors', 'guess', 'ocean', 'weigh', 'muscle', 'exercise', 'probably'],
  ['necessary', 'environment', 'rhythm', 'occasion', 'achievement', 'tomorrow', 'especially', 'recommend', 'temperature', 'restaurant', 'immediately', 'conscious']];
function misspell(w) {
  const out = new Set(), vowels = 'aeiou';
  const tries = [
    s => s.replace(/ie/, 'ei'), s => s.replace(/ei/, 'ie'), s => s.replace(/([bcdfglmnprst])\1/, '$1'), s => s.replace(/([bcdfglmnprst])(?!\1)/, '$1$1'),
    s => s.replace(/ph/, 'f'), s => s.replace(/ou/, 'ow'), s => s.replace(/gh/, 'f'), s => s.replace(/tion/, 'shun'), s => s.replace(/e$/, ''),
    s => { const i = 1 + Math.floor(Math.random() * (s.length - 2)); return s.slice(0, i) + s[i + 1] + s[i] + s.slice(i + 2); },
    s => { const idx = [...s].map((c, i) => vowels.includes(c) ? i : -1).filter(i => i > 0); if (!idx.length) return s; const i = pick(idx); return s.slice(0, i) + s.slice(i + 1); },
    s => { const idx = [...s].map((c, i) => vowels.includes(c) ? i : -1).filter(i => i > 0); if (!idx.length) return s; const i = pick(idx); return s.slice(0, i) + pick([...vowels].filter(v => v !== s[i])) + s.slice(i + 1); },
  ];
  let guard = 0; while (out.size < 3 && guard++ < 80) { const v = pick(tries)(w); if (v && v !== w && v.length > 1) out.add(v); }
  return [...out];
}

// ─── Reading River passages (original stories starring the explorers) ───────
const STORIES = [
  [ // K–1
    { t: 'Leo the lion has a red ball. He kicks the ball to Toby. Toby is slow, but he kicks it back!', qs: [['What color is Leo\'s ball?', 'red', ['blue', 'green', 'yellow']], ['Who kicks the ball back?', 'Toby', ['Oliver', 'Katie', 'Nia']]] },
    { t: 'Nia found a big yellow sunflower. She gave it to her three friends to share. Everyone smiled.', qs: [['What did Nia find?', 'a sunflower', ['a ball', 'a book', 'a hat']], ['How many friends did Nia share with?', 'three', ['two', 'five', 'one']]] },
    { t: 'Oliver Owl stays up at night. He looks at the moon and the stars. In the morning, he sleeps in his tree.', qs: [['When does Oliver sleep?', 'in the morning', ['at night', 'at lunch', 'never']], ['What does Oliver look at?', 'the moon and stars', ['the sun', 'the river', 'a TV']]] },
    { t: 'Katie Kangaroo can hop very high. She hops over a log. Then she hops into the lab to see Gizmo.', qs: [['What does Katie hop over?', 'a log', ['a rock', 'a car', 'a tree']], ['Who does Katie go to see?', 'Gizmo', ['Leo', 'Toby', 'Freddy']]] },
  ],
  [ // 2–3
    { t: 'Toby Tortoise wanted to cross Reading River. The water was too deep to walk through, so he waited at the dock. Soon a little raft floated by, and Oliver helped Toby climb aboard. Toby thanked Oliver with a shiny river stone.', qs: [['Why did Toby wait at the dock?', 'The water was too deep', ['He was sleepy', 'He lost his book', 'It was raining']], ['How did Toby say thank you?', 'He gave a shiny stone', ['He sang a song', 'He baked a cake', 'He drew a map']]] },
    { t: 'Every spring, Katie Kangaroo plants sunflower seeds outside the STEM Lab. She waters them each morning and measures them every Friday. By summer, the tallest sunflower is taller than Katie!', qs: [['When does Katie measure the sunflowers?', 'every Friday', ['every morning', 'every night', 'once a year']], ['What is this story mostly about?', 'Katie growing sunflowers', ['Katie building a robot', 'A rainy day', 'Leo\'s safari']]] },
    { t: 'The Silence Shadow drifted over Word Village, and every book went quiet. Leo opened a book and read one word out loud: "Brave." The word began to glow, and the shadow shrank back.', qs: [['What happened when Leo read out loud?', 'The word began to glow', ['The book closed', 'It started to rain', 'Leo fell asleep']], ['Which word did Leo read?', 'Brave', ['Quiet', 'Shadow', 'Village']]] },
    { t: 'Gizmo the robot follows directions exactly. When Katie typed "forward, forward, turn left," Gizmo rolled two squares and turned. But Katie forgot the last step, so Gizmo stopped one square away from the crystal.', qs: [['Why did Gizmo stop before the crystal?', 'Katie forgot a step', ['Gizmo was tired', 'The crystal moved', 'Gizmo ran out of power']], ['How many squares did Gizmo roll forward?', 'two', ['one', 'three', 'four']]] },
  ],
  [ // 4–5
    { t: 'Sloth Sage moves slowly, but never wastes a step. Before climbing the observatory tree, the sage studies every branch and tests which ones will hold. "Patience is a kind of speed," Sloth Sage likes to say. "It gets you where you are going without starting over."', qs: [['What does "Patience is a kind of speed" mean?', 'Careful work saves time', ['Sloths are secretly fast', 'Waiting is boring', 'Speed is not important']], ['Why does Sloth Sage test the branches?', 'To find the ones that will hold', ['To make noise', 'To find fruit', 'To scare birds']]] },
    { t: 'Oliver Owl kept a weather journal for a month. On sunny days, Reading River was low and clear. After three days of heavy rain, it rose almost to the dock and turned brown with mud. Oliver concluded that rain washes soil from the hills into the river.', qs: [['What made the river turn brown?', 'Rain washed soil into it', ['Leaves fell in', 'Toby stirred it', 'The sun dried it']], ['What is Oliver\'s conclusion based on?', 'What he recorded in his journal', ['A dream', 'A guess with no evidence', 'What Leo told him']]] },
    { t: 'When the Number Eight Butterfly landed in Nia\'s garden, Nia noticed its wings made two loops, one on top of the other. "You\'re shaped like the number you\'re named for," she said. From then on, whenever Nia saw an eight, she imagined it fluttering off the page.', qs: [['Why is it called the Number Eight Butterfly?', 'Its wings form an 8', ['It has eight legs', 'It is eight years old', 'It visits at 8 o\'clock']], ['In this story, "imagined" means…', 'pictured in her mind', ['wrote down', 'forgot', 'counted']]] },
    { t: 'Leo\'s roar had always been the loudest on the savanna. One morning it came out as a whisper. Instead of giving up, Leo practiced sounding out words with Oliver every day. By the end of the week his roar was back, and he had learned fifty new words along the way.', qs: [['What problem did Leo have?', 'His roar became a whisper', ['He lost his hat', 'He could not find water', 'He was too loud']], ['What is the lesson of this story?', 'Practice helps you grow', ['Never talk to owls', 'Roaring is rude', 'Mornings are scary']]] },
  ],
];

// ─── Science & space banks (by band) ─────────────────────────────────────────
const SCI = [
  [['What do plants need to grow?', 'water and sunlight', ['candy', 'toys', 'darkness'], 'Plants make food from sunlight, water, and air.'],
    ['Which one is a living thing?', '🌳 a tree', ['🪨 a rock', '🧸 a teddy', '🚲 a bike'], 'Living things grow, need food and water, and make more of their kind.'],
    ['Which body part do you use to hear?', 'ears', ['eyes', 'nose', 'hands'], 'Your ears catch sounds.'],
    ['What falls from clouds when it rains?', 'water drops', ['sand', 'leaves', 'feathers'], 'Clouds are made of tiny water drops.'],
    ['Which animal hatches from an egg?', '🐥 a chick', ['🐶 a puppy', '🐱 a kitten', '🐮 a calf'], 'Birds, turtles, and frogs hatch from eggs.'],
    ['What season comes after winter?', 'spring', ['summer', 'fall', 'winter again'], 'Winter, spring, summer, fall, and around again.'],
    ['Ice is water that is…', 'frozen', ['boiling', 'flying', 'glowing'], 'When water gets cold enough it freezes into ice.']],
  [['Ice melting into water changes from…', 'solid to liquid', ['liquid to gas', 'gas to solid', 'liquid to solid'], 'Heat melts solid ice into liquid water.'],
    ['What part of a plant takes in water from the soil?', 'roots', ['petals', 'leaves', 'seeds'], 'Roots soak up water and hold the plant in place.'],
    ['What force pulls things down to the ground?', 'gravity', ['magnetism', 'wind', 'friction'], 'Gravity pulls everything toward Earth.'],
    ['A caterpillar turns into a…', 'butterfly', ['bird', 'spider', 'frog'], 'Like Carlo, caterpillars change into butterflies. That change is called metamorphosis.'],
    ['Which animal is a mammal?', 'whale', ['shark', 'frog', 'eagle'], 'Whales breathe air and feed their babies milk, so they are mammals.'],
    ['Animals that eat only plants are called…', 'herbivores', ['carnivores', 'predators', 'insects'], 'Herbi- means plants. Cows and deer are herbivores.'],
    ['Which material does a magnet pull?', 'iron', ['wood', 'plastic', 'glass'], 'Magnets attract metals like iron and steel.']],
  [['What gas do plants take in to make food?', 'carbon dioxide', ['oxygen', 'helium', 'nitrogen'], 'Plants take in carbon dioxide and give off oxygen during photosynthesis.'],
    ['In a food chain, plants are called…', 'producers', ['consumers', 'decomposers', 'predators'], 'Plants produce their own food from sunlight.'],
    ['Which is a renewable energy source?', 'wind', ['coal', 'oil', 'natural gas'], 'Wind and sunlight will not run out. Coal and oil will.'],
    ['When water vapor cools in the sky, it…', 'condenses into clouds', ['turns into rock', 'disappears forever', 'becomes oxygen'], 'Cooling vapor condenses into tiny droplets that form clouds.'],
    ['Sound travels fastest through…', 'steel', ['air', 'water', 'empty space'], 'Sound moves faster through solids. It cannot travel through empty space at all.'],
    ['What do decomposers like mushrooms do?', 'break down dead things', ['make sunlight', 'eat only meat', 'build nests'], 'Decomposers return nutrients to the soil.'],
    ['A mixture you can separate with a magnet is…', 'iron filings and sand', ['salt water', 'sugar in tea', 'milk'], 'The magnet pulls the iron out and leaves the sand.']],
];
const SPACE = [
  [['What is the big star we see in the daytime?', 'the Sun', ['the Moon', 'Mars', 'a cloud'], 'The Sun is a star. It gives us light and heat.'],
    ['When can we usually see the stars?', 'at night', ['at lunchtime', 'only in summer', 'never'], 'The Sun is so bright in the day that it hides the other stars.'],
    ['What planet do we live on?', 'Earth', ['Mars', 'the Moon', 'the Sun'], 'Earth is our home planet.'],
    ['What do astronauts wear in space?', 'a space suit', ['a swimsuit', 'pajamas', 'a raincoat'], 'Space suits give astronauts air and keep them safe.'],
    ['What shape is the full Moon?', 'a circle', ['a square', 'a triangle', 'a star'], 'A full Moon looks like a round circle.']],
  [['Which planet is called the Red Planet?', 'Mars', ['Jupiter', 'Venus', 'Neptune'], 'Mars looks red because of rusty dust.'],
    ['Why do we have day and night?', 'Earth spins', ['The Sun turns off', 'Clouds cover the Sun', 'The Moon blocks the Sun'], 'Earth spins once every 24 hours, so each side faces the Sun, then away.'],
    ['Which is the biggest planet?', 'Jupiter', ['Earth', 'Mars', 'Mercury'], 'More than 1,000 Earths could fit inside Jupiter.'],
    ['What is a group of stars that makes a picture called?', 'a constellation', ['a comet', 'a galaxy', 'a crater'], 'The Big Dipper is a famous star picture.'],
    ['About how long does the Moon take to go around Earth?', 'about a month', ['one day', 'one hour', 'ten years'], 'The Moon orbits Earth about every 27 days.']],
  [['Which planet is closest to the Sun?', 'Mercury', ['Venus', 'Earth', 'Mars'], 'Mercury is the smallest planet and closest to the Sun.'],
    ['Where does the Moon\'s light really come from?', 'sunlight reflecting off it', ['its own fire', 'city lights', 'electricity'], 'The Moon does not make light. It reflects sunlight.'],
    ['How long does Earth take to orbit the Sun?', 'about 365 days', ['24 hours', '30 days', '100 years'], 'One trip around the Sun is one year.'],
    ['Why do stars look tiny?', 'They are very far away', ['They are tiny', 'They are cold', 'They are behind clouds'], 'Many stars are bigger than our Sun, just extremely far away.'],
    ['What keeps the planets in orbit around the Sun?', 'gravity', ['wind', 'magnets', 'light'], 'The Sun\'s gravity holds the planets in their paths.'],
    ['What causes Earth\'s seasons?', 'the tilt of Earth\'s axis', ['distance from the Moon', 'how fast Earth spins', 'clouds'], 'The tilt means each half of Earth gets more direct sunlight for part of the year.']],
];
const LOGIC = [
  [['Gizmo only picks up RED things. Which one does Gizmo pick up?', '🍎', ['🍌', '🫐']], ['If the light is green, Gizmo goes. The light is green. What does Gizmo do?', 'Go', ['Stop', 'Sleep']],
    ['First Gizmo puts on socks. What comes next?', 'shoes', ['a bath', 'pajamas']], ['Gizmo counts 1, 2, 3. What does Gizmo say next?', '4', ['5', '2']],
    ['Which one needs electricity to work?', '💡', ['🪨', '🍃']], ['Gizmo sorts by size. Which is the BIGGEST?', '🐘', ['🐭', '🐞']]],
  [['If it rains, Gizmo opens an umbrella. It is raining. What does Gizmo do?', 'Opens an umbrella', ['Plants seeds', 'Goes to sleep', 'Nothing']],
    ['To make a sandwich, what is the FIRST step?', 'Get two slices of bread', ['Take a bite', 'Clean the plate', 'Cut it in half']],
    ['Gizmo repeats "clap" 3 times. How many claps?', '3', ['1', '6', '4']],
    ['A recipe says: add eggs, crack eggs, mix. What is the bug?', 'Eggs are added before cracking', ['Too many eggs', 'Mixing is not a step', 'Nothing is wrong']],
    ['Gizmo shares 10 gears equally into 2 bins. How many in each bin?', '5', ['2', '10', '8']],
    ['Which instruction is the most exact for a robot?', 'Move forward 3 squares', ['Go over there', 'Move a bit', 'Go fast']]],
  [['A light turns on only when BOTH switches are on. A is on, B is off. Is the light on?', 'No', ['Yes', 'Half on', 'It blinks']],
    ['A light turns on when EITHER switch is on. A is off, B is on. Is the light on?', 'Yes', ['No', 'Only if A turns on', 'It breaks']],
    ['In binary, 1, 10, 11, 100 count from 1 to 4. What is 5?', '101', ['110', '111', '1000']],
    ['A loop of 4 jumps runs inside a loop that repeats 3 times. How many jumps?', '12', ['7', '4', '3']],
    ['score = 5, then score = score + 3. What is score now?', '8', ['5', '3', '53']],
    ['Which is an example of an algorithm?', 'Steps to tie a shoe', ['A pile of shoes', 'A shoe color', 'A broken lace']],
    ['If temperature > 30, the fan turns on. It is 25. Is the fan on?', 'No', ['Yes', 'Only at night', 'It spins backward']]],
];

// ─── Coding paths for Gizmo ──────────────────────────────────────────────────
const ARW = { '→': [0, 1], '←': [0, -1], '↑': [-1, 0], '↓': [1, 0] };
function runProg(p, start, n) { let [r, c] = start; for (const a of p) { r += ARW[a][0]; c += ARW[a][1]; if (r < 0 || c < 0 || r >= n || c >= n) return null; } return [r, c]; }
function fmtProg(p, loops) {
  if (!loops) return p.join(' ');
  for (const k of [4, 3, 2]) if (p.length % k === 0) { const u = p.slice(0, p.length / k); if (u.length > 1 && p.every((a, i) => a === u[i % u.length])) return `repeat ${k} [${u.join(' ')}]`; }
  const runs = []; for (const a of p) { const l = runs[runs.length - 1]; if (l && l[0] === a) l[1]++; else runs.push([a, 1]); }
  return runs.map(([a, k]) => k > 1 ? `repeat ${k} [${a}]` : a).join(', ');
}
function codeQuestion(l) {
  const g = grade(), n = 5, loops = g >= 4;
  for (let guard = 0; guard < 200; guard++) {
    const start = [ri(0, n - 1), ri(0, n - 1)];
    let prog = [];
    if (g <= 1) { const a = pick(Object.keys(ARW)); prog = Array(ri(1, l + 2)).fill(a); }
    else if (loops && l >= 1 && Math.random() < 0.6) { const k = ri(2, 3); const u = shuffle([pick(['→', '←']), pick(['↑', '↓'])]); for (let i = 0; i < k; i++) prog.push(...u); }
    else { const h = pick(['→', '←']), v = pick(['↑', '↓']); prog = [...Array(ri(1, 3)).fill(h), ...Array(ri(1, l + 1)).fill(v)]; if (Math.random() < 0.4) prog.reverse(); }
    const goal = runProg(prog, start, n); if (!goal || (goal[0] === start[0] && goal[1] === start[1])) continue;
    const flip = { '→': '←', '←': '→', '↑': '↓', '↓': '↑' };
    const muts = [p => p.map((a, i) => i === p.length - 1 ? flip[a] : a), p => p.slice(0, -1), p => [...p, p[p.length - 1]], p => p.map(a => flip[a]), p => p.map((a, i) => i === 0 ? (a === '↑' || a === '↓' ? pick(['→', '←']) : pick(['↑', '↓'])) : a), p => [p[0], ...p]];
    const wrong = new Set();
    for (const m of shuffle(muts)) { const q = m(prog); if (!q.length) continue; const e = runProg(q, start, n); if (e && e[0] === goal[0] && e[1] === goal[1]) continue; const s = fmtProg(q, loops); if (s !== fmtProg(prog, loops)) wrong.add(s); if (wrong.size >= nOpt() - 1) break; }
    if (wrong.size < 2) continue;
    const ans = fmtProg(prog, loops);
    return { prompt: 'Which code moves Gizmo to the crystal?', ...choicesStr(ans, [...wrong]), explain: `Follow it one arrow at a time: ${ans} lands right on the crystal.`, say: 'Which code moves Gizmo to the crystal? Read each arrow and follow the squares.', draw: (x, w, h) => DX.grid(x, w, h, n, start, goal) };
  }
  return { prompt: 'What comes next? → → ↑ → → ↑ → →', ...choicesStr('↑', ['→', '←']), explain: 'The pattern is two rights, then up.', draw: (x, w, h) => DX.big(x, w, h, '→ → ↑ → → ↑ → → ?', '#E8FBFF', '#C8EFF7') };
}
function patternQuestion(l) {
  const sets = [['🔴', '🔵'], ['🟡', '🟢', '🟢'], ['⭐', '🌙'], ['🔺', '🟦', '🟦'], ['🤖', '⚙️'], ['🍎', '🍌', '🍇']];
  const unit = pick(sets), seq = Array.from({ length: 6 + l }, (_, i) => unit[i % unit.length]), ans = unit[seq.length % unit.length];
  const wrong = [...new Set(['🔴', '🔵', '🟡', '🟢', '⭐', '🌙', '🔺', '🟦', '🤖', '⚙️', '🍎', '🍌', '🍇'].filter(e => e !== ans))];
  return { prompt: 'What comes next in Gizmo\'s pattern?', ...choicesStr(ans, shuffle(wrong).slice(0, 2)), explain: `The part that repeats is ${unit.join(' ')}.`,
    draw: (x, w, h) => { D.bg(x, w, h, '#E8FBFF', '#C8EFF7'); seq.forEach((e, i) => DX.emoji(x, e, 40 + i * (w - 80) / (seq.length + 0.6), h / 2, 46)); D.text(x, '?', w - 40, h / 2, 56, '#0F2F36'); } };
}

// ─── Math Masters: K–5 number sense at the Academy ───────────────────────────
function mathQuestion(l) {
  const g = grade(), E = pick([['🦋', 'butterflies'], ['🌻', 'sunflowers'], ['🐞', 'ladybugs'], ['🍓', 'strawberries']]);
  const fr = (n, d) => `${n}/${d}`, val = (s) => { const [n, d] = s.split('/').map(Number); return n / d; };
  if (g === 0) {
    if (Math.random() < 0.6) { const n = [ri(1, 5), ri(3, 8), ri(5, 10)][l]; return { prompt: `How many ${E[1]} do you see?`, ...choicesNum(n, 2, 3, 1), explain: `Touch each one and count: there are ${n}.`, draw: (x, w, h) => { D.bg(x, w, h, '#F0FFE8', '#D8F5C6'); for (let i = 0; i < n; i++) DX.emoji(x, E[0], 70 + (i % 5) * (w - 140) / 4, n > 5 ? (i < 5 ? h * 0.32 : h * 0.7) : h / 2, 54); } }; }
    const n = ri(1, [5, 9, 19][l]); return { prompt: `What number comes right after ${n}?`, ...choicesNum(n + 1, 2, 3, 0), explain: `Count up: ${n}, ${n + 1}.`, draw: (x, w, h) => DX.big(x, w, h, `${n}, __`, '#F0FFE8', '#D8F5C6') };
  }
  if (g === 1) { const max = [5, 10, 20][l];
    if (Math.random() < 0.55) { const a = ri(1, max - 1), b = ri(1, max - a); return { prompt: `${a} + ${b} = ?`, ...choicesNum(a + b, 3, 3, 0), explain: `Start at ${a} and count on ${b}: ${a + b}.`, draw: (x, w, h) => DX.big(x, w, h, `${a} + ${b} = ?`, '#FFF6DC', '#FFE3A3') }; }
    const a = ri(2, max), b = ri(1, a); return { prompt: `${a} − ${b} = ?`, ...choicesNum(a - b, 3, 3, 0), explain: `Start at ${a} and count back ${b}: ${a - b}.`, draw: (x, w, h) => DX.big(x, w, h, `${a} − ${b} = ?`, '#F6F0FF', '#E4D8FF') }; }
  if (g === 2) { const t = pick(['add', 'sub', 'skip']);
    if (t === 'skip') { const step = pick([[2, 5, 10], [2, 5, 10, 3], [3, 4, 5, 25]][l]), st = step * ri(0, 3), seq = [0, 1, 2, 3].map(i => st + i * step), ans = st + 4 * step; return { prompt: `Skippy skips by ${step}s: ${seq.join(', ')}, __`, ...choicesStr(String(ans), [ans + step, ans + 1, ans - 1].map(String)), explain: `Add ${step} to ${seq[3]}: ${ans}.`, draw: (x, w, h) => DX.big(x, w, h, `${seq.join(', ')}, ?`, '#EFFBEA', '#D3F2C6') }; }
    let a, b; for (let k = 0; k < 50; k++) { a = ri(11, 69); b = ri(11, 29); const carry = (a % 10) + (b % 10) >= 10; if (l === 0) { a = ri(1, 9) * 10; b = ri(1, 9); break; } if ((l === 1) !== carry) break; }
    if (t === 'add') return { prompt: `${a} + ${b} = ?`, ...choicesStr(String(a + b), [a + b + 10, a + b - 10, a + b + 1].map(String)), explain: `Add the tens, then the ones: ${a + b}.`, draw: (x, w, h) => DX.big(x, w, h, `${a} + ${b}`, '#FFF6DC', '#FFE3A3') };
    const big = a + b; return { prompt: `${big} − ${b} = ?`, ...choicesStr(String(a), [a + 10, a - 10, a + 1].map(String)), explain: `${big} − ${b} = ${a}. Check: ${a} + ${b} = ${big}.`, draw: (x, w, h) => DX.big(x, w, h, `${big} − ${b}`, '#F6F0FF', '#E4D8FF') }; }
  if (g === 3) { const m = [5, 6, 10][l], a = l === 0 ? pick([2, 5, 10]) : ri(2, m), b = ri(2, m), t = pick(['mul', 'div', 'story']);
    if (t === 'div') return { prompt: `${a * b} ÷ ${a} = ?`, ...choicesStr(String(b), [b + 1, b - 1, a].filter(v => v !== b && v > 0).map(String)), explain: `Think: ${a} × ${b} = ${a * b}, so ${a * b} ÷ ${a} = ${b}.`, draw: (x, w, h) => DX.big(x, w, h, `${a * b} ÷ ${a}`, '#2A0F4A', '#4A1A7A', '#FFE27A') };
    const p = t === 'story' ? `Nia plants ${a} rows with ${b} seeds in each row. How many seeds?` : `${a} × ${b} = ?`;
    return { prompt: p, ...choicesStr(String(a * b), [a * b + a, a * b - b, a + b].filter(v => v !== a * b).map(String)), explain: `${a} groups of ${b} make ${a * b}.`, draw: (x, w, h) => DX.big(x, w, h, `${a} × ${b}`, '#2A0F4A', '#4A1A7A', '#FFE27A') }; }
  if (g === 4) { const t = pick(['mul', 'frac', 'round']);
    if (t === 'mul') { const a = [ri(11, 19), ri(12, 49), ri(11, 25)][l], b = [ri(2, 5), ri(3, 9), ri(11, 15)][l], ans = a * b; return { prompt: `${a} × ${b} = ?`, ...choicesStr(String(ans), [ans + 10, ans - b, ans + a].filter(v => v !== ans).map(String)), explain: `Break it apart: ${a} × ${b} = ${ans}.`, draw: (x, w, h) => DX.big(x, w, h, `${a} × ${b}`, '#FFF6DC', '#FFE3A3') }; }
    if (t === 'frac') { const [n, d] = pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5]]), k = ri(2, 4), ans = fr(n * k, d * k); const wrong = [fr(n * k, d * k + 1), fr(n + k, d + k), fr(n, d * k), fr(n * k + 1, d * k)].filter(s => Math.abs(val(s) - n / d) > 1e-9 && s !== ans); return { prompt: `Freddy asks: which fraction equals ${n}/${d}?`, ...choicesStr(ans, [...new Set(wrong)].slice(0, 3)), explain: `Multiply the top and bottom by ${k}: ${n}/${d} = ${ans}.`, draw: (x, w, h) => { D.bg(x, w, h, '#FFF5F5', '#FFE0E0'); D.pie(x, w / 2, h / 2, h * 0.42, d, n); } }; }
    const p = l === 2 ? 100 : 10, x0 = l === 0 ? ri(11, 99) : ri(101, 999), ans = Math.round(x0 / p) * p; return { prompt: `Round ${x0} to the nearest ${p}.`, ...choicesStr(String(ans), [ans + p, ans - p, Math.floor(x0 / p) * p === ans ? ans + p : Math.floor(x0 / p) * p].filter(v => v !== ans && v >= 0).map(String)), explain: `Look at the digit to the right. ${x0} rounds to ${ans}.`, draw: (x, w, h) => DX.big(x, w, h, `${x0} → nearest ${p}`, '#EEF4FF', '#D6E4FF') };
  }
  const t = pick(['frac', 'dec', 'ops']), fmt = (v) => String(+v.toFixed(3));
  if (t === 'frac') { let ans, p, wrong;
    if (l < 2) { const d = pick([4, 5, 6, 8, 10, 12]), a = ri(1, d - 2), b = ri(1, d - 1 - a); p = `${a}/${d} + ${b}/${d} = ?`; ans = fr(a + b, d); wrong = [fr(a + b, d * 2), fr(a + b + 1, d), fr(Math.abs(a - b) || 1, d)]; }
    else { const d1 = pick([2, 3, 4]), d2 = d1 * 2, a = 1, b = ri(1, d2 - 2 * a - 1); p = `${a}/${d1} + ${b}/${d2} = ?`; ans = fr(2 * a + b, d2); wrong = [fr(a + b, d1 + d2), fr(a + b, d2), fr(2 * a + b + 1, d2)]; }
    wrong = [...new Set(wrong)].filter(s => Math.abs(val(s) - val(ans)) > 1e-9);
    return { prompt: p, ...choicesStr(ans, wrong.slice(0, 3)), explain: `Use the same denominator, then add the numerators: ${ans}.`, draw: (x, w, h) => DX.big(x, w, h, p.replace(' = ?', ''), '#FFF5F5', '#FFE0E0') }; }
  if (t === 'dec') { let p, ans;
    if (l === 0) { const a = ri(1, 5), b = ri(1, 4); p = `0.${a} + 0.${b} = ?`; ans = (a + b) / 10; }
    else if (l === 1) { const a = ri(11, 60), b = ri(1, 9); p = `${fmt(a / 100)} + ${fmt(b / 10)} = ?`; ans = a / 100 + b / 10; }
    else { const a = ri(12, 95) / 10; p = `${fmt(a)} × 10 = ?`; ans = a * 10; }
    return { prompt: p, ...choicesStr(fmt(ans), [fmt(ans + 0.1), fmt(ans * 10 === ans ? ans + 1 : ans * 10), fmt(Math.max(0.01, ans - 0.01))].filter(s => s !== fmt(ans))), explain: `Line up the decimal points: ${fmt(ans)}.`, draw: (x, w, h) => DX.big(x, w, h, p.replace(' = ?', ''), '#EEF4FF', '#D6E4FF') }; }
  const a = ri(2, 9), b = ri(2, 6), c = ri(2, 5), paren = l === 2, ans = paren ? (a + b) * c : a + b * c, other = paren ? a + b * c : (a + b) * c;
  const p = paren ? `(${a} + ${b}) × ${c} = ?` : `${a} + ${b} × ${c} = ?`;
  return { prompt: p, ...choicesStr(String(ans), [other, ans + 1, ans - c].filter(v => v !== ans).map(String)), explain: paren ? 'Work inside the parentheses first.' : 'Multiply before you add.', draw: (x, w, h) => DX.big(x, w, h, p.replace(' = ?', ''), '#FFF6DC', '#FFE3A3') };
}

// ─── The new games (every one adapts to the explorer's grade) ────────────────
Object.assign(GAMES, {
  phonics: { title: 'Leo\'s Word Safari', host: 'Leo', icon: '🦁', zone: 'safari', subject: 'Phonics & words', graded: true, intro: 'Every word you sound out makes my roar stronger. Let\'s track some words!',
    gen(l) { const g = grade(), n = nOpt();
      if (g === 0) { const end = l === 2; const [e, w] = pick(end ? ENDS : PICS.filter(p => l === 1 || !'aeiou'.includes(p[1][0]))); const ans = end ? w[w.length - 1] : w[0];
        const pool = 'bcdfghjklmnprstvwz'.split('').concat(l ? ['a', 'e', 'i', 'o', 'u'] : []);
        return { prompt: end ? `What sound does "${w}" end with?` : `What sound does "${w}" start with?`, say: `${w}. What letter does ${w} ${end ? 'end' : 'start'} with?`, ...optsFrom(ans, pool, 3), explain: `Say it slowly: "${w}" ${end ? 'ends' : 'starts'} with ${ans}.`, draw: (x, w2, h) => DX.picWord(x, w2, h, e, end ? w.slice(0, -1) + '_' : '_' + w.slice(1)) }; }
      if (g === 1) { if (l === 2) { const [e, w, dg] = pick(DIGRAPH); return { prompt: `Which letters start "${w}"?`, say: `${w}. Which two letters make the first sound?`, ...choicesStr(dg, ['sh', 'ch', 'th', 'wh'].filter(d => d !== dg).slice(0, n - 1)), explain: `${dg} + ${w.slice(2)} makes "${w}".`, draw: (x, w2, h) => DX.picWord(x, w2, h, e, '__' + w.slice(2)) }; }
        const [e, w] = pick(CVC); return { prompt: `Which vowel finishes "${w}"?`, say: `${w}. Which vowel is in the middle?`, ...optsFrom(w[1], ['a', 'e', 'i', 'o', 'u'], l ? 4 : 3), explain: `${w[0]} – ${w[1]} – ${w[2]} spells "${w}".`, draw: (x, w2, h) => DX.picWord(x, w2, h, e, w[0] + '_' + w[2]) }; }
      if (g === 2) { const [w, r, d] = pick(RHYME); return { prompt: `Which word rhymes with "${w}"?`, ...choicesStr(r, d.slice(0, n - 1)), explain: `"${w}" and "${r}" end with the same sound.`, draw: (x, w2, h) => DX.big(x, w2, h, `${w} rhymes with …`, '#FFF6DC', '#FFE3A3', '#5A2E10') }; }
      if (g === 3) { const [p, a, d, hint] = pick(MORPH); return { prompt: p, ...choicesStr(a, d.slice(0, n - 1)), explain: hint, draw: (x, w2, h) => DX.big(x, w2, h, p.length < 28 ? p : '🦁 Word Builders', '#FFF6DC', '#FFE3A3', '#5A2E10') }; }
      const [p, a, d] = pick(g === 4 ? SYN : CTX); return { prompt: p, ...choicesStr(a, d.slice(0, n - 1)), explain: `The best answer is "${a}".`, draw: (x, w2, h) => g === 5 && p.length > 50 ? DX.passage(x, w2, h, p, '#FFF6DC', '#FFE3A3') : DX.big(x, w2, h, '🦁 ' + (p.match(/"([^"]+)"/)?.[1] || 'Word Safari'), '#FFF6DC', '#FFE3A3', '#5A2E10') };
    } },
  spelling: { title: 'Toby\'s Spelling Stroll', host: 'Toby', icon: '🐢', zone: 'river', subject: 'Sight words & spelling', graded: true, intro: 'Slow and steady wins the race. Let\'s find the words that are just right.',
    gen(l) { const g = grade();
      if (g <= 1) { const [w, d] = pick(SIGHT[g]); return { prompt: `Find the word "${w}".`, say: `Find the word: ${w}.`, ...choicesStr(w, d), explain: `"${w}" is spelled ${w.split('').join('-')}.`, draw: (x, w2, h) => DX.big(x, w2, h, '👂 Listen and find the word', '#E9F7FF', '#CBEAFF', '#1D3557') }; }
      const w = pick(SPELL[g]); return { prompt: 'Which word is spelled correctly?', say: `Which word is spelled correctly? The word is ${w}.`, ...choicesStr(w, misspell(w)), explain: `"${w}" is spelled ${w.split('').join('-')}.`, draw: (x, w2, h) => DX.big(x, w2, h, '🐢 Spelling Stroll', '#E9F7FF', '#CBEAFF', '#1D3557') };
    } },
  reading: { title: 'Story Time on Reading River', host: 'Oliver', icon: '🦉', zone: 'river', subject: 'Reading comprehension', graded: true, intro: 'Hoo! Listen to the story, then answer my question.',
    gen() { const s = pick(STORIES[band()]), [q, a, d] = pick(s.qs);
      return { prompt: q, say: `${s.t} ... ${q}`, ...choicesStr(a, d.slice(0, nOpt() - 1)), explain: `The story tells us: ${a}.`, draw: (x, w, h) => DX.passage(x, w, h, s.t, '#EEF7FF', '#D7EBFF') };
    } },
  coding: { title: 'Code Gizmo to the Crystal', host: 'Katie', icon: '🦘', zone: 'lab', subject: 'Coding', graded: true, intro: 'Gizmo follows your code one step at a time. Pick the code that reaches the crystal!',
    gen(l) { return grade() <= 1 && (l === 0 || Math.random() < 0.35) ? patternQuestion(l) : codeQuestion(l); } },
  logic: { title: 'Gizmo\'s Logic Lab', host: 'Gizmo', icon: '🤖', zone: 'lab', subject: 'Logic & computer science', graded: true, intro: 'Beep boop! Robots think in steps and rules. Can you think like me?',
    gen() { const [p, a, d] = pick(LOGIC[band()]); return { prompt: p, ...choicesStr(a, d.slice(0, nOpt() - 1)), explain: `The answer is ${a}.`, draw: (x, w, h) => { D.bg(x, w, h, '#0F2F36', '#123E47'); const em = [a, ...d].filter(s => /\p{Extended_Pictographic}/u.test(s)); if (em.length) em.slice(0, 3).forEach((e, i) => DX.emoji(x, e, w * (0.25 + i * 0.25), h / 2, 80)); else D.text(x, '🤖 ⚙️ 💡', w / 2, h / 2, 70, '#2EE6E3'); } }; } },
  science: { title: 'Sloth Sage\'s Science Quest', host: 'Sloth', icon: '🦥', zone: 'observatory', subject: 'Science', graded: true, intro: 'Ask a question, look closely, and the answer will come.',
    gen() { const [p, a, d, f] = pick(SCI[band()]); return { prompt: p, ...choicesStr(a, d.slice(0, nOpt() - 1)), explain: f, draw: (x, w, h) => { D.bg(x, w, h, '#F1ECFF', '#DDD2FF'); const em = [a, ...d].map(s => s.match(/\p{Extended_Pictographic}/u)?.[0]).filter(Boolean); D.text(x, em.length ? em.join('  ') : '🔬 🌱 💧', w / 2, h / 2, 72); } }; } },
  space: { title: 'Star Gazer Quiz', host: null, icon: '🔭', zone: 'observatory', subject: 'Space science', graded: true, intro: 'Look up! Let\'s learn about the Sun, the Moon, and the planets.',
    gen() { const [p, a, d, f] = pick(SPACE[band()]); return { prompt: p, ...choicesStr(a, d.slice(0, nOpt() - 1)), explain: f, draw: (x, w, h) => { const g2 = x.createLinearGradient(0, 0, 0, h); g2.addColorStop(0, '#0B1030'); g2.addColorStop(1, '#25195A'); x.fillStyle = g2; x.fillRect(0, 0, w, h); for (let i = 0; i < 60; i++) { x.fillStyle = `rgba(255,255,255,${0.3 + (i % 5) * 0.14})`; x.fillRect((i * 97) % w, (i * 53) % h, 2, 2); } DX.emoji(x, '🪐', w * 0.3, h / 2, 96); DX.emoji(x, '🌙', w * 0.7, h * 0.4, 70); } }; } },
  mathplus: { title: 'Math Masters', host: null, icon: '🔢', zone: 'academy', subject: 'Math (K–5)', graded: true, intro: 'Numbers at just the right level for your grade. Let\'s solve!',
    gen(l) { return mathQuestion(l); } },
});
Object.assign(CHAR_GAME, { leo: 'phonics', toby: 'spelling', oliver: 'reading', katie: 'coding', gizmo: 'logic', sloth: 'science' });

// ═════════════════════════════════════════════════════════════════════════════
//  NEW FRIENDS
// ═════════════════════════════════════════════════════════════════════════════
function bmeFace(head, R, S, o = {}) {
  const { brow = '#5A2E10', lip = '#6B2A10', bx = 0.36, by = 0.42, my = -0.44, mw = 0.5, w = 2.0, smile = 1.4 } = o;
  const paint = (open) => (x, map, px) => { for (const s of [-1, 1]) paintBrow(x, map, px, s * bx, by, 0.22, 0.04, brow, -s * 0.2, 0.4); paintMouth(x, map, px, my, mw, open, { lip, inner: '#5B1414', tongue: '#E46B7B', teeth: false, smile }); };
  const face = faceDecal(head, R + 0.017, S, { w, t0: 0.75, tl: 1.5 }, paint(0.08));
  return { mat: face.mat, closed: face.mat.map, open: face.make(paint(0.22)) };
}
function buildLeo() {
  const root = grp(), body = grp(root);
  const FUR = 0xE3A43C, LIGHT = 0xF7D9A0, MANE = 0xB5541C;
  for (const s of [-1, 1]) {
    fur(new THREE.CapsuleGeometry(0.075, 0.26, 6, 14), FUR, { len: 0.012, density: [24, 16] }, root).position.set(s * 0.12, 0.22, 0);
    const paw = fur(new THREE.SphereGeometry(0.085, 18, 12), LIGHT, { len: 0.01, density: [16, 10] }, root); paw.position.set(s * 0.12, 0.05, 0.05); paw.scale.set(1, 0.6, 1.4);
  }
  const torso = fur(new THREE.SphereGeometry(0.24, 32, 24), FUR, { len: 0.014, density: [50, 30] }, body); torso.position.y = 0.64; torso.scale.set(1, 1.2, 0.9);
  const belly = fur(new THREE.SphereGeometry(0.17, 24, 16), LIGHT, { len: 0.012, density: [30, 20] }, body); belly.position.set(0, 0.6, 0.12); belly.scale.set(0.85, 1.1, 0.6);
  mk(lathe([[0.215, 0.45], [0.255, 0.56], [0.26, 0.72], [0.22, 0.86], [0.13, 0.92]], 32, 24, 0.75, TAU - 1.5), felt(0x2F7D5B, undefined, THREE.DoubleSide), body);
  for (const s of [-1, 1]) { const p = mk(new RoundedBox(0.09, 0.08, 0.03, 0.01), felt(0x245F45), body); p.position.set(s * 0.17, 0.66, 0.19); p.rotation.y = s * 0.5; }
  const armL = makeArm(body, V3(0.25, 0.84, 0), 1, { len: 0.3, r0: 0.06, r1: 0.05, sleeve: felt(FUR), skinMat: felt(LIGHT), handScale: 1.15, bare: true, spread: 0.25 });
  const armR = makeArm(body, V3(-0.25, 0.84, 0), -1, { len: 0.3, r0: 0.06, r1: 0.05, sleeve: felt(FUR), skinMat: felt(LIGHT), handScale: 1.15, bare: true, spread: 0.25 });
  const tail = grp(body); tail.position.set(0, 0.42, -0.2);
  mk(taperTube([[0, 0, 0], [0, -0.05, -0.3], [0, 0.18, -0.5]], 0.03, 0.022, 16, 8), felt(FUR), tail);
  fur(new THREE.SphereGeometry(0.065, 16, 12), MANE, { len: 0.03, density: [20, 14] }, tail).position.set(0, 0.2, -0.52);
  const head = grp(body); head.position.set(0, 1.16, 0.02);
  const R = 0.21, S = V3(1.05, 0.98, 0.98);
  const mane = fur(new THREE.SphereGeometry(0.31, 32, 24), MANE, { len: 0.06, density: [70, 40], gravity: 0.15 }, head); mane.position.set(0, -0.01, -0.09); mane.scale.set(1.08, 1.05, 0.72);
  fur(new THREE.SphereGeometry(R, 48, 32), FUR, { len: 0.01, density: [60, 30] }, head).scale.copy(S);
  const muz = fur(new THREE.SphereGeometry(0.1, 24, 16), LIGHT, { len: 0.008, density: [25, 15] }, head); muz.position.copy(onSphere(R, S, 0, -0.38, -0.045)); muz.scale.set(1.35, 0.8, 0.9);
  const nose = mk(new THREE.SphereGeometry(0.036, 16, 12), gloss(0x5A2E1A, 0.25), head); nose.position.copy(onSphere(R, S, 0, -0.16, 0.03)); nose.scale.set(1.4, 0.9, 1);
  const eyes = [-1, 1].map(s => makeEye(head, onSphere(R, S, s * 0.36, 0.1, -0.02), 0.055, 0xC8842A, felt(FUR)));
  const mouth = bmeFace(head, R, S, { my: -0.55, mw: 0.45 });
  for (const s of [-1, 1]) { const e = mk(new THREE.SphereGeometry(0.065, 16, 12), felt(FUR), head); e.position.set(s * 0.17, 0.18, -0.03); e.scale.set(1, 1, 0.5); const i = mk(new THREE.SphereGeometry(0.04, 12, 10), felt(0xF2A7A0), head); i.position.set(s * 0.17, 0.18, 0.0); i.scale.set(1, 1, 0.3); }
  const hat = grp(head); hat.position.set(0, 0.2, -0.01); hat.rotation.x = -0.12; const KH = felt(0xD8C18A);
  mk(new THREE.CylinderGeometry(0.3, 0.3, 0.025, 32), KH, hat); mk(new THREE.SphereGeometry(0.17, 24, 12, 0, TAU, 0, Math.PI / 2), KH, hat).position.y = 0.01;
  mk(new THREE.CylinderGeometry(0.172, 0.172, 0.045, 24), felt(0x2F7D5B), hat).position.y = 0.035;
  return registerChar(root, {
    key: 'leo', name: 'Leo the Lion', height: 1.5, hitR: 0.55, rig: { body, head, eyes, mouth },
    dialog: ['Roar! I\'m Leo, the Lost Language Lion. Welcome to my Word Safari!', 'Every word you sound out makes my roar stronger.', 'Sounds hide inside words. "Cat" starts with c... a... t!', 'Oliver Owl reads stories down at Reading River. Visit him next!', 'Help me earn the Word Crystal to chase away the Silence Shadow.'],
    update: (t, dt, focus, ud) => { armR.rotation.z = ud.excite > 0.2 ? -2.5 + Math.sin(t * 9) * 0.3 : -0.25; armL.rotation.z = 0.25 + Math.sin(t * 1.7) * 0.05; tail.rotation.y = Math.sin(t * 1.4) * 0.4; }
  });
}
function buildOliver() {
  const root = grp(), body = grp(root);
  const BR = 0x7A5233, DK = 0x5E3D24, BELLY = 0xEAD3A8, FACE = 0xF3E2C0;
  const torso = fur(new THREE.SphereGeometry(0.3, 32, 24), BR, { len: 0.02, density: [50, 30] }, body); torso.position.y = 0.44; torso.scale.set(1, 1.2, 0.95);
  const belly = fur(new THREE.SphereGeometry(0.22, 24, 18), BELLY, { len: 0.015, density: [30, 20] }, body); belly.position.set(0, 0.4, 0.14); belly.scale.set(1, 1.15, 0.7);
  const wings = [-1, 1].map(s => { const w = grp(body); w.position.set(s * 0.28, 0.58, -0.02); const m = fur(new THREE.SphereGeometry(0.2, 20, 14), DK, { len: 0.015, density: [25, 15] }, w); m.scale.set(0.35, 1, 0.8); m.position.y = -0.12; return w; });
  for (const s of [-1, 1]) { const f = mk(new THREE.SphereGeometry(0.05, 12, 10), gloss(0xE89A2E, 0.4), root); f.position.set(s * 0.1, 0.04, 0.12); f.scale.set(1.2, 0.5, 1.4); }
  const head = grp(body); head.position.set(0, 0.92, 0);
  const R = 0.24, S = V3(1.1, 0.95, 1);
  fur(new THREE.SphereGeometry(R, 40, 28), BR, { len: 0.016, density: [60, 30] }, head).scale.copy(S);
  for (const s of [-1, 1]) { const d = fur(new THREE.SphereGeometry(0.12, 24, 16), FACE, { len: 0.008, density: [20, 12] }, head); d.position.copy(onSphere(R, S, s * 0.32, 0.04, -0.06)); d.scale.set(1, 1, 0.5); }
  const eyes = [-1, 1].map(s => makeEye(head, onSphere(R, S, s * 0.32, 0.06, -0.01), 0.068, 0xF2A900, felt(BR)));
  for (const s of [-1, 1]) { const g = mk(new THREE.TorusGeometry(0.085, 0.01, 8, 28), GOLD, head); g.position.copy(onSphere(R, S, s * 0.32, 0.06, 0.06)); g.rotation.y = s * 0.3; }
  mk(new THREE.CylinderGeometry(0.008, 0.008, 0.06, 6).rotateZ(Math.PI / 2), GOLD, head).position.copy(onSphere(R, S, 0, 0.08, 0.05));
  const beak = mk(new THREE.ConeGeometry(0.04, 0.12, 12).rotateX(Math.PI / 2 + 0.5), gloss(0xF2A93B, 0.3), head); beak.position.copy(onSphere(R, S, 0, -0.14, 0.02));
  for (const s of [-1, 1]) { const tf = mk(new THREE.ConeGeometry(0.05, 0.17, 10), felt(DK), head); tf.position.set(s * 0.16, 0.22, -0.02); tf.rotation.z = -s * 0.4; }
  const book = mk(new RoundedBox(0.24, 0.3, 0.05, 0.012), gloss(0x2E86DE, 0.4), body); book.position.set(0.17, 0.32, 0.24); book.rotation.set(-0.25, -0.35, 0);
  return registerChar(root, {
    key: 'oliver', name: 'Oliver Owl', height: 1.2, hitR: 0.5, rig: { body, head, eyes },
    dialog: ['Hoo-hoo! I\'m Oliver Owl, keeper of the stories on Reading River.', 'Good readers ask questions while they read: who, what, where, and why?', 'Every story has a beginning, a middle, and an end.', 'Read with me to earn the Story Crystal!'],
    update: (t, dt, focus, ud) => { wings.forEach((w, i) => w.rotation.z = (i ? -1 : 1) * (ud.excite > 0.2 ? 0.8 + Math.sin(t * 14) * 0.5 : 0.05)); head.rotation.z = Math.sin(t * 0.6) * 0.12; }
  });
}
function buildToby() {
  const root = grp(), body = grp(root);
  const SKIN = 0x93C46E;
  const shellTex = canvasTex(512, 256, (x, w, h) => { x.fillStyle = '#4E9A5B'; x.fillRect(0, 0, w, h); x.strokeStyle = '#2F6B3A'; x.lineWidth = 8; for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) { const cx = c * 62 + (r % 2) * 31, cy = r * 64 + 30; x.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; x.lineTo(cx + Math.cos(a) * 30, cy + Math.sin(a) * 30); } x.closePath(); x.fillStyle = (r + c) % 3 ? '#5BAE66' : '#6CBF72'; x.fill(); x.stroke(); } });
  const shell = mk(new THREE.SphereGeometry(0.42, 36, 18, 0, TAU, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ map: shellTex, roughness: 0.45, clearcoat: 0.4 }), body); shell.position.y = 0.2; shell.scale.set(1, 0.78, 1.18);
  const rim = mk(new THREE.TorusGeometry(0.42, 0.045, 10, 40), felt(0xC9A36A), body); rim.rotation.x = Math.PI / 2; rim.position.y = 0.2; rim.scale.set(1, 1.18, 1);
  const under = mk(new THREE.SphereGeometry(0.4, 24, 12), felt(SKIN), body); under.position.y = 0.18; under.scale.set(1, 0.3, 1.15);
  const legs = []; for (const [x, z] of [[-0.3, 0.32], [0.3, 0.32], [-0.3, -0.32], [0.3, -0.32]]) { const l = fur(new THREE.CapsuleGeometry(0.075, 0.08, 6, 12), SKIN, { len: 0.006, density: [12, 8] }, body); l.position.set(x, 0.09, z); legs.push(l); }
  const neck = fur(new THREE.CapsuleGeometry(0.075, 0.14, 6, 12).rotateX(-0.9), SKIN, { len: 0.006, density: [12, 8] }, body); neck.position.set(0, 0.3, 0.48);
  const head = grp(body); head.position.set(0, 0.42, 0.6);
  const R = 0.14, S = V3(1, 0.95, 1.1);
  fur(new THREE.SphereGeometry(R, 32, 24), SKIN, { len: 0.006, density: [30, 16] }, head).scale.copy(S);
  const eyes = [-1, 1].map(s => makeEye(head, onSphere(R, S, s * 0.42, 0.18, -0.01), 0.04, 0x3A2A10, felt(SKIN)));
  const mouth = bmeFace(head, R, S, { brow: '#3E6B2A', lip: '#3E5A20', my: -0.3, mw: 0.5 });
  const scarf = mk(new THREE.TorusGeometry(0.1, 0.035, 10, 24), felt(0xE63946), body); scarf.position.set(0, 0.32, 0.5); scarf.rotation.x = 0.6;
  const cap = mk(new THREE.SphereGeometry(0.1, 20, 10, 0, TAU, 0, Math.PI / 2), felt(0x3A86FF), head); cap.position.set(0, 0.09, -0.01); mk(new THREE.BoxGeometry(0.12, 0.012, 0.09), felt(0x3A86FF), head).position.set(0, 0.09, 0.1);
  return registerChar(root, {
    key: 'toby', name: 'Toby Tortoise', height: 0.75, hitR: 0.6, rig: { body, head, eyes, mouth },
    dialog: ['Hello there. I\'m Toby Tortoise. Slow and steady wins the race!', 'When a word is tricky, I go slowly and look at every letter.', 'Some words you just have to know by heart, like "the," "said," and "where."', 'Oliver tells the best stories. Have you heard one yet?'],
    update: (t, dt, focus, ud) => { head.position.z = 0.6 + Math.sin(t * 0.8) * 0.03; legs.forEach((l, i) => l.rotation.x = Math.sin(t * 1.2 + i) * 0.1); }
  });
}
function buildKatie() {
  const root = grp(), body = grp(root);
  const FUR = 0xC48A55, LIGHT = 0xEFD2AA, COAT = felt(0xF4F7FA, undefined, THREE.DoubleSide);
  for (const s of [-1, 1]) { const f = fur(new THREE.CapsuleGeometry(0.06, 0.3, 6, 12).rotateX(Math.PI / 2), FUR, { len: 0.008, density: [16, 10] }, root); f.position.set(s * 0.12, 0.06, 0.1); const th = fur(new THREE.SphereGeometry(0.16, 20, 14), FUR, { len: 0.012, density: [24, 14] }, body); th.position.set(s * 0.14, 0.34, -0.02); th.scale.set(0.8, 1.1, 1.25); }
  const torso = fur(new THREE.SphereGeometry(0.24, 32, 24), FUR, { len: 0.012, density: [50, 30] }, body); torso.position.y = 0.74; torso.scale.set(0.9, 1.35, 0.85);
  const pouch = fur(new THREE.SphereGeometry(0.14, 20, 14), LIGHT, { len: 0.008, density: [20, 12] }, body); pouch.position.set(0, 0.6, 0.15); pouch.scale.set(1, 0.9, 0.5);
  mk(lathe([[0.2, 0.5], [0.26, 0.62], [0.27, 0.86], [0.22, 0.99], [0.12, 1.05]], 32, 24, 0.65, TAU - 1.3), COAT, body);
  const tail = fur(taperTube([[0, 0.38, -0.15], [0, 0.2, -0.5], [0, 0.06, -0.85]], 0.09, 0.03, 16, 10), FUR, { len: 0.01, density: [20, 12] }, body);
  const armL = makeArm(body, V3(0.18, 0.95, 0.06), 1, { len: 0.24, r0: 0.045, r1: 0.04, sleeve: COAT, skinMat: felt(LIGHT), handScale: 0.85, spread: 0.3 });
  const armR = makeArm(body, V3(-0.18, 0.95, 0.06), -1, { len: 0.24, r0: 0.045, r1: 0.04, sleeve: COAT, skinMat: felt(LIGHT), handScale: 0.85, spread: 0.3 });
  const head = grp(body); head.position.set(0, 1.26, 0.04);
  const R = 0.16, S = V3(0.92, 1, 1.08);
  fur(new THREE.SphereGeometry(R, 40, 28), FUR, { len: 0.01, density: [50, 26] }, head).scale.copy(S);
  const sn = fur(new THREE.SphereGeometry(0.09, 20, 14), LIGHT, { len: 0.006, density: [18, 10] }, head); sn.position.copy(onSphere(R, S, 0, -0.32, -0.03)); sn.scale.set(1, 0.8, 1.35);
  mk(new THREE.SphereGeometry(0.026, 12, 10), gloss(0x2B1A10, 0.25), head).position.copy(onSphere(R, S, 0, -0.2, 0.07));
  const eyes = [-1, 1].map(s => makeEye(head, onSphere(R, S, s * 0.38, 0.12, -0.02), 0.045, 0x5A3A1A, felt(FUR), { lash: s }));
  const mouth = bmeFace(head, R, S, { my: -0.55, mw: 0.42 });
  for (const s of [-1, 1]) { const e = grp(head); e.position.set(s * 0.08, 0.15, -0.03); e.rotation.z = -s * 0.25; mk(new THREE.ConeGeometry(0.05, 0.26, 14).translate(0, 0.13, 0), felt(FUR), e).scale.z = 0.5; const inn = mk(new THREE.ConeGeometry(0.03, 0.18, 12).translate(0, 0.1, 0), felt(0xF2B2A0), e); inn.scale.z = 0.3; inn.position.z = 0.012; }
  for (const s of [-1, 1]) { const g = mk(new THREE.TorusGeometry(0.042, 0.012, 8, 20), gloss(0x0F2F36, 0.3), head); g.position.copy(onSphere(R, S, s * 0.26, 0.45, 0.03)); g.rotation.x = -0.4; const lens = mk(new THREE.CircleGeometry(0.04, 20), new THREE.MeshPhysicalMaterial({ color: 0x2EE6E3, transparent: true, opacity: 0.6, roughness: 0.05, emissive: 0x2EE6E3, emissiveIntensity: 0.4 }), head); lens.position.copy(g.position); lens.rotation.x = -0.4; }
  return registerChar(root, {
    key: 'katie', name: 'Katie Kangaroo', height: 1.55, hitR: 0.55, rig: { body, head, eyes, mouth },
    dialog: ['Hop on in! I\'m Katie Kangaroo, chief engineer of the Explorers STEM Lab.', 'Coding is just giving clear steps in the right order.', 'If your code doesn\'t work, that\'s a bug. Find it, fix it, try again!', 'Code Gizmo to the crystal and we\'ll earn the Code Crystal together.'],
    update: (t, dt, focus, ud) => { const ph = (t * 0.45) % 1, hop = ph < 0.18 ? Math.sin(ph / 0.18 * Math.PI) * 0.35 : 0; root.position.y = (ud.baseY ?? root.position.y) + hop; tail.rotation.x = -hop * 0.6; armR.rotation.z = ud.excite > 0.2 ? -2.3 + Math.sin(t * 9) * 0.3 : -0.3; armL.rotation.z = 0.3; }
  });
}
function buildSloth() {
  const root = grp(), body = grp(root);
  const FUR = 0x9A8366, FACE = 0xE8D6B8, MASK = 0x4A3A2A, ROBE = felt(0x6A3FB5);
  const torso = fur(new THREE.SphereGeometry(0.32, 32, 24), FUR, { len: 0.03, density: [50, 30], gravity: 0.3 }, body); torso.position.y = 0.42; torso.scale.set(1, 1.1, 0.9);
  for (const s of [-1, 1]) { const l = fur(new THREE.CapsuleGeometry(0.07, 0.22, 6, 12).rotateX(Math.PI / 2), FUR, { len: 0.02, density: [18, 12] }, root); l.position.set(s * 0.15, 0.14, 0.24); }
  const armL = makeArm(body, V3(0.27, 0.62, 0.05), 1, { len: 0.42, r0: 0.06, r1: 0.05, sleeve: felt(FUR), skinMat: felt(0x6B5A45), bare: true, fingers: 3, spread: 0.35 });
  const armR = makeArm(body, V3(-0.27, 0.62, 0.05), -1, { len: 0.42, r0: 0.06, r1: 0.05, sleeve: felt(FUR), skinMat: felt(0x6B5A45), bare: true, fingers: 3, spread: 0.35 });
  const scarf = mk(new THREE.TorusGeometry(0.2, 0.06, 10, 28), ROBE, body); scarf.position.y = 0.7; scarf.rotation.x = Math.PI / 2;
  const pin = mk(starGeoE(0.05, 0.022, 0.02), GOLD, body); pin.position.set(0, 0.68, 0.25);
  const head = grp(body); head.position.set(0, 0.9, 0.02);
  const R = 0.2, S = V3(1.12, 0.95, 0.95);
  fur(new THREE.SphereGeometry(R, 40, 28), FUR, { len: 0.02, density: [50, 26], gravity: 0.2 }, head).scale.copy(S);
  const fd = fur(new THREE.SphereGeometry(0.155, 28, 20), FACE, { len: 0.006, density: [20, 12] }, head); fd.position.copy(onSphere(R, S, 0, -0.05, -0.07)); fd.scale.set(1.15, 0.85, 0.6);
  for (const s of [-1, 1]) { const m = mk(new THREE.SphereGeometry(0.055, 16, 12), felt(MASK), head); m.position.copy(onSphere(R, S, s * 0.3, 0.02, -0.01)); m.scale.set(1.5, 0.75, 0.5); m.rotation.z = s * 0.35; }
  const eyes = [-1, 1].map(s => makeEye(head, onSphere(R, S, s * 0.3, 0.03, 0.005), 0.03, 0x2A1A0A, felt(MASK)));
  for (const s of [-1, 1]) mk(new THREE.TorusGeometry(0.05, 0.007, 8, 24), GOLD, head).position.copy(onSphere(R, S, s * 0.3, 0.03, 0.04));
  mk(new THREE.SphereGeometry(0.035, 14, 10), gloss(0x3A2A1A, 0.3), head).position.copy(onSphere(R, S, 0, -0.12, 0.02));
  const mouth = bmeFace(head, R, S, { brow: '#4A3A2A', lip: '#4A2A1A', my: -0.38, mw: 0.38, by: 0.3 });
  const hat = mk(new THREE.ConeGeometry(0.15, 0.36, 24), ROBE, head); hat.position.set(0.02, 0.27, -0.02); hat.rotation.z = -0.18;
  const hs = mk(starGeoE(0.04, 0.018, 0.015), GOLD, head); hs.position.set(0.0, 0.3, 0.12);
  return registerChar(root, {
    key: 'sloth', name: 'Sloth Sage', height: 1.15, hitR: 0.55, rig: { body, head, eyes, mouth },
    dialog: ['Wel...come... I am Sloth Sage. I move slowly, but I notice everything.', 'A scientist asks a question, makes a guess, then tests it.', 'Patience is a kind of speed. It gets you there without starting over.', 'Look through the big telescope. The planets are waiting for you.', 'Earn the Star Crystal by answering my science questions.'],
    update: (t, dt, focus, ud) => { armR.rotation.z = ud.excite > 0.2 ? -1.8 + Math.sin(t * 3) * 0.2 : -0.35 + Math.sin(t * 0.6) * 0.05; head.rotation.z = Math.sin(t * 0.4) * 0.1; }
  });
}
function buildGizmo() {
  const root = grp(), body = grp(root);
  const METAL = gloss(0x2BA6B5, 0.3, 0.35), DARK = gloss(0x173A42, 0.35, 0.2), LIGHT = glow(0x2EE6E3, 2.2);
  for (const s of [-1, 1]) { mk(new RoundedBox(0.13, 0.16, 0.42, 0.05), DARK, root).position.set(s * 0.2, 0.08, 0); for (const z of [-0.14, 0, 0.14]) { const wh = mk(new THREE.CylinderGeometry(0.05, 0.05, 0.14, 16).rotateZ(Math.PI / 2), std(0x6A7A80, 0.4, 0.6), root); wh.position.set(s * 0.2, 0.07, z); } }
  mk(new RoundedBox(0.44, 0.38, 0.32, 0.08), METAL, body).position.y = 0.38;
  const chest = mk(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 20).rotateX(Math.PI / 2), glow(0xFFC83A, 2), body); chest.position.set(0, 0.42, 0.165);
  const head = grp(body); head.position.set(0, 0.74, 0);
  mk(new RoundedBox(0.38, 0.27, 0.27, 0.07), METAL, head);
  mk(new RoundedBox(0.31, 0.18, 0.02, 0.02), std(0x0B1F24, 0.2), head).position.z = 0.135;
  const eyeL = mk(new THREE.SphereGeometry(0.035, 16, 12), LIGHT, head); eyeL.position.set(-0.07, 0.015, 0.146); eyeL.scale.set(1, 1.3, 0.4);
  const eyeR = eyeL.clone(); eyeR.position.x = 0.07; head.add(eyeR);
  const sm = mk(new THREE.TorusGeometry(0.04, 0.008, 6, 16, Math.PI), LIGHT, head); sm.position.set(0, -0.035, 0.147); sm.rotation.z = Math.PI;
  mk(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 8), DARK, head).position.y = 0.21;
  const bulb = mk(new THREE.SphereGeometry(0.04, 16, 12), glow(0xFFC83A, 2.4), head); bulb.position.y = 0.3;
  const arms = [-1, 1].map(s => { const a = grp(body); a.position.set(s * 0.25, 0.48, 0); mk(new THREE.CylinderGeometry(0.03, 0.03, 0.26, 10).translate(0, -0.13, 0), DARK, a); const cl = mk(new THREE.TorusGeometry(0.045, 0.014, 6, 12, Math.PI * 1.4), METAL, a); cl.position.y = -0.28; cl.rotation.z = Math.PI * 0.8; a.rotation.z = s * 0.3; return a; });
  return registerChar(root, {
    key: 'gizmo', name: 'Gizmo the Robot', height: 1.05, hitR: 0.5, rig: { body, head, eyes: [] },
    dialog: ['Beep boop! I am Gizmo. I follow your code one step at a time.', 'Robots need exact steps. "Go over there" does not compute!', 'A loop repeats steps so you don\'t have to write them again.', 'Katie built me. She is the best engineer on Explorer Island!'],
    update: (t, dt, focus, ud) => { bulb.material.emissiveIntensity = 1.5 + Math.sin(t * 5) * 1; arms.forEach((a, i) => a.rotation.x = ud.excite > 0.2 ? -1.6 + Math.sin(t * 10 + i * 3) * 0.4 : Math.sin(t * 1.5 + i) * 0.15); head.rotation.z = Math.sin(t * 0.9) * 0.08; }
  });
}

// ═════════════════════════════════════════════════════════════════════════════
//  NEW PLACES
// ═════════════════════════════════════════════════════════════════════════════
const BME = { crystalMeshes: {}, shadow: null, portals: [] };
const atG = (par, x, z, dy = 0) => { const g = grp(par); g.position.set(x, H(x, z) + dy, z); return g; };
const facePath = (L, tx, tz) => Math.atan2(tx - L.x, tz - L.z);
function portalStone(x, z, label, icon, hint, act, color = 0x2EE6E3) {
  const g = grp(); const gy = H(x, z); g.position.set(x, gy, z);
  mk(lathe([[0.75, 0], [0.62, 0.15], [0.45, 0.25], [0.4, 0.85], [0.6, 0.95], [0.62, 1.05], [0.001, 1.06]], 28), stoneMat, g);
  const top = mk(new THREE.CylinderGeometry(0.55, 0.55, 0.06, 32), new THREE.MeshPhysicalMaterial({ color, roughness: 0.2, clearcoat: 1, emissive: color, emissiveIntensity: 0.5 }), g); top.position.y = 1.08;
  const lab = labelSprite(icon + ' ' + label, { bg: 'rgba(15,47,54,0.9)', fg: '#FFE27A' }); lab.position.y = 2.2; g.add(lab);
  const ring = mk(new THREE.TorusGeometry(0.85, 0.035, 8, 48), glow(color, 1.6), g, false); ring.rotation.x = Math.PI / 2; ring.position.y = 0.05;
  g.userData.dynamic = true; GAME_STONES.push({ pos: new THREE.Vector3(x, gy, z), game: 'bme', label, obj: g, ring, act, hint, icon });
  return g;
}
function bmeSign(L, ang, dist, lines, w = 4.2) { const x = L.x + Math.sin(ang) * dist, z = L.z + Math.cos(ang) * dist; return signBoard(x, z, ang, lines, w, 1.3, 1.5, { bg: '#0F2F36', border: '#08191D', fg: '#FFE27A' }); }
function acacia(x, z, s = 1) {
  const g = atG(scene, x, z); g.scale.setScalar(s); g.rotation.y = brr(0, TAU);
  mk(taperTube([[0, 0, 0], [0.3, 1.6, 0.1], [0.1, 3.2, -0.2], [0.6, 4.2, 0]], 0.28, 0.12, 18, 10), darkWood, g);
  mk(taperTube([[0.1, 2.8, -0.15], [-0.9, 3.6, 0.3], [-1.4, 4.1, 0.4]], 0.12, 0.07, 12, 8), darkWood, g);
  for (const [cx, cy, cz, r] of [[0.5, 4.5, 0, 2.2], [-1.3, 4.3, 0.4, 1.4], [1.8, 4.3, -0.4, 1.3]]) { const c = mk(lumpy(new THREE.SphereGeometry(r, 18, 10), 0.12, 1.5, cx), std(0x6E8B3A, 0.85), g); c.position.set(cx, cy, cz); c.scale.y = 0.32; }
  return g;
}

// ── 1. Explorers Academy (the hub) ───────────────────────────────────────────
const CRYSTALS = [
  { key: 'number', game: 'mathplus', name: 'Number Crystal', color: 0xFFC83A, icon: '🔢', where: 'academy' },
  { key: 'word', game: 'phonics', name: 'Word Crystal', color: 0xFF7A59, icon: '🦁', where: 'safari' },
  { key: 'story', game: 'reading', name: 'Story Crystal', color: 0x3A86FF, icon: '🦉', where: 'river' },
  { key: 'code', game: 'coding', name: 'Code Crystal', color: 0x2EE6E3, icon: '🤖', where: 'lab' },
  { key: 'star', game: 'science', name: 'Star Crystal', color: 0xB388FF, icon: '🔭', where: 'observatory' },
];
{
  const L = LM.academy, g = atG(scene, L.x, L.z);
  const plaza = mk(new THREE.CylinderGeometry(9.2, 9.6, 0.4, 48), stoneMat, g); plaza.position.y = 0.05;
  const inlay = mk(new THREE.RingGeometry(6.2, 6.7, 48), glow(0x2EE6E3, 0.7), g, false); inlay.rotation.x = -Math.PI / 2; inlay.position.y = 0.27;
  const WALL = std(0xF4FBFB, 0.55), TEAL = std(0x0F2F36, 0.5), CY = glow(0x2EE6E3, 1.4);
  mk(new THREE.CylinderGeometry(2.9, 3.1, 1.2, 32), stoneMat, g).position.y = 0.8;
  mk(new THREE.CylinderGeometry(2.1, 2.4, 7.5, 32), WALL, g).position.y = 5.1;
  for (const y of [2.2, 5.2, 8.2]) mk(new THREE.CylinderGeometry(2.25 - y * 0.02, 2.3 - y * 0.02, 0.3, 32), TEAL, g).position.y = y;
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; for (const y of [3.6, 6.7]) { const w = mk(new RoundedBox(0.55, 0.9, 0.12, 0.08), CY, g, false); const rr0 = 2.18 - y * 0.02; w.position.set(Math.sin(a) * rr0, y, Math.cos(a) * rr0); w.rotation.y = a; } }
  const door = mk(new RoundedBox(1.4, 2.2, 0.3, 0.3), TEAL, g); door.position.set(0, 2.3, 2.3);
  mk(new THREE.TorusGeometry(2.4, 0.18, 12, 40), GOLD, g).position.y = 8.9;
  mk(new THREE.ConeGeometry(2.7, 3.2, 32), gloss(0xFFC83A, 0.35), g).position.y = 10.6;
  const top = mk(new THREE.OctahedronGeometry(0.9, 0), new THREE.MeshPhysicalMaterial({ color: 0xBFFBFF, emissive: 0x2EE6E3, emissiveIntensity: 0.4, roughness: 0.05, transmission: 0.4, thickness: 0.5 }), g); top.position.y = 13.4; top.scale.y = 1.4; floater(top, 0.25, 1.1, 0.6);
  BME.topCrystal = top;
  addCollider(L.x, L.z, 6, 6);
  const words = text3D('EXPLORERS ACADEMY', 0.42, gloss(0xFFC83A, 0.3), 0.3); words.position.set(0, 3.9, 2.45); g.add(words);
  // Reading Crystal pedestals in an arc facing the path
  const arc = facePath(L, 18, 62);
  CRYSTALS.forEach((c, i) => {
    const a = arc + (i - 2) * 0.48, x = Math.sin(a) * 5.4, z = Math.cos(a) * 5.4;
    const p = grp(g); p.position.set(x, 0.25, z);
    mk(lathe([[0.45, 0], [0.32, 0.12], [0.24, 0.2], [0.22, 0.85], [0.36, 0.95], [0.001, 1.0]], 24), stoneMat, p);
    const mat = new THREE.MeshPhysicalMaterial({ color: 0x4A4A5A, emissive: c.color, emissiveIntensity: 0, roughness: 0.15, clearcoat: 1, transparent: true, opacity: 0.85 });
    const cr = mk(new THREE.OctahedronGeometry(0.32, 0), mat, p, false); cr.position.y = 1.5; cr.scale.y = 1.5; floater(cr, 0.12, 1.5, 0.8);
    const lab = labelSprite(c.icon + ' ' + c.name, { bg: 'rgba(15,47,54,0.88)', scale: 0.7 }); lab.position.y = 2.45; p.add(lab);
    BME.crystalMeshes[c.key] = { mesh: cr, mat, c };
  });
  // The Silence Shadow — a gloomy cloud wrapped around the tower top
  const sh = grp(g); sh.position.y = 11.5; sh.userData.dynamic = true; BME.shadow = sh;
  const smat = new THREE.MeshStandardMaterial({ color: 0x2A1F45, roughness: 1, transparent: true, opacity: 0.62, depthWrite: false });
  const puffs = []; for (let i = 0; i < 22; i++) { const a = i / 22 * TAU, r = 2.6 + (i % 3) * 0.9; const s = mk(new THREE.SphereGeometry(brr(0.8, 1.5), 14, 10), smat, sh, false, false); s.position.set(Math.cos(a) * r, brr(-1.2, 2.2), Math.sin(a) * r); puffs.push([s, a, r, brr(0, 10)]); }
  for (const s of [-1, 1]) { const e = mk(new THREE.SphereGeometry(0.18, 12, 10), glow(0xB06CFF, 1.5), sh, false); e.position.set(s * 0.5, 1.4, 3.6); puffs.push([e, null]); }
  ANIM.push((t) => { const left = CRYSTALS.filter(c => !PROG.crystals[c.key]).length; const k = left / 5; sh.visible = left > 0; sh.scale.setScalar(0.35 + k * 0.65); sh.rotation.y = t * 0.12; smat.opacity = 0.25 + k * 0.4;
    for (const p of puffs) if (p[1] != null) p[0].position.y = Math.sin(t * 0.7 + p[3]) * 0.4 + (p[3] % 2);
    top.material.emissiveIntensity = 0.4 + (5 - left) * 0.5 + Math.sin(t * 2) * 0.2; });
  bmeSign(L, arc, 9.8, ['Bright Minds Explorers Academy', 'Learn • Build • Imagine'], 5.2);
  // Activity stones and portals around the plaza
  gameStone(L.x + Math.sin(arc + 1.6) * 7.2, L.z + Math.cos(arc + 1.6) * 7.2, 'mathplus', 'Math Masters');
  portalStone(L.x + Math.sin(arc - 1.6) * 7.2, L.z + Math.cos(arc - 1.6) * 7.2, 'Choose Grade', '🎒', 'choose your grade', () => openGradePanel(), 0xFFC83A);
  const dests = [['safari', '🦁', 'Word Safari'], ['river', '🦉', 'Reading River'], ['lab', '🤖', 'STEM Lab'], ['observatory', '🔭', 'Sky Observatory']];
  dests.forEach(([k, ic, nm], i) => {
    const a = arc + Math.PI + (i - 1.5) * 0.55, px = L.x + Math.sin(a) * 7.4, pz = L.z + Math.cos(a) * 7.4, gy = H(px, pz);
    const arch = grp(); arch.position.set(px, gy, pz); arch.rotation.y = a + Math.PI;
    const ring = mk(new THREE.TorusGeometry(1.25, 0.16, 14, 40), gloss(0x0F2F36, 0.35), arch); ring.position.y = 1.55;
    const swirl = mk(new THREE.CircleGeometry(1.12, 40), new THREE.MeshBasicMaterial({ color: CRYSTALS.find(c => c.where === k).color, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false }), arch, false, false); swirl.position.y = 1.55;
    mk(new THREE.CylinderGeometry(0.5, 0.6, 0.3, 20), stoneMat, arch).position.y = 0.15;
    const lab = labelSprite(ic + ' ' + nm, { bg: 'rgba(15,47,54,0.9)', scale: 0.8 }); lab.position.y = 3.3; arch.add(lab);
    arch.userData.dynamic = true; ANIM.push((t) => { swirl.rotation.z = t * 1.5; swirl.material.opacity = 0.4 + Math.sin(t * 2 + i) * 0.15; });
    GAME_STONES.push({ pos: new THREE.Vector3(px, gy, pz), game: 'bme', label: nm, obj: arch, act: () => travelTo({ kind: 'place', key: k, name: nm, icon: ic, L: LM[k] }), hint: `jump through the portal to ${nm}`, icon: '🌀' });
  });
}

// ── 2. Leo's Word Safari ─────────────────────────────────────────────────────
{
  const L = LM.safari, g = atG(scene, L.x, L.z), arc = facePath(L, 99, 0);
  [[-7, -5, 1.1], [6, -7, 0.95], [-2, 9, 1.2], [8, 5, 0.85], [-9, 3, 0.8]].forEach(([dx, dz, s]) => acacia(L.x + dx, L.z + dz, s));
  const grassM = std(0xD9B55A, 0.9);
  for (let i = 0; i < 70; i++) { const a = brr(0, TAU), r = brr(3, 12), x = L.x + Math.cos(a) * r, z = L.z + Math.sin(a) * r; const c = mk(new THREE.ConeGeometry(brr(0.15, 0.3), brr(0.6, 1.2), 5), grassM, scene); c.position.set(x, H(x, z) + 0.3, z); c.rotation.z = brr(-0.2, 0.2); }
  for (let i = 0; i < 6; i++) { const a = brr(0, TAU), r = brr(5, 11), x = L.x + Math.cos(a) * r, z = L.z + Math.sin(a) * r; const rk = mk(lumpy(new THREE.DodecahedronGeometry(brr(0.5, 1.1), 1), 0.12, 2, i), std(0xA39074, 0.95), scene); rk.position.set(x, H(x, z) + 0.2, z); rk.scale.y = 0.6; }
  // Safari camp tent
  const tent = grp(g); tent.position.set(-3.5, 0, -3.2); tent.rotation.y = arc + 0.6;
  const tentTex = canvasTex(256, 256, (x, w, h) => { for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#F4E2B8' : '#2F7D5B'; x.fillRect(i * w / 8, 0, w / 8, h); } });
  mk(new THREE.ConeGeometry(2.4, 3.2, 8, 1, true), new THREE.MeshStandardMaterial({ map: tentTex, side: THREE.DoubleSide, roughness: 0.85 }), tent).position.y = 1.6;
  mk(new THREE.CylinderGeometry(0.06, 0.06, 3.8, 8), darkWood, tent).position.y = 1.9;
  const flag = mk(new THREE.PlaneGeometry(0.7, 0.42), new THREE.MeshStandardMaterial({ color: 0xFFC83A, side: THREE.DoubleSide }), tent, false); flag.position.set(0.37, 3.6, 0);
  addCollider(L.x - 3.5, L.z - 3.2, 4, 4);
  // Giant alphabet blocks
  const letters = 'LEOABC', COLS = ['#FF7A59', '#2EE6E3', '#FFC83A', '#8BE15B', '#B388FF', '#3A86FF'];
  const stack = grp(g); stack.position.set(3.6, 0, -4.2); stack.rotation.y = arc - 0.5;
  [[0, 0.55, 0], [1.15, 0.55, 0.1], [0.55, 1.65, 0.05], [-1.2, 0.55, 0.3], [-0.6, 1.65, 0.2], [0, 2.75, 0.1]].forEach(([x, y, z], i) => {
    const t = canvasTex(256, 256, (c, w, h) => { c.fillStyle = COLS[i]; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 18; c.strokeRect(9, 9, w - 18, h - 18); c.fillStyle = '#fff'; c.font = '180px "Fredoka One", Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(letters[i], w / 2, h / 2 + 10); });
    const b = mk(new RoundedBox(1.05, 1.05, 1.05, 0.08), new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 }), stack); b.position.set(x, y, z); b.rotation.y = brr(-0.25, 0.25);
  });
  addCollider(L.x + 3.6, L.z - 4.2, 3.6, 2);
  bmeSign(L, arc, 11, ['🦁 Leo\'s Word Safari', 'Sound it out!'], 4.4);
  placeChar(buildLeo(), L.x + Math.sin(arc) * 3, L.z + Math.cos(arc) * 3, arc);
  gameStone(L.x + Math.sin(arc + 0.9) * 6, L.z + Math.cos(arc + 0.9) * 6, 'phonics', 'Word Safari');
}

// ── 3. Reading River (on the banks of the garden stream) ─────────────────────
{
  const L = LM.river, g = atG(scene, L.x, L.z), arc = facePath(L, -93, 12.5);
  // Dock out over the stream
  const dz0 = L.z + 7, dz1 = L.z + 15.5, deckY = Math.max(H(L.x, dz0), WATER_Y) + 0.45;
  for (let z = dz0; z < dz1; z += 0.55) { const p = mk(new THREE.BoxGeometry(2.6, 0.12, 0.48), woodMat, scene); p.position.set(L.x + 3, deckY, z); }
  for (const z of [dz0 + 1, dz0 + 4, dz0 + 7.5]) for (const s of [-1, 1]) { const post = mk(new THREE.CylinderGeometry(0.12, 0.12, 2.6, 8), darkWood, scene); post.position.set(L.x + 3 + s * 1.3, deckY - 0.7, z); }
  const raft = grp(scene); raft.position.set(L.x + 6, WATER_Y + 0.05, dz1 - 1.5); raft.userData.dynamic = true;
  for (let i = 0; i < 5; i++) { const lg = mk(new THREE.CylinderGeometry(0.18, 0.18, 2.4, 10).rotateZ(Math.PI / 2), darkWood, raft); lg.position.z = (i - 2) * 0.36; }
  ANIM.push((t) => { raft.position.y = WATER_Y + 0.05 + Math.sin(t * 1.2) * 0.05; raft.rotation.y = Math.sin(t * 0.2) * 0.3; });
  // Story stump with a giant open book
  const stump = grp(g); stump.position.set(-1.5, 0, -1); stump.rotation.y = arc;
  mk(lathe([[1.5, 0], [1.25, 0.2], [1.15, 0.9], [1.2, 1.1], [0.001, 1.12]], 24), darkWood, stump);
  const pageTex = canvasTex(512, 320, (x, w, h) => { x.fillStyle = '#FFF8E8'; x.fillRect(0, 0, w, h); x.fillStyle = '#3B2A1A'; x.font = '36px "Fredoka One", Arial'; x.textAlign = 'center'; x.fillText('Once upon a time…', w / 2, 70); x.font = '22px Nunito, Arial'; for (let i = 0; i < 7; i++) { x.fillStyle = 'rgba(59,42,26,0.35)'; x.fillRect(40, 110 + i * 28, w - 80 - (i % 3) * 40, 10); } });
  for (const s of [-1, 1]) { const pg = mk(new THREE.BoxGeometry(1.1, 0.05, 1.4), [std(0xEDE0C6), std(0xEDE0C6), new THREE.MeshStandardMaterial({ map: pageTex, roughness: 0.8 }), std(0xEDE0C6), std(0xEDE0C6), std(0xEDE0C6)], stump); pg.position.set(s * 0.56, 1.22, 0); pg.rotation.z = -s * 0.12; }
  mk(new RoundedBox(2.4, 0.08, 1.55, 0.03), gloss(0x3A86FF, 0.5), stump).position.y = 1.15;
  addCollider(L.x - 1.5, L.z - 1, 2.8, 2.8);
  // Reading circle of log seats and lanterns
  for (let i = 0; i < 6; i++) { const a = arc + Math.PI + (i - 2.5) * 0.5, x = L.x - 1.5 + Math.sin(a) * 4, z = L.z - 1 + Math.cos(a) * 4; const lg = mk(new THREE.CylinderGeometry(0.35, 0.38, 1.4, 12).rotateZ(Math.PI / 2), darkWood, scene); lg.position.set(x, H(x, z) + 0.32, z); lg.rotation.y = a; }
  for (const [dx, dz] of [[4.5, -4], [-6, 3], [5, 5]]) { const x = L.x + dx, z = L.z + dz; const lp = grp(scene); lp.position.set(x, H(x, z), z); mk(new THREE.CylinderGeometry(0.06, 0.08, 2.2, 8), darkWood, lp).position.y = 1.1; const lt = mk(new THREE.SphereGeometry(0.22, 14, 10), glow(0xFFD86B, 2), lp, false); lt.position.y = 2.35; }
  for (let i = 0; i < 26; i++) { const x = L.x + brr(-9, 9), z = L.z + brr(6, 10); if (isWet(x, z) && distStream(x, z) < 2.5) continue; const rd = mk(new THREE.CylinderGeometry(0.02, 0.03, brr(0.8, 1.5), 5), std(0x5E8A3A), scene); rd.position.set(x, H(x, z) + 0.5, z); rd.rotation.z = brr(-0.2, 0.2); }
  bmeSign(L, arc, 9.5, ['🦉 Reading River', 'Stories & spelling'], 4.2);
  const post = grp(scene); { const x = L.x + Math.sin(arc + 0.8) * 3.2, z = L.z + Math.cos(arc + 0.8) * 3.2; post.position.set(x, H(x, z), z); mk(new THREE.CylinderGeometry(0.4, 0.45, 1.1, 14), darkWood, post).position.y = 0.55; }
  placeChar(buildOliver(), post.position.x, post.position.z, arc, 1.1);
  placeChar(buildToby(), L.x + Math.sin(arc - 0.9) * 3.5, L.z + Math.cos(arc - 0.9) * 3.5, arc);
  gameStone(L.x + Math.sin(arc + 1.7) * 6, L.z + Math.cos(arc + 1.7) * 6, 'reading', 'Story Time');
  gameStone(L.x + Math.sin(arc - 1.7) * 6, L.z + Math.cos(arc - 1.7) * 6, 'spelling', 'Spelling Stroll');
}

// ── 4. Explorers STEM Lab ────────────────────────────────────────────────────
{
  const L = LM.lab, g = atG(scene, L.x, L.z), arc = facePath(L, 55, -86);
  const back = arc + Math.PI, bx = Math.sin(back) * 5, bz = Math.cos(back) * 5;
  const dome = grp(g); dome.position.set(bx, 0, bz); dome.rotation.y = arc;
  mk(new THREE.CylinderGeometry(4.7, 4.9, 0.5, 40), stoneMat, dome).position.y = 0.25;
  mk(new THREE.SphereGeometry(4.4, 40, 20, 0, TAU, 0, Math.PI / 2), gloss(0xF4FBFB, 0.3), dome).position.y = 0.5;
  for (const y of [1.6, 3.0]) { const b = mk(new THREE.TorusGeometry(Math.sqrt(4.42 ** 2 - (y - 0.5) ** 2), 0.09, 8, 60), glow(0x2EE6E3, 1.6), dome, false); b.rotation.x = Math.PI / 2; b.position.y = y; }
  const dr = mk(new RoundedBox(1.8, 2.6, 1.2, 0.3), gloss(0x0F2F36, 0.3), dome); dr.position.set(0, 1.6, 4.0);
  mk(new THREE.CircleGeometry(0.5, 24), glow(0x2EE6E3, 1.2), dome, false).position.set(0, 2.2, 4.62);
  const dish = grp(dome); dish.position.set(1.8, 4.6, -0.8); mk(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8), std(0x9AA7AD, 0.4, 0.7), dish).position.y = 0.6; const bowl = mk(new THREE.SphereGeometry(0.8, 24, 10, 0, TAU, 0, Math.PI / 2.6), std(0xDDE6EA, 0.35, 0.6), dish); bowl.position.y = 1.3; bowl.rotation.x = Math.PI + 0.6; dish.userData.dynamic = true;
  ANIM.push((t) => { dish.rotation.y = Math.sin(t * 0.3) * 1.2; });
  addCollider(L.x + bx, L.z + bz, 8.6, 8.6);
  // Circuit-board plaza
  const circ = canvasTex(512, 512, (x, w, h) => { x.fillStyle = '#123E47'; x.fillRect(0, 0, w, h); x.strokeStyle = '#2EE6E3'; x.lineWidth = 5; x.lineCap = 'round'; for (let i = 0; i < 40; i++) { let px = (i * 137) % w, py = (i * 71) % h; x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 4; k++) { if (k % 2) py += (i % 2 ? 1 : -1) * 40; else px += (i % 3 - 1) * 50 + 30; x.lineTo(px, py); } x.stroke(); x.fillStyle = '#FFC83A'; x.beginPath(); x.arc(px, py, 7, 0, TAU); x.fill(); } });
  const pad = mk(new THREE.CylinderGeometry(4.2, 4.3, 0.22, 40), [std(0x0F2F36), new THREE.MeshStandardMaterial({ map: circ, emissive: 0xffffff, emissiveMap: circ, emissiveIntensity: 0.35, roughness: 0.5 }), std(0x0F2F36)], g); pad.position.set(Math.sin(arc) * 1.5, 0.1, Math.cos(arc) * 1.5);
  // Floating holographic gears
  for (const [dx, dy, dz, r] of [[-3.4, 3.2, 1.2, 0.8], [3.6, 2.6, 0.6, 0.6], [0.4, 4.2, 2.6, 0.5]]) { const gear = grp(g); gear.position.set(dx, dy, dz); const ring = mk(new THREE.TorusGeometry(r, r * 0.22, 8, 24), new THREE.MeshStandardMaterial({ color: 0x2EE6E3, emissive: 0x2EE6E3, emissiveIntensity: 1.2, transparent: true, opacity: 0.75 }), gear, false); for (let k = 0; k < 8; k++) { const tth = mk(new THREE.BoxGeometry(r * 0.3, r * 0.3, r * 0.3), ring.material, gear, false); const a = k / 8 * TAU; tth.position.set(Math.cos(a) * r * 1.2, Math.sin(a) * r * 1.2, 0); tth.rotation.z = a; } floater(gear, 0.2, 1, (dx > 0 ? 1 : -1) * 0.8); }
  // Solar panels
  for (const s of [-1, 1]) { const sp = grp(g); const a = arc + s * 1.3; sp.position.set(Math.sin(a) * 8, 0, Math.cos(a) * 8); sp.rotation.y = a; mk(new THREE.CylinderGeometry(0.08, 0.08, 1.4, 8), std(0x9AA7AD, 0.4, 0.7), sp).position.y = 0.7; const pn = mk(new THREE.BoxGeometry(2.2, 0.06, 1.3), new THREE.MeshPhysicalMaterial({ color: 0x1A3A8A, roughness: 0.15, metalness: 0.5, clearcoat: 1 }), sp); pn.position.y = 1.5; pn.rotation.x = -0.5; }
  bmeSign(L, arc, 10, ['🤖 Explorers STEM Lab', 'Code • Build • Test'], 4.4);
  const K = placeChar(buildKatie(), L.x + Math.sin(arc + 0.7) * 2.6, L.z + Math.cos(arc + 0.7) * 2.6, arc); K.userData.baseY = K.position.y;
  placeChar(buildGizmo(), L.x + Math.sin(arc - 0.6) * 2.2, L.z + Math.cos(arc - 0.6) * 2.2, arc);
  gameStone(L.x + Math.sin(arc + 1.7) * 6, L.z + Math.cos(arc + 1.7) * 6, 'coding', 'Code Gizmo');
  gameStone(L.x + Math.sin(arc - 1.7) * 6, L.z + Math.cos(arc - 1.7) * 6, 'logic', 'Logic Lab');
}

// ── 5. Sky Observatory ───────────────────────────────────────────────────────
{
  const L = LM.observatory, g = atG(scene, L.x, L.z), arc = facePath(L, -55, -86);
  const back = arc + Math.PI, ox = Math.sin(back) * 5, oz = Math.cos(back) * 5;
  const obs = grp(g); obs.position.set(ox, 0, oz); obs.rotation.y = arc;
  mk(new THREE.CylinderGeometry(3, 3.2, 4.2, 36), stoneMat, obs).position.y = 2.1;
  mk(new THREE.CylinderGeometry(3.15, 3.15, 0.25, 36), std(0x6A3FB5, 0.5), obs).position.y = 4.2;
  const domeG = grp(obs); domeG.position.y = 4.3; domeG.userData.dynamic = true;
  mk(new THREE.SphereGeometry(3, 36, 18, 0, TAU, 0, Math.PI / 2), gloss(0xB9C4D6, 0.25, 0.6), domeG);
  mk(new THREE.BoxGeometry(0.9, 3.1, 3.05), std(0x14102A, 0.6), domeG).position.set(0, 1.2, 1.2);
  const scope = mk(new THREE.CylinderGeometry(0.35, 0.45, 4.2, 20), gloss(0xFFC83A, 0.3, 0.5), domeG); scope.position.set(0, 2.2, 1.6); scope.rotation.x = 0.85;
  ANIM.push((t) => { domeG.rotation.y = Math.sin(t * 0.08) * 0.6; });
  const dr = mk(new RoundedBox(1.4, 2.3, 0.4, 0.25), gloss(0x2A1F45, 0.3), obs); dr.position.set(0, 1.15, 3.05);
  addCollider(L.x + ox, L.z + oz, 6.4, 6.4);
  // Orrery: the Sun and planets turning on a pedestal
  const orr = grp(g); orr.position.set(Math.sin(arc) * 1.2 + Math.sin(arc + 1.57) * 3.6, 0, Math.cos(arc) * 1.2 + Math.cos(arc + 1.57) * 3.6); orr.userData.dynamic = true;
  mk(lathe([[0.7, 0], [0.5, 0.2], [0.3, 0.3], [0.25, 1.0], [0.6, 1.1], [0.001, 1.12]], 24), stoneMat, orr);
  const sunB = mk(new THREE.SphereGeometry(0.42, 24, 16), glow(0xFFB703, 2.2), orr, false); sunB.position.y = 2;
  const PL = [[0.8, 0.09, 0xB0A090, 2.2], [1.15, 0.14, 0xE8C27A, 1.6], [1.5, 0.15, 0x3A86FF, 1.2], [1.85, 0.12, 0xE2553A, 0.9], [2.4, 0.3, 0xD9A066, 0.5], [3.0, 0.25, 0xEAD49A, 0.38]];
  const planets = PL.map(([r, s, c, sp], i) => { const p = mk(new THREE.SphereGeometry(s, 18, 12), gloss(c, 0.4), orr, false); if (i === 5) { const ring = mk(new THREE.TorusGeometry(s * 1.6, s * 0.15, 6, 30), std(0xEAD49A, 0.5), p, false); ring.rotation.x = 1.2; } const o = mk(new THREE.TorusGeometry(r, 0.008, 4, 64), std(0xFFFFFF, 0.5), orr, false); o.rotation.x = Math.PI / 2; o.position.y = 2; return [p, r, sp, i]; });
  ANIM.push((t) => { for (const [p, r, sp, i] of planets) { const a = t * sp * 0.4 + i * 1.7; p.position.set(Math.cos(a) * r, 2, Math.sin(a) * r); } });
  localSparkles(g, 40, 9, 0.12, 0xE6DCFF);
  const log = mk(new THREE.CylinderGeometry(0.38, 0.42, 2.2, 12).rotateZ(Math.PI / 2), darkWood, g); const lx = Math.sin(arc - 0.8) * 3, lz = Math.cos(arc - 0.8) * 3; log.position.set(lx, 0.35, lz); log.rotation.y = arc + Math.PI / 2;
  bmeSign(L, arc, 10, ['🔭 Sky Observatory', 'Science & the stars'], 4.4);
  placeChar(buildSloth(), L.x + lx, L.z + lz, arc, 0.5);
  gameStone(L.x + Math.sin(arc + 1.6) * 6.4, L.z + Math.cos(arc + 1.6) * 6.4, 'science', 'Science Quest');
  gameStone(L.x + Math.sin(arc - 1.7) * 6.4, L.z + Math.cos(arc - 1.7) * 6.4, 'space', 'Star Gazer');
}

// ═════════════════════════════════════════════════════════════════════════════
//  GRADE, CRYSTALS & THE GROWN-UPS VIEW
// ═════════════════════════════════════════════════════════════════════════════
function refreshCrystals() {
  for (const k in BME.crystalMeshes) { const { mat, c } = BME.crystalMeshes[k]; const on = !!PROG.crystals[k]; mat.color.setHex(on ? c.color : 0x4A4A5A); mat.emissiveIntensity = on ? 1.4 : 0; }
  const n = CRYSTALS.filter(c => PROG.crystals[c.key]).length, el = document.getElementById('hud-crystals'); if (el) el.textContent = `💎 ${n}/5`;
  const gb = document.getElementById('hud-grade'); if (gb) gb.textContent = `🎒 ${PROG.grade == null ? 'Grade?' : GRADES[grade()] === 'K' ? 'Grade K' : 'Grade ' + GRADES[grade()]}`;
  const ar = document.getElementById('g-autoread'); if (ar && PROG.grade != null) ar.checked = grade() <= 1;
}
function setGrade(g) { PROG.grade = g; saveProgress(); refreshCrystals(); document.querySelectorAll('[data-grade]').forEach(b => b.classList.toggle('on', Number(b.dataset.grade) === g)); }
window.setGrade = setGrade;
function openGradePanel() { SFX.unlock(); document.querySelectorAll('[data-grade]').forEach(b => b.classList.toggle('on', Number(b.dataset.grade) === PROG.grade)); document.getElementById('grade-panel').style.display = 'flex'; }
window.openGradePanel = openGradePanel;
window.closeGradePanel = () => { document.getElementById('grade-panel').style.display = 'none'; if (PROG.grade == null) setGrade(1); showToast(`🎒 ${gradeName(grade())} — every game is set to your level!`); };
function BME_onFinish(k, stars) {
  const st = PROG.stats[k] || (PROG.stats[k] = { rounds: 0, q: 0, first: 0 }); st.rounds++; st.q += GAME.total; st.first += stars; st.last = Date.now(); st.grade = grade();
  const c = CRYSTALS.find(c => c.game === k);
  if (c && stars >= 3 && !PROG.crystals[c.key]) {
    PROG.crystals[c.key] = Date.now(); const n = CRYSTALS.filter(c => PROG.crystals[c.key]).length;
    setTimeout(() => { refreshCrystals(); SFX.win(); showToast(n >= 5 ? '💎 All five Reading Crystals! The Silence Shadow is gone!' : `💎 You earned the ${c.name}! ${n}/5 — the Silence Shadow is shrinking.`); const m = BME.crystalMeshes[c.key]?.mesh; if (m) { const p = m.getWorldPosition(new THREE.Vector3()); for (let i = 0; i < 5; i++) setTimeout(() => burst(p, c.color, 50), i * 200); } if (n >= 5) setTimeout(openCertificate, 2200); }, 900);
  }
}
window.openCertificate = function openCertificate() { const d = new Date(); document.getElementById('cert-grade').textContent = gradeName(grade()); document.getElementById('cert-date').textContent = d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }); document.getElementById('cert-panel').style.display = 'flex'; };
window.closeCertificate = () => { document.getElementById('cert-panel').style.display = 'none'; };
const SUBJECT_ORDER = ['mathplus', 'addition', 'subtraction', 'fractions', 'arrays', 'counting', 'skip', 'phonics', 'spelling', 'reading', 'coding', 'logic', 'science', 'space'];
window.openParents = () => {
  SFX.unlock(); const tb = document.getElementById('p-rows'); tb.innerHTML = '';
  let weakest = null;
  for (const k of SUBJECT_ORDER) { const G = GAMES[k]; if (!G) continue; const s = PROG.stats[k], sv = PROG.games[k];
    const tr = document.createElement('tr'); const acc = s && s.q ? Math.round(s.first / s.q * 100) : null;
    if (acc != null && s.rounds >= 1 && (!weakest || acc < weakest.acc)) weakest = { k, acc };
    const cells = [`${G.icon} ${G.title}`, G.subject || 'Math', s ? String(s.rounds) : '—', acc == null ? '—' : acc + '%', sv ? (G.graded ? 'Grade ' + GRADES[s?.grade ?? grade()] : LVL[sv.level || 0]) : '—'];
    cells.forEach((v, i) => { const td = document.createElement('td'); td.textContent = v; if (i === 3 && acc != null) td.className = acc >= 80 ? 'good' : acc >= 60 ? 'ok' : 'low'; tr.appendChild(td); }); tb.appendChild(tr); }
  const n = CRYSTALS.filter(c => PROG.crystals[c.key]).length;
  document.getElementById('p-summary').textContent = `${gradeName(grade())} · 💎 ${n}/5 Reading Crystals · ⭐ ${totalStars()} stars · ⏱ ${Math.round(PROG.seconds / 60)} minutes of play`;
  document.getElementById('p-next').textContent = weakest ? `Suggested next: ${GAMES[weakest.k].title} (${weakest.acc}% first-try). A few more rounds there will help most.` : 'Play any game to start seeing progress here.';
  document.querySelectorAll('[data-grade]').forEach(b => b.classList.toggle('on', Number(b.dataset.grade) === PROG.grade));
  document.getElementById('parents-panel').style.display = 'flex';
};
window.closeParents = () => { document.getElementById('parents-panel').style.display = 'none'; };
window.resetProgress = (btn) => {
  if (!btn.dataset.armed) { btn.dataset.armed = '1'; btn.textContent = 'Tap again to erase all progress'; setTimeout(() => { delete btn.dataset.armed; btn.textContent = '↺ Reset progress on this device'; }, 3500); return; }
  for (const k of Object.keys(PROG)) if (k !== 'grade') delete PROG[k]; PROG.games = {}; PROG.eights = []; PROG.crystals = {}; PROG.stats = {}; PROG.seconds = 0; saveProgress(); refreshCrystals(); window.openParents(); showToast('Progress reset.');
};
setInterval(() => { if (started && document.visibilityState === 'visible') { PROG.seconds += 15; try { localStorage.setItem('nng-progress-v1', JSON.stringify(PROG)); } catch (e) {} } }, 15000);
refreshCrystals();
document.getElementById('start-btn')?.addEventListener('click', () => setTimeout(() => { if (PROG.grade == null) openGradePanel(); else showToast('🏫 Visit the Explorers Academy to the east of the gate. Earn 5 Reading Crystals to chase away the Silence Shadow!'); }, 2500));
