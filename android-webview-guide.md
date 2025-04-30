# Companion Care Android WebView 앱 구현 가이드

이 가이드는 Companion Care 웹앱을 Android WebView로 감싸서 Play Store에 배포 가능한 APK 파일을 생성하는 방법을 설명합니다.

## 사전 요구사항

- 웹앱(PWA) 완성 및 HTTPS 배포 완료 (ex. Vercel)
- Android Studio 설치
- Java 17 이상 설치

## 1. React Native 프로젝트 생성

```bash
# 새 디렉토리 생성
mkdir CompanionCareApp
cd CompanionCareApp

# React Native 프로젝트 초기화 (Android만 타겟)
npx react-native init CompanionCareApp --template react-native-template-typescript
```

## 2. 필요한 패키지 설치

```bash
# 프로젝트 디렉토리로 이동
cd CompanionCareApp

# WebView 패키지 설치
npm install react-native-webview

# Splash Screen 패키지 설치
npm install react-native-splash-screen
```

## 3. App.tsx 수정 (WebView 연결)

`App.tsx` 파일을 다음과 같이 수정합니다:

```typescript
import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import SplashScreen from 'react-native-splash-screen';

// 배포된 웹앱 URL (실제 배포 URL로 변경 필요)
const WEB_APP_URL = 'https://your-companion-care.vercel.app';

const App = () => {
  useEffect(() => {
    // 1초 후 스플래시 화면 숨기기
    const timer = setTimeout(() => {
      SplashScreen.hide();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // PWA 설치 배너 숨기기 위한 스크립트
  const INJECTED_JAVASCRIPT = `
    (function() {
      // PWA 설치 배너 숨기기
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        return false;
      });
      
      // 모바일 앱에서 실행 중임을 알리는 플래그 설정
      window.isNativeApp = true;
    })();
  `;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#A7D7A7" />
      <WebView
        source={{ uri: WEB_APP_URL }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        mixedContentMode="always"
        cacheEnabled={true}
        thirdPartyCookiesEnabled={true}
        injectedJavaScript={INJECTED_JAVASCRIPT}
        onMessage={(event) => {
          console.log('Message from WebView:', event.nativeEvent.data);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A7D7A7',
  },
  webview: {
    flex: 1,
  },
});

export default App;
```

## 4. AndroidManifest.xml 수정

`android/app/src/main/AndroidManifest.xml` 파일을 다음과 같이 수정합니다:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- 인터넷 접근 권한 -->
    <uses-permission android:name="android.permission.INTERNET" />
    <!-- 파일 업로드를 위한 권한 -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.CAMERA" />

    <application
      android:name=".MainApplication"
      android:label="@string/app_name"
      android:icon="@mipmap/ic_launcher"
      android:roundIcon="@mipmap/ic_launcher_round"
      android:allowBackup="false"
      android:theme="@style/AppTheme"
      android:usesCleartextTraffic="true">
      <activity
        android:name=".MainActivity"
        android:label="@string/app_name"
        android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode"
        android:launchMode="singleTask"
        android:windowSoftInputMode="adjustResize"
        android:exported="true"
        android:screenOrientation="portrait">
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent-filter>
      </activity>
    </application>
</manifest>
```

## 5. Splash Screen 설정

### 5.1 MainActivity.java 수정

`android/app/src/main/java/com/companioncare/MainActivity.java` 파일을 다음과 같이 수정합니다:

```java
package com.companioncare;

import android.os.Bundle;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import org.devio.rn.splashscreen.SplashScreen;

public class MainActivity extends ReactActivity {

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    SplashScreen.show(this);  // 스플래시 화면 표시
    super.onCreate(savedInstanceState);
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "CompanionCareApp";
  }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util class {@link
   * DefaultReactActivityDelegate} which allows you to easily enable Fabric and Concurrent React
   * (aka React 18) with two boolean flags.
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new DefaultReactActivityDelegate(
        this,
        getMainComponentName(),
        // If you opted-in for the New Architecture, we enable the Fabric Renderer.
        DefaultNewArchitectureEntryPoint.getFabricEnabled());
  }
}
```

### 5.2 스플래시 화면 레이아웃 생성

`android/app/src/main/res/layout/launch_screen.xml` 파일을 생성합니다:

```xml
<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#A7D7A7">

    <ImageView
        android:layout_width="120dp"
        android:layout_height="120dp"
        android:layout_centerInParent="true"
        android:src="@mipmap/ic_launcher" />

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_alignParentBottom="true"
        android:layout_centerHorizontal="true"
        android:layout_marginBottom="24dp"
        android:text="Companion Care"
        android:textColor="#FFFFFF"
        android:textSize="18sp"
        android:textStyle="bold" />
</RelativeLayout>
```

## 6. 앱 아이콘 교체

Companion Care 앱 아이콘을 Android 앱 아이콘으로 설정하기 위해, 기존 PWA용 아이콘을 다양한 크기로 변환하여 `android/app/src/main/res/mipmap-*` 폴더에 넣습니다.

기존 PWA 아이콘은 `public/icons/` 폴더에 있습니다. 이 아이콘을 다음 크기로 변환하여 Android 앱에 사용합니다:
- mipmap-mdpi: 48x48 px
- mipmap-hdpi: 72x72 px
- mipmap-xhdpi: 96x96 px
- mipmap-xxhdpi: 144x144 px
- mipmap-xxxhdpi: 192x192 px

## 7. build.gradle 설정

`android/app/build.gradle` 파일에서 SDK 버전을 설정합니다:

```gradle
android {
    compileSdkVersion 34
    defaultConfig {
        applicationId "com.companioncare"
        minSdkVersion 24
        targetSdkVersion 34
        versionCode 1
        versionName "1.0"
    }
    // ...
}
```

## 8. APK 빌드

프로젝트 루트 디렉토리에서 다음 명령어를 실행하여 APK를 빌드합니다:

```bash
cd android
./gradlew assembleRelease
```

빌드된 APK는 `android/app/build/outputs/apk/release/app-release.apk` 경로에 생성됩니다.

## 9. Google Play Console 등록 준비

1. Google Play Console 계정 생성 (아직 없는 경우)
2. 새 앱 등록
3. 앱 정보 입력 (이름, 설명, 스크린샷 등)
4. 내부 테스트 트랙 설정
5. 빌드된 APK 업로드

## 주요 고려사항

1. **WebView 설정**: 파일 접근, 캐시 사용, JavaScript 활성화 등 필요한 모든 설정을 포함했습니다.
2. **권한 설정**: 인터넷 접근, 파일 접근 등 필요한 권한을 추가했습니다.
3. **화면 방향**: `screenOrientation="portrait"`으로 세로 모드 고정했습니다.
4. **SDK 버전**: 최소 SDK 24 (Android 7.0), 타겟 SDK 34 (Android 14)로 설정했습니다.
5. **Splash Screen**: 1초 이내 대기 시간으로 설정했습니다.
6. **PWA 설치 배너**: JavaScript 주입을 통해 숨김 처리했습니다.

## 참고 사항

- 실제 URL은 배포된 Companion Care 웹앱의 URL로 변경해야 합니다.
- 앱 아이콘은 Companion Care의 브랜드 아이덴티티에 맞게 제작해야 합니다.
- 앱 이름과 패키지 이름은 필요에 따라 변경할 수 있습니다.
