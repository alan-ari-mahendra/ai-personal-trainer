
ayo brainstorming, jadi saya ingin membuat AI assistance yang dipersonalize sebagai PT gym dan mungkin ahli gizi dan sejenisnya, jadi nanti user bisa mengisi form progres dibantu dengan AI, terus nanti bisa tanya tanya juga, saya ingin AI bisa mengakses database, misal AI butuh konteks history latihan user dalam sebulan, perkembangan berat badan, history makan, dan lain lain,, untuk AI saya niatnya pakai groq, apakah memungkinkan?

saya belum kebayang soal RAGnya, tapi saya pernah membuat prompt injection, berikan contoh kode implementasinya, saya pakai nextjs fullstack

bagaimana kalau getUserContextFromDB dipakaikan groq juga, misal 

langkah 1
buat endpoint untuk mengambil data user dengan id bla bla bla yang di create pada tanggal bla bla bla dan seterusnya
output endpoint digunakan untuk ambil data, 
langkah 2
outputnya digunakan untuk membangun prompt
langkah 3
kirim ke groq dengan prompt personal trainer
langkah 4
output untuk user