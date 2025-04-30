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

// 그래프에 사용할 색상 배열
const COLORS = [
  'rgba(34, 197, 94, 0.7)',  // green-500
  'rgba(16, 185, 129, 0.7)', // emerald-500
  'rgba(5, 150, 105, 0.7)',  // teal-600
  'rgba(3, 102, 114, 0.7)',  // cyan-700
];

// Chart.js 모듈 등록
ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

/**
 * 케어 완료 통계 차트 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {Object} props.data - 차트 데이터
 * @param {Array<string>} props.data.labels - 차트 라벨 배열
 * @param {Array<number>} props.data.counts - 차트 데이터 배열
 * @param {string} props.title - 차트 제목
 * @returns {React.ReactNode} - 케어 완료 통계 차트 컴포넌트
 */
export default function CareCompletionChart({ data, title = '주간 케어 완료 통계' }) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: '완료된 케어 수',
        data: data.counts,
        backgroundColor: data.counts.map((_, idx) => COLORS[idx % COLORS.length]), // 색상 순환
        borderRadius: 10,
        borderSkipped: false, // 테두리 제거로 더 둥글게
      },
    ],
  };

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
          usePointStyle: true, // 레이블 스타일 개선
          padding: 20 // 레이블 간격 조정
        }
      },
      title: { 
        display: true, 
        text: title,
        font: {
          family: "'Pretendard', sans-serif",
          size: 16,
          weight: 'bold'
        },
        padding: {
          bottom: 20 // 제목 하단 여백 추가
        }
      },
      tooltip: {
        backgroundColor: 'rgba(31, 41, 55, 0.8)', // 약간 어두운 회색
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
        displayColors: true, // 색상 표시
        boxPadding: 6 // 색상 박스 패딩
      }
    },
    // 애니메이션 추가
    animation: {
      duration: 1000, // 1초 동안 부드럽게
      easing: 'easeOutBounce', // 부드럽고 통통 튀는 느낌
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
    <div className="w-full h-[300px] bg-white p-5 rounded-lg shadow-sm border border-neutral-100 hover:shadow-md transition-shadow duration-300">
      <Bar data={chartData} options={options} />
    </div>
  );
}
