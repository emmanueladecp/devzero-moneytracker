import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';

/**
 * Format angka ke bentuk mata uang Rupiah (Rp)
 */
const formatRupiah = (amount) => {
  return 'Rp ' + Number(amount).toLocaleString('id-ID');
};

/**
 * Mengonversi tanggal ISO "YYYY-MM-DD" menjadi "DD MMMM YYYY" versi Indonesia
 */
const formatIndoDate = (dateStr) => {
  if (!dateStr) return '';
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const day = parseInt(parts[2], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const year = parts[0];
  return `${day} ${months[monthIdx]} ${year}`;
};

/**
 * Ekspor transaksi bulanan sebagai file PDF
 * @param {Array} transactions - Daftar transaksi pada bulan tersebut
 * @param {string} monthLabel - Label bulan, misal "Juni 2026"
 * @param {string} userEmail - Email pengguna untuk header laporan
 */
export const exportToPDF = async (transactions, monthLabel, userEmail) => {
  try {
    // 1. Hitung total Pemasukan, Pengeluaran, dan Saldo
    let totalIncome = 0;
    let totalExpense = 0;
    
    transactions.forEach(t => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpense += t.amount;
      }
    });
    
    const balance = totalIncome - totalExpense;

    // 2. Buat baris tabel HTML untuk transaksi
    const rowsHtml = transactions.map((t, idx) => {
      const typeLabel = t.type === 'income' ? 'Pemasukan' : 'Pengeluaran';
      const typeColor = t.type === 'income' ? '#10B981' : '#F43F5E';
      return `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td>${formatIndoDate(t.date)}</td>
          <td><span style="color: ${typeColor}; font-weight: bold;">${typeLabel}</span></td>
          <td>${t.category}</td>
          <td style="text-align: right; font-weight: 500;">${formatRupiah(t.amount)}</td>
          <td>${t.note || '-'}</td>
        </tr>
      `;
    }).join('');

    // 3. Buat kerangka HTML lengkap dengan CSS yang elegan dan modern
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Laporan Keuangan - ${monthLabel}</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1E293B;
            background-color: #FFFFFF;
            padding: 30px;
            margin: 0;
            font-size: 13px;
            line-height: 1.5;
          }
          .header-container {
            border-bottom: 2px solid #E2E8F0;
            padding-bottom: 20px;
            margin-bottom: 25px;
          }
          .header-title {
            font-size: 24px;
            font-weight: bold;
            color: #0F172A;
            margin: 0 0 5px 0;
          }
          .header-subtitle {
            font-size: 14px;
            color: #64748B;
            margin: 0;
          }
          .user-info {
            float: right;
            text-align: right;
            font-size: 12px;
            color: #64748B;
            margin-top: -40px;
          }
          .summary-cards {
            display: table;
            width: 100%;
            margin-bottom: 30px;
            border-spacing: 12px 0;
            margin-left: -12px;
            margin-right: -12px;
          }
          .summary-card {
            display: table-cell;
            width: 33.33%;
            background-color: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 8px;
            padding: 15px;
          }
          .card-title {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748B;
            margin: 0 0 8px 0;
            font-weight: 600;
          }
          .card-value {
            font-size: 18px;
            font-weight: bold;
            margin: 0;
          }
          .income-val { color: #10B981; }
          .expense-val { color: #F43F5E; }
          .balance-val { color: ${balance >= 0 ? '#6366F1' : '#F43F5E'}; }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th {
            background-color: #0F172A;
            color: #FFFFFF;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
            padding: 12px 10px;
            border: 1px solid #0F172A;
          }
          td {
            padding: 10px;
            border-bottom: 1px solid #E2E8F0;
            border-left: 1px solid #E2E8F0;
            border-right: 1px solid #E2E8F0;
          }
          tr:nth-child(even) {
            background-color: #F8FAFC;
          }
          .footer {
            margin-top: 50px;
            font-size: 11px;
            color: #94A3B8;
            text-align: center;
            border-top: 1px dashed #E2E8F0;
            padding-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="header-container">
          <h1 class="header-title">Laporan Keuangan Bulanan</h1>
          <p class="header-subtitle">Periode: <strong>${monthLabel}</strong></p>
          <div class="user-info">
            <p style="margin: 0;">Pengguna: <strong>${userEmail || 'Tamu'}</strong></p>
            <p style="margin: 3px 0 0 0;">Diunduh: ${formatIndoDate(new Date().toISOString().split('T')[0])}</p>
          </div>
        </div>

        <div class="summary-cards">
          <div class="summary-card">
            <p class="card-title">Total Pemasukan</p>
            <p class="card-value income-val">${formatRupiah(totalIncome)}</p>
          </div>
          <div class="summary-card">
            <p class="card-title">Total Pengeluaran</p>
            <p class="card-value expense-val">${formatRupiah(totalExpense)}</p>
          </div>
          <div class="summary-card">
            <p class="card-title">Sisa Saldo</p>
            <p class="card-value balance-val">${formatRupiah(balance)}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 5%; text-align: center;">No</th>
              <th style="width: 18%;">Tanggal</th>
              <th style="width: 15%;">Jenis</th>
              <th style="width: 20%;">Kategori</th>
              <th style="width: 20%; text-align: right;">Nominal</th>
              <th style="width: 22%;">Catatan</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || `<tr><td colspan="6" style="text-align: center; color: #94A3B8; padding: 20px;">Tidak ada data transaksi untuk bulan ini.</td></tr>`}
          </tbody>
        </table>

        <div class="footer">
          <p>Laporan ini dibuat otomatis oleh Aplikasi CatatKeuangan.</p>
        </div>
      </body>
      </html>
    `;

    // 4. Render HTML ke file PDF lokal di Cache Directory
    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    
    // 5. Bagikan file PDF ke sistem Android (Share Sheet / Save File)
    const sanitizedLabel = monthLabel.replace(/\s+/g, '_');
    const destName = `Laporan_Keuangan_${sanitizedLabel}.pdf`;
    
    // Pindahkan ke file yang bernama bagus sebelum dibagikan
    const finalUri = FileSystem.cacheDirectory + destName;
    await FileSystem.moveAsync({
      from: uri,
      to: finalUri
    });

    await shareAsync(finalUri, {
      UTI: '.pdf',
      mimeType: 'application/pdf',
      dialogTitle: `Unduh Laporan PDF ${monthLabel}`
    });

    return true;
  } catch (error) {
    console.error('Gagal mengekspor PDF:', error);
    return false;
  }
};

/**
 * Ekspor transaksi bulanan sebagai file Excel (format CSV yang dioptimalkan untuk Excel)
 * @param {Array} transactions - Daftar transaksi pada bulan tersebut
 * @param {string} monthLabel - Label bulan, misal "Juni 2026"
 */
export const exportToExcel = async (transactions, monthLabel) => {
  try {
    // Menggunakan sep=, di baris pertama memberi tahu Excel versi Windows/Mac untuk menggunakan
    // karakter koma sebagai pembatas kolom, meskipun regional setting komputer adalah Indonesia.
    // Ditambah karakter BOM \uFEFF di depan string agar Excel mendeteksi format UTF-8 dengan benar.
    let csvContent = '\uFEFFsep=,\n';
    
    // Header Kolom
    csvContent += 'No,Tanggal,Jenis Transaksi,Kategori,Nominal (IDR),Catatan\n';
    
    // Isi Baris
    transactions.forEach((t, index) => {
      const typeLabel = t.type === 'income' ? 'Pemasukan' : 'Pengeluaran';
      // Menghindari karakter kutip ganda rusak di CSV dengan meresetnya menjadi double quotes
      const escapedNote = (t.note || '').replace(/"/g, '""');
      
      csvContent += `${index + 1},${t.date},${typeLabel},${t.category},${t.amount},"${escapedNote}"\n`;
    });
    
    // Tambahkan baris total
    let totalIncome = 0;
    let totalExpense = 0;
    transactions.forEach(t => {
      if (t.type === 'income') totalIncome += t.amount;
      else totalExpense += t.amount;
    });
    
    csvContent += `\n,,,,,\n`;
    csvContent += `,,Total Pemasukan,${totalIncome},,\n`;
    csvContent += `,,Total Pengeluaran,${totalExpense},,\n`;
    csvContent += `,,Sisa Saldo,${totalIncome - totalExpense},,\n`;

    // Tentukan jalur file tujuan di folder cache
    const sanitizedLabel = monthLabel.replace(/\s+/g, '_');
    const fileName = `Laporan_Keuangan_${sanitizedLabel}.csv`; // Menggunakan ekstensi CSV agar kompatibel langsung
    const fileUri = FileSystem.cacheDirectory + fileName;
    
    // Tulis ke media penyimpanan lokal cache
    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8
    });
    
    // Bagikan file
    await shareAsync(fileUri, {
      UTI: 'public.comma-separated-values-text',
      mimeType: 'text/csv',
      dialogTitle: `Unduh Laporan Excel ${monthLabel}`
    });
    
    return true;
  } catch (error) {
    console.error('Gagal mengekspor Excel/CSV:', error);
    return false;
  }
};
