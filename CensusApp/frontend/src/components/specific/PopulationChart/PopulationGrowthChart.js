import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import axios from 'axios';
import './PopulationGrowthChart.css';

// API URL from environment variables
const REACT_APP_API_URL = process.env.REACT_APP_API_URL;

/**
 * Population growth chart component
 * @param {Object} props - Component props
 * @param {number} props.selectedYear - Selected census year
 * @returns {JSX.Element} Chart component with time range controls
 */
const PopulationGrowthChart = ({ selectedYear }) => {
  const [timeRange, setTimeRange] = useState('all');
  const [populationData, setPopulationData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch population trend data
  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${REACT_APP_API_URL}/api/population/trend`, {
          params: { 
            end_year: selectedYear,
            start_year: selectedYear - 10, // Past 10 years
            include_sample: true // Include sample historical data if available
          }
        });
        
        if (response.data && response.data.length > 0) {
          setPopulationData(response.data);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching population trend data:', err);
        // Use sample data as fallback
        setPopulationData([
          { year: '1700', births: 0.6, deaths: 0.5, growth: 0.1, total: 0.6 },
          { year: '1750', births: 0.8, deaths: 0.7, growth: 0.1, total: 0.8 },
          { year: '1800', births: 1.0, deaths: 0.9, growth: 0.1, total: 1.0 },
          { year: '1850', births: 1.3, deaths: 1.1, growth: 0.2, total: 1.3 },
          { year: '1900', births: 1.7, deaths: 1.5, growth: 0.2, total: 1.7 },
          { year: '1950', births: 2.5, deaths: 2.0, growth: 0.5, total: 2.5 },
          { year: '2000', births: 6.2, deaths: 4.0, growth: 2.2, total: 6.2 },
          { year: '2020', births: 9.5, deaths: 5.0, growth: 4.0, total: 9.5 },
          { year: '2050', births: 11.7, deaths: 6.8, growth: 4.9, total: 11.7 },
        ]);
        setLoading(false);
      }
    };
    
    fetchTrendData();
  }, [selectedYear]);
  
  // Filter data based on selected time range
  const getFilteredData = () => {
    if (populationData.length === 0) return [];
    
    switch (timeRange) {
      case '1d':
        return populationData.slice(-2);
      case '1w':
        return populationData.slice(-3);
      case '1m':
        return populationData.slice(-4);
      case '3m':
        return populationData.slice(-5);
      case '6m':
        return populationData.slice(-6);
      case '1y':
        return populationData.slice(-7);
      case '5y':
        return populationData.slice(-8);
      case 'all':
      default:
        return populationData;
    }
  };
  
  // Format Y-axis ticks to include B for billions
  const formatYAxis = (value) => {
    return `${value}B`;
  };
  
  // Custom tooltip formatter
  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-year">{label}</p>
          {payload.map((entry, index) => (
            <p 
              key={`tooltip-${index}`} 
              className="tooltip-data"
              style={{ color: entry.color }}
            >
              {entry.name}: {entry.value}B
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <div className="chart-loading">Loading population data...</div>;
  }

  return (
    <div className="chart-wrapper">
      {/* Time range selector */}
      <div className="time-controls">
        <button 
          className={`time-button ${timeRange === '1d' ? 'active' : ''}`}
          onClick={() => setTimeRange('1d')}
        >
          1D
        </button>
        <button 
          className={`time-button ${timeRange === '1w' ? 'active' : ''}`}
          onClick={() => setTimeRange('1w')}
        >
          1W
        </button>
        <button 
          className={`time-button ${timeRange === '1m' ? 'active' : ''}`}
          onClick={() => setTimeRange('1m')}
        >
          1M
        </button>
        <button 
          className={`time-button ${timeRange === '3m' ? 'active' : ''}`}
          onClick={() => setTimeRange('3m')}
        >
          3M
        </button>
        <button 
          className={`time-button ${timeRange === '6m' ? 'active' : ''}`}
          onClick={() => setTimeRange('6m')}
        >
          6M
        </button>
        <button 
          className={`time-button ${timeRange === '1y' ? 'active' : ''}`}
          onClick={() => setTimeRange('1y')}
        >
          1Y
        </button>
        <button 
          className={`time-button ${timeRange === '5y' ? 'active' : ''}`}
          onClick={() => setTimeRange('5y')}
        >
          5Y
        </button>
        <button 
          className={`time-button ${timeRange === 'all' ? 'active' : ''}`}
          onClick={() => setTimeRange('all')}
        >
          All
        </button>
      </div>
      
      {/* Chart */}
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={getFilteredData()}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 10,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="year" 
              padding={{ left: 30, right: 30 }}
            />
            <YAxis 
              tickFormatter={formatYAxis}
              domain={[0, 'auto']}
            />
            <Tooltip content={customTooltip} />
            <Legend />
            <Line
              type="monotone"
              dataKey="births"
              stroke="#6366f1"
              strokeWidth={2}
              activeDot={{ r: 8 }}
              name="Births This Year"
            />
            <Line
              type="monotone"
              dataKey="growth"
              stroke="#f97316"
              strokeWidth={2}
              activeDot={{ r: 8 }}
              name="Growth This Year"
            />
            <Line
              type="monotone"
              dataKey="deaths"
              stroke="#ec4899"
              strokeWidth={2}
              activeDot={{ r: 8 }}
              name="Deaths This Year"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PopulationGrowthChart;