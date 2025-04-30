'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { getUserProfile, updateNotificationSettings } from '@/lib/supabaseUser';

/**
 * 알림 설정 토글 컴포넌트
 */
export default function NotificationToggle() {
  const { toast } = useToast();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // 사용자 알림 설정 가져오기
  useEffect(() => {
    async function fetchNotificationSettings() {
      try {
        setIsLoading(true);
        const { profile, error } = await getUserProfile();
        
        if (error) throw error;
        
        if (profile) {
          setIsEnabled(profile.notifications_enabled || false);
        }
      } catch (error) {
        console.error('알림 설정 가져오기 오류:', error);
        toast({
          title: '알림 설정 로드 실패',
          description: '알림 설정을 불러오는 중 오류가 발생했습니다.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchNotificationSettings();
  }, [toast]);
  
  // 알림 설정 변경 핸들러
  const handleToggleChange = async (checked) => {
    try {
      setIsSaving(true);
      
      const { success, error } = await updateNotificationSettings(checked);
      
      if (error) throw error;
      
      if (success) {
        setIsEnabled(checked);
        
        toast({
          title: '알림 설정 변경 완료',
          description: checked 
            ? '이메일 알림이 활성화되었습니다.' 
            : '이메일 알림이 비활성화되었습니다.',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('알림 설정 변경 오류:', error);
      toast({
        title: '알림 설정 변경 실패',
        description: '알림 설정을 변경하는 중 오류가 발생했습니다.',
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
        <div className="flex justify-center items-center h-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              {isEnabled ? (
                <Bell className="h-5 w-5 text-primary" />
              ) : (
                <BellOff className="h-5 w-5 text-neutral-400" />
              )}
              <Label htmlFor="notifications" className="text-lg font-medium">이메일 알림</Label>
            </div>
            <p className="text-sm text-neutral-500">
              케어 일정 알림을 이메일로 받아보세요.
            </p>
          </div>
          
          <div className="flex items-center">
            {isSaving && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-neutral-400" />
            )}
            <Switch
              id="notifications"
              checked={isEnabled}
              onCheckedChange={handleToggleChange}
              disabled={isSaving}
            />
          </div>
        </div>
        
        <div className="border-t border-neutral-200 pt-4">
          <h3 className="text-sm font-medium mb-2">알림 종류</h3>
          <ul className="space-y-2 text-sm text-neutral-600">
            <li className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-primary' : 'bg-neutral-300'}`}></div>
              <span>케어 일정 하루 전 알림</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-primary' : 'bg-neutral-300'}`}></div>
              <span>케어 일정 당일 알림</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-primary' : 'bg-neutral-300'}`}></div>
              <span>지난 케어 일정 알림</span>
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
