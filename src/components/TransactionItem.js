import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { 
  Utensils, 
  Car, 
  ShoppingBag, 
  CreditCard, 
  TrendingUp, 
  Activity, 
  Sparkles, 
  HelpCircle, 
  Trash2 
} from 'lucide-react-native';
import { COLORS } from '../utils/theme';

// Map kategori ke ikon Lucide
const getCategoryIcon = (category, type) => {
  const iconProps = { size: 20, color: COLORS.textPrimary };
  
  if (type === 'income') {
    return <TrendingUp {...iconProps} color={COLORS.income} />;
  }

  switch (category) {
    case 'Makanan':
    case 'Minuman':
      return <Utensils {...iconProps} />;
    case 'Transportasi':
      return <Car {...iconProps} />;
    case 'Belanja':
      return <ShoppingBag {...iconProps} />;
    case 'Tagihan':
      return <CreditCard {...iconProps} />;
    case 'Kesehatan':
      return <Activity {...iconProps} />;
    case 'Hiburan':
      return <Sparkles {...iconProps} />;
    default:
      return <HelpCircle {...iconProps} />;
  }
};

export default function TransactionItem({ item, onDelete }) {
  const { id, type, amount, category, date, note } = item;
  const isIncome = type === 'income';

  const formatRupiah = (num) => {
    return 'Rp ' + Number(num).toLocaleString('id-ID');
  };

  const handleDeletePress = () => {
    Alert.alert(
      'Hapus Transaksi',
      'Apakah Anda yakin ingin menghapus catatan transaksi ini?',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Hapus', 
          style: 'destructive', 
          onPress: () => onDelete(id, date) 
        }
      ]
    );
  };

  // Memotong teks catatan jika terlalu panjang
  const truncatedNote = note && note.length > 28 ? note.substring(0, 25) + '...' : note;

  // Format tanggal singkat (DD/MM)
  const dateParts = date.split('-');
  const shortDate = `${dateParts[2]}/${dateParts[1]}`;

  return (
    <View style={styles.container}>
      {/* Kolom Kiri: Ikon Kategori */}
      <View style={[styles.iconWrapper, isIncome ? styles.incomeIconWrapper : styles.expenseIconWrapper]}>
        {getCategoryIcon(category, type)}
      </View>

      {/* Kolom Tengah: Info Kategori & Catatan */}
      <View style={styles.details}>
        <Text style={styles.categoryText}>{category}</Text>
        {note ? <Text style={styles.noteText}>{truncatedNote}</Text> : null}
        <Text style={styles.dateText}>{shortDate}</Text>
      </View>

      {/* Kolom Kanan: Nominal dan Tombol Hapus */}
      <View style={styles.rightAction}>
        <Text style={[styles.amountText, isIncome ? styles.incomeText : styles.expenseText]}>
          {isIncome ? '+' : '-'} {formatRupiah(amount)}
        </Text>
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={handleDeletePress}
          activeOpacity={0.7}
        >
          <Trash2 size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  incomeIconWrapper: {
    backgroundColor: COLORS.incomeLight,
  },
  expenseIconWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  categoryText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  noteText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  dateText: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  rightAction: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 10,
  },
  incomeText: {
    color: COLORS.income,
  },
  expenseText: {
    color: COLORS.expense,
  },
  deleteButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
});
