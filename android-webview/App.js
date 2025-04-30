import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View, ActivityIndicator, BackHandler } from 'react-native';
import { WebView } from 'react-native-webview';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const webViewRef = React.useRef(null);
  
  // 뒤로가기 버튼 처리
  React.useEffect(() => {
    const backAction = () => {
      if (webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#A7D7A7" />
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A7D7A7" />
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ uri: 'https://companion-care-qywqyo51x-bumsol2s-projects.vercel.app' }}
        style={styles.webview}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        allowsBackForwardNavigationGestures={true}
        cacheEnabled={true}
        cacheMode="LOAD_DEFAULT"
        // PWA 설치 배너 숨김
        userAgent="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.0.0 Mobile Safari/537.36"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 1,
  },
});

export default App;
