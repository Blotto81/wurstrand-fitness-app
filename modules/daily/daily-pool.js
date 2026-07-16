const DAILY_POOL = [
{
  id: "nutrition-001",
  category: "Ernährung",
  difficulty: 2,
  title: "🌱 Heute vegetarisch",
  text: "Schaffst du es heute, komplett vegetarisch zu essen?",
  why: "Ein vegetarischer Tag bringt oft mehr Abwechslung auf den Teller, als man denkt.",
  alternative: "",
  image: null
},

{
  id: "nutrition-002",
  category: "Ernährung",
  difficulty: 2,
  title: "💧 Wasser gewinnt",
  text: "Schaffst du es heute, alle Getränke durch Wasser zu ersetzen und mindestens 2 Liter zu trinken?",
  why: "Ausreichend Wasser unterstützt deinen Körper den ganzen Tag.",
  alternative: "Falls du aus gesundheitlichen Gründen weniger trinken solltest, halte dich an deine persönliche Empfehlung.",
  image: null
},

{
  id: "movement-001",
  category: "Bewegung",
  difficulty: 1,
  title: "🪜 Treppenmeister",
  text: "Schaffst du es heute, jede Treppe zu nehmen und auf Aufzüge oder Rolltreppen zu verzichten?",
  why: "Viele kleine Bewegungen summieren sich über den Tag.",
  alternative: "Falls dir heute keine Treppe begegnet, gehe bewusst einen kleinen Umweg von mindestens 500 Metern.",
  image: null
},

{
  id: "movement-002",
  category: "Bewegung",
  difficulty: 1,
  title: "🚶 Neue Wege",
  text: "Schaffst du es heute, einen Weg zu gehen, den du normalerweise nie nimmst?",
  why: "Oft entdeckt man direkt vor der eigenen Haustür etwas Neues.",
  alternative: "Falls du heute kaum unterwegs bist, drehe bewusst eine kleine Runde um den Block.",
  image: null
},

{
  id: "social-001",
  category: "Soziales",
  difficulty: 1,
  title: "😊 Ehrlich gemeint",
  text: "Schaffst du es heute, jemandem ein ehrliches Kompliment zu machen, das nichts mit dem Aussehen zu tun hat?",
  why: "Charaktereigenschaften hört jeder gerne – aber viel zu selten.",
  alternative: "",
  image: null
},

{
  id: "social-002",
  category: "Soziales",
  difficulty: 1,
  title: "🙏 Danke!",
  text: "Schaffst du es heute, dich bei jemandem für etwas zu bedanken, das du sonst als selbstverständlich ansiehst?",
  why: "Dankbarkeit überrascht oft beide Seiten.",
  alternative: "",
  image: null
},

{
  id: "social-003",
  category: "Soziales",
  difficulty: 2,
  title: "📞 Lange nicht gehört",
  text: "Schaffst du es heute, dich bei jemandem zu melden, mit dem du schon lange keinen Kontakt mehr hattest?",
  why: "Manchmal reicht eine einzige Nachricht, um den Kontakt wieder aufleben zu lassen.",
  alternative: "Falls dir niemand einfällt, schreibe jemandem einfach eine nette Nachricht.",
  image: null
},

{
  id: "fun-001",
  category: "Spaß",
  difficulty: 1,
  title: "🎵 Zeitmaschine",
  text: "Schaffst du es heute, das Lied anzuhören, das dich sofort an deine Schulzeit erinnert?",
  why: "Musik kann Erinnerungen blitzschnell zurückbringen.",
  alternative: "",
  image: null
},

{
  id: "fun-002",
  category: "Spaß",
  difficulty: 1,
  title: "🍽️ Abenteuer",
  text: "Schaffst du es heute, etwas zu essen oder zu trinken, das du noch nie probiert hast?",
  why: "Vielleicht entdeckst du heute einen neuen Favoriten.",
  alternative: "",
  image: null
},

{
  id: "mind-001",
  category: "Achtsamkeit",
  difficulty: 1,
  title: "🌿 Durchatmen",
  text: "Schaffst du es heute, dir fünf Minuten Zeit zu nehmen und einfach bewusst nichts zu tun?",
  why: "Auch kurze Pausen können überraschend gut tun.",
  alternative: "",
  image: null
},

{
  id: "home-001",
  category: "Alltag",
  difficulty: 1,
  title: "🧹 Endlich weg",
  text: "Schaffst du es heute, genau eine Sache zu entsorgen oder zu verschenken, die du seit Monaten nicht mehr benutzt hast?",
  why: "Loslassen schafft Platz – oft nicht nur im Schrank.",
  alternative: "",
  image: null
},

{
  id: "home-002",
  category: "Alltag",
  difficulty: 1,
  title: "📦 Die Eine",
  text: "Schaffst du es heute, genau eine Schublade, Ablage oder Kiste komplett aufzuräumen?",
  why: "Ein kleiner Bereich reicht oft aus, um ein gutes Gefühl zu bekommen.",
  alternative: "",
  image: null
},

{
  id: "courage-001",
  category: "Mut",
  difficulty: 2,
  title: "🙋 Trau dich",
  text: "Schaffst du es heute, eine Frage zu stellen, die du dich bisher nicht getraut hast?",
  why: "Oft kostet Nachfragen weniger Mut, als wir denken.",
  alternative: "Falls sich keine Gelegenheit ergibt, frage jemanden nach seiner Meinung zu einem Thema.",
  image: null
},
{
  id: "fun-003",
  category: "Spaß",
  difficulty: 1,
  title: "🛒 Überraschung",
  text: "Schaffst du es heute, beim Einkaufen ein Produkt mitzunehmen, das du normalerweise nie kaufen würdest?",
  why: "Neue Dinge auszuprobieren macht den Alltag spannender.",
  alternative: "Falls du heute nicht einkaufen gehst, probiere stattdessen zuhause etwas aus, das du schon lange nicht mehr genutzt hast.",
  image: null
},

{
  id: "social-004",
  category: "Soziales",
  difficulty: 1,
  title: "😁 Vortritt",
  text: "Schaffst du es heute, jemanden bewusst vorzulassen – egal ob an der Kasse, im Straßenverkehr oder irgendwo anders?",
  why: "Kleine Gesten fallen oft mehr auf als große.",
  alternative: "",
  image: null
},

{
  id: "food-003",
  category: "Ernährung",
  difficulty: 1,
  title: "🌈 Bunter Teller",
  text: "Schaffst du es heute, mindestens fünf verschiedene Farben auf deinem Teller zu haben?",
  why: "Buntes Essen ist oft abwechslungsreicher als man denkt.",
  alternative: "",
  image: null
},

{
  id: "movement-003",
  category: "Bewegung",
  difficulty: 1,
  title: "🚗 Extra weit",
  text: "Schaffst du es heute, bewusst etwas weiter entfernt zu parken oder auszusteigen und den Rest zu laufen?",
  why: "Ein paar zusätzliche Meter merkt man kaum – sie summieren sich aber.",
  alternative: "Falls du heute kein Auto oder öffentliche Verkehrsmittel nutzt, gehe stattdessen bewusst einen kleinen Umweg.",
  image: null
},

{
  id: "fun-004",
  category: "Spaß",
  difficulty: 1,
  title: "📖 Kindheit",
  text: "Schaffst du es heute, etwas zu tun, das du als Kind richtig gern gemacht hast?",
  why: "Manche schönen Dinge verlieren wir einfach aus Gewohnheit.",
  alternative: "",
  image: null
},

{
  id: "knowledge-001",
  category: "Wissen",
  difficulty: 1,
  title: "🧠 Heute schlauer",
  text: "Schaffst du es heute, eine Frage zu beantworten, auf die du die Antwort bisher nicht kanntest?",
  why: "Jeden Tag etwas Neues zu lernen hält neugierig.",
  alternative: "",
  image: null
},

{
  id: "social-005",
  category: "Soziales",
  difficulty: 1,
  title: "👂 Zuhören",
  text: "Schaffst du es heute, jemanden ausreden zu lassen, auch wenn dir die Antwort schon klar erscheint?",
  why: "Echtes Zuhören ist seltener geworden als man denkt.",
  alternative: "",
  image: null
},

{
  id: "environment-001",
  category: "Umwelt",
  difficulty: 1,
  title: "♻️ Zweites Leben",
  text: "Schaffst du es heute, etwas zu reparieren oder weiterzuverwenden, statt es wegzuwerfen?",
  why: "Nicht alles muss sofort ersetzt werden.",
  alternative: "",
  image: null
},

{
  id: "mind-002",
  category: "Achtsamkeit",
  difficulty: 1,
  title: "☕ Genussmoment",
  text: "Schaffst du es heute, ein Getränk ganz bewusst und ohne Ablenkung zu genießen?",
  why: "Manchmal reicht schon ein Moment, um kurz herunterzufahren.",
  alternative: "",
  image: null
},

{
  id: "fun-005",
  category: "Spaß",
  difficulty: 2,
  title: "📷 Perspektivwechsel",
  text: "Schaffst du es heute, ein Foto aus einer ungewöhnlichen Perspektive aufzunehmen?",
  why: "Ein anderer Blickwinkel verändert oft mehr als nur das Bild.",
  alternative: "",
  image: null
},

{
  id: "home-003",
  category: "Alltag",
  difficulty: 1,
  title: "🧺 Fünf Dinge",
  text: "Schaffst du es heute, fünf Dinge an ihren richtigen Platz zurückzubringen?",
  why: "Oft reichen schon wenige Handgriffe für mehr Ordnung.",
  alternative: "",
  image: null
},

{
  id: "courage-002",
  category: "Mut",
  difficulty: 2,
  title: "🎯 Einfach fragen",
  text: "Schaffst du es heute, nach etwas zu fragen, obwohl du mit einem 'Nein' rechnest?",
  why: "Ein Nein kennst du schon – vielleicht überrascht dich heute ein Ja.",
  alternative: "",
  image: null
},
{
  id: "fun-006",
  category: "Spaß",
  difficulty: 1,
  title: "🎲 Zufall entscheidet",
  text: "Schaffst du es heute, bei einer kleinen Entscheidung bewusst den Zufall entscheiden zu lassen?",
  why: "Manchmal entdeckt man dadurch Dinge, die man sonst nie gewählt hätte.",
  alternative: "",
  image: null
},

{
  id: "alltag-004",
  category: "Alltag",
  difficulty: 1,
  title: "🚪 Die Zwei-Minuten-Regel",
  text: "Schaffst du es heute, alles sofort zu erledigen, was weniger als zwei Minuten dauert?",
  why: "Kleine Aufgaben sammeln sich oft schneller an als große.",
  alternative: "",
  image: null
},

{
  id: "spaß-007",
  category: "Spaß",
  difficulty: 1,
  title: "🎨 Lieblingsfarbe",
  text: "Schaffst du es heute, bewusst etwas in deiner Lieblingsfarbe zu tragen oder mitzunehmen?",
  why: "Kleine Details können die Stimmung überraschend beeinflussen.",
  alternative: "",
  image: null
},

{
  id: "soziales-006",
  category: "Soziales",
  difficulty: 1,
  title: "🙋 Name merken",
  text: "Schaffst du es heute, den Namen eines Menschen zu verwenden, den du sonst nur flüchtig grüßt?",
  why: "Menschen hören ihren eigenen Namen besonders gerne.",
  alternative: "",
  image: null
},

{
  id: "wissen-002",
  category: "Wissen",
  difficulty: 1,
  title: "🌍 Wo liegt das eigentlich?",
  text: "Schaffst du es heute, ein Land auf der Karte zu suchen, in dem du noch nie warst?",
  why: "Vielleicht landet genau dieses Land irgendwann auf deiner Reiseliste.",
  alternative: "",
  image: null
},

{
  id: "ernährung-004",
  category: "Ernährung",
  difficulty: 1,
  title: "🥢 Langsam genießen",
  text: "Schaffst du es heute, eine komplette Mahlzeit ohne Hektik zu essen?",
  why: "Bewusstes Essen fühlt sich oft ganz anders an.",
  alternative: "",
  image: null
},

{
  id: "bewegung-004",
  category: "Bewegung",
  difficulty: 1,
  title: "🚶‍♂️ Frische Luft",
  text: "Schaffst du es heute, mindestens zehn Minuten draußen zu verbringen – ganz egal bei welchem Wetter?",
  why: "Frische Luft tut fast immer gut.",
  alternative: "Falls du das Haus heute nicht verlassen kannst, verbringe zehn Minuten am offenen Fenster oder auf dem Balkon.",
  image: null
},

{
  id: "spaß-008",
  category: "Spaß",
  difficulty: 2,
  title: "🎬 Filmzitat",
  text: "Schaffst du es heute, ein berühmtes Film- oder Serienzitat in einem Gespräch unterzubringen?",
  why: "Vielleicht erkennt es ja jemand.",
  alternative: "",
  image: null
},

{
  id: "mut-003",
  category: "Mut",
  difficulty: 2,
  title: "👍 Einfach Ja",
  text: "Schaffst du es heute, zu etwas 'Ja' zu sagen, was du normalerweise ablehnen würdest?",
  why: "Neue Erfahrungen beginnen oft mit einem einfachen Ja.",
  alternative: "Natürlich nur, wenn du dich dabei wohlfühlst.",
  image: null
},

{
  id: "soziales-007",
  category: "Soziales",
  difficulty: 1,
  title: "💬 Frag mal nach",
  text: "Schaffst du es heute, jemandem eine Frage zu stellen, die über 'Wie geht's?' hinausgeht?",
  why: "Die besten Gespräche beginnen oft mit einer guten Frage.",
  alternative: "",
  image: null
},

{
  id: "alltag-005",
  category: "Alltag",
  difficulty: 1,
  title: "📦 Schubladenfund",
  text: "Schaffst du es heute, einen Gegenstand wiederzuentdecken, den du längst vergessen hattest?",
  why: "Fast jeder besitzt kleine Schätze, die irgendwo verschwunden sind.",
  alternative: "",
  image: null
},

{
  id: "spaß-009",
  category: "Spaß",
  difficulty: 1,
  title: "🌅 Sonnenmoment",
  text: "Schaffst du es heute, bewusst den Sonnenauf- oder Sonnenuntergang zu beobachten?",
  why: "Diese Momente gehen im Alltag oft unter.",
  alternative: "Ist die Sonne nicht zu sehen, beobachte stattdessen fünf Minuten den Himmel.",
  image: null
},

{
  id: "umwelt-002",
  category: "Umwelt",
  difficulty: 1,
  title: "💡 Strom sparen",
  text: "Schaffst du es heute, bewusst überall das Licht auszuschalten, wenn du einen Raum verlässt?",
  why: "Viele kleine Gewohnheiten ergeben zusammen einen Unterschied.",
  alternative: "",
  image: null
},

{
  id: "ernährung-005",
  category: "Ernährung",
  difficulty: 2,
  title: "🍴 Selber machen",
  text: "Schaffst du es heute, mindestens eine Mahlzeit selbst zuzubereiten?",
  why: "Selbstgemacht schmeckt oft besser als gedacht.",
  alternative: "",
  image: null
},

{
  id: "spaß-010",
  category: "Spaß",
  difficulty: 1,
  title: "😄 Gute-Laune-Song",
  text: "Schaffst du es heute, dein absolutes Gute-Laune-Lied laut mitzusingen?",
  why: "Singen hebt nachweislich bei vielen Menschen die Stimmung.",
  alternative: "Wenn dir laut zu peinlich ist, reicht auch leises Mitsummen.",
  image: null
},
{
  id: "day-046",
  category: "Ernährung",
  difficulty: 2,
  title: "🍭 Zuckerpause",
  text: "Schaffst du es heute, komplett auf Süßigkeiten zu verzichten?",
  why: "Gar nicht so leicht – aber ein spannender Selbsttest.",
  alternative: "Falls heute ein besonderer Anlass ansteht, verzichte stattdessen bewusst auf Chips oder Knabbereien.",
  image: null
},

{
  id: "day-047",
  category: "Alltag",
  difficulty: 1,
  title: "📬 Erledigt ist erledigt",
  text: "Schaffst du es heute, eine Aufgabe zu erledigen, die du schon seit mindestens einer Woche vor dir herschiebst?",
  why: "Oft dauert das Erledigen kürzer als das Aufschieben.",
  alternative: "",
  image: null
},

{
  id: "day-048",
  category: "Spaß",
  difficulty: 1,
  title: "🎲 Lass den Zufall wählen",
  text: "Schaffst du es heute, bei einer kleinen Entscheidung den Zufall bestimmen zu lassen?",
  why: "Manchmal entstehen genau dadurch die schönsten Momente.",
  alternative: "",
  image: null
},

{
  id: "day-049",
  category: "Soziales",
  difficulty: 1,
  title: "🙂 Grüß zuerst",
  text: "Schaffst du es heute, jede Person zuerst zu grüßen?",
  why: "Eine kleine Geste mit oft großer Wirkung.",
  alternative: "",
  image: null
},

{
  id: "day-050",
  category: "Bewegung",
  difficulty: 1,
  title: "🚪 Keinen direkten Weg",
  text: "Schaffst du es heute, jeden Weg im Gebäude bewusst etwas länger zu machen?",
  why: "Viele kleine Extrameter fallen kaum auf.",
  alternative: "Falls du heute hauptsächlich zuhause bist, geh einmal bewusst eine kleine Extrarunde durchs Viertel.",
  image: null
},

{
  id: "day-051",
  category: "Mut",
  difficulty: 2,
  title: "🙋 Frag einfach",
  text: "Schaffst du es heute, etwas zu fragen, obwohl du die Antwort vielleicht schon kennst?",
  why: "Oft entstehen genau daraus interessante Gespräche.",
  alternative: "",
  image: null
},

{
  id: "day-052",
  category: "Ernährung",
  difficulty: 1,
  title: "🥛 Durstlöscher",
  text: "Schaffst du es heute, vor jeder Mahlzeit ein Glas Wasser zu trinken?",
  why: "Eine kleine Gewohnheit mit großer Wirkung.",
  alternative: "",
  image: null
},

{
  id: "day-053",
  category: "Spaß",
  difficulty: 1,
  title: "📺 Klassiker",
  text: "Schaffst du es heute, einen Film oder eine Serie zu schauen, die du seit Jahren wieder sehen wolltest?",
  why: "Manche Klassiker sind besser, als man sie in Erinnerung hat.",
  alternative: "Falls keine Zeit bleibt, schau dir wenigstens eine Lieblingsszene an.",
  image: null
},

{
  id: "day-054",
  category: "Achtsamkeit",
  difficulty: 1,
  title: "🌬️ Tief durchatmen",
  text: "Schaffst du es heute, dreimal bewusst tief durchzuatmen, bevor du auf Stress reagierst?",
  why: "Ein kurzer Moment kann viel verändern.",
  alternative: "",
  image: null
},

{
  id: "day-055",
  category: "Umwelt",
  difficulty: 1,
  title: "👜 Stoff statt Plastik",
  text: "Schaffst du es heute, wenn möglich auf eine Plastiktüte zu verzichten?",
  why: "Kleine Entscheidungen machen auf Dauer einen Unterschied.",
  alternative: "",
  image: null
},

{
  id: "day-056",
  category: "Alltag",
  difficulty: 1,
  title: "📱 Freie Hände",
  text: "Schaffst du es heute, beim Gehen nicht aufs Handy zu schauen?",
  why: "Du nimmst deine Umgebung plötzlich ganz anders wahr.",
  alternative: "",
  image: null
},

{
  id: "day-057",
  category: "Spaß",
  difficulty: 1,
  title: "📸 Ein Lieblingsmoment",
  text: "Schaffst du es heute, ein Foto von etwas zu machen, das deinen Tag schöner gemacht hat?",
  why: "Man übersieht die schönen Momente oft viel zu schnell.",
  alternative: "",
  image: null
},

{
  id: "day-058",
  category: "Soziales",
  difficulty: 1,
  title: "👏 Lob weitergeben",
  text: "Schaffst du es heute, jemanden für etwas zu loben, das oft selbstverständlich wirkt?",
  why: "Anerkennung motiviert – auch bei kleinen Dingen.",
  alternative: "",
  image: null
},

{
  id: "day-059",
  category: "Mut",
  difficulty: 2,
  title: "🎯 Einfach machen",
  text: "Schaffst du es heute, etwas sofort zu erledigen, statt es auf morgen zu verschieben?",
  why: "Manchmal braucht es nur die ersten zehn Sekunden.",
  alternative: "",
  image: null
},

{
  id: "day-060",
  category: "Spaß",
  difficulty: 1,
  title: "🍨 Gönn dir was",
  text: "Schaffst du es heute, dir ganz bewusst etwas zu gönnen – ohne schlechtes Gewissen?",
  why: "Auch kleine Belohnungen gehören zu einem guten Tag.",
  alternative: "",
  image: null
},
{
  id: "day-061",
  category: "Alltag",
  difficulty: 1,
  title: "🚪 Leise bitte",
  text: "Schaffst du es heute, jede Tür bewusst leise zu schließen?",
  why: "Kleine Gewohnheiten fallen oft erst auf, wenn man bewusst darauf achtet.",
  alternative: "",
  image: null
},

{
  id: "day-062",
  category: "Ernährung",
  difficulty: 2,
  title: "🍽️ Nachschlag? Nein.",
  text: "Schaffst du es heute, auf einen Nachschlag zu verzichten?",
  why: "Man merkt oft erst danach, dass man eigentlich schon satt war.",
  alternative: "",
  image: null
},

{
  id: "day-063",
  category: "Spaß",
  difficulty: 1,
  title: "😀 Lieblingswitz",
  text: "Schaffst du es heute, jemandem deinen Lieblingswitz zu erzählen?",
  why: "Vielleicht lacht ihr beide darüber.",
  alternative: "",
  image: null
},

{
  id: "day-064",
  category: "Soziales",
  difficulty: 1,
  title: "👏 Aufmerksamkeit",
  text: "Schaffst du es heute, jemandem ehrlich zuzuhören, ohne ihn zu unterbrechen?",
  why: "Zuhören ist oft wertvoller als Antworten.",
  alternative: "",
  image: null
},

{
  id: "day-065",
  category: "Mut",
  difficulty: 2,
  title: "🙋 Frag nach",
  text: "Schaffst du es heute, eine Frage zu stellen, die du dich bisher nicht getraut hast?",
  why: "Manchmal beginnt etwas Gutes mit einer einzigen Frage.",
  alternative: "",
  image: null
},

{
  id: "day-066",
  category: "Alltag",
  difficulty: 1,
  title: "📬 Sofort erledigt",
  text: "Schaffst du es heute, eine kleine Aufgabe sofort zu erledigen, statt sie aufzuschieben?",
  why: "Aus kleinen Aufgaben entstehen oft große To-do-Listen.",
  alternative: "",
  image: null
},

{
  id: "day-067",
  category: "Spaß",
  difficulty: 1,
  title: "🎲 Kopf oder Zahl",
  text: "Schaffst du es heute, eine kleine Entscheidung per Münzwurf zu treffen?",
  why: "Der Zufall führt manchmal zu überraschend guten Entscheidungen.",
  alternative: "Falls du keine Münze hast, nutze einen Zufallsgenerator.",
  image: null
},

{
  id: "day-068",
  category: "Bewegung",
  difficulty: 1,
  title: "🚶 Extrarunde",
  text: "Schaffst du es heute, freiwillig einen kleinen Umweg zu gehen?",
  why: "Ein paar zusätzliche Schritte verändern oft den Kopf mehr als den Körper.",
  alternative: "",
  image: null
},

{
  id: "day-069",
  category: "Ernährung",
  difficulty: 1,
  title: "🥕 Farbe auf dem Teller",
  text: "Schaffst du es heute, etwas Grünes zu essen?",
  why: "Eine kleine Ergänzung reicht völlig aus.",
  alternative: "",
  image: null
},

{
  id: "day-070",
  category: "Achtsamkeit",
  difficulty: 1,
  title: "🌬️ Zehn Atemzüge",
  text: "Schaffst du es heute, zehn bewusste Atemzüge zu nehmen?",
  why: "Eine Minute reicht oft schon aus, um kurz runterzukommen.",
  alternative: "",
  image: null
},

{
  id: "day-071",
  category: "Spaß",
  difficulty: 1,
  title: "📖 Zufallsseite",
  text: "Schaffst du es heute, eine beliebige Buchseite aufzuschlagen und einen Absatz zu lesen?",
  why: "Manchmal findet man genau das, was man gerade braucht.",
  alternative: "Falls du kein Buch hast, nimm eine Zeitschrift oder Zeitung.",
  image: null
},

{
  id: "day-072",
  category: "Soziales",
  difficulty: 1,
  title: "🙂 Guten Tag",
  text: "Schaffst du es heute, drei Menschen zuerst zu grüßen?",
  why: "Ein freundlicher Anfang verändert oft die Stimmung.",
  alternative: "",
  image: null
},

{
  id: "day-073",
  category: "Mut",
  difficulty: 2,
  title: "👍 Probier's",
  text: "Schaffst du es heute, etwas auszuprobieren, das du normalerweise ablehnen würdest?",
  why: "Neue Erfahrungen beginnen oft mit einem kleinen Schritt.",
  alternative: "",
  image: null
},

{
  id: "day-074",
  category: "Alltag",
  difficulty: 1,
  title: "🧼 Blitzblank",
  text: "Schaffst du es heute, einen Gegenstand gründlich zu reinigen, den du oft benutzt?",
  why: "Kleine Dinge machen den Alltag angenehmer.",
  alternative: "",
  image: null
},

{
  id: "day-075",
  category: "Spaß",
  difficulty: 1,
  title: "⭐ Glückstreffer",
  text: "Schaffst du es heute, etwas zu tun, das dir einfach gute Laune macht?",
  why: "Nicht jeder gute Tag braucht einen besonderen Anlass.",
  alternative: "",
  image: null
},
{
  id: "day-076",
  category: "Alltag",
  difficulty: 1,
  title: "🛏️ Gemacht ist gemacht",
  text: "Schaffst du es heute, direkt nach dem Aufstehen dein Bett zu machen?",
  why: "Ein kleiner Start kann den ganzen Tag beeinflussen.",
  alternative: "",
  image: null
},

{
  id: "day-077",
  category: "Ernährung",
  difficulty: 2,
  title: "🚫 Süße Pause",
  text: "Schaffst du es heute, komplett auf Softdrinks zu verzichten?",
  why: "Oft greift man ganz automatisch zur süßen Alternative.",
  alternative: "",
  image: null
},

{
  id: "day-078",
  category: "Spaß",
  difficulty: 1,
  title: "🎁 Überrasch dich",
  text: "Schaffst du es heute, dir selbst eine kleine Freude zu machen, mit der du nicht gerechnet hast?",
  why: "Warum sollten Überraschungen immer nur von anderen kommen?",
  alternative: "",
  image: null
},

{
  id: "day-079",
  category: "Soziales",
  difficulty: 1,
  title: "🤝 Hilf mit",
  text: "Schaffst du es heute, jemandem ungefragt deine Hilfe anzubieten?",
  why: "Manchmal reicht schon eine kleine Unterstützung.",
  alternative: "",
  image: null
},

{
  id: "day-080",
  category: "Mut",
  difficulty: 2,
  title: "🎯 Ehrliche Meinung",
  text: "Schaffst du es heute, deine Meinung ehrlich, aber freundlich auszusprechen?",
  why: "Mut zeigt sich oft in kleinen Momenten.",
  alternative: "",
  image: null
},

{
  id: "day-081",
  category: "Alltag",
  difficulty: 1,
  title: "🧺 Eine Ladung weniger",
  text: "Schaffst du es heute, eine kleine Hausarbeit zu erledigen, ohne sie aufzuschieben?",
  why: "Später danken dir dein Zukunfts-Ich und dein Zuhause.",
  alternative: "",
  image: null
},

{
  id: "day-082",
  category: "Bewegung",
  difficulty: 1,
  title: "🚪 Jeder Weg zählt",
  text: "Schaffst du es heute, jeden unnötigen Fahrstuhl konsequent zu meiden?",
  why: "Aus vielen kleinen Entscheidungen entstehen Gewohnheiten.",
  alternative: "Falls dir heute kein Fahrstuhl begegnet, geh bewusst einen kleinen Umweg.",
  image: null
},

{
  id: "day-083",
  category: "Ernährung",
  difficulty: 1,
  title: "🍎 Natürlich",
  text: "Schaffst du es heute, statt eines Snacks ein Stück Obst oder Gemüse zu essen?",
  why: "Manchmal reicht schon ein kleiner Tausch.",
  alternative: "",
  image: null
},

{
  id: "day-084",
  category: "Spaß",
  difficulty: 1,
  title: "🎲 Neue Wahl",
  text: "Schaffst du es heute, in einem Restaurant oder Café etwas zu bestellen, das du noch nie hattest?",
  why: "Neue Lieblingsgerichte findet man nur durch Ausprobieren.",
  alternative: "Falls du heute nicht essen gehst, probiere zuhause etwas Neues aus.",
  image: null
},

{
  id: "day-085",
  category: "Soziales",
  difficulty: 1,
  title: "😊 Mehr Lächeln",
  text: "Schaffst du es heute, jedem Menschen, den du begrüßt, bewusst ein Lächeln zu schenken?",
  why: "Ein Lächeln kostet nichts und bleibt oft hängen.",
  alternative: "",
  image: null
},

{
  id: "day-086",
  category: "Achtsamkeit",
  difficulty: 1,
  title: "⌚ Eine Minute",
  text: "Schaffst du es heute, eine Minute lang einfach nur still zu sitzen und nichts zu tun?",
  why: "Gar nicht so leicht, wie es klingt.",
  alternative: "",
  image: null
},

{
  id: "day-087",
  category: "Spaß",
  difficulty: 1,
  title: "🎵 Ohrwurm",
  text: "Schaffst du es heute, den ersten Song zu hören, der dir spontan einfällt?",
  why: "Der erste Gedanke ist oft der beste.",
  alternative: "",
  image: null
},

{
  id: "day-088",
  category: "Alltag",
  difficulty: 1,
  title: "📦 Fünf Dinge",
  text: "Schaffst du es heute, fünf Dinge wegzuräumen, die gerade nicht an ihren Platz gehören?",
  why: "Kleine Ordnung macht oft überraschend zufrieden.",
  alternative: "",
  image: null
},

{
  id: "day-089",
  category: "Mut",
  difficulty: 2,
  title: "🙌 Einfach anfangen",
  text: "Schaffst du es heute, etwas zu beginnen, das du schon länger vor dir herschiebst?",
  why: "Der Anfang ist oft der schwerste Teil.",
  alternative: "",
  image: null
},

{
  id: "day-090",
  category: "Spaß",
  difficulty: 1,
  title: "🍀 Glücksmoment",
  text: "Schaffst du es heute, bewusst einen Moment festzuhalten, in dem du dich glücklich fühlst?",
  why: "Schöne Momente vergehen schnell – festhalten lohnt sich.",
  alternative: "",
  image: null
},
{
  id: "day-091",
  category: "Ernährung",
  difficulty: 2,
  title: "🧂 Ohne Nachwürzen",
  text: "Schaffst du es heute, keine Mahlzeit nachzusalzen?",
  why: "Probier erst den ursprünglichen Geschmack aus – vielleicht überrascht er dich.",
  alternative: "",
  image: null
},

{
  id: "day-092",
  category: "Alltag",
  difficulty: 1,
  title: "📬 Gleich erledigt",
  text: "Schaffst du es heute, auf jede kleine Aufgabe sofort zu reagieren, statt sie aufzuschieben?",
  why: "Viele To-do-Listen entstehen aus Kleinigkeiten.",
  alternative: "",
  image: null
},

{
  id: "day-093",
  category: "Spaß",
  difficulty: 1,
  title: "🎲 Heute entscheidet jemand anderes",
  text: "Schaffst du es heute, eine kleine Entscheidung bewusst jemand anderem zu überlassen?",
  why: "Kontrolle abzugeben kann überraschend angenehm sein.",
  alternative: "",
  image: null
},

{
  id: "day-094",
  category: "Soziales",
  difficulty: 1,
  title: "💬 Frag nach",
  text: "Schaffst du es heute, jemanden nach seinem schönsten Erlebnis der letzten Woche zu fragen?",
  why: "Schöne Gespräche beginnen oft mit einer guten Frage.",
  alternative: "",
  image: null
},

{
  id: "day-095",
  category: "Mut",
  difficulty: 2,
  title: "🙌 Sag's",
  text: "Schaffst du es heute, jemandem ehrlich zu sagen, dass du seine Hilfe oder Unterstützung schätzt?",
  why: "Wertschätzung hört jeder gern – ausgesprochen wird sie viel zu selten.",
  alternative: "",
  image: null
},

{
  id: "day-096",
  category: "Bewegung",
  difficulty: 1,
  title: "🚶 Eine Station früher",
  text: "Schaffst du es heute, eine Station früher auszusteigen oder dein Auto etwas weiter entfernt zu parken?",
  why: "Ein kleiner Umweg bringt oft mehr Bewegung als gedacht.",
  alternative: "Falls das heute nicht passt, geh stattdessen bewusst einen kleinen Umweg.",
  image: null
},

{
  id: "day-097",
  category: "Ernährung",
  difficulty: 1,
  title: "🍎 Erst das Gesunde",
  text: "Schaffst du es heute, vor jeder Hauptmahlzeit zuerst etwas Obst oder Gemüse zu essen?",
  why: "Eine kleine Reihenfolge kann einen großen Unterschied machen.",
  alternative: "",
  image: null
},

{
  id: "day-098",
  category: "Spaß",
  difficulty: 1,
  title: "🎵 Wunschkonzert",
  text: "Schaffst du es heute, jemandem dein absolutes Lieblingslied zu zeigen?",
  why: "Musik verrät oft mehr über uns als viele Worte.",
  alternative: "",
  image: null
},

{
  id: "day-099",
  category: "Alltag",
  difficulty: 1,
  title: "🪥 Andere Hand",
  text: "Schaffst du es heute, dir die Zähne mit der anderen Hand als sonst zu putzen?",
  why: "Eine ungewohnte Bewegung fordert dein Gehirn heraus und macht aus einer Routine etwas Neues.",
  alternative: "",
  image: "toothbrush-other-hand.png"
},

{
  id: "day-100",
  category: "Spaß",
  difficulty: 1,
  title: "📷 Perspektivwechsel",
  text: "Schaffst du es heute, drei Fotos aus einer Perspektive aufzunehmen, die du normalerweise nie wählen würdest?",
  why: "Manchmal verändert ein anderer Blickwinkel alles.",
  alternative: "",
  image: null
},

{
  id: "day-101",
  category: "Alltag",
  difficulty: 1,
  title: "📦 Zehn Minuten",
  text: "Schaffst du es heute, genau zehn Minuten lang aufzuräumen und danach bewusst aufzuhören?",
  why: "Oft schafft man in zehn Minuten mehr, als man denkt.",
  alternative: "",
  image: null
},

{
  id: "day-102",
  category: "Soziales",
  difficulty: 1,
  title: "😊 Erst lächeln",
  text: "Schaffst du es heute, bei jeder Begrüßung zuerst zu lächeln?",
  why: "Ein Lächeln verändert oft den ersten Eindruck.",
  alternative: "",
 image: null
},

{
  id: "day-103",
  category: "Achtsamkeit",
  difficulty: 1,
  title: "🌬️ Durchatmen",
  text: "Schaffst du es heute, vor jeder Mahlzeit einmal bewusst tief durchzuatmen?",
  why: "Eine kleine Pause hilft dabei, den Moment bewusster wahrzunehmen.",
  alternative: "",
  image: null
},

{
  id: "day-104",
  category: "Mut",
  difficulty: 2,
  title: "🎯 Einfach anfangen",
  text: "Schaffst du es heute, eine Aufgabe mindestens fünf Minuten zu beginnen, die du schon länger vor dir herschiebst?",
  why: "Der schwerste Teil ist oft nur der Anfang.",
  alternative: "",
  image: null
},

{
  id: "day-105",
  category: "Spaß",
  difficulty: 1,
  title: "🎁 Kleine Belohnung",
  text: "Schaffst du es heute, dir nach einer erledigten Aufgabe ganz bewusst eine kleine Belohnung zu gönnen?",
  why: "Auch kleine Erfolge dürfen gefeiert werden.",
  alternative: "",
  image: null
},
{
  id: "day-106",
  category: "Ernährung",
  difficulty: 1,
  title: "🥄 Langsam",
  text: "Schaffst du es heute, deine erste Mahlzeit doppelt so langsam zu essen wie sonst?",
  why: "Wer langsamer isst, nimmt sein Essen oft bewusster wahr.",
  alternative: "",
  image: null
},

{
  id: "day-107",
  category: "Spaß",
  difficulty: 1,
  title: "🎲 Gerade oder ungerade",
  text: "Schaffst du es heute, eine kleine Entscheidung mit einer geraden oder ungeraden Zahl zu treffen?",
  why: "Der Zufall bringt manchmal die besseren Ideen.",
  alternative: "Eine Münze funktioniert natürlich auch.",
  image: null
},

{
  id: "day-108",
  category: "Alltag",
  difficulty: 1,
  title: "🧥 Taschenkontrolle",
  text: "Schaffst du es heute, deine Jacken-, Hosen- oder Handtasche komplett auszuräumen und nur das Nötigste wieder einzupacken?",
  why: "Erstaunlich, was sich mit der Zeit alles ansammelt.",
  alternative: "",
  image: null
},

{
  id: "day-109",
  category: "Soziales",
  difficulty: 1,
  title: "👏 Namen merken",
  text: "Schaffst du es heute, mindestens drei Menschen bewusst mit ihrem Namen anzusprechen?",
  why: "Den eigenen Namen zu hören fühlt sich für viele Menschen wertschätzend an.",
  alternative: "",
  image: null
},

{
  id: "day-110",
  category: "Mut",
  difficulty: 2,
  title: "🤔 Warum eigentlich?",
  text: "Schaffst du es heute, einmal freundlich nach dem 'Warum' zu fragen, statt etwas einfach hinzunehmen?",
  why: "Neugier eröffnet oft neue Perspektiven.",
  alternative: "",
  image: null
},

{
  id: "day-111",
  category: "Spaß",
  difficulty: 1,
  title: "📖 Erste Seite",
  text: "Schaffst du es heute, die erste Seite eines Buches zu lesen, das schon lange bei dir herumliegt?",
  why: "Vielleicht beginnt heute deine nächste Lieblingsgeschichte.",
  alternative: "",
  image: null
},

{
  id: "day-112",
  category: "Ernährung",
  difficulty: 2,
  title: "🥤 Selber gemacht",
  text: "Schaffst du es heute, ein Getränk selbst zuzubereiten statt fertig zu kaufen?",
  why: "Oft schmeckt Selbstgemachtes besser als gedacht.",
  alternative: "",
  image: null
},

{
  id: "day-113",
  category: "Alltag",
  difficulty: 1,
  title: "🗑️ Fünf Teile",
  text: "Schaffst du es heute, fünf Dinge auszusortieren, die du wirklich nicht mehr brauchst?",
  why: "Kleine Schritte schaffen Platz.",
  alternative: "",
  image: null
},

{
  id: "day-114",
  category: "Achtsamkeit",
  difficulty: 1,
  title: "👂 Geräusche",
  text: "Schaffst du es heute, eine Minute lang nur auf die Geräusche um dich herum zu achten?",
  why: "Man nimmt viel mehr wahr, wenn man bewusst zuhört.",
  alternative: "",
  image: null
},

{
  id: "day-115",
  category: "Bewegung",
  difficulty: 1,
  title: "🚪 Immer aufstehen",
  text: "Schaffst du es heute, jedes Mal aufzustehen, wenn du telefonierst?",
  why: "Eine kleine Gewohnheit sorgt ganz nebenbei für mehr Bewegung.",
  alternative: "Gilt auch für Videotelefonate.",
  image: null
},

{
  id: "day-116",
  category: "Soziales",
  difficulty: 1,
  title: "🎉 Glückwunsch",
  text: "Schaffst du es heute, jemandem ehrlich zu einem Erfolg zu gratulieren?",
  why: "Mitfreude verbindet Menschen.",
  alternative: "",
  image: null
},

{
  id: "day-117",
  category: "Spaß",
  difficulty: 1,
  title: "🪞 Spiegelgrinsen",
  text: "Schaffst du es heute, dir beim Vorbeigehen an einem Spiegel bewusst zuzulächeln?",
  why: "Es fühlt sich erst komisch an – und dann oft erstaunlich gut.",
  alternative: "",
  image: null
},

{
  id: "day-118",
  category: "Ernährung",
  difficulty: 2,
  title: "🍴 Kein Nachschlag",
  text: "Schaffst du es heute, nach jeder Mahlzeit zehn Minuten zu warten, bevor du über einen Nachschlag nachdenkst?",
  why: "Das Sättigungsgefühl braucht manchmal etwas Zeit.",
  alternative: "",
  image: null
},

{
  id: "day-119",
  category: "Alltag",
  difficulty: 1,
  title: "📥 Postfach",
  text: "Schaffst du es heute, dein E-Mail- oder Nachrichtenpostfach um mindestens zehn Nachrichten zu erleichtern?",
  why: "Digitale Ordnung fühlt sich oft genauso gut an wie echte Ordnung.",
  alternative: "",
  image: null
},

{
  id: "day-120",
  category: "Spaß",
  difficulty: 1,
  title: "🎯 Heute anders",
  text: "Schaffst du es heute, bewusst eine Kleinigkeit anders zu machen als sonst?",
  why: "Routine ist praktisch – Abwechslung macht das Leben spannend.",
  alternative: "",
  image: null
},
{
  id: "day-121",
  category: "Balance",
  difficulty: 1,
  title: "⚖️ Sicherer Stand",
  text: "Schaffst du es heute, auf jedem Bein 30 Sekunden zu stehen?",
  why: "Balance lässt sich einfach trainieren und hilft im Alltag.",
  alternative: "Halte dich leicht an einer Wand fest.",
  image: "balance-one-leg.png"
},

{
  id: "day-122",
  category: "Balance",
  difficulty: 2,
  title: "🪥 Balance am Waschbecken",
  text: "Schaffst du es heute, dir die Zähne auf einem Bein zu putzen?",
  why: "Eine Alltagsroutine wird plötzlich zu einem kleinen Balance-Training.",
  alternative: "Wechsle nach der Hälfte das Bein oder halte dich leicht fest.",
  image: "balance-toothbrush.png"
},

{
  id: "day-123",
  category: "Sport",
  difficulty: 1,
  title: "🙆 Beweglich bleiben",
  text: "Schaffst du es heute, deinen ganzen Körper fünf Minuten lang zu dehnen?",
  why: "Beweglichkeit kommt im Alltag oft zu kurz.",
  alternative: "",
  image: "stretching-basic.png"
},

{
  id: "day-124",
  category: "Sport",
  difficulty: 1,
  title: "🦴 Schulter frei",
  text: "Schaffst du es heute, deine Schultern zehnmal langsam vorwärts und rückwärts zu kreisen?",
  why: "Gerade nach langem Sitzen tut Bewegung gut.",
  alternative: "",
  image: null
},

{
  id: "day-125",
  category: "Balance",
  difficulty: 2,
  title: "👣 Fersenlauf",
  text: "Schaffst du es heute, zehn Meter nur auf den Fersen und zehn Meter nur auf den Zehenspitzen zu gehen?",
  why: "Eine gute Übung für Balance und Fußmuskulatur.",
  alternative: "Gehe einfach so weit, wie es sich sicher anfühlt.",
  image: "heel-toe-walk.png"
},

{
  id: "day-126",
  category: "Sport",
  difficulty: 1,
  title: "💺 Sitzhaltung",
  text: "Schaffst du es heute, dich immer wieder bewusst gerade hinzusetzen?",
  why: "Eine gute Haltung entlastet Rücken und Nacken.",
  alternative: "",
  image: null
},

{
  id: "day-127",
  category: "Sport",
  difficulty: 2,
  title: "🤸 Mobil bleiben",
  text: "Schaffst du es heute, dreimal aufzustehen, ohne deine Hände zu benutzen?",
  why: "Koordination und Beweglichkeit sind mindestens genauso wichtig wie Kraft.",
  alternative: "Nutze nur leicht die Fingerspitzen, wenn nötig.",
  image: "stand-up.png"
},

{
  id: "day-128",
  category: "Balance",
  difficulty: 1,
  title: "🎯 Gerade Linie",
  text: "Schaffst du es heute, zehn Schritte auf einer gedachten Linie Fuß vor Fuß zu gehen?",
  why: "Eine einfache Übung für Balance und Konzentration.",
  alternative: "",
  image: "line-walk.png"
},

{
  id: "day-129",
  category: "Sport",
  difficulty: 1,
  title: "🙌 Arme hoch",
  text: "Schaffst du es heute, dich dreimal richtig lang zu strecken, als wolltest du die Decke berühren?",
  why: "Kurzes Strecken lockert den ganzen Körper.",
  alternative: "",
  image: null
},

{
  id: "day-130",
  category: "Balance",
  difficulty: 2,
  title: "🧍 Augen zu",
  text: "Schaffst du es heute, zehn Sekunden auf einem Bein mit geschlossenen Augen zu stehen?",
  why: "Ohne Sehen arbeitet dein Gleichgewicht besonders intensiv.",
  alternative: "Mach die Übung neben einer Wand oder einem Tisch.",
  image: "balance-eyes-closed.png"
},

{
  id: "day-131",
  category: "Sport",
  difficulty: 1,
  title: "🪑 Nicht plumpsen",
  text: "Schaffst du es heute, dich jedes Mal langsam auf einen Stuhl zu setzen?",
  why: "Kontrollierte Bewegungen trainieren deine Muskulatur ganz nebenbei.",
  alternative: "",
  image: null
},

{
  id: "day-132",
  category: "Sport",
  difficulty: 1,
  title: "🤲 Handgelenke",
  text: "Schaffst du es heute, deine Handgelenke jeweils zehnmal in beide Richtungen zu kreisen?",
  why: "Gerade bei Bildschirmarbeit tut das oft gut.",
  alternative: "",
  image: null
},

{
  id: "day-133",
  category: "Balance",
  difficulty: 2,
  title: "🎈 Einbein-Challenge",
  text: "Schaffst du es heute, insgesamt zwei Minuten auf einem Bein zu stehen? Wie du sie aufteilst, entscheidest du.",
  why: "Viele kleine Versuche führen oft schneller zum Ziel.",
  alternative: "",
  image: "balance-total.png"
},

{
  id: "day-134",
  category: "Sport",
  difficulty: 1,
  title: "🫁 Tief Luft holen",
  text: "Schaffst du es heute, fünfmal ganz bewusst tief ein- und auszuatmen und dabei die Schultern locker zu lassen?",
  why: "Bewusstes Atmen hilft vielen Menschen, kurz herunterzufahren.",
  alternative: "",
  image: null
},

{
  id: "day-135",
  category: "Balance",
  difficulty: 1,
  title: "🔄 Seitenwechsel",
  text: "Schaffst du es heute, beim Zähneputzen nach der Hälfte bewusst das Standbein zu wechseln?",
  why: "So trainierst du beide Seiten gleichmäßig.",
  alternative: "Falls dir das zu schwer ist, wechsle einfach die Hand.",
  image: "balance-switch.png"
},
{
  id:"day-136",
  category:"Gesundheit",
  difficulty:1,
  title:"🦷 Zahnseide",
  text:"Schaffst du es heute, deine Zähne zusätzlich mit Zahnseide oder Interdentalbürsten zu reinigen?",
  why:"Die Zahnzwischenräume werden beim normalen Putzen oft vergessen.",
  alternative:"",
  image:null
},

{
  id:"day-137",
  category:"Gesundheit",
  difficulty:1,
  title:"😴 Schlaf vorbereiten",
  text:"Schaffst du es heute, dein Schlafzimmer vor dem Schlafengehen einmal gut zu lüften?",
  why:"Frische Luft sorgt oft für ein angenehmeres Schlafklima.",
  alternative:"",
  image:null
},

{
  id:"day-138",
  category:"Kreativität",
  difficulty:1,
  title:"✏️ Kritzelmeister",
  text:"Schaffst du es heute, zwei Minuten lang einfach drauflos zu kritzeln?",
  why:"Kreativität braucht keine Perfektion.",
  alternative:"",
  image:null
},

{
  id:"day-139",
  category:"Wissen",
  difficulty:1,
  title:"🌍 Hauptstadt",
  text:"Schaffst du es heute, die Hauptstadt eines Landes herauszufinden, das du bisher nicht kanntest?",
  why:"Ein kleines Stück Allgemeinwissen pro Tag summiert sich.",
  alternative:"",
  image:null
},

{
  id:"day-140",
  category:"Balance",
  difficulty:2,
  title:"🪙 Münzbalance",
  text:"Schaffst du es heute, eine Münze für 30 Sekunden auf deinem Handrücken zu balancieren?",
  why:"Koordination lässt sich auf viele Arten trainieren.",
  alternative:"",
  image:null
},

{
  id:"day-141",
  category:"Spaß",
  difficulty:1,
  title:"😀 Spitzname",
  text:"Schaffst du es heute, jemandem einen lustigen, aber netten Spitznamen zu geben?",
  why:"Gemeinsam lachen verbindet.",
  alternative:"",
  image:null
},

{
  id:"day-142",
  category:"Alltag",
  difficulty:1,
  title:"🔑 Schlüsselcheck",
  text:"Schaffst du es heute, deinen Schlüsselbund einmal auszumisten?",
  why:"Fast jeder trägt Dinge mit sich herum, die längst überflüssig sind.",
  alternative:"",
  image:null
},

{
  id:"day-143",
  category:"Umwelt",
  difficulty:1,
  title:"🚰 Leitungswasser",
  text:"Schaffst du es heute, wenn möglich Leitungswasser statt Flaschenwasser zu trinken?",
  why:"Das spart Verpackung und Schlepperei.",
  alternative:"",
  image:null
},

{
  id:"day-144",
  category:"Mut",
  difficulty:2,
  title:"🤝 Um Hilfe bitten",
  text:"Schaffst du es heute, jemanden um Hilfe zu bitten, wenn du sie gebrauchen kannst?",
  why:"Mut bedeutet manchmal auch, Unterstützung anzunehmen.",
  alternative:"",
  image:null
},

{
  id:"day-145",
  category:"Kreativität",
  difficulty:1,
  title:"🎨 Drei Farben",
  text:"Schaffst du es heute, etwas mit genau drei Farben zu gestalten?",
  why:"Kreativität beginnt oft mit kleinen Ideen.",
  alternative:"",
  image:null
},

{
  id:"day-146",
  category:"Wissen",
  difficulty:1,
  title:"📖 Neues Wort",
  text:"Schaffst du es heute, ein neues deutsches Wort zu lernen und zu benutzen?",
  why:"Unser Wortschatz wächst nur, wenn wir ihn benutzen.",
  alternative:"",
  image:null
},

{
  id:"day-147",
  category:"Gesundheit",
  difficulty:1,
  title:"💺 Haltung",
  text:"Schaffst du es heute, jedes Mal beim Hinsetzen kurz auf deine Haltung zu achten?",
  why:"Eine gute Haltung entlastet Rücken und Nacken.",
  alternative:"",
  image:null
},

{
  id:"day-148",
  category:"Spaß",
  difficulty:1,
  title:"🎲 Würfelglück",
  text:"Schaffst du es heute, irgendein kleines Spiel zu spielen?",
  why:"Spielen macht nicht nur Kindern Spaß.",
  alternative:"",
  image:null
},

{
  id:"day-149",
  category:"Soziales",
  difficulty:1,
  title:"👋 Wiedersehen",
  text:"Schaffst du es heute, dich von jedem Menschen bewusst zu verabschieden?",
  why:"Ein freundlicher Abschied bleibt oft in Erinnerung.",
  alternative:"",
 image:null
},

{
  id:"day-150",
  category:"Bewegung",
  difficulty:1,
  title:"🧍Nicht anlehnen",
  text:"Schaffst du es heute, wenn möglich im Stehen nicht an Wänden oder Möbeln zu lehnen?",
  why:"Deine Haltung arbeitet dabei ganz automatisch mit.",
  alternative:"",
  image:null
},
{
  id:"day-151",
  category:"Gesundheit",
  difficulty:1,
  title:"🪥 Zahnputz-Upgrade",
  text:"Schaffst du es heute, deine Zähne mindestens drei Minuten lang gründlich zu putzen?",
  why:"Gründlichkeit schlägt Geschwindigkeit.",
  alternative:"",
  image:null
},

{
  id:"day-152",
  category:"Spaß",
  difficulty:1,
  title:"🍴 Überraschung",
  text:"Schaffst du es heute, mit dem Besteck in der ungewohnten Hand zu essen?",
  why:"Kleine Veränderungen bringen dein Gehirn aus dem Autopilot.",
  alternative:"",
  image:null
},

{
  id:"day-153",
  category:"Balance",
  difficulty:2,
  title:"👣 Fersen an Zehen",
  text:"Schaffst du es heute, zehn Schritte Fuß vor Fuß auf einer geraden Linie zu gehen?",
  why:"Eine einfache Übung für Gleichgewicht und Konzentration.",
  alternative:"",
  image:"line-walk.png"
},

{
  id:"day-154",
  category:"Ernährung",
  difficulty:1,
  title:"🥗 Extra Portion",
  text:"Schaffst du es heute, zu jeder Hauptmahlzeit etwas Obst oder Gemüse zu ergänzen?",
  why:"Kleine Änderungen sind oft leichter als große Vorsätze.",
  alternative:"",
  image:null
},

{
  id:"day-155",
  category:"Soziales",
  difficulty:1,
  title:"😊 Nett gedacht",
  text:"Schaffst du es heute, drei Menschen ehrlich etwas Nettes zu sagen?",
  why:"Freundliche Worte kosten nichts und bleiben oft lange im Kopf.",
  alternative:"",
  image:null
},

{
  id:"day-156",
  category:"Alltag",
  difficulty:1,
  title:"🗑️ Eine Ecke",
  text:"Schaffst du es heute, genau eine kleine Ecke aufzuräumen, die dich schon länger stört?",
  why:"Schon fünf Minuten können sichtbar etwas verändern.",
  alternative:"",
  image:null
},

{
  id:"day-157",
  category:"Mut",
  difficulty:2,
  title:"💬 Sag's einfach",
  text:"Schaffst du es heute, etwas ehrlich auszusprechen, das du bisher zurückgehalten hast?",
  why:"Ehrlichkeit braucht manchmal etwas Mut.",
  alternative:"",
  image:null
},

{
  id:"day-158",
  category:"Spaß",
  difficulty:1,
  title:"🎧 Zufallsplaylist",
  text:"Schaffst du es heute, fünf Lieder im Zufallsmodus zu hören, ohne eines zu überspringen?",
  why:"Vielleicht entdeckst du einen alten Lieblingssong neu.",
  alternative:"",
  image:null
},

{
  id:"day-159",
  category:"Gesundheit",
  difficulty:1,
  title:"🥛 Erst Wasser",
  text:"Schaffst du es heute, vor jedem Kaffee oder Softdrink zuerst ein Glas Wasser zu trinken?",
  why:"Eine kleine Gewohnheit mit großer Wirkung.",
  alternative:"",
  image:null
},

{
  id:"day-160",
  category:"Bewegung",
  difficulty:1,
  title:"🚪 Immer aufstehen",
  text:"Schaffst du es heute, bei jedem Telefonat aufzustehen?",
  why:"So kommt ganz nebenbei etwas mehr Bewegung in den Tag.",
  alternative:"",
  image:null
},

{
  id:"day-161",
  category:"Balance",
  difficulty:2,
  title:"🧍 Stillstand",
  text:"Schaffst du es heute, insgesamt zwei Minuten auf einem Bein zu stehen? Wie du die Zeit aufteilst, entscheidest du.",
  why:"Viele kleine Versuche führen oft schneller zum Ziel.",
  alternative:"",
  image:"balance-total.png"
},

{
  id:"day-162",
  category:"Spaß",
  difficulty:1,
  title:"🎲 Neue Routine",
  text:"Schaffst du es heute, eine alltägliche Kleinigkeit bewusst anders zu machen als sonst?",
  why:"Abwechslung beginnt oft im Kleinen.",
  alternative:"",
  image:null
},

{
  id:"day-163",
  category:"Wissen",
  difficulty:1,
  title:"🌍 Ein neues Land",
  text:"Schaffst du es heute, etwas Interessantes über ein Land herauszufinden, in dem du noch nie warst?",
  why:"Neugierig zu bleiben lohnt sich.",
  alternative:"",
  image:null
},

{
  id:"day-164",
  category:"Kreativität",
  difficulty:1,
  title:"✏️ 60 Sekunden",
  text:"Schaffst du es heute, eine Minute lang ohne abzusetzen zu zeichnen oder zu kritzeln?",
  why:"Es geht nicht ums Ergebnis, sondern ums Ausprobieren.",
  alternative:"",
  image:null
},

{
  id:"day-165",
  category:"Alltag",
  difficulty:1,
  title:"📦 Das letzte Teil",
  text:"Schaffst du es heute, genau einen Gegenstand zu reparieren, wegzuräumen oder endgültig auszusortieren?",
  why:"Manchmal reicht eine einzige erledigte Sache für ein gutes Gefühl.",
  alternative:"",
  image:null
},
];