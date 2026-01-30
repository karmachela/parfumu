
import { GoogleGenAI, Type } from "@google/genai";
import { PERFUME_DATABASE } from "../constants";
import { QuizQuestion } from "../types";

// Inisialisasi SDK menggunakan process.env.API_KEY secara langsung
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const SCENT_FAMILIES = [
  "Fresh", "Green", "Tropical", "Fruity", "Woody", "Aquatic", "Citrus", 
  "Tea", "Floral", "Spicy", "Amber", "Herbal", "Powdery", "Musk", 
  "Solar", "Earth", "Aromatic", "Oriental", "Gourmand"
];

const BUDGETS = ["< Rp99K", "Rp100K - Rp299K", "> Rp300K"];

export const generateDynamicQuiz = async (): Promise<QuizQuestion[]> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a new unique 10-question perfume personality quiz in INDONESIAN. Seed: ${Date.now()}`,
      config: {
        systemInstruction: `You are a Scent Psychologist. Generate 10 randomized psychological questions. 
        Each option MUST have a 'tag' from this list: ${SCENT_FAMILIES.join(", ")}. 
        Include at least one question for budget with tags: budget:< Rp99K, budget:Rp100K - Rp299K, budget:> Rp300K.
        The output must be a valid JSON array of questions.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              text: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING },
                    tag: { type: Type.STRING }
                  },
                  required: ["text", "tag"]
                }
              }
            },
            required: ["id", "text", "options"]
          }
        }
      },
    });

    const parsed = JSON.parse(response.text || "[]");
    // Pastikan minimal ada 3 pertanyaan agar kuis terasa valid
    return parsed.length >= 3 ? parsed : getFallbackQuiz();
  } catch (error) {
    console.error("Quiz generation failed:", error);
    return getFallbackQuiz();
  }
};

export const analyzeQuizProfile = async (tags: string[]): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze these tags and give 1 powerful sentence: ${tags.join(", ")}`,
      config: { 
        systemInstruction: "Generate EXACTLY ONE SHORT, PERSUASIVE sentence in INDONESIAN about the user's psychological aura and their perfect perfume match." 
      },
    });
    return response.text?.trim() || "Aura Anda menunjukkan karakter yang luar biasa; kurasi aroma ini adalah kunci untuk menyempurnakan jati diri Anda.";
  } catch (error) {
    return "Profil batin Anda menunjukkan keunikan yang mendalam; wewangian ini adalah manifestasi dari jiwa Anda.";
  }
};

export const getPerfumeRecommendation = async (userPrompt: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userPrompt,
      config: { 
        systemInstruction: `You are the Fragrance Oracle for Parfumu. Collection: ${JSON.stringify(PERFUME_DATABASE.map(p => ({id: p.id, name: p.name, family: p.scent_family})))}` 
      },
    });
    return response.text || "Oracle sedang bermeditasi. Silakan tanyakan kembali.";
  } catch (error) {
    return "Maaf, Oracle sedang beristirahat. Silakan coba beberapa saat lagi.";
  }
};

const getFallbackQuiz = (): QuizQuestion[] => [
  {
    id: 1,
    text: "Pilih suasana alam yang paling menggambarkan ketenangan batin Anda?",
    options: [
      { text: "Puncak gunung yang dingin berembun", tag: "Fresh" },
      { text: "Hutan pinus yang hangat dan kokoh", tag: "Woody" },
      { text: "Taman bunga mekar di pagi hari", tag: "Floral" },
      { text: "Deburan ombak di pantai tropis", tag: "Aquatic" }
    ]
  },
  {
    id: 2,
    text: "Bagaimana cara Anda menghabiskan waktu luang yang paling ideal?",
    options: [
      { text: "Membaca buku di kedai kopi yang tenang", tag: "Gourmand" },
      { text: "Menjelajahi tempat baru yang belum terjamah", tag: "Green" },
      { text: "Menghadiri acara sosial yang penuh energi", tag: "Fruity" },
      { text: "Meditasi atau yoga di rumah", tag: "Musk" }
    ]
  },
  {
    id: 3,
    text: "Pilih palet warna yang paling mewakili emosi Anda saat ini?",
    options: [
      { text: "Biru laut dan putih bersih", tag: "Aquatic" },
      { text: "Hijau lumut dan cokelat tanah", tag: "Earth" },
      { text: "Merah menyala dan oranye hangat", tag: "Spicy" },
      { text: "Ungu pastel dan pink lembut", tag: "Powdery" }
    ]
  },
  {
    id: 4,
    text: "Apa elemen visual yang paling menarik perhatian Anda?",
    options: [
      { text: "Kilauan kristal yang elegan", tag: "Amber" },
      { text: "Tekstur kain sutra yang lembut", tag: "Floral" },
      { text: "Logam futuristik yang dingin", tag: "Aromatic" },
      { text: "Kayu tua yang memiliki sejarah", tag: "Woody" }
    ]
  },
  {
    id: 5,
    text: "Berapa alokasi investasi untuk aroma jati diri Anda?",
    options: [
      { text: "Masterpiece terjangkau (< Rp99K)", tag: "budget:< Rp99K" },
      { text: "Koleksi menengah (Rp100K - Rp299K)", tag: "budget:Rp100K - Rp299K" },
      { text: "Investasi premium (> Rp300K)", tag: "budget:> Rp300K" }
    ]
  }
];
