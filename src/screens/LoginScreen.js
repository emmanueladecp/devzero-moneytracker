import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  StatusBar
} from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { Mail, ShieldAlert } from 'lucide-react-native';
import { COLORS } from '../utils/theme';
import Card from '../components/Card';
import { saveUserProfile } from '../utils/storage';

export default function LoginScreen({ onLoginSuccess }) {
  const [sandboxEmail, setSandboxEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Inisialisasi Google Sign-In sekali saja di tingkat root layar
    try {
      GoogleSignin.configure({
        // webClientId diisi jika menggunakan server OAuth, kosong untuk basic profile
        offlineAccess: false,
      });
    } catch (e) {
      console.warn('Google Sign-In tidak dapat dikonfigurasi pada perangkat ini:', e);
    }
  }, []);

  // Alur Login Resmi Google
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      const userProfile = {
        name: userInfo.user.name,
        email: userInfo.user.email,
        photo: userInfo.user.photo,
        id: userInfo.user.id,
        isSandbox: false
      };

      await saveUserProfile(userProfile);
      setIsLoading(false);
      onLoginSuccess(userProfile);
    } catch (error) {
      setIsLoading(false);
      console.log('Google Login Error:', error);
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('Masuk Dibatalkan', 'Proses masuk dibatalkan oleh pengguna.');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('Proses Sedang Berjalan', 'Proses masuk sedang dilakukan.');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Google Play Services', 'Layanan Google Play tidak tersedia atau kedaluwarsa.');
      } else {
        // Fallback untuk perangkat emulator/pengujian yang belum mendaftarkan SHA-1
        Alert.alert(
          'Konfigurasi Kunci Diperlukan',
          'Login Google SDK memerlukan pendaftaran SHA-1 Keystore di Google Developer Console.\n\nSilakan gunakan "Developer Sandbox" di bawah untuk masuk menggunakan Gmail Anda secara langsung!',
          [{ text: 'Mengerti' }]
        );
      }
    }
  };

  // Alur Login Sandbox (Sangat penting untuk pengujian dan review instan!)
  const handleSandboxLogin = async () => {
    if (!sandboxEmail.trim()) {
      Alert.alert('Email Diperlukan', 'Silakan masukkan alamat Gmail Anda.');
      return;
    }

    const trimmedEmail = sandboxEmail.trim().toLowerCase();
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|googlemail\.com)$/;

    if (!gmailRegex.test(trimmedEmail)) {
      Alert.alert('Alamat Email Tidak Valid', 'Wajib menggunakan alamat email Google Mail (@gmail.com atau @googlemail.com).');
      return;
    }

    setIsLoading(false);
    
    // Ekstrak nama panggilan dari email
    const prefix = trimmedEmail.split('@')[0];
    const formattedName = prefix
      .split(/[._-]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const sandboxProfile = {
      name: formattedName,
      email: trimmedEmail,
      photo: null,
      id: 'sandbox_' + Date.now(),
      isSandbox: true
    };

    await saveUserProfile(sandboxProfile);
    onLoginSuccess(sandboxProfile);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        
        {/* Desain Logo Premium */}
        <View style={styles.logoSection}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>$</Text>
          </View>
          <Text style={styles.logoText}>CatatKeuangan</Text>
          <Text style={styles.slogan}>Kelola pemasukan dan pengeluaran secara cerdas, aman, & hemat memori.</Text>
        </View>

        {/* Form Login Kartu Glassmorphic */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Silakan Masuk</Text>
          <Text style={styles.cardSubtitle}>Mulai kelola catatan uang masuk dan keluar Anda.</Text>

          {/* Tombol Google Resmi */}
          <TouchableOpacity 
            style={[styles.buttonGoogle, isLoading && styles.buttonDisabled]} 
            onPress={handleGoogleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <View style={styles.buttonIconWrapper}>
              <Text style={styles.googleIconChar}>G</Text>
            </View>
            <Text style={styles.buttonGoogleText}>Masuk dengan Google</Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ATAU DEVELOPER SANDBOX</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Fallback Sandbox Mode */}
          <View style={styles.sandboxContainer}>
            <View style={styles.sandboxHeader}>
              <ShieldAlert size={16} color={COLORS.primaryLight} style={{ marginRight: 6 }} />
              <Text style={styles.sandboxTitle}>Sandbox Mode (Uji Instan)</Text>
            </View>
            <Text style={styles.sandboxDesc}>
              Bagi peninjau/tester, masukkan email Gmail Anda di bawah ini untuk melewati batasan kredensial Google Play Services.
            </Text>

            <View style={styles.inputWrapper}>
              <Mail size={16} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="nama.anda@gmail.com"
                placeholderTextColor={COLORS.textMuted}
                value={sandboxEmail}
                onChangeText={setSandboxEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity 
              style={styles.buttonSandbox} 
              onPress={handleSandboxLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonSandboxText}>Masuk Mode Sandbox</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Text style={styles.footerText}>Minimum Android 6.0 Marshmallow (API 23)</Text>
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
    justifyContent: 'center',
    padding: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoIcon: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: 'bold',
  },
  logoText: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  slogan: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  card: {
    padding: 24,
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
  },
  buttonGoogle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonIconWrapper: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  googleIconChar: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EA4335', // Google Red
  },
  buttonGoogleText: {
    color: '#1E293B',
    fontSize: 15,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: 'bold',
    marginHorizontal: 10,
    letterSpacing: 1,
  },
  sandboxContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  sandboxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sandboxTitle: {
    color: COLORS.primaryLight,
    fontSize: 12,
    fontWeight: 'bold',
  },
  sandboxDesc: {
    color: COLORS.textSecondary,
    fontSize: 10,
    lineHeight: 14,
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 10,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  buttonSandbox: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonSandboxText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 24,
  },
});
