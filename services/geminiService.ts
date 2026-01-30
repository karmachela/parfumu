
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
        systemInstruction: `You are a Scent Psychologist. Generate 10 randomized psychological questions mapping to: ${SCENT_FAMILIES.join(", ")}, budget:[BudgetCategory].`,
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
    return parsed.length > 0 ? parsed : getFallbackQuiz();
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
    text: "Pilih elemen alam yang paling menenangkan jiwa Anda?",
    options: [
      { text: "Embun pagi di pegunungan", tag: "Fresh" },
      { text: "Hutan kayu yang hangat", tag: "Woody" },
      { text: "Taman bunga saat fajar", tag: "Floral" },
      { text: "Deburan ombak di laut", tag: "Aquatic" }
    ]
  }
];
