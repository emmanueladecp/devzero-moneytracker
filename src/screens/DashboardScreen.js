import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp 
} from 'lucide-react-native';
import { COLORS } from '../utils/theme';
import Card from '../components/Card';
import TransactionItem from '../components/TransactionItem';
import SimpleChart from '../components/SimpleChart';
import { getTransactionsForMonth, deleteTransaction, clearUserSession } from '../utils/storage';

export default function DashboardScreen({ userProfile, onLogout, navigateToTab }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Format label bulan saat ini (misal: "Juni 2026")
  const getMonthLabel = (date) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const loadMonthlyData = async () => {
    setIsLoading(true);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // 1-indexed
    const data = await getTransactionsForMonth(year, month, userProfile.email);
    setTransactions(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadMonthlyData();
  }, [currentDate]);

  // Handler Ganti Bulan (Mundur)
  const prevMonth = () => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  // Handler Ganti Bulan (Maju)
  const nextMonth = () => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  // Handler Hapus Transaksi
  const handleDeleteTransaction = async (id, dateString) => {
    const success = await deleteTransaction(id, dateString, userProfile.email);
    if (success) {
      loadMonthlyData();
    } else {
      Alert.alert('Gagal', 'Terjadi kesalahan saat menghapus transaksi.');
    }
  };

  // Handler Logout
  const handleLogoutPress = () => {
    Alert.alert(
      'Keluar Aplikasi',
      'Apakah Anda yakin ingin keluar dari akun Anda?',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Keluar', 
          style: 'destructive', 
          onPress: async () => {
            await clearUserSession();
            onLogout();
          } 
        }
      ]
    );
  };

  // Hitung akumulasi bulanan
  let totalIncome = 0;
  let totalExpense = 0;
  transactions.forEach(t => {
    if (t.type === 'income') totalIncome += t.amount;
    else totalExpense += t.amount;
  });
  const balance = totalIncome - totalExpense;

  const formatRupiah = (num) => {
    return 'Rp ' + Number(num).toLocaleString('id-ID');
  };

  return (
    <View style={styles.container}>
      {/* Bagian Header Utama */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={styles.profileText}>
            <Text style={styles.welcomeText}>Halo, selamat datang</Text>
            <Text style={styles.userName}>{userProfile.name || 'Pengguna'}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogoutPress}
          activeOpacity={0.7}
        >
          <LogOut size={18} color={COLORS.expense} />
        </TouchableOpacity>
      </View>

      {/* Bagian Switcher Bulan (Pengendali Rentang) */}
      <View style={styles.monthSelector}>
        <TouchableOpacity style={styles.arrowButton} onPress={prevMonth}>
          <ChevronLeft size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{getMonthLabel(currentDate)}</Text>
        <TouchableOpacity style={styles.arrowButton} onPress={nextMonth}>
          <ChevronRight size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Konten Scrollable menggunakan FlatList */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionItem item={item} onDelete={handleDeleteTransaction} />
        )}
        ListHeaderComponent={
          <>
            {/* Kartu Ringkasan Saldo Bulanan */}
            <Card style={styles.balanceCard}>
              <Text style={styles.balanceTitle}>Total Saldo Bulan Ini</Text>
              <Text style={[styles.balanceValue, balance < 0 && { color: COLORS.expense }]}>
                {balance >= 0 ? '' : '-'}{formatRupiah(Math.abs(balance))}
              </Text>
              
              <View style={styles.rowFlow}>
                {/* Kolom Pemasukan */}
                <View style={styles.flowCol}>
                  <View style={[styles.flowIconBadge, { backgroundColor: COLORS.incomeLight }]}>
                    <ArrowUpRight size={16} color={COLORS.income} />
                  </View>
                  <View>
                    <Text style={styles.flowLabel}>Pemasukan</Text>
                    <Text style={styles.flowValue}>{formatRupiah(totalIncome)}</Text>
                  </View>
                </View>

                <View style={styles.flowDivider} />

                {/* Kolom Pengeluaran */}
                <View style={styles.flowCol}>
                  <View style={[styles.flowIconBadge, { backgroundColor: 'rgba(244, 63, 94, 0.1)' }]}>
                    <ArrowDownLeft size={16} color={COLORS.expense} />
                  </View>
                  <View>
                    <Text style={styles.flowLabel}>Pengeluaran</Text>
                    <Text style={styles.flowValue}>{formatRupiah(totalExpense)}</Text>
                  </View>
                </View>
              </View>
            </Card>

            {/* Kartu Visualisasi Donut/Kategori */}
            <Card style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <TrendingUp size={16} color={COLORS.primaryLight} style={{ marginRight: 6 }} />
                <Text style={styles.chartTitle}>Aliran Kas & Distribusi</Text>
              </View>
              <SimpleChart transactions={transactions} />
            </Card>

            {/* Sub-header daftar riwayat */}
            <Text style={styles.historyTitle}>Riwayat Transaksi</Text>
          </>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingWrapper}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          ) : (
            <View style={styles.emptyWrapper}>
              <Text style={styles.emptyText}>Tidak ada transaksi di bulan ini.</Text>
              <TouchableOpacity 
                style={styles.emptyAddButton} 
                onPress={() => navigateToTab(1)}
              >
                <Text style={styles.emptyAddText}>Catat Transaksi Pertama</Text>
              </TouchableOpacity>
            </View>
          )
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button (FAB) untuk menambah transaksi */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigateToTab(1)}
        activeOpacity={0.8}
      >
        <Plus size={24} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  profileText: {
    justifyContent: 'center',
  },
  welcomeText: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
  userName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(244, 63, 94, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.1)',
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  arrowButton: {
    padding: 6,
  },
  monthLabel: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 90, // Beri jarak agar tidak tertutup FAB/Tab
  },
  balanceCard: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  balanceTitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    textAlign: 'center',
  },
  balanceValue: {
    color: COLORS.income,
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  rowFlow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flowCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  flowIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  flowLabel: {
    color: COLORS.textSecondary,
    fontSize: 9,
  },
  flowValue: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 1,
  },
  flowDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
    marginHorizontal: 12,
  },
  chartCard: {
    padding: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: 'bold',
  },
  historyTitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loadingWrapper: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyWrapper: {
    paddingVertical: 36,
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 20,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyAddButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  emptyAddText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
});
