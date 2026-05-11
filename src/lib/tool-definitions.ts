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
  ];
}
