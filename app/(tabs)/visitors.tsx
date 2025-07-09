import { View, Text, Button, Share, Linking, Alert, TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
let message_hindi = "📣 बने के निहोरा हे!\n" +
  " आप मन ला आमंत्रित करत हन CBN - छत्तीसगढ़ बिजनेस नेटवर्क के एक खास मीटिंग म, जिहां व्यवसायी मन मिलथें, सींखथें अउ एक दूसर ला मदद करथें।\n" +
  "🗓 तारीख: [तारीख डारव]\n" +
  " 🕘 टाइम: [टाइम डारव]\n" +
  " 📍 जगह: [जगह डारव]\n" +
  " 💰 फीस: ₹500 (नास्ता समेते)\n" +
  "ए मीटिंग म आप मन ला मिलही:\n" +
  " ✅ दूसर व्यवसायी संग जान-पहिचान\n" +
  " ✅ अपन व्यवसाय के प्रस्तुती के मौका\n" +
  " ✅ रेफरल ले व्यापार बढ़ाय के तरीका\n" +
  " ✅ नवा बात सींखे के मौका\n" +
  "सीट सीमित हे!\n" +
  " कृपा करके अपन आवक के पक्का जानकारी देवव – [मोबाइल नंबर डारव] म कॉल करके या एही मेसेज म रिप्लाय करके।\n" +
  "CBN – लोकल व्यापार, सबले मजबूत संग\n" +
  " चलव, अपन छत्तीसगढ़ के व्यवसाय ला एक संगे आगे बढ़ावन।";

let message_eng = "📣 You're Invited!\n" +
  " Join us for an exciting CBN - Chhattisgarh Business Network meeting where entrepreneurs and professionals connect, collaborate, and grow together!\n" +
  "🗓 Date: [Insert Date]\n" +
  " 🕘 Time: [Insert Time]\n" +
  " 📍 Venue: [Insert Venue Name & Address]\n" +
  " 💰 Meeting Fee: ₹500 (Including Breakfast)\n" +
  "This is a great opportunity to:\n" +
  " ✅ Network with like-minded business owners\n" +
  " ✅ Present your business to potential referrers";

const Visitors = () => {
  const shareLink = async (platform: string) => {

    let url = "https://example.com"; // Replace with the actual link you want to share

    try {
      await Share.share({
        message: platform === 'whatsapp' ? `WhatsApp: ${message_hindi} ${url}` :
          platform === 'sms' ? `SMS: ${message_hindi} ${url}` :
            `Invite: ${message_hindi} ${url}`,
      });
    } catch (error: any) {
      console.log(error.message);
    }
  };
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Invite For Meeting</Text>
      <View style={styles.buttonGrid}>

        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={{
              backgroundColor: '#25D366', // WhatsApp brand color
              padding: 15,
              borderRadius: 8,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center'
            }}
            onPress={async () => {
              const whatsappUrl = "whatsapp://send?text=" + message_hindi;
              try {
                const canOpen = await Linking.canOpenURL(whatsappUrl);
                if (canOpen) {
                  await Linking.openURL(whatsappUrl);
                } else {
                  Alert.alert('Error', 'WhatsApp is not installed on your device');
                }
              } catch (error) {
                console.error('Error opening WhatsApp:', error);
              }
            }}
          >
            <Ionicons name="logo-whatsapp" size={24} color="white" />
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
              Share via WhatsApp (CG)
            </Text>
          </TouchableOpacity>
        </View>


        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={{
              backgroundColor: '#25D366', // WhatsApp brand color
              padding: 15,
              borderRadius: 8,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center'
            }}
            onPress={async () => {
              const whatsappUrl = "whatsapp://send?text=" + message_eng;
              try {
                const canOpen = await Linking.canOpenURL(whatsappUrl);
                if (canOpen) {
                  await Linking.openURL(whatsappUrl);
                } else {
                  Alert.alert('Error', 'WhatsApp is not installed on your device');
                }
              } catch (error) {
                console.error('Error opening WhatsApp:', error);
              }
            }}
          >
            <Ionicons name="logo-whatsapp" size={24} color="white" />
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
              Share via WhatsApp (English)
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={{
              backgroundColor: '#d50606', // primary color from your theme
              padding: 15,
              borderRadius: 8,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 10
            }}
            onPress={async () => {
              const subject = "Invitation to CBN Meeting";
              const body = encodeURIComponent(message_eng);
              const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${body}`;

              try {
                const canOpen = await Linking.canOpenURL(mailtoUrl);
                if (canOpen) {
                  await Linking.openURL(mailtoUrl);
                } else {
                  Alert.alert('Error', 'No email client is installed on your device');
                }
              } catch (error) {
                console.error('Error opening email client:', error);
              }
            }}
          >
            <Ionicons name="mail" size={24} color="white" />
            <Text className="flex items-center justify-center" style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
              Share on Email
            </Text>
          </TouchableOpacity >
        </View>

      <Text style={{fontSize:24,fontWeight:'bold',textAlign:'center', paddingBottom:10}} >Or</Text>

        <View style={styles.buttonWrapper}>
          <TouchableOpacity style={{
              backgroundColor: 'darkgreen', // primary color from your theme
              padding: 15,
              borderRadius: 8,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 10
            }} 
            onPress={()=> router.navigate('/forms/visitor')}
            >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Register Visitor</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonGrid: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  buttonWrapper: {
    borderRadius: 40,
    width: '100%',
    marginBottom: 20,
  },
});

export default Visitors