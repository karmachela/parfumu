
import { GoogleGenAI, Type } from "@google/genai";
import { PERFUME_DATABASE } from "../constants";
import { QuizQuestion } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API Key is missing. Check your environment configuration.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "" });

const SCENT_FAMILIES = [
  "Fresh", "Green", "Tropical", "Fruity", "Woody", "Aquatic", "Citrus", 
  "Tea", "Floral", "Spicy", "Amber", "Herbal", "Powdery", "Musk", 
  "Solar", "Earth", "Aromatic", "Oriental", "Gourmand"
];

const BUDGETS = ["< Rp99K", "Rp100K - Rp299K", "> Rp300K"];

export const generateDynamicQuiz = async (): Promise<QuizQuestion[]> => {
  if (!API_KEY) return [];

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
    
    The questions MUST cover:
    1. Mental/Emotional state.
    2. Dream atmosphere.
    3. How they want to be perceived by others.
    4. Childhood or nostalgic memories.
    5. Daily habits.
    6. Preferred sensory textures.
    7. Scents that make them uncomfortable (exclude tags).
    8. Spending personality (budget tags).
    
    Make the questions unique and different every time.
    Return the response as a valid JSON array of QuizQuestion objects.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a new, fresh, and deeply psychological 10-question perfume quiz. Seed: ${Math.random()}`,
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

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error generating quiz:", error);
    return [];
  }
};

export const getPersonalityInsight = async (answers: string[]): Promise<string> => {
  if (!API_KEY) return "Jiwa Anda unik dan penuh misteri.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User selected these traits: ${answers.join(", ")}. Write 1 short, convincing sentence in Indonesian about their psychological profile and why these perfumes match them perfectly.`,
      config: {
        systemInstruction: "You are a poetic scent expert. Be brief (max 25 words).",
      }
    });
    return response.text || "Aroma ini adalah cerminan batin Anda yang elegan.";
  } catch (error) {
    return "Aroma ini melengkapi aura unik yang Anda miliki.";
  }
};

export const getPerfumeRecommendation = async (userPrompt: string) => {
  const systemInstruction = `
    You are the "Fragrance Oracle" for Parfumu.
    Collection: ${JSON.stringify(PERFUME_DATABASE.map(p => ({ id: p.id, name: p.name, family: p.scent_family })))}
    Consultation: Be poetic, brief, and psychological.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userPrompt,
      config: { systemInstruction },
    });
    return response.text || "Spiritualitas aroma sedang terganggu.";
  } catch (error) {
    return "Aromatic Vault sedang dalam masa restorasi.";
  }
};
