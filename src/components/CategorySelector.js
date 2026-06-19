import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { 
  Utensils, 
  Car, 
  ShoppingBag, 
  CreditCard, 
  TrendingUp, 
  Activity, 
  Sparkles, 
  Gift, 
  Briefcase, 
  Coins, 
  HelpCircle 
} from 'lucide-react-native';
import { COLORS } from '../utils/theme';

// Kategori untuk Pemasukan (Income)
const INCOME_CATEGORIES = [
  { name: 'Gaji', icon: TrendingUp },
  { name: 'Bisnis', icon: Briefcase },
  { name: 'Investasi', icon: Coins },
  { name: 'Hadiah', icon: Gift },
  { name: 'Lainnya', icon: HelpCircle },
];

// Kategori untuk Pengeluaran (Expense)
const EXPENSE_CATEGORIES = [
  { name: 'Makanan', icon: Utensils },
  { name: 'Transportasi', icon: Car },
  { name: 'Belanja', icon: ShoppingBag },
  { name: 'Tagihan', icon: CreditCard },
  { name: 'Kesehatan', icon: Activity },
  { name: 'Hiburan', icon: Sparkles },
  { name: 'Lainnya', icon: HelpCircle },
];

export default function CategorySelector({ type, selectedCategory, onSelectCategory }) {
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pilih Kategori</Text>
      <View style={styles.grid}>
        {categories.map((cat, idx) => {
          const IconComponent = cat.icon;
          const isSelected = selectedCategory === cat.name;
          
          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.categoryCard,
                isSelected && styles.selectedCategoryCard
              ]}
              onPress={() => onSelectCategory(cat.name)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.iconWrapper,
                isSelected ? styles.selectedIconWrapper : styles.defaultIconWrapper,
                type === 'income' && isSelected && { backgroundColor: COLORS.incomeLight }
              ]}>
                <IconComponent 
                  size={20} 
                  color={
                    isSelected 
                      ? (type === 'income' ? COLORS.income : COLORS.primaryLight) 
                      : COLORS.textSecondary
                  } 
                />
              </View>
              <Text style={[
                styles.categoryText,
                isSelected && styles.selectedCategoryText
              ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
  },
  title: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  categoryCard: {
    width: '25%', // 4 item per baris
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedCategoryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: COLORS.cardBorder,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  defaultIconWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  selectedIconWrapper: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)', // Indigo background untuk pengeluaran terpilih
  },
  categoryText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    textAlign: 'center',
  },
  selectedCategoryText: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
});
