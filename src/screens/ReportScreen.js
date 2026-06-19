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
  FileText, 
  FileSpreadsheet, 
  Printer, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Download 
} from 'lucide-react-native';
import { COLORS } from '../utils/theme';
import Card from '../components/Card';
import { getActiveMonths, getTransactionsForMonth } from '../utils/storage';
import { exportToPDF, exportToExcel } from '../utils/exportHelper';

export default function ReportScreen({ userProfile }) {
  const [activeMonths, setActiveMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(''); // format: "YYYY-MM"
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Muat daftar bulan yang memiliki data transaksi
  const loadActiveMonths = async () => {
    setIsLoading(true);
    const months = await getActiveMonths(userProfile.email);
    setActiveMonths(months);
    if (months.length > 0) {
      setSelectedMonth(months[0]); // Default bulan pertama (terbaru)
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadActiveMonths();
  }, []);

  // Muat transaksi untuk bulan yang dipilih
  useEffect(() => {
    if (selectedMonth) {
      loadTransactionsForSelectedMonth();
    } else {
      setTransactions([]);
    }
  }, [selectedMonth]);

  const loadTransactionsForSelectedMonth = async () => {
    const [year, month] = selectedMonth.split('-');
    const data = await getTransactionsForMonth(parseInt(year, 10), parseInt(month, 10), userProfile.email);
    setTransactions(data);
  };

  // Label nama bulan Indonesia (misal: "Juni 2026")
  const getMonthLabel = (monthStr) => {
    if (!monthStr) return '';
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const parts = monthStr.split('-');
    const idx = parseInt(parts[1], 10) - 1;
    return `${months[idx]} ${parts[0]}`;
  };

  // Ekspor PDF
  const handleExportPDF = async () => {
    if (transactions.length === 0) {
      Alert.alert('Data Kosong', 'Tidak ada transaksi untuk diekspor pada bulan ini.');
      return;
    }
    setIsExporting(true);
    const success = await exportToPDF(
      transactions, 
      getMonthLabel(selectedMonth), 
      userProfile.email
    );
    setIsExporting(false);
    if (!success) {
      Alert.alert('Gagal', 'Terjadi kesalahan saat menghasilkan laporan PDF.');
    }
  };

  // Ekspor Excel (CSV)
  const handleExportExcel = async () => {
    if (transactions.length === 0) {
      Alert.alert('Data Kosong', 'Tidak ada transaksi untuk diekspor pada bulan ini.');
      return;
    }
    setIsExporting(true);
    const success = await exportToExcel(
      transactions, 
      getMonthLabel(selectedMonth)
    );
    setIsExporting(false);
    if (!success) {
      Alert.alert('Gagal', 'Terjadi kesalahan saat menghasilkan laporan Excel.');
    }
  };

  // Hitung akumulasi
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
      <Text style={styles.screenTitle}>Unduh Laporan</Text>
      <Text style={styles.screenSubtitle}>Pilih periode bulanan untuk menghasilkan laporan PDF atau Excel.</Text>

      {isLoading ? (
        <View style={styles.centerWrapper}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      ) : activeMonths.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <FileText size={48} color={COLORS.textMuted} style={{ marginBottom: 12 }} />
          <Text style={styles.emptyText}>Belum ada data transaksi.</Text>
          <Text style={styles.emptySubtext}>Lakukan pencatatan pengeluaran atau pemasukan terlebih dahulu untuk membuat laporan bulanan.</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {/* List Pemilih Bulan Horizontal */}
          <Text style={styles.sectionLabel}>Pilih Bulan Laporan</Text>
          <View style={styles.carouselContainer}>
            <FlatList
              horizontal
              data={activeMonths}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = selectedMonth === item;
                return (
                  <TouchableOpacity
                    style={[
                      styles.monthTab,
                      isSelected && styles.selectedMonthTab
                    ]}
                    onPress={() => setSelectedMonth(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.monthTabText,
                      isSelected && styles.selectedMonthTabText
                    ]}>
                      {getMonthLabel(item)}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            />
          </View>

          {/* Pratinjau Ringkasan Bulan Terpilih */}
          <View style={{ paddingHorizontal: 20 }}>
            <Card style={styles.previewCard}>
              <Text style={styles.previewTitle}>Pratinjau Keuangan {getMonthLabel(selectedMonth)}</Text>
              
              <View style={styles.previewRow}>
                <View style={styles.previewCol}>
                  <View style={styles.statHeader}>
                    <ArrowUpRight size={14} color={COLORS.income} style={{ marginRight: 4 }} />
                    <Text style={styles.statLabel}>Total Pemasukan</Text>
                  </View>
                  <Text style={[styles.statValue, { color: COLORS.income }]}>{formatRupiah(totalIncome)}</Text>
                </View>

                <View style={styles.previewCol}>
                  <View style={styles.statHeader}>
                    <ArrowDownLeft size={14} color={COLORS.expense} style={{ marginRight: 4 }} />
                    <Text style={styles.statLabel}>Total Pengeluaran</Text>
                  </View>
                  <Text style={[styles.statValue, { color: COLORS.expense }]}>{formatRupiah(totalExpense)}</Text>
                </View>
              </View>

              <View style={styles.previewDivider} />

              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>Sisa Saldo Bersih</Text>
                <Text style={[
                  styles.balanceValue, 
                  { color: balance >= 0 ? COLORS.primaryLight : COLORS.expense }
                ]}>
                  {balance >= 0 ? '' : '-'}{formatRupiah(Math.abs(balance))}
                </Text>
              </View>
              
              <Text style={styles.totalTxText}>Total catatan: {transactions.length} transaksi</Text>
            </Card>

            {/* Tombol Ekspor */}
            {isExporting ? (
              <View style={styles.exportingWrapper}>
                <ActivityIndicator size="small" color={COLORS.primary} style={{ marginRight: 10 }} />
                <Text style={styles.exportingText}>Menyiapkan berkas laporan...</Text>
              </View>
            ) : (
              <View style={styles.buttonsContainer}>
                {/* Ekspor ke PDF */}
                <TouchableOpacity 
                  style={[styles.exportButton, styles.pdfButton]}
                  onPress={handleExportPDF}
                  activeOpacity={0.8}
                >
                  <Printer size={20} color={COLORS.white} style={{ marginRight: 8 }} />
                  <View>
                    <Text style={styles.btnTitle}>Laporan PDF</Text>
                    <Text style={styles.btnDesc}>Cetak dokumen rapi</Text>
                  </View>
                </TouchableOpacity>

                {/* Ekspor ke Excel */}
                <TouchableOpacity 
                  style={[styles.exportButton, styles.excelButton]}
                  onPress={handleExportExcel}
                  activeOpacity={0.8}
                >
                  <FileSpreadsheet size={20} color={COLORS.white} style={{ marginRight: 8 }} />
                  <View>
                    <Text style={styles.btnTitle}>Laporan XLS</Text>
                    <Text style={styles.btnDesc}>Kompatibel Excel</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 16,
  },
  screenTitle: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: 'bold',
    paddingHorizontal: 20,
  },
  screenSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  centerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  emptySubtext: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  carouselContainer: {
    height: 48,
    marginBottom: 20,
  },
  monthTab: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 24,
    paddingHorizontal: 16,
    justifyContent: 'center',
    marginRight: 10,
    height: 38,
  },
  selectedMonthTab: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  monthTabText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  selectedMonthTabText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  previewCard: {
    padding: 20,
    marginBottom: 20,
  },
  previewTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  previewRow: {
    flexDirection: 'row',
  },
  previewCol: {
    flex: 1,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalTxText: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 12,
    fontStyle: 'italic',
  },
  exportingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    height: 52,
  },
  exportingText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  pdfButton: {
    backgroundColor: COLORS.primary,
    marginRight: 10,
  },
  excelButton: {
    backgroundColor: COLORS.income,
  },
  btnTitle: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: 'bold',
  },
  btnDesc: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 9,
    marginTop: 1,
  },
});
