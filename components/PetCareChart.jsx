'use client';

import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  BarElement, 
  CategoryScale, 
  LinearScale, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

// Chart.js 모듈 등록
ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

// 그래프에 사용할 색상 배열
const COLORS = [
  'rgba(34, 197, 94, 0.7)',    // 초록
  'rgba(59, 130, 246, 0.7)',   // 파랑
  'rgba(250, 204, 21, 0.7)',   // 노랑
  'rgba(251, 113, 133, 0.7)',  // 분홍
  'rgba(168, 85, 247, 0.7)',   // 보라
  'rgba(236, 72, 153, 0.7)',   // 핑크
];

/**
 * 반려동물별 케어 통계 차트 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {Object} props.data - 차트 데이터
 * @param {Array<string>} props.data.labels - 반려동물 이름 배열
 * @param {Array<number>} props.data.counts - 완료된 케어 수 배열
 * @param {Array<number>} props.data.totals - 전체 케어 수 배열
 * @param {Array<number>} props.data.completionRates - 완료율 배열
 * @returns {React.ReactNode} - 반려동물별 케어 통계 차트 컴포넌트
 */
export default function PetCareChart({ data }) {
  // 데이터가 없는 경우 처리
  if (!data.labels || data.labels.length === 0) {
    return (
      <div className="flex justify-center items-center h-[300px] bg-white p-6 rounded-lg border border-neutral-100">
        <p className="text-neutral-500">반려동물별 케어 통계 데이터가 없습니다.</p>
      </div>
    );
  }

  // 완료된 케어 수 차트 데이터
  const completedChartData = {
    labels: data.labels,
    datasets: [
      {
        label: '완료된 케어 수',
        data: data.counts,
        backgroundColor: data.labels.map((_, idx) => COLORS[idx % COLORS.length]),
        borderRadius: 10,
        borderSkipped: false,
      },
    ],
  };

  // 완료율 차트 데이터
  const rateChartData = {
    labels: data.labels,
    datasets: [
      {
        label: '완료율 (%)',
        data: data.completionRates,
        backgroundColor: data.labels.map((_, idx) => COLORS[(idx + 2) % COLORS.length]), // 색상 변화를 위해 오프셋 추가
        borderRadius: 10,
        borderSkipped: false,
      },
    ],
  };

  // 차트 옵션
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          font: {
            family: "'Pretendard', sans-serif",
            size: 12
          },
          usePointStyle: true,
          padding: 20
        }
      },
      title: { 
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(31, 41, 55, 0.8)',
        titleFont: {
          family: "'Pretendard', sans-serif",
          size: 14
        },
        bodyFont: {
          family: "'Pretendard', sans-serif",
          size: 12
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        boxPadding: 6,
        callbacks: {
          afterLabel: function(context) {
            // 완료된 케어 수 차트인 경우 전체 케어 수 표시
            if (context.dataset.label === '완료된 케어 수') {
              const total = data.totals[context.dataIndex];
              return `전체 케어 수: ${total}개`;
            }
            return '';
          }
        }
      }
    },
    // 애니메이션 추가
    animation: {
      duration: 1000,
      easing: 'easeOutCubic',
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0, // 정수만 표시
          font: {
            family: "'Pretendard', sans-serif",
            size: 12
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        ticks: {
          font: {
            family: "'Pretendard', sans-serif",
            size: 12
          }
        },
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="w-full h-[300px] bg-white p-5 rounded-lg shadow-sm border border-neutral-100 hover:shadow-md transition-shadow duration-300">
        <h3 className="text-lg font-medium mb-4">반려동물별 완료된 케어 수</h3>
        <Bar data={completedChartData} options={options} />
      </div>
      
      <div className="w-full h-[300px] bg-white p-5 rounded-lg shadow-sm border border-neutral-100 hover:shadow-md transition-shadow duration-300">
        <h3 className="text-lg font-medium mb-4">반려동물별 케어 완료율</h3>
        <Bar data={rateChartData} options={{...options, scales: {...options.scales, y: {...options.scales.y, max: 100}}}} />
      </div>
    </div>
  );
}
