/* eslint-disable react-native/no-inline-styles */
import React, { useEffect } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import ScreenHeader from '../../components/ScreenHeader';
import { StackNames } from '../../constants/StackNames';
import { Download } from 'lucide-react-native';

const PdfPreview = ({ navigation, route }: any) => {
  const { invoiceNo, invoiceUri } = route.params || {};

  useEffect(() => {
    if (invoiceNo) {
      navigation.setOptions({
        title: `Invoice [${invoiceNo}]`,
      });
    }
  }, [invoiceNo, navigation]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScreenHeader title={StackNames.InvoiceScreen} navigation={navigation} >
        <TouchableOpacity><Download size={20} color="#333" /></TouchableOpacity>
      </ScreenHeader>
      <View style={{ flex: 1, marginTop: 20 }}>
        <WebView
          style={styles.webview}
          source={{ uri: Platform.OS === 'android' ? `https://drive.google.com/viewerng/viewer?embedded=true&url=${invoiceUri}` : invoiceUri }}
          scalesPageToFit={true}
          automaticallyAdjustContentInsets={true}
          injectedJavaScript={`
                const meta = document.createElement('meta'); 
                meta.setAttribute('name', 'viewport'); 
                meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=yes'); 
                document.getElementsByTagName('head')[0].appendChild(meta);
                true;
            `}
        />
      </View>
    </SafeAreaView>
  );
};

export default PdfPreview;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
  },
});