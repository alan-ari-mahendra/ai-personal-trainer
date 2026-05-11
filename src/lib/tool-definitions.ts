export function getToolDefinitions() {
  return [
    {
      type: "function" as const,
      function: {
        name: "save_workout_log",
        description:
          "Simpan log latihan gym/strength training. Panggil ketika user menyebutkan latihan angkat beban.",
        parameters: {
          type: "object",
          properties: {
            exercise_name: {
              type: "string",
              description: "Nama latihan (Bench Press, Squat, Deadlift, dll)",
            },
            weight_kg: {
              type: "number",
              description: "Beban kg. Null jika bodyweight.",
            },
            sets: { type: "integer", description: "Jumlah set" },
            reps: { type: "integer", description: "Jumlah repetisi per set" },
            rpe: {
              type: "integer",
              description: "Intensitas 1-10. Opsional.",
            },
            notes: { type: "string", description: "Catatan opsional" },
          },
          required: ["exercise_name", "sets", "reps"],
        },
      },
    },
    {
      type: "function" as const,
      function: {
        name: "save_cardio_log",
        description:
          "Simpan log aktivitas cardio (lari, sepeda, renang, dll).",
        parameters: {
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: ["running", "cycling", "swimming", "walking", "hiit", "other"],
              description: "Jenis aktivitas",
            },
            distance_km: {
              type: "number",
              description: "Jarak km. Opsional untuk HIIT.",
            },
            duration_min: {
              type: "integer",
              description: "Durasi menit",
            },
            notes: { type: "string", description: "Catatan opsional" },
          },
          required: ["type", "duration_min"],
        },
      },
    },
    {
      type: "function" as const,
      function: {
        name: "save_nutrition_log",
        description: "Simpan log makanan/minuman user.",
        parameters: {
          type: "object",
          properties: {
            meal_type: {
              type: "string",
              enum: ["breakfast", "lunch", "dinner", "snack"],
              description: "Waktu makan",
            },
            food_name: {
              type: "string",
              description: "Nama makanan",
            },
            calories: {
              type: "number",
              description: "Kalori. Opsional.",
            },
            protein_g: {
              type: "number",
              description: "Protein gram. Opsional.",
            },
            carbs_g: {
              type: "number",
              description: "Karbohidrat gram. Opsional.",
            },
            fat_g: {
              type: "number",
              description: "Lemak gram. Opsional.",
            },
            portion_size: {
              type: "string",
              description: "Ukuran porsi. Opsional.",
            },
            notes: { type: "string", description: "Catatan opsional" },
          },
          required: ["meal_type", "food_name"],
        },
      },
    },
    {
      type: "function" as const,
      function: {
        name: "save_body_stats",
        description: "Update berat badan user. Satu entry per hari (upsert).",
        parameters: {
          type: "object",
          properties: {
            weight_kg: {
              type: "number",
              description: "Berat badan kg",
            },
            waist_cm: {
              type: "number",
              description: "Lingkar pinggang cm. Opsional.",
            },
            notes: { type: "string", description: "Catatan opsional" },
          },
          required: ["weight_kg"],
        },
      },
    },
    {
      type: "function" as const,
      function: {
        name: "get_user_analytics",
        description:
          "Ambil data analitik user untuk menjawab pertanyaan tentang progress, statistik, atau ringkasan aktivitas.",
        parameters: {
          type: "object",
          properties: {
            period: {
              type: "string",
              enum: ["today", "week", "month"],
              description: "Periode waktu",
            },
            metric: {
              type: "string",
              enum: ["all", "workouts", "nutrition", "cardio", "weight"],
              description: "Metrik yang dianalisis",
            },
          },
          required: ["period", "metric"],
        },
      },
    },
  ];
}
