
import { GoogleGenAI, Type } from "@google/genai";
import { PERFUME_DATABASE } from "../constants";
import { QuizQuestion } from "../types";

// Export SCENT_FAMILIES to fix reference error in App.tsx
export const SCENT_FAMILIES = [
  "Fresh", "Green", "Tropical", "Fruity", "Woody", "Aquatic", "Citrus", 
  "Tea", "Floral", "Spicy", "Amber", "Herbal", "Powdery", "Musk", 
  "Solar", "Earth", "Aromatic", "Oriental", "Gourmand"
];

const BUDGETS = ["< Rp99K", "Rp100K - Rp299K", "> Rp300K"];

export const generateDynamicQuiz = async (): Promise<QuizQuestion[]> => {
  // Initialize GoogleGenAI with apiKey from process.env.API_KEY directly as per guidelines.
  // We create a new instance right before call to ensure the key is fresh.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const systemInstruction = `
    You are a Scent Psychologist for 'Parfumu'. 
    Generate a creative, poetic, and psychologically-driven perfume personality quiz in INDONESIAN.
    
    The quiz must have exactly 10 questions.
    Each question must have 4-5 options.
    Each option must map to a 'tag'.
    
    Available Tags for mapping:
    - Scent Families: ${SCENT_FAMILIES.join(", ")}
    - Exclusions: exclude:[FamilyName] (e.g., exclude:Gourmand)
    - Budgets: budget:[BudgetCategory] (Available categories: ${BUDGETS.join(", ")})
    
    The questions should explore:
    1. Psychological state and personality traits.
    2. Social aspirations (how they want to be seen).
    3. Daily rituals and childhood nostalgia.
    4. Sensory preferences and aversions.
    5. Specific budget categories (MUST include 1 question for budget).
    
    Make the quiz randomized and unique every time it's called.
    Return the response as a valid JSON array of QuizQuestion objects.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 10 fresh randomized perfume quiz questions. Timestamp: ${Date.now()}`,
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

    // Use .text property directly as per guidelines
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error generating quiz:", error);
    return [];
  }
};

export const analyzeQuizProfile = async (tags: string[]): Promise<string> => {
  // Initialize GoogleGenAI with apiKey from process.env.API_KEY directly
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const systemInstruction = `
    You are a Scent Profiler. Based on user quiz tags, generate EXACTLY ONE SHORT, POWERFUL sentence in INDONESIAN.
    The sentence must summarize their psychological aura and state that the following perfumes are the ultimate missing piece of their identity, making them feel they MUST buy them immediately.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze these tags: ${tags.join(", ")}`,
      config: { systemInstruction },
    });
    // Use .text property directly
    return response.text?.trim() || "Aura Anda memancarkan keunikan yang mendalam; kurasi aroma ini adalah kunci untuk menyempurnakan jati diri Anda.";
  } catch (error) {
    return "Profil Anda menunjukkan karakter yang luar biasa; wewangian ini dirancang khusus sebagai ekstensi dari jiwa Anda yang menawan.";
  }
};

export const getPerfumeRecommendation = async (userPrompt: string) => {
  // Initialize GoogleGenAI with apiKey from process.env.API_KEY directly
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const systemInstruction = `
    You are the "Fragrance Oracle" for Parfumu.
    Collection: ${JSON.stringify(PERFUME_DATABASE.map(p => ({ id: p.id, name: p.name, family: p.scent_family })))}
    Consultation: Be poetic, brief, and persuasive. Focus on psychological needs.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userPrompt,
      config: { systemInstruction },
    });
    // Use .text property directly
    return response.text || "Oracle sedang bermeditasi. Silakan tanyakan kembali.";
  } catch (error) {
    return "Aromatic Vault sedang dalam masa restorasi.";
  }
};
