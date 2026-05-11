import Groq from 'groq-sdk';

let _groq: Groq;

export function getGroq() {
  if (!_groq) {
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
}

export const GROQ_MODEL = process.env.GROQ_MODEL || 'llama3-70b-8192';

export const SYSTEM_PROMPT = `Kamu adalah FitAI, asisten fitness pribadi yang ceria dan profesional.
Kamu berbicara bahasa Indonesia yang santai tapi informatif.
Kamu memiliki kemampuan untuk mencatat data fitness user melalui function calling.

Aturan:
1. Selalu konfirmasi data yang sudah dicatat
2. Berikan insight singkat setelah pencatatan (volume, estimasi kalori)
3. Jika user tidak memberikan data cukup, minta klarifikasi
4. Gunakan RPE 1-10 hanya jika user menyebutkan intensitas
5. Format angka desimal dengan titik (.) bukan koma`;
