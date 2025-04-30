-- Supabase 마이그레이션 파일
-- Companion Care 앱을 위한 데이터베이스 스키마 정의

-- 사용자 테이블 확장 (Supabase Auth와 연동)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  locale TEXT DEFAULT 'ko-KR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 반려 생물 테이블
CREATE TABLE IF NOT EXISTS public.pets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('plant', 'pet')),
  breed TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 케어 일정 테이블
CREATE TABLE IF NOT EXISTS public.cares (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pet_id UUID REFERENCES public.pets(id) NOT NULL,
  care_type TEXT NOT NULL,
  cycle_days INTEGER NOT NULL,
  next_date DATE NOT NULL,
  last_completed DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_pets_user_id ON public.pets(user_id);
CREATE INDEX IF NOT EXISTS idx_cares_pet_id ON public.cares(pet_id);
CREATE INDEX IF NOT EXISTS idx_cares_next_date ON public.cares(next_date);

-- Row Level Security (RLS) 설정
-- 모든 테이블에 대한 RLS 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cares ENABLE ROW LEVEL SECURITY;

-- 사용자 테이블 정책: 사용자는 자신의 데이터만 볼 수 있음
CREATE POLICY users_policy ON public.users
  FOR ALL USING (auth.uid() = id);

-- 반려 생물 테이블 정책: 사용자는 자신의 반려 생물만 볼 수 있음
CREATE POLICY pets_policy ON public.pets
  FOR ALL USING (auth.uid() = user_id);

-- 케어 일정 테이블 정책: 사용자는 자신의 반려 생물에 대한 케어 일정만 볼 수 있음
CREATE POLICY cares_policy ON public.cares
  FOR ALL USING (
    pet_id IN (
      SELECT id FROM public.pets WHERE user_id = auth.uid()
    )
  );

-- 트리거 함수: 사용자 생성 시 자동으로 users 테이블에 추가
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 설정
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 트리거 함수: 케어 완료 시 다음 일정 자동 계산
CREATE OR REPLACE FUNCTION public.update_next_care_date()
RETURNS TRIGGER AS $$
BEGIN
  -- 완료일 업데이트
  NEW.last_completed = CURRENT_DATE;
  -- 다음 일정 계산
  NEW.next_date = CURRENT_DATE + (NEW.cycle_days * INTERVAL '1 day');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 설정
CREATE TRIGGER on_care_completed
  BEFORE UPDATE ON public.cares
  FOR EACH ROW
  WHEN (OLD.last_completed IS DISTINCT FROM NEW.last_completed)
  EXECUTE FUNCTION public.update_next_care_date();
