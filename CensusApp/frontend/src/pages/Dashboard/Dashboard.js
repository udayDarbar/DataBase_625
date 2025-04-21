import React, { useState, useEffect } from 'react';
import { UserSession } from '../../utils/UserSession';
import axios from 'axios';
import './Dashboard.css';
import Loader from '../../components/common/loader/Loader';
import PopulationGrowthChart from '../../components/specific/PopulationChart/PopulationGrowthChart';
import DemographicsCard from '../../components/specific/DemographicsCard/DemographicsCard';
import CountryTable from '../../components/specific/CountryTable/CountryTable';
import { Calendar } from 'lucide-react';

// API URL from environment variables
const REACT_APP_API_URL = process.env.REACT_APP_API_URL;

/**
 * Dashboard component - Main dashboard view of the application
 * Displays population statistics, demographics, growth data, and country rankings
 * @returns {JSX.Element} Dashboard component
 */
const Dashboard = () => {
  const { user } = UserSession(); // User session
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [worldPopulation, setWorldPopulation] = useState({
    total: 0,
    working: 0,
    elderly: 0,
    youth: 0,
    birthToday: 0,
    deathsToday: 0,
    populationGrowthToday: 0
  });
  const [topCountries, setTopCountries] = useState([]);
  const [selectedYear, setSelectedYear] = useState(2023);
  const [topCountriesByLandArea, setTopCountriesByLandArea] = useState([
    { country: 'Russia', area: 16376870 },
    { country: 'China', area: 9388211 },
    { country: 'U.S', area: 9147420 },
    { country: 'Canada', area: 9093510 },
    { country: 'Brazil', area: 8358140 },
    { country: 'Australia', area: 7682300 },
    { country: 'India', area: 2973190 },
    { country: 'Argentina', area: 2736690 },
    { country: 'Kazakhstan', area: 2699700 },
    { country: 'Algeria', area: 2381740 }
  ]);
  
  // Current date for calendar
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState('November 2022');
  
  // Calendar days grid - sample for November 2022
  const calendarDays = [
    { day: 28, month: 'Oct' },
    { day: 29, month: 'Oct' },
    { day: 30, month: 'Oct' },
    { day: 31, month: 'Oct' },
    { day: 1, month: 'Nov', isCurrentMonth: true },
    { day: 2, month: 'Nov', isCurrentMonth: true },
    { day: 3, month: 'Nov', isCurrentMonth: true },
    { day: 4, month: 'Nov', isCurrentMonth: true },
    { day: 5, month: 'Nov', isCurrentMonth: true },
    { day: 6, month: 'Nov', isCurrentMonth: true },
    { day: 7, month: 'Nov', isCurrentMonth: true },
    { day: 8, month: 'Nov', isCurrentMonth: true },
    { day: 9, month: 'Nov', isCurrentMonth: true },
    { day: 10, month: 'Nov', isCurrentMonth: true },
    { day: 11, month: 'Nov', isCurrentMonth: true },
    { day: 12, month: 'Nov', isCurrentMonth: true },
    { day: 13, month: 'Nov', isCurrentMonth: true },
    { day: 14, month: 'Nov', isCurrentMonth: true },
    { day: 15, month: 'Nov', isCurrentMonth: true },
    { day: 16, month: 'Nov', isCurrentMonth: true },
    { day: 17, month: 'Nov', isCurrentMonth: true },
    { day: 18, month: 'Nov', isCurrentMonth: true },
    { day: 19, month: 'Nov', isCurrentMonth: true },
    { day: 20, month: 'Nov', isCurrentMonth: true },
    { day: 21, month: 'Nov', isCurrentMonth: true },
    { day: 22, month: 'Nov', isCurrentMonth: true },
    { day: 23, month: 'Nov', isCurrentMonth: true },
    { day: 24, month: 'Nov', isCurrentMonth: true },
    { day: 25, month: 'Nov', isCurrentMonth: true },
    { day: 26, month: 'Nov', isCurrentMonth: true },
    { day: 27, month: 'Nov', isCurrentMonth: true },
    { day: 28, month: 'Nov', isCurrentMonth: true },
    { day: 29, month: 'Nov', isCurrentMonth: true },
    { day: 30, month: 'Nov', isCurrentMonth: true },
    { day: 31, month: 'Nov', isCurrentMonth: true },
    { day: 1, month: 'Dec' },
    { day: 2, month: 'Dec' },
    { day: 3, month: 'Dec' },
    { day: 4, month: 'Dec' },
    { day: 5, month: 'Dec' },
    { day: 6, month: 'Dec' },
    { day: 7, month: 'Dec' },
  ].map(day => ({
    ...day,
    isToday: day.day === 1 && day.month === 'Nov',
    isSelected: day.day === 1 && day.month === 'Nov'
  }));

  // Fetch census data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch world population data
        const popResponse = await axios.get(`${REACT_APP_API_URL}/api/population/overview`);
        
        setWorldPopulation({
          total: popResponse.data.total_population || 7981681536,
          working: popResponse.data.working_age_percentage || 65,
          elderly: popResponse.data.elderly_percentage || 10,
          youth: popResponse.data.youth_percentage || 25,
          birthToday: popResponse.data.births_today || 180295,
          deathsToday: popResponse.data.deaths_today || 80295,
          populationGrowthToday: popResponse.data.growth_today || 105295
        });
        
        // Fetch top countries by population
        const countriesResponse = await axios.get(`${REACT_APP_API_URL}/api/countries/top`);
        setTopCountries(countriesResponse.data || []);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching population data:', err);
        setError('Failed to fetch population data');
        setLoading(false);
        
        // Set fallback data
        setWorldPopulation({
          total: 7981681536,
          working: 65,
          elderly: 10,
          youth: 25,
          birthToday: 180295,
          deathsToday: 80295,
          populationGrowthToday: 105295
        });
        
        // Sample top countries data
        setTopCountries([
          {
            rank: 1,
            country: "China",
            population: 1452363551,
            male: 682329104,
            female: 650481765,
            urban: 882894483,
            rural: 529465517
          },
          {
            rank: 2,
            country: "India",
            population: 1452363551,
            male: 623724248,
            female: 586469174,
            urban: 377105760,
            rural: 833087662
          },
          {
            rank: 3,
            country: "USA",
            population: 335578902,
            male: 164729431,
            female: 169185643,
            urban: 273975139,
            rural: 56843442
          },
          {
            rank: 4,
            country: "Indonesia",
            population: 280422728,
            male: 135337011,
            female: 134266419,
            urban: 158327668,
            rural: 118034120
          },
          {
            rank: 5,
            country: "Pakistan",
            population: 231352049,
            male: 106318122,
            female: 101344632,
            urban: 84314853,
            rural: 140885078
          },
          {
            rank: 6,
            country: "Brazil",
            population: 216132758,
            male: 7357736,
            female: 7027050,
            urban: 187973657,
            rural: 27304243
          },
          {
            rank: 7,
            country: "Nigeria",
            population: 218770604,
            male: 30462148,
            female: 28274149,
            urban: 111505415,
            rural: 99895289
          }
        ]);
      }
    };

    fetchData();
  }, [selectedYear]);

  // Format large numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  /**
   * Renders a progress bar for the countries by land area section
   * @param {number} area - Land area value
   * @param {number} maxArea - Maximum land area for scaling
   * @returns {JSX.Element} Progress bar element
   */
  const renderAreaBar = (area, maxArea = 17000000) => {
    const percentage = (area / maxArea) * 100;
    return (
      <div className="area-bar-container">
        <div className="area-bar" style={{ width: `${percentage}%` }}></div>
      </div>
    );
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
        {/* Top row: population overview */}
        <div className="dashboard-grid">
          {/* Current World Population */}
          <div className="grid-item world-population-card">
            <div className="card-content">
              <h2 className="card-subtitle">Current World Population</h2>
              <h1 className="population-total">{formatNumber(worldPopulation.total)}</h1>
            </div>
          </div>
          
          {/* Population by Age Group */}
          <div className="grid-item demographics-card">
            <DemographicsCard 
              title="Population aged 15-64" 
              value={`${worldPopulation.working}%`}
              color="indigo" 
            />
          </div>
          
          <div className="grid-item demographics-card">
            <DemographicsCard 
              title="Population aged 65+" 
              value={`${worldPopulation.elderly}%`}
              color="rose" 
            />
          </div>
          
          <div className="grid-item demographics-card">
            <DemographicsCard 
              title="Population aged 0-14" 
              value={`${worldPopulation.youth}%`}
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
                  <h3 className="stat-title">Birth Today</h3>
                  <p className="stat-value">{formatNumber(worldPopulation.birthToday)}</p>
                  <div className="stat-graph">
                    <div className="line-wave birth-wave"></div>
                    <div className="stat-percentage">7.2%</div>
                  </div>
                </div>
              </div>
              
              <div className="stat-card death-card">
                <div className="stat-content">
                  <h3 className="stat-title">Deaths Today</h3>
                  <p className="stat-value">{formatNumber(worldPopulation.deathsToday)}</p>
                  <div className="stat-graph">
                    <div className="line-wave death-wave"></div>
                    <div className="stat-percentage">7.2%</div>
                  </div>
                </div>
              </div>
              
              <div className="stat-card growth-card">
                <div className="stat-content">
                  <h3 className="stat-title">Population Growth Today</h3>
                  <p className="stat-value">{formatNumber(worldPopulation.populationGrowthToday)}</p>
                  <div className="stat-graph">
                    <div className="line-wave growth-wave"></div>
                    <div className="stat-percentage">7.2%</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Top Countries by Land Area */}
            <div className="countries-by-area-card">
              <h3 className="card-title">Top 10 Countries by Land Area (km²)</h3>
              <div className="countries-area-list">
                {topCountriesByLandArea.map((country, index) => (
                  <div className="country-area-item" key={index}>
                    <div className="country-area-name">{country.country}</div>
                    <div className="country-area-bar">
                      {renderAreaBar(country.area)}
                    </div>
                    <div className="country-area-value">{formatNumber(country.area)}</div>
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
                    className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''} ${day.isSelected ? 'selected' : ''}`}
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
              <PopulationGrowthChart />
            </div>
            
            {/* Top Countries Table */}
            <div className="countries-table-card">
              <h3 className="card-title">Top 10 Largest Countries By Population (LIVE)</h3>
              <CountryTable countries={topCountries} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;