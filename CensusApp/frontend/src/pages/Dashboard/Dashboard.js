import React, { useState, useEffect } from 'react';
import { UserSession } from '../../utils/UserSession';
import axios from 'axios';
import './Dashboard.css';
import Loader from '../../components/common/loader/Loader';
import PopulationGrowthChart from '../../components/specific/PopulationChart/PopulationGrowthChart';
import DemographicsCard from '../../components/specific/DemographicsCard/DemographicsCard';
import CountryTable from '../../components/specific/CountryTable/CountryTable';

// API URL from environment variables
const REACT_APP_API_URL = process.env.REACT_APP_API_URL;

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
        {/* Current World Population */}
        <div className="population-overview">
          <div className="main-population-card">
            <h2 className="card-subtitle">Current World Population</h2>
            <h1 className="population-total">{formatNumber(worldPopulation.total)}</h1>
          </div>
          
          {/* Population by Age Group */}
          <div className="demographics-grid">
            <DemographicsCard 
              title="Population aged 15-64" 
              value={`${worldPopulation.working}%`}
              color="indigo" 
            />
            <DemographicsCard 
              title="Population aged 65+" 
              value={`${worldPopulation.elderly}%`}
              color="rose" 
            />
            <DemographicsCard 
              title="Population aged 0-14" 
              value={`${worldPopulation.youth}%`}
              color="amber" 
            />
          </div>
        </div>
        
        {/* Daily statistics */}
        <div className="stats-grid">
          <div className="stats-card birth">
            <div className="stats-content">
              <h3 className="stats-title">Birth Today</h3>
              <p className="stats-value">{formatNumber(worldPopulation.birthToday)}</p>
            </div>
            <div className="stats-icon">👶</div>
          </div>
          
          <div className="stats-card death">
            <div className="stats-content">
              <h3 className="stats-title">Deaths Today</h3>
              <p className="stats-value">{formatNumber(worldPopulation.deathsToday)}</p>
            </div>
            <div className="stats-icon">💔</div>
          </div>
          
          <div className="stats-card growth">
            <div className="stats-content">
              <h3 className="stats-title">Population Growth Today</h3>
              <p className="stats-value">{formatNumber(worldPopulation.populationGrowthToday)}</p>
            </div>
            <div className="stats-icon">📈</div>
          </div>
        </div>
        
        {/* Population Growth Chart */}
        <div className="chart-section">
          <h3 className="card-title">World Population Growth</h3>
          <div className="chart-container">
            <PopulationGrowthChart />
          </div>
        </div>
        
        {/* Top Countries Table */}
        <div className="table-section">
          <h3 className="card-title">Top 10 Largest Countries By Population (LIVE)</h3>
          <CountryTable countries={topCountries} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;