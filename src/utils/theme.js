export const COLORS = {
  background: '#0F172A',     // Slate 900 - Latar belakang utama
  cardBackground: '#1E293B', // Slate 800 - Latar belakang kartu/elemen
  cardBorder: 'rgba(255, 255, 255, 0.08)', // Garis tepi kartu semi-transparan
  
  primary: '#6366F1',        // Indigo 500 - Warna aksen utama
  primaryLight: '#818CF8',   // Indigo 400 - Warna aksen terang (hover/fokus)
  
  income: '#10B981',         // Emerald 500 - Pemasukan
  incomeLight: 'rgba(16, 185, 129, 0.1)', // Emerald 10% - Latar belakang pemasukan
  
  expense: '#F43F5E',        // Rose 500 - Pengeluaran
  expenseLight: 'rgba(244, 63, 94, 0.1)', // Rose 10% - Latar belakang pengeluaran
  
  textPrimary: '#F8FAFC',    // Slate 50 - Teks utama terang
  textSecondary: '#94A3B8',  // Slate 400 - Teks pendukung/abu-abu
  textMuted: '#64748B',      // Slate 500 - Teks redup
  
  border: '#334155',         // Slate 700 - Garis pemisah biasa
  white: '#FFFFFF',
  overlay: 'rgba(15, 23, 42, 0.75)', // Lapisan overlay gelap modal
};

export const FONTS = {
  // Menggunakan font sistem bawaan Android (Roboto/Inter-like) untuk menghemat RAM
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export const SHADOWS = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
};
