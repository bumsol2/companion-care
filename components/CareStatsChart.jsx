'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

/**
 * 케어 통계 차트 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {Array<Object>} props.data - 차트 데이터 배열
 * @param {string} props.data[].date - 날짜
 * @param {number} props.data[].completed - 완료한 케어 수
 * @returns {React.ReactNode} - 케어 통계 차트 컴포넌트
 */
export default function CareStatsChart({ data }) {
  const chartData = {
    labels: data.map((item) => item.date),
    datasets: [
      {
        label: '완료한 케어 수',
        data: data.map((item) => item.completed),
        fill: true,
        borderColor: '#4ade80', // 초록색
        backgroundColor: 'rgba(74, 222, 128, 0.2)', // 초록색 투명 배경
        tension: 0.3, // 선을 부드럽게
        pointBackgroundColor: '#4ade80',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 3,
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
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
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
        boxPadding: 6
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
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
    },
    // 애니메이션 추가
    animation: {
      duration: 1500,
      easing: 'easeOutQuart',
    },
  };

  return (
    <div className="w-full h-[300px] bg-white p-5 rounded-lg shadow-sm border border-neutral-100 hover:shadow-md transition-shadow duration-300">
      <h3 className="text-lg font-medium mb-4">최근 케어 완료 추이</h3>
      <Line data={chartData} options={options} />
    </div>
  );
}
