import React from 'react';
import {
  SimilarityLevel,
  SIMILARITY_LEVEL_LABELS,
  SIMILARITY_LEVEL_COLORS
} from '../../../types/imageGuardian';

interface SimilarityMeterProps {
  score: number;
  level: SimilarityLevel;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SimilarityMeter: React.FC<SimilarityMeterProps> = ({
  score,
  level,
  showDetails = false,
  size = 'md'
}) => {
  const getBarColor = () => {
    if (score >= 95) return 'bg-red-500';
    if (score >= 80) return 'bg-orange-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const sizeClasses = {
    sm: {
      container: 'h-1.5',
      text: 'text-xs',
      score: 'text-sm'
    },
    md: {
      container: 'h-2',
      text: 'text-sm',
      score: 'text-base'
    },
    lg: {
      container: 'h-3',
      text: 'text-base',
      score: 'text-lg'
    }
  };

  const classes = sizeClasses[size];

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className={`font-bold ${classes.score}`}>
          {score.toFixed(1)}%
        </span>
        <span className={`px-2 py-0.5 rounded-full ${classes.text} font-medium ${SIMILARITY_LEVEL_COLORS[level]}`}>
          {SIMILARITY_LEVEL_LABELS[level]}
        </span>
      </div>

      <div className={`w-full bg-gray-200 rounded-full ${classes.container}`}>
        <div
          className={`${classes.container} rounded-full transition-all duration-300 ${getBarColor()}`}
          style={{ width: `${Math.min(100, score)}%` }}
        />
      </div>

      {showDetails && (
        <div className={`${classes.text} text-gray-500`}>
          {score >= 95 && '完全相同：直接盜用原圖'}
          {score >= 80 && score < 95 && '高度相似：可能有加框、加字、改色'}
          {score >= 50 && score < 80 && '中度相似：需人工確認'}
          {score < 50 && '低相似度：可能非侵權'}
        </div>
      )}
    </div>
  );
};

export default SimilarityMeter;
