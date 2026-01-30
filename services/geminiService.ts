
import { GoogleGenAI, Type } from "@google/genai";
import { PERFUME_DATABASE } from "../constants";
import { QuizQuestion } from "../types";

// Fungsi pembantu untuk inisialisasi AI secara aman
const getAIClient = () => {
  let apiKey = "";
  try {
    // Mencoba mengakses process.env secara aman
    apiKey = process.env.API_KEY || "";
  } catch (e) {
    console.error("API Key tidak ditemukan di environment.");
  }
  return new GoogleGenAI({ apiKey });
};

export const SCENT_FAMILIES = [
  "Fresh", "Green", "Tropical", "Fruity", "Woody", "Aquatic", "Citrus", 
  "Tea", "Floral", "Spicy", "Amber", "Herbal", "Powdery", "Musk", 
  "Solar", "Earth", "Aromatic", "Oriental", "Gourmand"
];

const BUDGETS = ["< Rp99K", "Rp100K - Rp299K", "> Rp300K"];

export const generateDynamicQuiz = async (): Promise<QuizQuestion[]> => {
  const ai = getAIClient();
  const systemInstruction = `
    You are a Scent Psychologist for 'Parfumu'. 
    Generate a creative, poetic, and psychologically-driven perfume personality quiz in INDONESIAN.
    The quiz must have exactly 10 questions.
    Each option must map to a 'tag'.
    Available Tags: ${SCENT_FAMILIES.join(", ")}, budget:[BudgetCategory].
    Make it randomized and unique.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 10 randomized perfume personality questions. Seed: ${Date.now()}`,
      config: {
        systemInstruction,
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

    const questions = JSON.parse(response.text || "[]");
    return questions.length > 0 ? questions : getFallbackQuiz();
  } catch (error) {
    console.error("Gagal generate kuis dinamis:", error);
    return getFallbackQuiz();
  }
};

export const analyzeQuizProfile = async (tags: string[]): Promise<string> => {
  const ai = getAIClient();
  const systemInstruction = `
    You are a Scent Profiler. Based on user quiz tags, generate EXACTLY ONE SHORT, POWERFUL sentence in INDONESIAN.
    The sentence must summarize their psychological aura and state that the following perfumes are the ultimate missing piece of their identity.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze: ${tags.join(", ")}`,
      config: { systemInstruction },
    });
    return response.text?.trim() || "Aura Anda menunjukkan karakter yang unik; wewangian ini dirancang khusus sebagai ekstensi dari jiwa Anda yang menawan.";
  } catch (error) {
    return "Profil Anda menunjukkan karakter yang luar biasa; kurasi aroma ini adalah kunci untuk menyempurnakan jati diri Anda.";
  }
};

export const getPerfumeRecommendation = async (userPrompt: string) => {
  const ai = getAIClient();
  const systemInstruction = `
    You are the "Fragrance Oracle" for Parfumu.
    Collection: ${JSON.stringify(PERFUME_DATABASE.map(p => ({ id: p.id, name: p.name, family: p.scent_family })))}
    Consultation: Be poetic and persuasive in Indonesian.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userPrompt,
      config: { systemInstruction },
    });
    return response.text || "Oracle sedang bermeditasi. Silakan tanyakan kembali.";
  } catch (error) {
    return "Sistem sedang dalam pemeliharaan.";
  }
};

// Fungsi untuk kuis cadangan jika API gagal
const getFallbackQuiz = (): QuizQuestion[] => [
  {
    id: 1,
    text: "Suasana pagi seperti apa yang paling menggambarkan jiwa Anda?",
    options: [
      { text: "Embun segar di pegunungan", tag: "Fresh" },
      { text: "Kehangatan kopi di kedai tua", tag: "Gourmand" },
      { text: "Kebun bunga yang baru mekar", tag: "Floral" },
      { text: "Hutan pinus yang basah setelah hujan", tag: "Woody" }
    ]
  },
  {
    id: 2,
    text: "Berapa budget yang Anda alokasikan untuk investasi aroma ini?",
    options: [
      { text: "Di bawah Rp99K", tag: "budget:< Rp99K" },
      { text: "Rp100K - Rp299K", tag: "budget:Rp100K - Rp299K" },
      { text: "Diatas Rp300K", tag: "budget:> Rp300K" }
    ]
  }
];
