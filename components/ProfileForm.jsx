'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from './ui/use-toast';
import { getUserProfile, updateUserProfile, uploadProfileImage } from '../lib/supabaseUser';
import { User, Camera, Loader2 } from 'lucide-react';

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * 사용자 프로필 관리 폼 컴포넌트
 */
export default function ProfileForm() {
  // 사용자 정보 상태
  const [user, setUser] = useState(null);
  
  // Supabase 세션 정보 가져오기
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }
    };
    
    getSession();
    
    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  const { toast } = useToast();
  
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    full_name: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // 프로필 정보 가져오기
  useEffect(() => {
    async function fetchProfile() {
      try {
        setIsLoading(true);
        const { profile: profileData, error } = await getUserProfile();
        
        if (error) throw error;
        
        if (profileData) {
          setProfile(profileData);
          setFormData({
            full_name: profileData.full_name || ''
          });
          setPreviewUrl(profileData.avatar_url || '');
        }
      } catch (error) {
        console.error('프로필 정보 가져오기 오류:', error);
        toast({
          title: '프로필 정보 로드 실패',
          description: '프로필 정보를 불러오는 중 오류가 발생했습니다.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchProfile();
  }, [toast]);
  
  // 입력 필드 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // 이미지 선택 핸들러
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // 파일 크기 검증 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: '파일 크기 초과',
        description: '이미지 크기는 5MB 이하여야 합니다.',
        variant: 'destructive',
      });
      return;
    }
    
    // 파일 형식 검증
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: '지원되지 않는 파일 형식',
        description: 'JPG, PNG, GIF, WEBP 형식만 지원합니다.',
        variant: 'destructive',
      });
      return;
    }
    
    setProfileImage(file);
    
    // 미리보기 URL 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  // 이미지 업로드 핸들러
  const handleImageUpload = async () => {
    if (!profileImage) return;
    
    try {
      setIsUploading(true);
      
      const { path, error } = await uploadProfileImage(profileImage);
      
      if (error) throw error;
      
      if (path) {
        // 사용자 메타데이터 업데이트
        const { data, error: updateError } = await supabase.auth.updateUser({
          data: { avatar_url: path }
        });
        
        if (updateError) throw updateError;
        
        toast({
          title: '프로필 이미지 업로드 완료',
          description: '프로필 이미지가 성공적으로 변경되었습니다.',
          variant: 'default',
        });
        
        // 상태 초기화
        setProfileImage(null);
      }
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      toast({
        title: '이미지 업로드 실패',
        description: '프로필 이미지 업로드 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // 프로필 저장 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      
      // 이름이 변경된 경우에만 업데이트
      if (formData.full_name !== profile?.full_name) {
        const { success, error } = await updateUserProfile({
          full_name: formData.full_name
        });
        
        if (error) throw error;
        
        if (success) {
          // 사용자 메타데이터 업데이트
          const { data, error: updateError } = await supabase.auth.updateUser({
            data: { full_name: formData.full_name }
          });
          
          if (updateError) throw updateError;
          
          toast({
            title: '프로필 업데이트 완료',
            description: '프로필 정보가 성공적으로 저장되었습니다.',
            variant: 'default',
          });
        }
      }
      
      // 이미지가 선택된 경우 업로드
      if (profileImage) {
        await handleImageUpload();
      }
    } catch (error) {
      console.error('프로필 저장 오류:', error);
      toast({
        title: '프로필 저장 실패',
        description: '프로필 정보 저장 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // 로딩 상태
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 프로필 이미지 섹션 */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-neutral-100 flex items-center justify-center">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="프로필 이미지"
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              ) : (
                <User className="h-12 w-12 text-neutral-400" />
              )}
            </div>
            <label 
              htmlFor="profile-image" 
              className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
            >
              <Camera className="h-4 w-4" />
              <span className="sr-only">프로필 이미지 변경</span>
            </label>
            <input
              id="profile-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
          
          {profileImage && (
            <div className="text-sm text-neutral-600">
              {profileImage.name} ({Math.round(profileImage.size / 1024)} KB)
            </div>
          )}
        </div>
        
        {/* 이름 입력 필드 */}
        <div className="space-y-2">
          <Label htmlFor="full_name">이름</Label>
          <Input
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="이름을 입력하세요"
            required
          />
        </div>
        
        {/* 이메일 (읽기 전용) */}
        <div className="space-y-2">
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            value={profile?.email || user?.email || ''}
            readOnly
            disabled
            className="bg-neutral-50"
          />
          <p className="text-xs text-neutral-500">이메일은 변경할 수 없습니다.</p>
        </div>
        
        {/* 저장 버튼 */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving || isUploading}>
            {(isSaving || isUploading) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isSaving ? '저장 중...' : '변경사항 저장'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
