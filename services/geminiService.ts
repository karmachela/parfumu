
import { GoogleGenAI, Type } from "@google/genai";
import { PERFUME_DATABASE } from "../constants";
import { QuizQuestion } from "../types";

// Inisialisasi SDK menggunakan process.env.API_KEY secara langsung
// Selalu membuat instance baru untuk memastikan menggunakan kunci API terbaru
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const SCENT_FAMILIES = [
  "Fresh", "Green", "Tropical", "Fruity", "Woody", "Aquatic", "Citrus", 
  "Tea", "Floral", "Spicy", "Amber", "Herbal", "Powdery", "Musk", 
  "Solar", "Earth", "Aromatic", "Oriental", "Gourmand"
];

// Menambahkan fungsi rekomendasi parfum untuk AI Assistant
export const getPerfumeRecommendation = async (userMessage: string): Promise<string> => {
  try {
    const ai = getAI();
    // Membuat ringkasan database untuk konteks AI guna memberikan rekomendasi yang akurat
    const perfumeContext = PERFUME_DATABASE.slice(0, 100).map(p => 
      `- ${p.name}: ${p.scent_family.join(', ')} (Top Notes: ${p.top_notes.slice(0, 3).join(', ')})`
    ).join('\n');
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userMessage,
      config: {
        systemInstruction: `Anda adalah "Oracle Aroma" dari PARFUMU. Tugas Anda adalah membantu pengguna menemukan parfum yang tepat dari database kami. 
        Berikan jawaban dalam Bahasa Indonesia yang sopan, persuasif, dan sangat membantu.
        
        Gunakan database parfum berikut sebagai referensi utama untuk rekomendasi Anda:
        ${perfumeContext}
        
        Jika pengguna mencari nuansa tertentu, cocokkan dengan keluarga aroma (Scent Family) yang ada. 
        Jangan menyebutkan database secara teknis, bersikaplah seperti ahli parfum yang elegan.`,
      },
    });
    
    // Mengakses properti .text secara langsung sesuai panduan SDK terbaru
    return response.text || "Maaf, saya tidak dapat menemukan rekomendasi yang tepat saat ini. Bisa ceritakan lebih lanjut?";
  } catch (error) {
    console.error("Assistant recommendation failed:", error);
    return "Maaf, terjadi gangguan pada indra penciuman digital saya. Silakan coba lagi nanti.";
  }
};

export const generateDynamicQuiz = async (): Promise<QuizQuestion[]> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a new unique 10-question perfume personality quiz in INDONESIAN. Seed: ${Date.now()}`,
      config: {
        systemInstruction: `You are a Scent Psychologist. Generate EXACTLY 10 randomized psychological questions. 
        Each option MUST have a 'tag' from this list: ${SCENT_FAMILIES.join(", ")}. 
        Include exactly one question for budget with tags: budget:< Rp99K, budget:Rp100K - Rp299K, budget:> Rp300K.
        The output must be a valid JSON array of 10 questions.`,
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

    // Menggunakan response.text sebagai properti
    const parsed = JSON.parse(response.text || "[]");
    return parsed.length >= 5 ? parsed : getFallbackQuiz();
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
      contents: `Analyze ini dan berikan 1 kalimat deskripsi karakter batin: ${tags.join(", ")}`,
      config: { 
        systemInstruction: "Generate EXACTLY ONE SHORT, PERSUASIVE sentence in INDONESIAN about the user's psychological aura and their perfect perfume match." 
      },
    });
    // Menggunakan response.text sebagai properti
    return response.text?.trim() || "Aura Anda menunjukkan karakter yang luar biasa; kurasi aroma ini adalah kunci untuk menyempurnakan jati diri Anda.";
  } catch (error) {
    return "Profil batin Anda menunjukkan keunikan yang mendalam; wewangian ini adalah manifestasi dari jiwa Anda.";
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
    text: "Bila hidup Anda adalah sebuah melodi, seperti apa bunyinya?",
    options: [
      { text: "Jazz yang santai dan manis", tag: "Gourmand" },
      { text: "Klasik yang megah dan dalam", tag: "Amber" },
      { text: "Pop yang ceria dan segar", tag: "Fruity" },
      { text: "Lo-fi yang tenang dan misterius", tag: "Tea" }
    ]
  },
  {
    id: 6,
    text: "Pilih aroma pagi yang paling membangkitkan semangat Anda?",
    options: [
      { text: "Kopi hitam yang pekat", tag: "Woody" },
      { text: "Jeruk segar yang baru diperas", tag: "Citrus" },
      { text: "Roti panggang mentega", tag: "Gourmand" },
      { text: "Udara bersih setelah hujan", tag: "Fresh" }
    ]
  },
  {
    id: 7,
    text: "Manakah dari tekstur berikut yang paling nyaman di kulit Anda?",
    options: [
      { text: "Katun bersih yang kaku", tag: "Fresh" },
      { text: "Wol tebal yang hangat", tag: "Spicy" },
      { text: "Kulit asli yang berwibawa", tag: "Woody" },
      { text: "Beludru yang mewah", tag: "Oriental" }
    ]
  },
  {
    id: 8,
    text: "Dalam sebuah ruangan, posisi mana yang paling Anda sukai?",
    options: [
      { text: "Di pusat perhatian, berbagi tawa", tag: "Tropical" },
      { text: "Di sudut tenang dekat jendela", tag: "Green" },
      { text: "Berpindah-pindah, menyapa semua", tag: "Citrus" },
      { text: "Mengamati dari balkon yang tinggi", tag: "Aquatic" }
    ]
  },
  {
    id: 9,
    text: "Apa impian liburan terjauh yang ingin Anda wujudkan?",
    options: [
      { text: "Kota metropolis yang tidak pernah tidur", tag: "Aromatic" },
      { text: "Desa terpencil di pegunungan salju", tag: "Musk" },
      { text: "Pulau pribadi di tengah samudra", tag: "Tropical" },
      { text: "Situs sejarah kuno yang sakral", tag: "Earth" }
    ]
  },
  {
    id: 10,
    text: "Berapa alokasi investasi untuk aroma jati diri Anda?",
    options: [
      { text: "Masterpiece terjangkau (< Rp99K)", tag: "budget:< Rp99K" },
      { text: "Koleksi menengah (Rp100K - Rp299K)", tag: "budget:Rp100K - Rp299K" },
      { text: "Investasi premium (> Rp300K)", tag: "budget:> Rp300K" }
    ]
  }
];
