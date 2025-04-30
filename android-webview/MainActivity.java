package com.companioncare;

import android.app.Activity;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;

public class MainActivity extends Activity {
    private WebView webView;
    private ProgressBar progressBar;
    private String webAppUrl = "https://companion-care.vercel.app"; // 배포된 웹앱 URL

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        progressBar = findViewById(R.id.progressBar);
        webView = findViewById(R.id.webView);
        
        // WebView 설정
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
        webSettings.setAppCacheEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setLoadWithOverviewMode(true);
        webSettings.setUseWideViewPort(true);
        
        // ServiceWorker 지원 활성화 (PWA 지원)
        webSettings.setMediaPlaybackRequiresUserGesture(false);
        
        // WebViewClient 설정
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                // 페이지 로딩 완료 시 프로그레스바 숨김
                progressBar.setVisibility(View.GONE);
                super.onPageFinished(view, url);
            }
        });
        
        // PWA 설치 배너 숨김
        webView.evaluateJavascript(
            "window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); });",
            null
        );
        
        // 웹앱 로드
        webView.loadUrl(webAppUrl);
    }

    // 뒤로가기 버튼 처리
    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}
