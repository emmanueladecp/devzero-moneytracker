import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { LayoutDashboard, PlusCircle, FileDown } from 'lucide-react-native';
import { COLORS } from './src/utils/theme';
import { getUserProfile } from './src/utils/storage';

// Impor Layar Aplikasi
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AddTransactionScreen from './src/screens/AddTransactionScreen';
import ReportScreen from './src/screens/ReportScreen';

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [currentTab, setCurrentTab] = useState(0); // 0: Ringkasan, 1: Tambah, 2: Laporan
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Digunakan untuk mereset komponen saat data diubah

  // Memeriksa sesi pengguna saat aplikasi pertama kali dimuat
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const profile = await getUserProfile();
        if (profile) {
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Gagal memeriksa sesi pengguna:', error);
      } finally {
        setAppReady(true);
      }
    };
    checkUserSession();
  }, []);

  const handleLoginSuccess = (profile) => {
    setUserProfile(profile);
    setCurrentTab(0); // Arahkan langsung ke Dashboard setelah masuk
  };

  const handleLogout = () => {
    setUserProfile(null);
    setCurrentTab(0);
  };

  const handleSaveSuccess = () => {
    // Bump refresh trigger untuk memastikan data terbaru terambil
    setRefreshTrigger(prev => prev + 1);
    // Kembalikan ke halaman dashboard setelah sukses menyimpan
    setCurrentTab(0);
  };

  // Navigasi Tab Sederhana (Screen Switcher) untuk Menghemat Memori
  const renderActiveScreen = () => {
    switch (currentTab) {
      case 0:
        return (
          <DashboardScreen 
            userProfile={userProfile} 
            onLogout={handleLogout} 
            navigateToTab={setCurrentTab} 
            key={`dashboard_${refreshTrigger}`} 
          />
        );
      case 1:
        return (
          <AddTransactionScreen 
            onSaveSuccess={handleSaveSuccess} 
          />
        );
      case 2:
        return (
          <ReportScreen 
            userProfile={userProfile} 
            key={`report_${refreshTrigger}`} 
          />
        );
      default:
        return <View style={styles.center}><Text>Halaman Tidak Ditemukan</Text></View>;
    }
  };

  // Tampilkan layar loading saat memeriksa sesi
  if (!appReady) {
    return (
      <View style={styles.loadingScreen}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Jika belum masuk, tampilkan layar login
  if (!userProfile) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      </SafeAreaView>
    );
  }

  // Tampilan utama setelah masuk dengan navigasi tab
  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Area Konten Utama */}
      <View style={styles.mainContent}>
        {renderActiveScreen()}
      </View>

      {/* Navigasi Tab Bar Bawah */}
      <View style={styles.tabBar}>
        {/* Tab 0: Ringkasan */}
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => setCurrentTab(0)}
          activeOpacity={0.8}
        >
          <LayoutDashboard 
            size={20} 
            color={currentTab === 0 ? COLORS.primaryLight : COLORS.textSecondary} 
          />
          <Text style={[
            styles.tabLabel, 
            currentTab === 0 ? styles.activeTabLabel : styles.inactiveTabLabel
          ]}>
            Ringkasan
          </Text>
        </TouchableOpacity>

        {/* Tab 1: Tambah Transaksi */}
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => setCurrentTab(1)}
          activeOpacity={0.8}
        >
          <PlusCircle 
            size={20} 
            color={currentTab === 1 ? COLORS.primaryLight : COLORS.textSecondary} 
          />
          <Text style={[
            styles.tabLabel, 
            currentTab === 1 ? styles.activeTabLabel : styles.inactiveTabLabel
          ]}>
            Catat Uang
          </Text>
        </TouchableOpacity>

        {/* Tab 2: Laporan */}
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => setCurrentTab(2)}
          activeOpacity={0.8}
        >
          <FileDown 
            size={20} 
            color={currentTab === 2 ? COLORS.primaryLight : COLORS.textSecondary} 
          />
          <Text style={[
            styles.tabLabel, 
            currentTab === 2 ? styles.activeTabLabel : styles.inactiveTabLabel
          ]}>
            Laporan
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  mainContent: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: COLORS.cardBackground,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: Platform.OS === 'ios' ? 10 : 0, // Padding ekstra untuk iOS notch
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 9,
    marginTop: 4,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: COLORS.primaryLight,
    fontWeight: 'bold',
  },
  inactiveTabLabel: {
    color: COLORS.textSecondary,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
