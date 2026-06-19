import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import { COLORS } from '../utils/theme';

export default function SimpleChart({ transactions }) {
  // 1. Hitung total pemasukan dan pengeluaran
  let totalIncome = 0;
  let totalExpense = 0;
  const categoryTotals = {};

  transactions.forEach(t => {
    if (t.type === 'income') {
      totalIncome += t.amount;
    } else {
      totalExpense += t.amount;
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    }
  });

  const grandTotal = totalIncome + totalExpense;
  const expensePercentage = grandTotal > 0 ? (totalExpense / grandTotal) * 100 : 0;
  const incomePercentage = grandTotal > 0 ? (totalIncome / grandTotal) * 100 : 0;

  // Konfigurasi SVG Donut
  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  
  // Hitung offset stroke untuk SVG circle
  const expenseStrokeOffset = circumference - (expensePercentage / 100) * circumference;
  const incomeStrokeOffset = circumference - (incomePercentage / 100) * circumference;

  // Dapatkan 3 kategori pengeluaran teratas untuk progress bar
  const sortedCategories = Object.keys(categoryTotals)
    .map(cat => ({ name: cat, amount: categoryTotals[cat] }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  const formatRupiah = (num) => {
    return 'Rp ' + Number(num).toLocaleString('id-ID');
  };

  return (
    <View style={styles.container}>
      {/* Sektor Kiri: Donut Chart SVG */}
      <View style={styles.chartWrapper}>
        <Svg width={140} height={140} viewBox="0 0 140 140">
          <G transform="rotate(-90 70 70)">
            {/* Lingkaran Background Gray */}
            <Circle
              cx="70"
              cy="70"
              r={radius}
              fill="transparent"
              stroke="#1E293B"
              strokeWidth={strokeWidth}
            />
            {grandTotal === 0 ? (
              // Ring Netral jika belum ada data
              <Circle
                cx="70"
                cy="70"
                r={radius}
                fill="transparent"
                stroke={COLORS.textMuted}
                strokeWidth={strokeWidth}
              />
            ) : (
              <>
                {/* Pemasukan Ring (Hijau) */}
                <Circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="transparent"
                  stroke={COLORS.income}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={incomeStrokeOffset}
                  strokeLinecap="round"
                />
                {/* Pengeluaran Ring (Merah) */}
                <Circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="transparent"
                  stroke={COLORS.expense}
                  strokeWidth={strokeWidth - 0.5} // sedikit tipis agar rapi
                  strokeDasharray={circumference}
                  strokeDashoffset={expenseStrokeOffset}
                  strokeLinecap="round"
                  // Putar pengeluaran agar dimulai setelah pemasukan
                  transform={`rotate(${(incomePercentage / 100) * 360} 70 70)`}
                />
              </>
            )}
          </G>
          {/* Teks Saldo Tengah Donut */}
          <SvgText
            x="70"
            y="72"
            textAnchor="middle"
            fill={COLORS.textPrimary}
            fontSize="14"
            fontWeight="bold"
          >
            {grandTotal > 0 ? `${Math.round(incomePercentage)}%` : '0%'}
          </SvgText>
          <SvgText
            x="70"
            y="90"
            textAnchor="middle"
            fill={COLORS.textSecondary}
            fontSize="10"
          >
            Masuk
          </SvgText>
        </Svg>
      </View>

      {/* Sektor Kanan: Legenda dan Kategori Teratas */}
      <View style={styles.legendWrapper}>
        {grandTotal === 0 ? (
          <View style={styles.emptyLegend}>
            <Text style={styles.emptyText}>Belum ada data keuangan untuk divisualisasikan.</Text>
          </View>
        ) : (
          <View style={styles.legendContainer}>
            {/* Label Pemasukan */}
            <View style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: COLORS.income }]} />
              <View style={styles.legendInfo}>
                <Text style={styles.legendLabel}>Pemasukan ({Math.round(incomePercentage)}%)</Text>
                <Text style={styles.legendValue}>{formatRupiah(totalIncome)}</Text>
              </View>
            </View>

            {/* Label Pengeluaran */}
            <View style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: COLORS.expense }]} />
              <View style={styles.legendInfo}>
                <Text style={styles.legendLabel}>Pengeluaran ({Math.round(expensePercentage)}%)</Text>
                <Text style={styles.legendValue}>{formatRupiah(totalExpense)}</Text>
              </View>
            </View>

            {/* Top 3 Kategori Pengeluaran */}
            {sortedCategories.length > 0 && (
              <View style={styles.categoriesSection}>
                <Text style={styles.categoriesTitle}>Pengeluaran Terbesar:</Text>
                {sortedCategories.map((cat, idx) => {
                  const catPct = totalExpense > 0 ? (cat.amount / totalExpense) * 100 : 0;
                  return (
                    <View key={idx} style={styles.catBarWrapper}>
                      <View style={styles.catHeader}>
                        <Text style={styles.catName}>{cat.name}</Text>
                        <Text style={styles.catAmount}>{formatRupiah(cat.amount)}</Text>
                      </View>
                      <View style={styles.track}>
                        <View style={[styles.bar, { width: `${catPct}%` }]} />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  chartWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  legendWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  legendContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyLegend: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
    marginRight: 8,
  },
  legendInfo: {
    flex: 1,
  },
  legendLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  legendValue: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 1,
  },
  categoriesSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    paddingTop: 10,
  },
  categoriesTitle: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  catBarWrapper: {
    marginBottom: 6,
  },
  catHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  catName: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  catAmount: {
    color: COLORS.textPrimary,
    fontSize: 10,
    fontWeight: '600',
  },
  track: {
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 2,
  },
});
