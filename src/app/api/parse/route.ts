import { getGroq, GROQ_MODEL } from '@/lib/groq';
import { getUserId } from '@/lib/api-auth';
import type { ParseType } from '@/types/api';

function getMealTypeHint(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 10) return 'breakfast';
  if (hour >= 10 && hour < 14) return 'lunch';
  if (hour >= 14 && hour < 17) return 'snack';
  return 'dinner';
}

const PARSE_PROMPTS: Record<ParseType, string> = {
  nutrition: `Kamu adalah food parser. Parse deskripsi makanan user ke JSON.

Rules:
- Extract setiap item makanan terpisah
- Estimasi kalori dan macro (protein, carbs, fat) per item berdasarkan pengetahuanmu tentang nutrisi makanan Indonesia dan umum
- portion_size = deskripsi porsi dari user (misal "2 biji", "100gram", "1 porsi")
- Jika user tidak sebut jumlah, anggap 1 porsi standar
- Angka kalori/macro boleh null jika benar-benar tidak bisa diestimasi
- meal_type hint: MEAL_TYPE_HINT (tapi user bisa override di form)

Output JSON format:
{
  "items": [
    {
      "food_name": "string",
      "portion_size": "string",
      "calories": number | null,
      "protein_g": number | null,
      "carbs_g": number | null,
      "fat_g": number | null
    }
  ],
  "meal_type": "breakfast" | "lunch" | "dinner" | "snack"
}`,

  workout: `Kamu adalah workout parser. Parse deskripsi latihan gym user ke JSON.

Rules:
- Extract setiap exercise terpisah
- "4x12" artinya 4 set, 12 rep
- "3 set 10 rep" artinya 3 set, 10 rep
- weight_kg null jika bodyweight exercise (push up, pull up, plank, dll)
- rpe null kecuali user menyebutkan intensitas
- notes null kecuali user menambahkan catatan spesifik

Output JSON format:
{
  "exercises": [
    {
      "exercise_name": "string",
      "sets": number,
      "reps": number,
      "weight_kg": number | null,
      "rpe": number | null,
      "notes": string | null
    }
  ]
}`,

  cardio: `Kamu adalah cardio activity parser. Parse deskripsi aktivitas cardio user ke JSON.

Rules:
- Tentukan type dari deskripsi: running, cycling, swimming, walking, hiit, other
- "lari" = running, "sepeda" = cycling, "renang" = swimming, "jalan" = walking
- distance_km null jika tidak disebutkan (misal HIIT)
- duration_min null jika tidak disebutkan
- notes null kecuali ada info tambahan

Output JSON format:
{
  "type": "running" | "cycling" | "swimming" | "walking" | "hiit" | "other",
  "distance_km": number | null,
  "duration_min": number | null,
  "notes": string | null
}`,
};

export async function POST(req: Request) {
  try {
    getUserId(req); // auth check

    const body = await req.json();
    const { type, input } = body as { type?: ParseType; input?: string };

    if (!type || !input || !PARSE_PROMPTS[type]) {
      return Response.json(
        { error: 'type and input are required' },
        { status: 400 },
      );
    }

    const systemPrompt = PARSE_PROMPTS[type].replace(
      'MEAL_TYPE_HINT',
      getMealTypeHint(),
    );

    const groq = getGroq();
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return Response.json(
        { error: 'AI returned empty response' },
        { status: 502 },
      );
    }

    const parsed = JSON.parse(content);
    return Response.json(parsed);
  } catch (error) {
    console.error('Parse API error:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return Response.json(
      { error: 'Failed to parse input' },
      { status: 500 },
    );
  }
}
