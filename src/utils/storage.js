import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Mensanitasi email/ID pengguna menjadi prefix kunci yang aman
 * Contoh: "test.user@gmail.com" -> "test_user_gmail_com_"
 */
const getUserPrefix = (userId) => {
  if (!userId) return '';
  return `${userId.replace(/[^a-zA-Z0-9]/g, '_')}_`;
};

/**
 * Mendapatkan kunci penyimpanan transaksi berdasarkan format tanggal (YYYY-MM-DD) dan ID Pengguna
 * @param {string} dateString - Contoh: "2026-06-19"
 * @param {string} userId - Email atau ID unik user
 * @returns {string} - Contoh: "test_user_gmail_com_transactions_2026_06"
 */
const getMonthKeyFromDate = (dateString, userId) => {
  const parts = dateString.split('-'); // ["2026", "06", "19"]
  const prefix = getUserPrefix(userId);
  return `${prefix}transactions_${parts[0]}_${parts[1]}`;
};

/**
 * Mendapatkan kunci bulan langsung dari tahun, bulan, dan ID Pengguna
 */
const getMonthKey = (year, month, userId) => {
  const paddedMonth = String(month).padStart(2, '0');
  const prefix = getUserPrefix(userId);
  return `${prefix}transactions_${year}_${paddedMonth}`;
};

/**
 * Memuat transaksi untuk bulan dan tahun tertentu ke RAM (Khusus Pengguna Tertentu)
 */
export const getTransactionsForMonth = async (year, month, userId) => {
  try {
    const key = getMonthKey(year, month, userId);
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Gagal mengambil data transaksi bulanan:', error);
    return [];
  }
};

/**
 * Menambahkan atau memperbarui transaksi (Khusus Pengguna Tertentu)
 */
export const saveTransaction = async (transaction, userId) => {
  try {
    const key = getMonthKeyFromDate(transaction.date, userId);
    const monthId = transaction.date.substring(0, 7); // "YYYY-MM"
    
    // 1. Ambil transaksi bulan tersebut yang sudah ada
    const existingData = await AsyncStorage.getItem(key);
    let transactions = existingData ? JSON.parse(existingData) : [];
    
    // 2. Cek apakah ini update atau insert baru
    const index = transactions.findIndex(t => t.id === transaction.id);
    if (index > -1) {
      transactions[index] = transaction; // Update
    } else {
      transactions.unshift(transaction); // Insert di awal daftar (terbaru dahulu)
    }
    
    // 3. Simpan kembali ke AsyncStorage dengan isolasi user
    await AsyncStorage.setItem(key, JSON.stringify(transactions));
    
    // 4. Update daftar bulan aktif (untuk menu filter)
    await registerActiveMonth(monthId, userId);
    
    return true;
  } catch (error) {
    console.error('Gagal menyimpan transaksi:', error);
    return false;
  }
};

/**
 * Menghapus transaksi (Khusus Pengguna Tertentu)
 */
export const deleteTransaction = async (id, dateString, userId) => {
  try {
    const key = getMonthKeyFromDate(dateString, userId);
    const monthId = dateString.substring(0, 7);
    
    const existingData = await AsyncStorage.getItem(key);
    if (!existingData) return false;
    
    let transactions = JSON.parse(existingData);
    transactions = transactions.filter(t => t.id !== id);
    
    if (transactions.length === 0) {
      // Jika kosong, hapus kunci dari AsyncStorage
      await AsyncStorage.removeItem(key);
      await unregisterActiveMonth(monthId, userId);
    } else {
      await AsyncStorage.setItem(key, JSON.stringify(transactions));
    }
    
    return true;
  } catch (error) {
    console.error('Gagal menghapus transaksi:', error);
    return false;
  }
};

/**
 * Mendaftarkan bulan baru ke daftar bulan aktif (Khusus Pengguna Tertentu)
 */
