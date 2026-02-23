import { GoogleGenAI, Type } from "@google/genai";
import { RPMFormData, GeneratedRPMContent, ProtaEntry, PromesEntry, PedagogicalPractice, GraduateDimension, LKPDContent, FormativeQuestion } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface ChapterInfo {
  chapter: string;
  title: string;
  materials: {
    title: string;
    meetings: number;
  }[];
}

const PREDEFINED_CURRICULUM: Record<string, Record<string, ChapterInfo[]>> = {
  "Kelas 1": {
    "Pendidikan Pancasila": [
      { chapter: "Bab 1", title: "Aku Mengenal Indonesia", materials: [{ title: "Simbol Negara", meetings: 2 }, { title: "Lagu Kebangsaan", meetings: 2 }] },
      { chapter: "Bab 2", title: "Aku dan Lingkunganku", materials: [{ title: "Rumah dan Sekolah", meetings: 2 }, { title: "Kebersihan Lingkungan", meetings: 2 }] }
    ],
    "Bahasa Indonesia": [
      { chapter: "Bab 5", title: "Teman Baru", materials: [{ title: "Berkenalan", meetings: 2 }, { title: "Menyapa Teman", meetings: 2 }] },
      { chapter: "Bab 6", title: "Berbeda itu Tak Apa", materials: [{ title: "Mengenal Perbedaan", meetings: 2 }, { title: "Indahnya Keragaman", meetings: 2 }] },
      { chapter: "Bab 7", title: "Aku Ingin", materials: [{ title: "Kebutuhan vs Keinginan", meetings: 2 }, { title: "Hemat Pangkal Kaya", meetings: 2 }] },
      { chapter: "Bab 8", title: "Di Sekitar Rumah", materials: [{ title: "Benda di Rumah", meetings: 2 }, { title: "Kegiatan di Rumah", meetings: 2 }] }
    ],
    "Matematika": [
      { chapter: "Bab 1", title: "Ayo, Membilang sampai 20", materials: [{ title: "Angka 1-10", meetings: 2 }, { title: "Angka 11-20", meetings: 2 }] },
      { chapter: "Bab 2", title: "Penjumlahan dan Pengurangan sampai dengan 20", materials: [{ title: "Penjumlahan Dasar", meetings: 3 }, { title: "Pengurangan Dasar", meetings: 3 }] },
      { chapter: "Bab 3", title: "Mengukur Panjang Benda", materials: [{ title: "Alat Ukur Tidak Baku", meetings: 2 }, { title: "Perbandingan Panjang", meetings: 2 }] },
      { chapter: "Bab 4", title: "Mengenal Diagram", materials: [{ title: "Membaca Gambar", meetings: 2 }, { title: "Diagram Gambar Sederhana", meetings: 2 }] }
    ],
    "Seni Musik": [
      { chapter: "Bab 1", title: "Bermain dan Bernyanyi", materials: [{ title: "Bernyanyi Bersama", meetings: 2 }, { title: "Irama Lagu", meetings: 2 }] },
      { chapter: "Bab 2", title: "Tepuk Tangan dan Entakkan Kakimu", materials: [{ title: "Ritmik Tubuh", meetings: 2 }, { title: "Bunyi Tubuh", meetings: 2 }] },
      { chapter: "Bab 3", title: "Dengarkan dan Bunyikan", materials: [{ title: "Sumber Bunyi", meetings: 2 }, { title: "Suara Alam", meetings: 2 }] },
      { chapter: "Bab 4", title: "Mari Bermain Musik", materials: [{ title: "Alat Musik Ritmis", meetings: 2 }, { title: "Ensambel Kecil", meetings: 2 }] }
    ],
    "PJOK": [
      { chapter: "Bab 1", title: "Gerak Berirama", materials: [{ title: "Langkah Kaki", meetings: 2 }, { title: "Senam Irama Anak", meetings: 2 }] },
      { chapter: "Bab 2", title: "Aktivitas Pengenalan Air", materials: [{ title: "Berani Masuk Kolam", meetings: 3 }, { title: "Bermain di Air", meetings: 2 }] },
      { chapter: "Bab 3", title: "Aktivitas Kebugaran Jasmani", materials: [{ title: "Lari dan Lompat", meetings: 2 }, { title: "Kekuatan Otot Kaki", meetings: 2 }] },
      { chapter: "Bab 4", title: "Mengenal Bagian-Bagian Tubuh", materials: [{ title: "Anggota Tubuh", meetings: 2 }, { title: "Kegunaan Anggota Tubuh", meetings: 2 }] }
    ]
  },
  "Kelas 2": {
    "Pendidikan Pancasila": [
      { chapter: "Bab 1", title: "Aku dan Teman-Temanku", materials: [{ title: "Keragaman Teman", meetings: 2 }, { title: "Sikap Menghargai", meetings: 2 }] },
      { chapter: "Bab 2", title: "Aku Peduli Lingkungan", materials: [{ title: "Pelestarian Alam", meetings: 2 }, { title: "Aksi Bersih", meetings: 2 }] }
    ],
    "Bahasa Indonesia": [
      { chapter: "Bab 5", title: "Berteman dalam Keragaman", materials: [{ title: "Suku dan Budaya", meetings: 2 }, { title: "Mengenal Bahasa Daerah", meetings: 2 }] },
      { chapter: "Bab 6", title: "Bijak Memakai Uang", materials: [{ title: "Mengenal Nilai Uang", meetings: 2 }, { title: "Menabung", meetings: 2 }] },
      { chapter: "Bab 7", title: "Sayang Lingkungan", materials: [{ title: "Memilah Sampah", meetings: 2 }, { title: "Tanaman di Sekitar", meetings: 2 }] },
      { chapter: "Bab 8", title: "Hobi yang Jadi Prestasi", materials: [{ title: "Mengenal Hobi", meetings: 2 }, { title: "Meraih Cita-cita", meetings: 2 }] }
    ],
    "Matematika": [
      { chapter: "Bab 1", title: "Pecahan", materials: [{ title: "Setengah", meetings: 2 }, { title: "Seperempat", meetings: 2 }] },
      { chapter: "Bab 2", title: "Pengukuran", materials: [{ title: "Alat Ukur Baku Panjang", meetings: 2 }, { title: "Pengukuran Berat Sederhana", meetings: 2 }] },
      { chapter: "Bab 3", title: "Ayo, Membilang sampai dengan 100", materials: [{ title: "Bilangan 21-50", meetings: 2 }, { title: "Bilangan 51-100", meetings: 2 }] },
      { chapter: "Bab 4", title: "Berbagi Diagram", materials: [{ title: "Pictogram", meetings: 2 }, { title: "Membaca Diagram", meetings: 2 }] }
    ],
    "Seni Musik": [
      { chapter: "Bab 1", title: "Apresiasi dan Eksplorasi Bunyi", materials: [{ title: "Bunyi Benda", meetings: 2 }, { title: "Imitasi Bunyi", meetings: 2 }] },
      { chapter: "Bab 2", title: "Pengembangan Ritme Sederhana", materials: [{ title: "Ketukan Stabil", meetings: 2 }, { title: "Pola Ritme", meetings: 2 }] },
      { chapter: "Bab 3", title: "Bermain dan Bermusik", materials: [{ title: "Lagu Anak Pilihan", meetings: 2 }, { title: "Apresiasi Musik", meetings: 2 }] },
      { chapter: "Bab 4", title: "Bermain dengan Arisambel", materials: [{ title: "Paduan Suara", meetings: 2 }, { title: "Musik Ansambel", meetings: 2 }] }
    ],
    "PJOK": [
      { chapter: "Bab 1", title: "Gerak Berirama", materials: [{ title: "Langkah dan Ayunan", meetings: 2 }, { title: "Formasi Senam", meetings: 2 }] },
      { chapter: "Bab 2", title: "Aktivitas Pengenalan Air (Renang)", materials: [{ title: "Meluncur", meetings: 3 }, { title: "Pernapasan di Air", meetings: 2 }] },
      { chapter: "Bab 3", title: "Aktivitas Kebugaran untuk Kesehatan", materials: [{ title: "Latihan Kelenturan", meetings: 2 }, { title: "Keseimbangan Statis", meetings: 2 }] },
      { chapter: "Bab 4", title: "Menjaga Kebersihan Lingkungan", materials: [{ title: "Kebersihan Kelas", meetings: 2 }, { title: "Halaman Sekolah Bersih", meetings: 2 }] }
    ]
  },
  "Kelas 3": {
    "Pendidikan Pancasila": [
      { chapter: "Bab 1", title: "Berbeda itu Indah", materials: [{ title: "Mengenal Perbedaan", meetings: 2 }, { title: "Toleransi", meetings: 2 }] },
      { chapter: "Bab 2", title: "Ayo Mengenal Pancasila", materials: [{ title: "Sila-Sila Pancasila", meetings: 3 }, { title: "Penerapan di Sekolah", meetings: 2 }] }
    ],
    "Bahasa Indonesia": [
      { chapter: "Bab 5", title: "Bola-Bola Coklat", materials: [{ title: "Teks Prosedur", meetings: 2 }, { title: "Menulis Instruksi", meetings: 2 }] },
      { chapter: "Bab 6", title: "Tersesat", materials: [{ title: "Membaca Denah", meetings: 2 }, { title: "Memberi Petunjuk Arah", meetings: 2 }] },
      { chapter: "Bab 7", title: "Aku dan Si Merah", materials: [{ title: "Pemanfaatan Sayuran", meetings: 2 }, { title: "Menanam di Pot", meetings: 2 }] },
      { chapter: "Bab 8", title: "Sahabat dari Seberang", materials: [{ title: "Korespondensi", meetings: 2 }, { title: "Menulis Surat", meetings: 2 }] }
    ],
    "Matematika": [
      { chapter: "Bab 1", title: "Pengukuran Panjang dan Berat", materials: [{ title: "Sentimeter dan Meter", meetings: 3 }, { title: "Kilogram dan Gram", meetings: 3 }] },
      { chapter: "Bab 2", title: "Unsur-Unsur Bangun Datar", materials: [{ title: "Sisi dan Sudut", meetings: 2 }, { title: "Segiempat dan Segitiga", meetings: 2 }] },
      { chapter: "Bab 3", title: "Penyajian Data dalam Tabel", materials: [{ title: "Turus", meetings: 2 }, { title: "Membaca Tabel", meetings: 2 }] }
    ],
    "Ilmu Pengetahuan Alam dan Sosial (IPAS)": [
      { chapter: "Bab 5", title: "Aku dan Lingkungan Sekitarnya", materials: [{ title: "Ekosistem Lokal", meetings: 3 }, { title: "Makhluk Hidup di Sekitar", meetings: 2 }] },
      { chapter: "Bab 6", title: "Aku Bagian dari Masyarakat", materials: [{ title: "Peran Sosial", meetings: 2 }, { title: "Norma di Masyarakat", meetings: 2 }] },
      { chapter: "Bab 7", title: "Cerita dari Kampung Halaman", materials: [{ title: "Sejarah Lokal", meetings: 3 }, { title: "Asal-usul Nama Daerah", meetings: 2 }] },
      { chapter: "Bab 8", title: "Bentang Alam Indonesia", materials: [{ title: "Gunung dan Sungai", meetings: 2 }, { title: "Pantai dan Laut", meetings: 2 }] }
    ],
    "Seni Rupa": [
      { chapter: "Bab 1", title: "Mengenal Kesan Ruang", materials: [{ title: "Perspektif Sederhana", meetings: 2 }, { title: "Latar Depan dan Belakang", meetings: 2 }] },
      { chapter: "Bab 2", title: "Eksplorasi Bentuk melalui Teknik Cetak", materials: [{ title: "Cetak Tinggi Sederhana", meetings: 3 }, { title: "Cetak Penampang", meetings: 2 }] },
      { chapter: "Bab 3", title: "Bentuk Geometri pada Bangun", materials: [{ title: "Pola Geometris", meetings: 2 }, { title: "Kolase Geometris", meetings: 2 }] },
      { chapter: "Bab 4", title: "Membuat Bentuk Karya Tiga Dimensi", materials: [{ title: "Model dari Lempung", meetings: 3 }, { title: "Konstruksi Kertas", meetings: 2 }] },
      { chapter: "Bab 5", title: "Mengapresiasi Karya Seni Rupa", materials: [{ title: "Kritik Seni Sederhana", meetings: 2 }, { title: "Pameran Kelas", meetings: 2 }] }
    ],
    "PJOK": [
      { chapter: "Bab 1", title: "Aktivitas Gerak Berirama", materials: [{ title: "Kombinasi Ayunan Lengan", meetings: 2 }, { title: "Langkah Berirama", meetings: 2 }] },
      { chapter: "Bab 2", title: "Permainan dan Olahraga Air", materials: [{ title: "Pengenalan Renang Gaya Dada", meetings: 3 }, { title: "Permainan Air", meetings: 2 }] },
      { chapter: "Bab 3", title: "Aktivitas Kebugaran untuk Kesehatan", materials: [{ title: "Latihan Kelenturan", meetings: 2 }, { title: "Latihan Daya Tahan", meetings: 2 }] },
      { chapter: "Bab 4", title: "Aktivitas Fisik dan Memilih Makanan Bergizi", materials: [{ title: "Pentingnya Gerak", meetings: 2 }, { title: "Makanan 4 Sehat 5 Sempurna", meetings: 2 }] }
    ]
  },
  "Kelas 4": {
    "Matematika": [
      { chapter: "Bab 1", title: "Pola gambar dan bilangan", materials: [{ title: "Pola Gambar", meetings: 2 }, { title: "Pola Bilangan", meetings: 2 }] },
      { chapter: "Bab 2", title: "Pengukuran luas dan volume", materials: [{ title: "Pengukuran Luas", meetings: 3 }, { title: "Pengukuran Volume", meetings: 3 }] },
      { chapter: "Bab 3", title: "Bangun datar", materials: [{ title: "Ciri-ciri Bangun Datar", meetings: 2 }, { title: "Komposisi Bangun Datar", meetings: 2 }] },
      { chapter: "Bab 4", title: "Piktogram dan diagram batang", materials: [{ title: "Piktogram", meetings: 2 }, { title: "Diagram Batang", meetings: 2 }] }
    ],
    "Bahasa Indonesia": [
      { chapter: "Bab 1", title: "Bertukar atau membayar", materials: [{ title: "Mengenal Nilai Uang", meetings: 2 }, { title: "Teks Prosedur Jual Beli", meetings: 2 }] },
      { chapter: "Bab 2", title: "Satu titik", materials: [{ title: "Membaca Peta Sederhana", meetings: 2 }, { title: "Menentukan Arah", meetings: 2 }] },
      { chapter: "Bab 3", title: "Asal usul", materials: [{ title: "Silsilah Keluarga", meetings: 2 }, { title: "Cerita Rakyat", meetings: 2 }] },
      { chapter: "Bab 4", title: "Sehatlah ragaku", materials: [{ title: "Menjaga Kesehatan", meetings: 2 }, { title: "Pola Hidup Bersih", meetings: 2 }] }
    ],
    "Pendidikan Pancasila": [
      { chapter: "Bab 1", title: "Kerjasama di lingkunganku", materials: [{ title: "Gotong Royong", meetings: 2 }, { title: "Manfaat Kerjasama", meetings: 2 }] },
      { chapter: "Bab 2", title: "Pancasila dalam diriku", materials: [{ title: "Simbol Pancasila", meetings: 2 }, { title: "Penerapan Pancasila", meetings: 3 }] }
    ],
    "Ilmu Pengetahuan Alam dan Sosial (IPAS)": [
      { chapter: "Bab 1", title: "Ini khas daerah", materials: [{ title: "Kekayaan Alam Daerah", meetings: 3 }, { title: "Kearifan Lokal", meetings: 2 }] },
      { chapter: "Bab 2", title: "Peranku di lingkungan sekolah dan masyarakat", materials: [{ title: "Norma Sosial", meetings: 2 }, { title: "Tanggung Jawab Diri", meetings: 2 }] },
      { chapter: "Bab 3", title: "Keragaman budaya dan kearifan lokal", materials: [{ title: "Rumah Adat", meetings: 2 }, { title: "Tarian Tradisional", meetings: 2 }] },
      { chapter: "Bab 4", title: "Menjadi pahlawan lingkungan", materials: [{ title: "Daur Ulang Sampah", meetings: 2 }, { title: "Pelestarian Alam", meetings: 3 }] }
    ],
    "PJOK": [
      { chapter: "Bab 1", title: "Aktivitas Gerak berirama", materials: [{ title: "Langkah Berirama", meetings: 2 }, { title: "Senam Irama", meetings: 2 }] },
      { chapter: "Bab 2", title: "Aktivitas air (renang)", materials: [{ title: "Pengenalan Air", meetings: 2 }, { title: "Gaya Bebas Dasar", meetings: 3 }] },
      { chapter: "Bab 3", title: "Aktivitas kebugaran jasmani", materials: [{ title: "Latihan Kekuatan", meetings: 2 }, { title: "Latihan Kelincahan", meetings: 2 }] },
      { chapter: "Bab 4", title: "Kebersihan dan Kesehatan alat reproduksi", materials: [{ title: "Perawatan Diri", meetings: 2 }, { title: "Menjaga Kebersihan", meetings: 2 }] }
    ]
  },
  "Kelas 5": {
    "Pendidikan Pancasila": [
      { chapter: "Bab 1", title: "Keragaman budaya indonesiaku", materials: [{ title: "Bhinneka Tunggal Ika", meetings: 3 }, { title: "Persatuan dalam Perbedaan", meetings: 2 }] },
      { chapter: "Bab 2", title: "Aku dan lingkungan sekitarku", materials: [{ title: "Interaksi Sosial", meetings: 2 }, { title: "Kewajiban Warga Negara", meetings: 2 }] }
    ],
    "Matematika": [
      { chapter: "Bab 1", title: "Sudut", materials: [{ title: "Jenis Sudut", meetings: 2 }, { title: "Mengukur Sudut", meetings: 2 }] },
      { chapter: "Bab 2", title: "Membandingkan ciri-ciri bangun datar", materials: [{ title: "Sifat Segiempat", meetings: 3 }, { title: "Sifat Segitiga", meetings: 3 }] },
      { chapter: "Bab 3", title: "Data", materials: [{ title: "Membaca Data", meetings: 2 }, { title: "Mengolah Data", meetings: 2 }] },
      { chapter: "Bab 4", title: "Bilangan cacah sampai 1.000.000", materials: [{ title: "Nilai Tempat", meetings: 3 }, { title: "Operasi Hitung", meetings: 3 }] }
    ],
    "Ilmu Pengetahuan Alam dan Sosial (IPAS)": [
      { chapter: "Bab 1", title: "Bagaiman akita hidup dan bertumbuh", materials: [{ title: "Sistem Pernapasan", meetings: 3 }, { title: "Pertumbuhan Manusia", meetings: 2 }] },
      { chapter: "Bab 2", title: "Indonesiaku kaya raya", materials: [{ title: "Sumber Daya Laut", meetings: 2 }, { title: "Hasil Hutan", meetings: 2 }] },
      { chapter: "Bab 3", title: "Daerahku kebanggaanku", materials: [{ title: "Potensi Wisata", meetings: 2 }, { title: "Seni Daerah", meetings: 2 }] },
      { chapter: "Bab 4", title: "Bumiku saying, bumiku malang", materials: [{ title: "Pemanasan Global", meetings: 2 }, { title: "Mitigasi Bencana", meetings: 2 }] }
    ],
    "Bahasa Indonesia": [
      { chapter: "Bab 1", title: "Menjadi warga dunia", materials: [{ title: "Komunikasi Global", meetings: 2 }, { title: "Surat Elektronik", meetings: 2 }] },
      { chapter: "Bab 2", title: "Cinta Indonesia", materials: [{ title: "Pemandangan Alam", meetings: 3 }, { title: "Teks Deskripsi", meetings: 2 }] },
      { chapter: "Bab 3", title: "Sayangi bumi", materials: [{ title: "Reduce, Reuse, Recycle", meetings: 2 }, { title: "Menulis Opini", meetings: 2 }] },
      { chapter: "Bab 4", title: "Bergerak bersama", materials: [{ title: "Aksi Sosial", meetings: 2 }, { title: "Wawancara", meetings: 2 }] }
    ],
    "PJOK": [
      { chapter: "Bab 1", title: "Aktivitas Gerak dominan pada senam", materials: [{ title: "Senam Lantai Dasar", meetings: 2 }, { title: "Keseimbangan", meetings: 2 }] },
      { chapter: "Bab 2", title: "Aktivitas Gerak berirama", materials: [{ title: "Langkah Kaki", meetings: 2 }, { title: "Ayunan Lengan", meetings: 2 }] },
      { chapter: "Bab 3", title: "Renang", materials: [{ title: "Gaya Dada", meetings: 3 }, { title: "Meluncur", meetings: 2 }] },
      { chapter: "Bab 4", title: "Aktivitas kebugaran jasmani", materials: [{ title: "Kelenturan", meetings: 2 }, { title: "Daya Tahan", meetings: 2 }] },
      { chapter: "Bab 5", title: "Cara mencegah bahaya merokok dan minuman keras", materials: [{ title: "Zat Berbahaya", meetings: 2 }, { title: "Pola Hidup Sehat", meetings: 2 }] }
    ]
  },
  "Kelas 6": {
    "Pendidikan Pancasila": [
      { chapter: "Bab 1", title: "Menghormati Perbedaan Budaya dan Agama", materials: [{ title: "Toleransi", meetings: 3 }, { title: "Indahnya Keberagaman", meetings: 2 }] },
      { chapter: "Bab 2", title: "Provinsiku bagian dari wilayah NKRI", materials: [{ title: "Letak Geografis", meetings: 2 }, { title: "Struktur Pemerintahan", meetings: 2 }] },
      { chapter: "Bab 3", title: "Menjaga persatuan dan kesatuan dengan gotong royong", materials: [{ title: "Filosofi Gotong Royong", meetings: 2 }, { title: "Kerjasama Global", meetings: 2 }] }
    ],
    "Matematika": [
      { chapter: "Bab 1", title: "Kubus dan Balok", materials: [{ title: "Volume Bangun Ruang", meetings: 3 }, { title: "Jaring-jaring", meetings: 2 }] },
      { chapter: "Bab 2", title: "Peluang", materials: [{ title: "Kejadian Mungkin", meetings: 2 }, { title: "Percobaan Sederhana", meetings: 2 }] }
    ],
    "Bahasa Indonesia": [
      { chapter: "Bab 1", title: "Anak-anak yang mengubah dunia", materials: [{ title: "Biografi Tokoh", meetings: 2 }, { title: "Menulis Impian", meetings: 2 }] },
      { chapter: "Bab 2", title: "Liburan perpisahan kelas", materials: [{ title: "Membuat Rencana Perjalanan", meetings: 2 }, { title: "Menulis Laporan", meetings: 2 }] },
      { chapter: "Bab 3", title: "Aku bisa berempati", materials: [{ title: "Memahami Perasaan", meetings: 2 }, { title: "Teks Narasi Empati", meetings: 2 }] },
      { chapter: "Bab 4", title: "Aman di Dunia Maya", materials: [{ title: "Etika Berinternet", meetings: 2 }, { title: "Keamanan Data", meetings: 2 }] }
    ],
    "Ilmu Pengetahuan Alam dan Sosial (IPAS)": [
      { chapter: "Bab 1", title: "Bumi dan Antariksa", materials: [{ title: "Sistem Tata Surya", meetings: 3 }, { title: "Gerhana Matahari & Bulan", meetings: 2 }] },
      { chapter: "Bab 2", title: "Krisis Energi", materials: [{ title: "Energi Alternatif", meetings: 2 }, { title: "Hemat Energi", meetings: 2 }] },
      { chapter: "Bab 3", title: "Permasalahan Lingkungan", materials: [{ title: "Pencemaran Tanah & Air", meetings: 2 }, { title: "Efek Rumah Kaca", meetings: 2 }] },
      { chapter: "Bab 4", title: "Proyeksi Akhir IPAS", materials: [{ title: "Pameran Sains", meetings: 4 }] }
    ],
    "PJOK": [
      { chapter: "Bab 1", title: "Gerak dominan senam", materials: [{ title: "Senam Ketangkasan", meetings: 2 }, { title: "Rangkaian Gerak", meetings: 2 }] },
      { chapter: "Bab 2", title: "Gerak berirama", materials: [{ title: "Kombinasi Gerak Dasar", meetings: 2 }, { title: "Formasi Senam", meetings: 2 }] },
      { chapter: "Bab 3", title: "Permainan dan olahraga air (renang)", materials: [{ title: "Gaya Bebas", meetings: 3 }, { title: "Gaya Dada", meetings: 2 }] },
      { chapter: "Bab 4", title: "Kebugaran jasmani untuk Kesehatan", materials: [{ title: "Komposisi Tubuh", meetings: 2 }, { title: "Tes Kebugaran", meetings: 2 }] },
      { chapter: "Bab 5", title: "Mencegah bahaya narkotika, zat adiktif", materials: [{ title: "Penyalahgunaan Narkoba", meetings: 2 }, { title: "Pola Hidup Bersih", meetings: 2 }] }
    ]
  }
};

