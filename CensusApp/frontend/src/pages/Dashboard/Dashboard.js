import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';
import Loader from '../../components/common/loader/Loader';
import PopulationGrowthChart from '../../components/specific/PopulationChart/PopulationGrowthChart';
import DemographicsCard from '../../components/specific/DemographicsCard/DemographicsCard';
import CountryTable from '../../components/specific/CountryTable/CountryTable';
import { Calendar } from 'lucide-react';

// API URL from environment variables with fallback
const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

/**
 * Dashboard component - Main dashboard view of the application
 * Displays population statistics, demographics, growth data, and state/county rankings
 * @returns {JSX.Element} Dashboard component
 */
const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [worldPopulation, setWorldPopulation] = useState({
    total: 0,
    workingPercentage: 0,
    elderlyPercentage: 0,
    youthPercentage: 0,
    birthsToday: 0,
    deathsToday: 0,
    populationGrowthToday: 0
  });
  const [topStates, setTopStates] = useState([]);
  
  // Available census years from database
  const [availableYears, setAvailableYears] = useState([2020]);
  const [selectedYear, setSelectedYear] = useState(2020);
  
  // Top states by area - will update with real data
  const [topStatesByLandArea, setTopStatesByLandArea] = useState([]);
  
  // Current date for the dashboard
  const [currentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(
    new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
  );
  
  // Calendar days grid - will be generated dynamically
  const [calendarDays, setCalendarDays] = useState([]);

  /**
   * Generate calendar days for the current month
   * @param {Date} date - Date to generate calendar for
   */
  const generateCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Day of week for the first day (0-6, where 0 is Sunday)
    let firstDayOfWeek = firstDay.getDay();
    // Convert to Monday-based index (0-6, where 0 is Monday)
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    // Get days from previous month to fill the calendar
    const prevMonthDays = [];
    if (firstDayOfWeek > 0) {
      const prevMonth = new Date(year, month, 0);
      const prevMonthLastDay = prevMonth.getDate();
      
      for (let i = prevMonthLastDay - firstDayOfWeek + 1; i <= prevMonthLastDay; i++) {
        prevMonthDays.push({
          day: i,
          month: new Date(year, month - 1).toLocaleString('default', { month: 'short' }),
          isCurrentMonth: false
        });
      }
    }
    
    // Get days from current month
    const currentMonthDays = [];
    for (let i = 1; i <= lastDay.getDate(); i++) {
      currentMonthDays.push({
        day: i,
        month: new Date(year, month).toLocaleString('default', { month: 'short' }),
        isCurrentMonth: true,
        isToday: i === new Date().getDate() && 
                 month === new Date().getMonth() && 
                 year === new Date().getFullYear()
      });
    }
    
    // Get days from next month to fill the calendar
    const nextMonthDays = [];
    const totalDaysShown = 42; // 6 rows of 7 days
    const daysNeeded = totalDaysShown - (prevMonthDays.length + currentMonthDays.length);
    
    for (let i = 1; i <= daysNeeded; i++) {
      nextMonthDays.push({
        day: i,
        month: new Date(year, month + 1).toLocaleString('default', { month: 'short' }),
        isCurrentMonth: false
      });
    }
    
    // Combine all days
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  // Fetch census years
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const yearsResponse = await axios.get(`${REACT_APP_API_URL}/api/census/years`);
        if (yearsResponse.data && yearsResponse.data.length > 0) {
          setAvailableYears(yearsResponse.data);
          setSelectedYear(yearsResponse.data[yearsResponse.data.length - 1]); // Select most recent year
        }
      } catch (err) {
        console.error('Error fetching census years:', err);
        // Keep default 2020 if there's an error
      }
    };
    
    fetchYears();
  }, []);

  // Generate calendar when component mounts
  useEffect(() => {
    const days = generateCalendarDays(currentDate);
    setCalendarDays(days);
    
    // Set current month string
    setCurrentMonth(currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }));
  }, [currentDate]);

  // Fetch census data when selected year changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch population overview data
        let populationData = {
          total_population: 7981681536,
          working_age_percentage: 65.0,
          elderly_percentage: 10.0,
          youth_percentage: 25.0,
          births_today: 180295,
          deaths_today: 80295,
          growth_today: 105295
        };
        
        try {
          const popResponse = await axios.get(`${REACT_APP_API_URL}/api/population/overview`, {
            params: { year: selectedYear }
          });
          if (popResponse.data) {
            populationData = popResponse.data;
          }
        } catch (err) {
          console.warn('Using fallback population data due to API error:', err);
        }
        
        setWorldPopulation({
          total: populationData.total_population || 0,
          workingPercentage: populationData.working_age_percentage || 0,
          elderlyPercentage: populationData.elderly_percentage || 0,
          youthPercentage: populationData.youth_percentage || 0,
          birthsToday: populationData.births_today || 0,
          deathsToday: populationData.deaths_today || 0,
          populationGrowthToday: populationData.growth_today || 0
        });
        
        // Fetch top states by population
        let statesData = [];
        try {
          const statesResponse = await axios.get(`${REACT_APP_API_URL}/api/population/states`, {
            params: { year: selectedYear }
          });
          
          if (statesResponse.data && statesResponse.data.states) {
            statesData = statesResponse.data.states;
          }
        } catch (err) {
          console.warn('Using fallback states data due to API error:', err);
          // Default fallback states data
          statesData = [
            { state_name: "California", total_population: 39538223, male_population: 19520104, female_population: 20018119 },
            { state_name: "Texas", total_population: 29145505, male_population: 14471701, female_population: 14673804 },
            { state_name: "Florida", total_population: 21538187, male_population: 10470577, female_population: 11067610 },
            { state_name: "New York", total_population: 20201249, male_population: 9819025, female_population: 10382224 },
            { state_name: "Pennsylvania", total_population: 13002700, male_population: 6358870, female_population: 6643830 },
            { state_name: "Illinois", total_population: 12812508, male_population: 6283129, female_population: 6529379 },
            { state_name: "Ohio", total_population: 11799448, male_population: 5799730, female_population: 5999718 },
            { state_name: "Georgia", total_population: 10711908, male_population: 5237835, female_population: 5474073 },
            { state_name: "North Carolina", total_population: 10439388, male_population: 5115300, female_population: 5324088 },
            { state_name: "Michigan", total_population: 10077331, male_population: 4929392, female_population: 5147939 }
          ];
        }
        
        // Transform states data into the format expected by CountryTable
        const transformedStates = statesData.map((state, index) => ({
          rank: index + 1,
          country: state.state_name, // Using state_name as the "country" field
          population: state.total_population,
          male: state.male_population,
          female: state.female_population,
          urban: Math.round(state.total_population * 0.65), // Estimated urban population (65%)
          rural: Math.round(state.total_population * 0.35), // Estimated rural population (35%)
        })).slice(0, 10); // Limit to top 10
        
        setTopStates(transformedStates);
        
        // Create area data for visualization
        let areaData = []; // Using let instead of const
        if (statesData && statesData.length > 0) {
          // For this example, we'll use population as a proxy for area
          areaData = statesData
            .sort((a, b) => b.total_population - a.total_population)
            .slice(0, 10)
            .map(state => ({
              country: state.state_name,
              area: Math.round(state.total_population / 100) // Using population/100 as a proxy for area
            }));
        }
        
        setTopStatesByLandArea(areaData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching census data:', err);
        setError('Failed to fetch census data. Please try again later.');
        setLoading(false);
      }
    };

    if (selectedYear) {
      fetchData();
    }
  }, [selectedYear]);

  // Format large numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  /**
   * Renders a progress bar for the states by land area section
   * @param {number} area - Land area value
   * @param {number} maxArea - Maximum land area for scaling
   * @returns {JSX.Element} Progress bar element
   */
  const renderAreaBar = (area, maxArea) => {
    const max = maxArea || Math.max(...topStatesByLandArea.map(state => state.area), 1);
    const percentage = max > 0 ? (area / max) * 100 : 0;
    return (
      <div className="area-bar-container">
        <div className="area-bar" style={{ width: `${percentage}%` }}></div>
      </div>
    );
  };

  /**
   * Handle year selection change
   * @param {Event} e - Change event
   */
  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value, 10));
  };

  // Early return with just the loader while loading
  if (loading) {
    return <Loader size="medium" />;
  }

  if (error) {
    return <div className="error-state">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="main-content">
        {/* Year selector */}
        <div className="year-selector">
          <label htmlFor="yearSelect">Census Year: </label>
          <select 
            id="yearSelect" 
            value={selectedYear} 
            onChange={handleYearChange}
            className="year-select"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        {/* Top row: population overview */}
        <div className="dashboard-grid">
          {/* Current US Population */}
          <div className="grid-item world-population-card">
            <div className="card-content">
              <h2 className="card-subtitle">US Total Population ({selectedYear})</h2>
              <h1 className="population-total">{formatNumber(worldPopulation.total)}</h1>
            </div>
          </div>
          
          {/* Population by Age Group */}
          <div className="grid-item demographics-card">
            <DemographicsCard 
              title="Population aged 15-64" 
              value={`${worldPopulation.workingPercentage}%`}
              color="indigo" 
            />
          </div>
          
          <div className="grid-item demographics-card">
            <DemographicsCard 
              title="Population aged 65+" 
              value={`${worldPopulation.elderlyPercentage}%`}
              color="rose" 
            />
          </div>
          
          <div className="grid-item demographics-card">
            <DemographicsCard 
              title="Population aged 0-14" 
              value={`${worldPopulation.youthPercentage}%`}
              color="amber" 
            />
          </div>
        </div>
        
        {/* Middle row: statistics and chart */}
        <div className="dashboard-middle-section">
          <div className="dashboard-left-column">
            {/* Daily statistics */}
            <div className="stats-column">
              <div className="stat-card birth-card">
                <div className="stat-content">
                  <h3 className="stat-title">Births (Estimated Daily)</h3>
                  <p className="stat-value">{formatNumber(worldPopulation.birthsToday)}</p>
                  <div className="stat-graph">
                    <div className="line-wave birth-wave"></div>
                    <div className="stat-percentage">{(worldPopulation.birthsToday / worldPopulation.total * 100).toFixed(3)}%</div>
                  </div>
                </div>
              </div>
              
              <div className="stat-card death-card">
                <div className="stat-content">
                  <h3 className="stat-title">Deaths (Estimated Daily)</h3>
                  <p className="stat-value">{formatNumber(worldPopulation.deathsToday)}</p>
                  <div className="stat-graph">
                    <div className="line-wave death-wave"></div>
                    <div className="stat-percentage">{(worldPopulation.deathsToday / worldPopulation.total * 100).toFixed(3)}%</div>
                  </div>
                </div>
              </div>
              
              <div className="stat-card growth-card">
                <div className="stat-content">
                  <h3 className="stat-title">Population Growth (Daily)</h3>
                  <p className="stat-value">{formatNumber(worldPopulation.populationGrowthToday)}</p>
                  <div className="stat-graph">
                    <div className="line-wave growth-wave"></div>
                    <div className="stat-percentage">{(worldPopulation.populationGrowthToday / worldPopulation.total * 100).toFixed(3)}%</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Top States by Land Area */}
            <div className="countries-by-area-card">
              <h3 className="card-title">Top 10 States by Population</h3>
              <div className="countries-area-list">
                {topStatesByLandArea.map((state, index) => (
                  <div className="country-area-item" key={index}>
                    <div className="country-area-name">{state.country}</div>
                    <div className="country-area-bar">
                      {renderAreaBar(state.area)}
                    </div>
                    <div className="country-area-value">{formatNumber(state.area * 100)}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Calendar */}
            <div className="calendar-card">
              <div className="calendar-header">
                <h3 className="calendar-title">{currentMonth}</h3>
                <button className="calendar-button">
                  <Calendar size={18} />
                </button>
              </div>
              <div className="calendar-weekdays">
                <div className="weekday">Mon</div>
                <div className="weekday">Tue</div>
                <div className="weekday">Wed</div>
                <div className="weekday">Thu</div>
                <div className="weekday">Fri</div>
                <div className="weekday">Sat</div>
                <div className="weekday">Sun</div>
              </div>
              <div className="calendar-days">
                {calendarDays.slice(0, 35).map((day, index) => (
                  <div 
                    key={index} 
                    className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''}`}
                  >
                    {day.day}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="dashboard-right-column">
            {/* Population Growth Chart */}
            <div className="chart-card">
              <PopulationGrowthChart selectedYear={selectedYear} />
            </div>
            
            {/* Top States Table */}
            <div className="countries-table-card">
              <h3 className="card-title">Top 10 Most Populous States ({selectedYear})</h3>
              <CountryTable countries={topStates} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;