const registerActiveMonth = async (monthId, userId) => {
  try {
    const key = `${getUserPrefix(userId)}active_months`;
    const activeMonthsData = await AsyncStorage.getItem(key);
    let activeMonths = activeMonthsData ? JSON.parse(activeMonthsData) : [];
    
    if (!activeMonths.includes(monthId)) {
      activeMonths.push(monthId);
      // Urutkan menurun agar bulan terbaru berada di paling atas
      activeMonths.sort((a, b) => b.localeCompare(a));
      await AsyncStorage.setItem(key, JSON.stringify(activeMonths));
    }
  } catch (error) {
    console.error('Gagal mendaftarkan bulan aktif:', error);
  }
};

/**
 * Menghapus bulan dari daftar aktif jika sudah tidak ada transaksi (Khusus Pengguna Tertentu)
 */
const unregisterActiveMonth = async (monthId, userId) => {
  try {
    const key = `${getUserPrefix(userId)}active_months`;
    const activeMonthsData = await AsyncStorage.getItem(key);
    if (!activeMonthsData) return;
    
    let activeMonths = JSON.parse(activeMonthsData);
    activeMonths = activeMonths.filter(m => m !== monthId);
    await AsyncStorage.setItem(key, JSON.stringify(activeMonths));
  } catch (error) {
    console.error('Gagal menghapus bulan aktif:', error);
  }
};

/**
 * Mendapatkan daftar bulan yang memiliki transaksi milik user (misal: ["2026-06", "2026-05"])
 */
export const getActiveMonths = async (userId) => {
  try {
    const key = `${getUserPrefix(userId)}active_months`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Gagal mengambil daftar bulan aktif:', error);
    return [];
  }
};

/**
 * Menyimpan profil sesi pengguna saat ini setelah berhasil Login/Daftar
 */
export const saveUserProfile = async (profile) => {
  try {
    await AsyncStorage.setItem('user_profile', JSON.stringify(profile));
    return true;
  } catch (error) {
    console.error('Gagal menyimpan profil pengguna:', error);
    return false;
  }
};

/**
 * Mengambil data profil sesi pengguna aktif saat ini
 */
export const getUserProfile = async () => {
  try {
    const data = await AsyncStorage.getItem('user_profile');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Gagal mengambil profil pengguna:', error);
    return null;
  }
};

/**
 * Menghapus data sesi pengguna (Logout)
 */
export const clearUserSession = async () => {
  try {
    await AsyncStorage.removeItem('user_profile');
    return true;
  } catch (error) {
    console.error('Gagal menghapus sesi pengguna:', error);
    return false;
  }
};

/**
 * Mendaftarkan akun pengguna lokal (Email + Password)
 * Menolak registrasi bila email sudah terdaftar sebelumnya.
 */
export const registerLocalUser = async (name, email, password) => {
  try {
    const data = await AsyncStorage.getItem('registered_users');
    const users = data ? JSON.parse(data) : [];
    
    const userExists = users.some(u => u.email === email);
    if (userExists) {
      return { success: false, message: 'Email sudah terdaftar. Silakan login.' };
    }
    
    users.push({ name, email, password });
    await AsyncStorage.setItem('registered_users', JSON.stringify(users));
    return { success: true };
  } catch (error) {
    console.error('Gagal registrasi user lokal:', error);
    return { success: false, message: 'Terjadi kesalahan sistem saat mendaftar.' };
  }
};

/**
 * Melakukan autentikasi masuk (Login) pengguna lokal
 */
export const loginLocalUser = async (email, password) => {
  try {
    const data = await AsyncStorage.getItem('registered_users');
    const users = data ? JSON.parse(data) : [];
    
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      return { 
        success: true, 
        user: { name: user.name, email: user.email, isSandbox: false } 
      };
    }
    return { success: false, message: 'Email atau password salah.' };
  } catch (error) {
    console.error('Gagal login user lokal:', error);
    return { success: false, message: 'Terjadi kesalahan sistem saat masuk.' };
  }
};

/**
 * Menghapus total data (Hapus semua data di AsyncStorage)
 */
export const clearAllData = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    await AsyncStorage.multiRemove(keys);
    return true;
  } catch (error) {
    console.error('Gagal membersihkan seluruh data:', error);
    return false;
  }
};