export const getAITopics = async (subject: string, grade: string, searchQuery?: string): Promise<ChapterInfo[]> => {
  if (!searchQuery && PREDEFINED_CURRICULUM[grade] && PREDEFINED_CURRICULUM[grade][subject]) {
    return PREDEFINED_CURRICULUM[grade][subject];
  }

  const ai = getAI();
  const prompt = searchQuery 
    ? `Sebagai pakar Kurikulum Merdeka Indonesia, berikan rincian Bab dan materi pokok untuk "${searchQuery}" mata pelajaran ${subject} ${grade} SD Semester 2. 
       Wajib sertakan estimasi jumlah pertemuan (tatap muka) yang ideal untuk setiap sub-materi berdasarkan beban kerja Promes (biasanya 1-4 pertemuan).
       Format JSON array of objects.`
    : `Sebagai pakar Kurikulum Merdeka Indonesia, berikan rincian Bab dan Materi Pokok yang SANGAT AKURAT sesuai Silabus/Buku Teks Utama terbaru untuk SEMESTER 2 (GENAP):
       Mata Pelajaran: ${subject}
       Jenjang: SD
       Kelas: ${grade}
       
       Ketentuan:
       1. Hanya berikan materi untuk Semester 2 (Genap).
       2. Harus terbagi per Bab.
       3. WAJIB: Tentukan 'meetings' (jumlah pertemuan) yang ideal untuk setiap materi agar tuntas, sesuai standar Program Semester (Promes). 
       4. Output harus berupa JSON array of objects.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            chapter: { type: Type.STRING, description: "Nomor Bab, misal: Bab 5" },
            title: { type: Type.STRING, description: "Judul Bab" },
            materials: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Judul Materi Pokok" },
                  meetings: { type: Type.INTEGER, description: "Jumlah pertemuan ideal (1-5)" }
                },
                required: ["title", "meetings"]
              },
              description: "Daftar materi pokok dan jumlah pertemuannya"
            }
          },
          required: ["chapter", "title", "materials"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || '[]');
  } catch (e) {
    return [];
  }
};

export const pregenerateCPandTP = async (subject: string, material: string, grade: string) => {
  const ai = getAI();
  const prompt = `Sebagai pakar Kurikulum Merdeka Indonesia versi terbaru (Regulasi No. 12 Tahun 2024), buatkan detail berikut untuk perencanaan pembelajaran:
    Mata Pelajaran: ${subject}
    Materi: ${material}
    Kelas: ${grade} SD (Semester 2)
    
    TUGAS:
    1. Capaian Pembelajaran (CP) yang sesuai dengan Fase (A/B/C) untuk kelas tersebut.
    2. Minimal 3 Tujuan Pembelajaran (TP) yang logis, terukur, dan operasional.
    3. Pilih Dimensi Profil Pelajar Pancasila yang PALING RELEVAN (maksimal 3) dari daftar ini: ${Object.values(GraduateDimension).join(", ")}.
    4. Pilih Praktik Pedagogis yang PALING COCOK dari daftar ini: ${Object.values(PedagogicalPractice).join(", ")}.

    Output dalam format JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          cp: { type: Type.STRING },
          tp: { type: Type.ARRAY, items: { type: Type.STRING } },
          dimensions: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestedPedagogy: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["cp", "tp", "dimensions", "suggestedPedagogy"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const generateProta = async (subject: string, grade: string): Promise<ProtaEntry[]> => {
  const ai = getAI();
  const prompt = `Sebagai pakar Kurikulum Merdeka, buatkan Program Tahunan (PROTA) lengkap untuk mata pelajaran ${subject} kelas ${grade} SD Tahun Pelajaran 2025/2026.
  Hasilkan daftar materi Semester 1 dan 2 dengan alokasi JP yang akurat.
  Output JSON array of objects.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            material: { type: Type.STRING },
            hours: { type: Type.INTEGER },
            semester: { type: Type.INTEGER }
          },
          required: ["material", "hours", "semester"]
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const generatePromes = async (subject: string, grade: string, semester: number): Promise<PromesEntry[]> => {
  const ai = getAI();
  const prompt = `Sebagai pakar kurikulum, buatkan Program Semester (PROMES) Kurikulum Merdeka Semester 2 (Januari-Juni 2026) untuk mata pelajaran ${subject} kelas ${grade} SD.
  Gunakan distribusi materi per minggu (Jan-1, Feb-2, dst).
  Output JSON array of objects.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            material: { type: Type.STRING },
            hours: { type: Type.INTEGER },
            weeks: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["material", "hours", "weeks"]
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const generateLKPD = async (subject: string, grade: string, material: string): Promise<LKPDContent> => {
  const ai = getAI();
  const prompt = `Sebagai pakar Kurikulum Merdeka, buatkan Lembar Kerja Peserta Didik (LKPD) yang menarik untuk:
  Mata Pelajaran: ${subject}
  Kelas: ${grade} SD
  Materi: ${material}
  
  LKPD harus memuat:
  1. Judul LKPD yang menarik.
  2. Tujuan Pembelajaran singkat.
  3. Petunjuk pengerjaan (list).
  4. Daftar Tugas/Aktivitas Eksplorasi dalam bentuk tabel (minimal 5 langkah kegiatan).
  
  Output harus dalam format JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          objective: { type: Type.STRING },
          instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
          tasks: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT,
              properties: {
                no: { type: Type.INTEGER },
                activity: { type: Type.STRING },
                instruction: { type: Type.STRING }
              }
            }
          }
        },
        required: ["title", "objective", "instructions", "tasks"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const generateQuestionBank = async (subject: string, grade: string, material: string): Promise<FormativeQuestion[]> => {
  const ai = getAI();
  const prompt = `Sebagai penulis soal ujian profesional untuk Sekolah Dasar, buatkan BANK SOAL FORMATIF yang terdiri dari **25 BUTIR SOAL** Pilihan Ganda.
  
  Konteks:
  - Mata Pelajaran: ${subject}
  - Kelas: ${grade}
  - Materi: ${material}
  - Kurikulum: Merdeka
  
  Kriteria Soal:
  1. Level Kognitif: Dominan HOTS (C4 - Menganalisis, C5 - Mengevaluasi, C6 - Mencipta).
  2. Soal harus berbasis stimulus (cerita pendek, data, atau situasi kontekstual).
  3. Opsi jawaban (a,b,c,d) harus homogen dan logis.
  4. Berikan kunci jawaban yang benar.
  
  Output WAJIB berupa JSON Array dengan 25 objek soal.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: {
              type: Type.OBJECT,
              properties: { a: { type: Type.STRING }, b: { type: Type.STRING }, c: { type: Type.STRING }, d: { type: Type.STRING } },
              required: ["a", "b", "c", "d"]
            },
            answer: { type: Type.STRING, description: "Kunci jawaban: 'a', 'b', 'c', atau 'd'" }
          },
          required: ["question", "options", "answer"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || '[]');
  } catch (e) {
    return [];
  }
};

export const generateRPMContent = async (formData: RPMFormData): Promise<GeneratedRPMContent> => {
  const ai = getAI();
  const prompt = `
    Buatkan konten otomatis untuk Rencana Pembelajaran Mendalam (RPM) SD Semester 2 Kurikulum Merdeka 2025/2026:
    - Mata Pelajaran: ${formData.subject}
    - Kelas: ${formData.grade}
    - Materi Pokok: ${formData.material}
    - TP: ${formData.tp}
    - Praktik Pedagogis: ${formData.pedagogy.join(", ")}
    - Jumlah Pertemuan: ${formData.meetingCount}
    
    WAJIB:
    - Hasilkan tepat ${formData.meetingCount} objek dalam array "meetings".
    - "students": Identifikasi karakteristik murid yang terbagi menjadi 3 kategori:
       1. Pengetahuan Awal (Prior Knowledge): Apa yang sudah diketahui siswa sebelumnya.
       2. Minat Belajar (Learning Interests): Apa yang menarik bagi siswa terkait materi ini.
       3. Kebutuhan Belajar (Learning Needs): Apa yang dibutuhkan siswa untuk sukses (visual, kinestetik, dsb).
    - "dimensions": Berikan rincian Dimensi Profil Pelajar Pancasila yang dikembangkan (berdasarkan pilihan guru: ${formData.dimensions.join(", ")}). Untuk setiap dimensi, sertakan "elemen" atau "sub-elemen" yang dikembangkan secara spesifik untuk materi ini.
    - "interdisciplinary": Jelaskan bagaimana materi ini dapat dikaitkan dengan disiplin ilmu lain (Lintas Disiplin Ilmu).
    - "digitalTools": Jelaskan pemanfaatan teknologi digital (aplikasi, alat, atau platform) yang digunakan dalam pembelajaran ini.
    - "summary": Buatkan **Ringkasan Materi Ajar** yang SANGAT MENDETAIL, LENGKAP, dan MENARIK untuk siswa SD (setara Buku Teks Paket). 
       * Minimal 300-500 kata. 
       * Jelaskan konsep kunci, definisi istilah, dan fakta penting.
       * Berikan contoh nyata dalam kehidupan sehari-hari (Kontekstual).
       * Gunakan poin-poin atau penomoran agar mudah dibaca.
       * Gunakan format Markdown untuk penekanan teks: **Teks Tebal** untuk kata kunci/poin penting dan *Teks Miring* untuk istilah asing atau penekanan halus.
    - Setiap pertemuan harus memiliki langkah-langkah yang berbeda dan progresif.
    - Format langkah-langkah dalam "steps" HARUS dalam bentuk daftar bernomor susun ke bawah.
    - Bagian assessments (initial, process, final) HARUS rinci (Teknik, Instrumen, Rubrik).
    - "enrichment": Strategi pengayaan untuk siswa yang sudah tuntas.
    - "remedial": Strategi remedial untuk siswa yang belum tuntas.
    - "reflectionTeacher": Pertanyaan refleksi untuk guru.
    - "reflectionStudent": Pertanyaan refleksi untuk siswa.
    - Bagian "FORMATIVEQUESTIONS" harus berisi 20 soal HOTS pilihan ganda unik.
    
    Output JSON.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          students: { 
            type: Type.OBJECT,
            properties: {
              priorKnowledge: { type: Type.STRING },
              interests: { type: Type.STRING },
              needs: { type: Type.STRING }
            },
            required: ["priorKnowledge", "interests", "needs"]
          },
          interdisciplinary: { type: Type.STRING },
          partnership: { type: Type.STRING },
          environment: { type: Type.STRING },
          digitalTools: { type: Type.STRING },
          summary: { type: Type.STRING },
          pedagogy: { type: Type.STRING },
          dimensions: { 
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                dimension: { type: Type.STRING },
                elements: { type: Type.STRING }
              },
              required: ["dimension", "elements"]
            }
          },
          meetings: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                opening: {
                  type: Type.OBJECT,
                  properties: { steps: { type: Type.STRING }, duration: { type: Type.STRING } },
                  required: ["steps", "duration"]
                },
                understand: {
                  type: Type.OBJECT,
                  properties: { type: { type: Type.STRING }, steps: { type: Type.STRING }, duration: { type: Type.STRING } },
                  required: ["type", "steps", "duration"]
                },
                apply: {
                  type: Type.OBJECT,
                  properties: { type: { type: Type.STRING }, steps: { type: Type.STRING }, duration: { type: Type.STRING } },
                  required: ["type", "steps", "duration"]
                },
                reflect: {
                  type: Type.OBJECT,
                  properties: { type: { type: Type.STRING }, steps: { type: Type.STRING }, duration: { type: Type.STRING } },
                  required: ["type", "steps", "duration"]
                },
                closing: {
                  type: Type.OBJECT,
                  properties: { steps: { type: Type.STRING }, duration: { type: Type.STRING } },
                  required: ["steps", "duration"]
                }
              },
              required: ["opening", "understand", "apply", "reflect", "closing"]
            }
          },
          assessments: {
            type: Type.OBJECT,
            properties: {
              initial: {
                type: Type.OBJECT,
                properties: { technique: { type: Type.STRING }, instrument: { type: Type.STRING }, rubric: { type: Type.STRING } },
                required: ["technique", "instrument", "rubric"]
              },
              process: {
                type: Type.OBJECT,
                properties: { technique: { type: Type.STRING }, instrument: { type: Type.STRING }, rubric: { type: Type.STRING } },
                required: ["technique", "instrument", "rubric"]
              },
              final: {
                type: Type.OBJECT,
                properties: { technique: { type: Type.STRING }, instrument: { type: Type.STRING }, rubric: { type: Type.STRING } },
                required: ["technique", "instrument", "rubric"]
              }
            },
            required: ["initial", "process", "final"]
          },
          lkpd: { type: Type.STRING },
          formativeQuestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.OBJECT,
                  properties: { a: { type: Type.STRING }, b: { type: Type.STRING }, c: { type: Type.STRING }, d: { type: Type.STRING } },
                  required: ["a", "b", "c", "d"]
                },
                answer: { type: Type.STRING }
              },
              required: ["question", "options", "answer"]
            }
          },
          enrichment: { type: Type.STRING },
          remedial: { type: Type.STRING },
          reflectionTeacher: { type: Type.STRING },
          reflectionStudent: { type: Type.STRING }
        },
        required: ["students", "interdisciplinary", "partnership", "environment", "digitalTools", "summary", "pedagogy", "dimensions", "meetings", "assessments", "lkpd", "formativeQuestions", "enrichment", "remedial", "reflectionTeacher", "reflectionStudent"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const generateRPMImage = async (material: string): Promise<string | null> => {
  try {
    const ai = getAI();
    const prompt = `Educational illustration for SD students about: "${material}". 
    High quality, vibrant colors, 3D vector style, clean composition. 
    Suitable for a textbook header image. No text in the image.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "16:9" } }
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (error) {
    return null;
  }
};