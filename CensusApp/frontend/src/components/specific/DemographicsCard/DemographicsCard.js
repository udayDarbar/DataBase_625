import React from 'react';
import PropTypes from 'prop-types';
import './DemographicsCard.css';

/**
 * Demographics card component for displaying population statistics
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {string} props.value - Value to display
 * @param {string} props.color - Color theme for the card (indigo, rose, amber)
 * @returns {JSX.Element} Demographics card component
 */
const DemographicsCard = ({ title, value, color = 'indigo' }) => {
  // Define color classes based on the color prop
  const colorClasses = {
    indigo: {
      bg: 'bg-indigo-100',
      text: 'text-indigo-600',
      border: 'border-indigo-200',
      progress: 'bg-indigo-500',
    },
    rose: {
      bg: 'bg-rose-100',
      text: 'text-rose-600',
      border: 'border-rose-200',
      progress: 'bg-rose-500',
    },
    amber: {
      bg: 'bg-amber-100',
      text: 'text-amber-600',
      border: 'border-amber-200',
      progress: 'bg-amber-500',
    },
  };

  // Parse percentage value
  const percentage = parseInt(value, 10) || 0;

  return (
    <div className={`demographics-card ${colorClasses[color].bg} ${colorClasses[color].border}`}>
      <div className="demographics-content">
        <h3 className="demographics-title text-gray-600">{title}</h3>
        <p className={`demographics-value ${colorClasses[color].text}`}>{value}</p>
      </div>
      
      {/* Progress bar */}
      <div className="progress-bar bg-gray-200">
        <div 
          className={`progress-fill ${colorClasses[color].progress}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

DemographicsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  color: PropTypes.oneOf(['indigo', 'rose', 'amber']),
};

export default DemographicsCard;