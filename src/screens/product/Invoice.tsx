import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

const PdfPreview = ({ navigation, route }: any) => {
  // ✅ get params from route
  const { invoiceNo, invoiceUri } = route.params || {};

  useEffect(() => {
    if (invoiceNo) {
      navigation.setOptions({
        title: `Invoice [${invoiceNo}]`,
      });
    }
  }, [invoiceNo, navigation]);

  return (
    <View style={styles.container}>
      <>
        {
          Platform.OS === 'android' ? (
            <WebView
              source={{ uri: `https://drive.google.com/viewerng/viewer?embedded=true&url=${invoiceUri}` }}
              style={styles.webview}
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
          ) : Platform.OS === 'ios' ? (
            <WebView
              source={{ uri: invoiceUri }}
              style={styles.webview}
            />
          ) : null
        }
      </>

    </View>
  );
};

export default PdfPreview;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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