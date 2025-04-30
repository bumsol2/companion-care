import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ArrowRight, Leaf, Bell } from 'lucide-react';

export default function DesignSystem() {
  return (
    <main className="min-h-screen p-8 md:p-12 lg:p-24">
      <div className="max-w-5xl mx-auto">
        <h1 className="mb-8">Companion Care 디자인 시스템</h1>
        
        <section className="mb-12">
          <h2 className="mb-4">타이포그래피</h2>
          <div className="grid gap-4 p-6 border rounded-lg bg-neutral-50">
            <div>
              <h1>Display - 700/48</h1>
              <p className="text-neutral-600">반려 케어, 놓치지 마세요</p>
            </div>
            <div>
              <h2>Heading 1 - 600/32</h2>
              <p className="text-neutral-600">매일 6시 알림으로 안심하세요</p>
            </div>
            <div>
              <h3>Heading 2 - 600/24</h3>
              <p className="text-neutral-600">반려식물과 반려동물을 위한 케어 알림</p>
            </div>
            <div>
              <h4>Heading 3 - 600/20</h4>
              <p className="text-neutral-600">물주기, 산책, 건강검진을 한 번에</p>
            </div>
            <div>
              <p>Body - 400/16</p>
              <p className="text-neutral-600">Companion Care는 바쁜 일상을 사는 1인 가구가 반려식물·반려동물을 책임감 있게 돌볼 수 있도록 &apos;까먹을 틈 없는&apos; 케어 동반자가 됩니다.</p>
            </div>
            <div>
              <p className="caption">Caption - 400/14</p>
              <p className="caption text-neutral-600">다음 물주기 D-2</p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-4">컬러 팔레트</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4>Primary</h4>
              <div className="h-12 rounded-lg bg-primary"></div>
              <div className="grid grid-cols-5 gap-1">
                <div className="h-6 rounded-md bg-primary-50"></div>
                <div className="h-6 rounded-md bg-primary-200"></div>
                <div className="h-6 rounded-md bg-primary-400"></div>
                <div className="h-6 rounded-md bg-primary-600"></div>
                <div className="h-6 rounded-md bg-primary-800"></div>
              </div>
            </div>
            <div className="space-y-2">
              <h4>Secondary</h4>
              <div className="h-12 rounded-lg bg-secondary"></div>
              <div className="grid grid-cols-5 gap-1">
                <div className="h-6 rounded-md bg-secondary-50"></div>
                <div className="h-6 rounded-md bg-secondary-200"></div>
                <div className="h-6 rounded-md bg-secondary-400"></div>
                <div className="h-6 rounded-md bg-secondary-600"></div>
                <div className="h-6 rounded-md bg-secondary-800"></div>
              </div>
            </div>
            <div className="space-y-2">
              <h4>Accent</h4>
              <div className="h-12 rounded-lg bg-accent"></div>
              <div className="grid grid-cols-5 gap-1">
                <div className="h-6 rounded-md bg-accent-50"></div>
                <div className="h-6 rounded-md bg-accent-200"></div>
                <div className="h-6 rounded-md bg-accent-400"></div>
                <div className="h-6 rounded-md bg-accent-600"></div>
                <div className="h-6 rounded-md bg-accent-800"></div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-4">버튼</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 border rounded-lg bg-neutral-50">
            <Button>기본 버튼</Button>
            <Button variant="secondary">세컨더리 버튼</Button>
            <Button variant="accent" className="bg-accent">액센트 버튼</Button>
            <Button variant="outline">아웃라인 버튼</Button>
            <Button variant="ghost">고스트 버튼</Button>
            <Button variant="link">링크 버튼</Button>
            <Button>
              아이콘 버튼 <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-4">배지</h2>
          <div className="flex flex-wrap gap-4 p-6 border rounded-lg bg-neutral-50">
            <Badge>기본</Badge>
            <Badge variant="secondary">세컨더리</Badge>
            <Badge variant="accent">액센트</Badge>
            <Badge variant="outline">아웃라인</Badge>
            <Badge variant="destructive">위험</Badge>
            <Badge variant="positive">긍정</Badge>
            <Badge variant="warning">경고</Badge>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-4">카드</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>몬스테라</CardTitle>
                  <Leaf className="h-5 w-5 text-primary-600" />
                </div>
                <CardDescription>실내 식물</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-square rounded-lg bg-neutral-100 flex items-center justify-center">
                  <p className="text-neutral-400">식물 이미지</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Badge variant="primary">물주기 D-2</Badge>
                <Button variant="ghost" size="sm">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>초코</CardTitle>
                  <Bell className="h-5 w-5 text-primary-600" />
                </div>
                <CardDescription>포메라니안</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-square rounded-lg bg-neutral-100 flex items-center justify-center">
                  <p className="text-neutral-400">반려동물 이미지</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Badge variant="secondary">산책 D-1</Badge>
                <Button variant="ghost" size="sm">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>알림 설정</CardTitle>
                  <Bell className="h-5 w-5 text-accent-600" />
                </div>
                <CardDescription>알림 방식을 선택하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p>이메일 알림</p>
                    <Badge variant="positive">활성화</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p>푸시 알림</p>
                    <Badge variant="outline">준비중</Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">설정 변경</Button>
              </CardFooter>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
