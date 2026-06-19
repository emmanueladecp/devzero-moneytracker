import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Keyboard
} from 'react-native';
import { ArrowLeftRight, Calendar, Landmark, PenTool } from 'lucide-react-native';
import { COLORS } from '../utils/theme';
import Card from '../components/Card';
import CategorySelector from '../components/CategorySelector';
import { saveTransaction, getUserProfile } from '../utils/storage';

export default function AddTransactionScreen({ onSaveSuccess }) {
  const [type, setType] = useState('expense'); // 'expense' | 'income'
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Makanan');
  const [note, setNote] = useState('');
  
  // Format Tanggal Hari Ini YYYY-MM-DD
  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  
  const [date, setDate] = useState(getTodayDateString());

  // Ubah tipe transaksi dan sesuaikan kategori default-nya
  const handleTypeChange = (newType) => {
    setType(newType);
    setCategory(newType === 'income' ? 'Gaji' : 'Makanan');
  };

  // Simpan catatan transaksi
  const handleSave = async () => {
    Keyboard.dismiss();

    const parsedAmount = parseFloat(amount.replace(/[^0-9]/g, ''));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Data Tidak Valid', 'Silakan masukkan jumlah nominal uang yang valid.');
      return;
    }

    if (!category) {
      Alert.alert('Kategori Kosong', 'Silakan pilih salah satu kategori transaksi.');
      return;
    }

    // Validasi format tanggal YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      Alert.alert('Format Tanggal Salah', 'Gunakan format tanggal YYYY-MM-DD (Contoh: 2026-06-19).');
      return;
    }

    const transaction = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      type,
      amount: parsedAmount,
      category,
      date,
      note: note.trim()
    };

    const profile = await getUserProfile();
    const userId = profile?.email || '';
    const success = await saveTransaction(transaction, userId);
    if (success) {
      // Reset Form
      setAmount('');
      setNote('');
      setDate(getTodayDateString());
      onSaveSuccess();
    } else {
      Alert.alert('Kesalahan', 'Gagal menyimpan transaksi ke memori.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.screenTitle}>Catat Transaksi</Text>
        <Text style={styles.screenSubtitle}>Catat pemasukan atau pengeluaran harian Anda.</Text>

        {/* Pemilih Tipe Transaksi (Pemasukan / Pengeluaran) */}
        <View style={styles.typeSwitcher}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'expense' && styles.activeExpenseButton
            ]}
            onPress={() => handleTypeChange('expense')}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.typeButtonText,
              type === 'expense' && styles.activeTypeText
            ]}>
              Pengeluaran
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'income' && styles.activeIncomeButton
            ]}
            onPress={() => handleTypeChange('income')}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.typeButtonText,
              type === 'income' && styles.activeTypeText
            ]}>
              Pemasukan
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Isi Data */}
        <Card style={styles.card}>
          {/* Input Nominal Uang */}
          <Text style={styles.inputLabel}>Nominal Uang (Rp)</Text>
          <View style={styles.amountInputWrapper}>
            <Text style={styles.rpPrefix}>Rp</Text>
            <TextInput
              style={[
                styles.amountInput, 
                type === 'income' ? styles.amountIncome : styles.amountExpense
              ]}
              placeholder="0"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
              value={amount}
              onChangeText={(text) => {
                // Hanya izinkan angka
                const numeric = text.replace(/[^0-9]/g, '');
                // Format ribuan
                const formatted = numeric ? Number(numeric).toLocaleString('id-ID') : '';
                setAmount(formatted);
              }}
            />
          </View>

          {/* Pemilih Kategori */}
          <CategorySelector 
            type={type} 
            selectedCategory={category} 
            onSelectCategory={setCategory} 
          />

          {/* Tanggal Transaksi */}
          <Text style={styles.inputLabel}>Tanggal Transaksi (YYYY-MM-DD)</Text>
          <View style={styles.inputWrapper}>
            <Calendar size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              value={date}
              onChangeText={setDate}
              placeholder="Contoh: 2026-06-19"
              placeholderTextColor={COLORS.textMuted}
              autoCorrect={false}
            />
          </View>

          {/* Catatan Tambahan */}
          <Text style={styles.inputLabel}>Catatan / Keterangan</Text>
          <View style={styles.inputWrapper}>
            <PenTool size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              value={note}
              onChangeText={setNote}
              placeholder="Contoh: Makan siang di warung padang"
              placeholderTextColor={COLORS.textMuted}
              maxLength={60}
            />
          </View>

          {/* Tombol Simpan */}
          <TouchableOpacity 
            style={[
              styles.saveButton,
              type === 'income' ? { backgroundColor: COLORS.income } : { backgroundColor: COLORS.expense }
            ]} 
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Simpan Transaksi</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  screenTitle: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 12,
  },
  screenSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 20,
  },
  typeSwitcher: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 4,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeExpenseButton: {
    backgroundColor: COLORS.expense,
  },
  activeIncomeButton: {
    backgroundColor: COLORS.income,
  },
  typeButtonText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: 'bold',
  },
  activeTypeText: {
    color: COLORS.white,
  },
  card: {
    padding: 20,
  },
  inputLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
    marginBottom: 20,
    paddingBottom: 6,
  },
  rpPrefix: {
    color: COLORS.textSecondary,
    fontSize: 22,
    fontWeight: 'bold',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: 'bold',
  },
  amountIncome: {
    color: COLORS.income,
  },
  amountExpense: {
    color: COLORS.expense,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 20,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  saveButton: {
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: 'bold',
  },
});
