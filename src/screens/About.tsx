import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import ScreenHeader from '../components/ScreenHeader';
import { StackNames } from '../constants/StackNames';
import { Colors } from '../constants/Colors';

const About = ({ navigation }: any) => {

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <ScreenHeader
                title={StackNames.AboutUs}
                navigation={navigation}
            />
            <WebView
                source={{ uri: 'https://screwplus.in/about' }}
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
        </SafeAreaView>
    );
};

export default About;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.StatusBarBg,
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