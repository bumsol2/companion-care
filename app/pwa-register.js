'use client';

import { useEffect } from 'react';

export function PWARegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // PWA 서비스 워커 등록 로그
      console.log('PWA 지원이 활성화되었습니다.');
      
      // 서비스 워커 등록 - 페이지 로드 완료 후 바로 실행
      if (document.readyState === 'complete') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
      }
      
      // beforeinstallprompt 이벤트 리스너 추가
      window.addEventListener('beforeinstallprompt', (e) => {
        // 설치 프롬프트 이벤트 발생
        console.log('PWA 설치 프롬프트가 발생했습니다!', e);
        // 이벤트를 저장하여 나중에 사용할 수 있음
        window.deferredPrompt = e;
        
        // 자동 프롬프트 표시는 브라우저 정책상 허용되지 않음
        // 사용자는 window.triggerInstall() 함수를 호출하거나 UI 버튼을 통해 설치해야 함
        console.log('PWA 설치 준비 완료: 사용자 제스처로 설치 가능');
        
        // 설치 가능함을 알리는 UI 표시 로직을 여기에 추가할 수 있음
        // 예: showInstallButton();

      });
      
      // 설치 완료 이벤트 리스너
      window.addEventListener('appinstalled', (e) => {
        console.log('PWA가 성공적으로 설치되었습니다!', e);
        // 설치 프롬프트 참조 제거
        window.deferredPrompt = null;
      });
    } else {
      console.log('ServiceWorker 지원이 없습니다.');
    }
    
    // 수동 설치 테스트를 위한 전역 함수 등록
    window.triggerInstall = function() {
      if (window.deferredPrompt) {
        window.deferredPrompt.prompt();
        console.log('설치 프롬프트가 표시되었습니다.');
        return true;
      } else {
        console.log('설치 프롬프트가 없습니다. PWA 설치 조건이 충족되지 않았거나 이미 설치되었습니다.');
        return false;
      }
    };
  }, []);
  
  function registerSW() {
    // 기존 서비스 워커 등록 해제 후 새로 등록
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (let registration of registrations) {
        registration.unregister().then(boolean => {
          console.log('기존 서비스 워커 등록 해제:', boolean);
        });
      }
      
      // 새 서비스 워커 등록
      setTimeout(() => {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
          .then((registration) => {
            console.log('서비스 워커 등록 성공:', registration.scope);
            // 서비스 워커 상태 확인
            if (registration.installing) {
              console.log('서비스 워커 설치 중');
            } else if (registration.waiting) {
              console.log('서비스 워커 대기 중');
            } else if (registration.active) {
              console.log('서비스 워커 활성화됨');
            }
          })
          .catch((err) => {
            console.error('서비스 워커 등록 실패:', err);
          });
      }, 1000);
    });
  }

  return null;
}

export default PWARegister;
