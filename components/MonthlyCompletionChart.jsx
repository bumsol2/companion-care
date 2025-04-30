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

/**
 * 월별 케어 완료 통계 차트 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {Object} props.data - 차트 데이터
 * @param {Array<string>} props.data.labels - 월 라벨 배열
 * @param {Array<number>} props.data.totalCounts - 전체 케어 항목 수 배열
 * @param {Array<number>} props.data.completedCounts - 완료된 케어 항목 수 배열
 * @returns {React.ReactNode} - 월별 케어 완료 통계 차트 컴포넌트
 */
export default function MonthlyCompletionChart({ data }) {
  // 데이터가 없는 경우 처리
  if (!data?.labels || data.labels.length === 0) {
    return (
      <div className="flex justify-center items-center h-[300px] bg-white p-6 rounded-lg border border-neutral-100">
        <p className="text-neutral-500">월별 케어 통계 데이터가 없습니다.</p>
      </div>
    );
  }

  // 차트 데이터
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: '전체 케어 항목',
        data: data.totalCounts,
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 0.8)',
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: '완료된 케어 항목',
        data: data.completedCounts,
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderColor: 'rgba(34, 197, 94, 0.9)',
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      }
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
            const datasetIndex = context.datasetIndex;
            const dataIndex = context.dataIndex;
            
            if (datasetIndex === 1) { // 완료된 케어 항목 데이터셋
              const total = data.totalCounts[dataIndex];
              const completed = data.completedCounts[dataIndex];
              const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
              return `완료율: ${completionRate}%`;
            }
            return '';
          }
        }
      }
    },
    // 애니메이션 추가
    animation: {
      duration: 1200,
      easing: 'easeOutQuad',
      delay: (context) => context.dataIndex * 100
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
      <h3 className="text-lg font-medium mb-4">월별 케어 항목 통계</h3>
      <Bar data={chartData} options={options} />
    </div>
  );
}
