// app/auth/page.jsx
import LoginButton from '../../components/LoginButton'; // 상대경로 맞추세요

export default function AuthPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Companion Care</h1>
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <LoginButton />
        
        <p className="mt-4 text-center text-sm text-neutral-500">
          로그인하면 Companion Care의 <a href="#" className="text-primary-600 hover:underline">이용약관</a>과 <a href="#" className="text-primary-600 hover:underline">개인정보처리방침</a>에 동의하게 됩니다.
        </p>
      </div>
    </div>
  );
}
