import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const b = await req.json();

    for (const k of ["name","birthDate","partnerName","partnerBirthDate","relationshipType","topic","email"]) {
      if (!b[k]) return NextResponse.json({ error: "Užpildyk visus privalomus laukus." }, { status: 400 });
    }

    if (process.env.TARO_DEMO_MODE !== "true") {
      return NextResponse.json(
        { error: "Analizė dar neatrakinta. Reikalingas patvirtintas Shopify apmokėjimas." },
        { status: 402 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "AI raktas dar neprijungtas serveryje." }, { status: 503 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `
Tu rengi ZYZY Studio išsamią individualią poros santykių TARO analizę lietuvių kalba.

Klientė/klientas:
Vardas: ${b.name}
Gimimo data: ${b.birthDate}

Partneris / kitas žmogus:
Vardas: ${b.partnerName}
Gimimo data: ${b.partnerBirthDate}

Santykio tipas: ${b.relationshipType}
Papildomai pasirinkta tema: ${b.topic}
Papildomas klausimas: ${b.question || "nepateiktas"}

SVARBU:
- Gimimo datas naudok kaip vartotojo pateiktą poros kontekstą. Neapsimesk, kad iš jų atlikai astrologinius ar numerologinius skaičiavimus, jei jų realiai neatlieki.
- TARO dalį pateik kaip santykių situacijos interpretaciją ir galimas tendencijas, o ne absoliučiai garantuotą ateitį.
- Nemeluok, kad fiziškai ištraukei atsitiktines kortas.
- Nerašyk bendrinių kelių sakinių. Analizė turi jaustis individuali ir išsami.
- Nekartok tos pačios minties skirtinguose skyriuose.
- Rašyk šiltai, aiškiai, brandžiai, be dirbtinai mistinio pertekliaus.
- Tikslas: maždaug 1800–2600 žodžių.

STRUKTŪRA:

1. JŪSŲ RYŠIO ESMĖ
Išsamiai aprašyk bendrą santykio dinamiką, trauką, artumo pobūdį ir pagrindinę ryšio temą.

2. ${b.name.toUpperCase()} ŠIAME RYŠYJE
Aptark emocinius poreikius, elgesį santykyje, ko šis žmogus ieško, ką duoda ir kur gali jaustis nesaugiai.

3. ${b.partnerName.toUpperCase()} ŠIAME RYŠYJE
Analogiškai išanalizuok kito žmogaus poziciją ir galimą emocinę dinamiką.

4. STIPRIOSIOS JŪSŲ POROS PUSĖS
Pateik bent 5 konkrečias stiprybes ir kiekvieną paaiškink.

5. SILPNOSIOS VIETOS IR IŠŠŪKIAI
Pateik bent 5 galimus santykių iššūkius. Paaiškink, kaip jie gali pasireikšti kasdienybėje.

6. EMOCINIS ARTUMAS IR JAUSMAI
Aptark emocinį ryšį, artumo poreikius, prisirišimą, jautrumą, pasitikėjimą ir tai, kas gali likti neišsakyta.

7. BENDRAVIMAS IR KONFLIKTAI
Kaip poroje gali kilti nesusikalbėjimas, kas padeda susitarti ir ko reikėtų vengti.

8. TRAUKA IR INTYMUMAS
Taktiškai aptark romantinę trauką, artumo dinamiką ir galimus skirtingus poreikius.

9. KAS JUS JUNGIA
Išskirk svarbiausius ryšį palaikančius elementus.

10. KAS GALI TOLINTI
Išskirk elgesio modelius, baimes, lūkesčius ar aplinkybes, kurios gali silpninti ryšį.

11. SANTYKIŲ POTENCIALAS IR GALIMA KRYPTIS
Aptark, kur link santykis galėtų vystytis, jei dabartiniai modeliai tęstųsi, ir kas galėtų pakeisti kryptį. Nenaudok kategoriškų garantijų.

12. PASIRINKTOS TEMOS ANALIZĖ
Tema: "${b.topic}". Atsakyk į ją atskirai ir išsamiai.

13. ATSAKYMAS Į INDIVIDUALŲ KLAUSIMĄ
Jei klausimas pateiktas, atsakyk tiesiai ir išsamiai. Jei nepateiktas, parašyk, kad papildomas klausimas nebuvo nurodytas.

14. KĄ VERTA STIPRINTI
Duok 5 praktiškus, konkrečius pasiūlymus šiai porai.

15. KO VERTA SAUGOTIS
Duok 3–5 aiškius perspėjimus apie santykių modelius, ne apie katastrofas ar garantuotus įvykius.

16. GALUTINĖ JŪSŲ POROS ŽINUTĖ
Užbaik 2–4 pastraipų individualia išvada apie šio ryšio stipriausią potencialą, pagrindinę pamoką ir svarbiausią kryptį.

Naudok aiškias antraštes. Atsakymas turi atrodyti kaip profesionaliai parengta mokama ZYZY Studio santykių analizė.
`;

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      input: prompt,
    });

    return NextResponse.json({ analysis: response.output_text });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Nepavyko parengti analizės." }, { status: 500 });
  }
}
