'use client';

import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  LineElement, 
  PointElement, 
  CategoryScale, 
  LinearScale, 
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';

// Chart.js 모듈 등록
ChartJS.register(
  LineElement, 
  PointElement, 
  CategoryScale, 
  LinearScale, 
  Title, 
  Tooltip, 
  Legend,
  Filler
);

/**
 * 케어 완료율 변화 추이 차트 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {Object} props.data - 차트 데이터
 * @param {Array<string>} props.data.labels - 날짜 라벨 배열
 * @param {Array<number>} props.data.completionRates - 완료율 배열
 * @returns {React.ReactNode} - 케어 완료율 변화 추이 차트 컴포넌트
 */
export default function CareCompletionTrendChart({ data }) {
  // 데이터가 없는 경우 처리
  if (!data?.labels || data.labels.length === 0) {
    return (
      <div className="flex justify-center items-center h-[300px] bg-white p-6 rounded-lg border border-neutral-100">
        <p className="text-neutral-500">완료율 변화 추이 데이터가 없습니다.</p>
      </div>
    );
  }

  // 차트 데이터
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: '완료율 (%)',
        data: data.completionRates,
        borderColor: 'rgba(34, 197, 94, 0.8)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        pointBackgroundColor: 'rgba(34, 197, 94, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.3,
        fill: true,
        borderWidth: 3,
      },
      {
        label: '완료 항목 수',
        data: data.completedCounts,
        borderColor: 'rgba(59, 130, 246, 0.8)',
        backgroundColor: 'rgba(59, 130, 246, 0.0)',
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3,
        borderWidth: 2,
        borderDash: [5, 5],
        yAxisID: 'y1',
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
            
            if (datasetIndex === 0) { // 완료율 데이터셋
              return `총 항목: ${data.totalCounts[dataIndex]}개`;
            } else if (datasetIndex === 1) { // 완료 항목 수 데이터셋
              return `완료율: ${data.completionRates[dataIndex]}%`;
            }
            return '';
          }
        }
      }
    },
    // 애니메이션 추가
    animation: {
      duration: 1500,
      easing: 'easeOutQuart',
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: '완료율 (%)',
          font: {
            family: "'Pretendard', sans-serif",
            size: 12
          }
        },
        ticks: {
          font: {
            family: "'Pretendard', sans-serif",
            size: 12
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y1: {
        beginAtZero: true,
        position: 'right',
        title: {
          display: true,
          text: '완료 항목 수',
          font: {
            family: "'Pretendard', sans-serif",
            size: 12
          }
        },
        ticks: {
          font: {
            family: "'Pretendard', sans-serif",
            size: 12
          }
        },
        grid: {
          display: false
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
      <h3 className="text-lg font-medium mb-4">최근 7일 케어 완료율 변화 추이</h3>
      <Line data={chartData} options={options} />
    </div>
  );
}
