import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './CountryTable.css';

/**
 * Country population table component
 * @param {Object} props - Component props
 * @param {Array} props.countries - Array of country data
 * @returns {JSX.Element} Country table component
 */
const CountryTable = ({ countries = [] }) => {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });

  // Format large numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Handle column sort
  const requestSort = (key) => {
    let direction = 'ascending';
    
    // If already sorting by this key, toggle direction
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
  };

  // Sort countries based on current sort configuration
  const sortedCountries = [...countries].sort((a, b) => {
    // If no sort config, return based on rank
    if (!sortConfig.key) {
      return a.rank - b.rank;
    }

    // Sort by the chosen key
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    
    // Default to rank if values are equal
    return a.rank - b.rank;
  });

  // Get sort direction indicator
  const getSortDirectionIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
    }
    return '';
  };

  return (
    <div className="country-table-container">
      <table className="country-table">
        <thead>
          <tr>
            <th 
              onClick={() => requestSort('rank')}
              className={sortConfig.key === 'rank' ? 'sorted' : ''}
            >
              # {getSortDirectionIndicator('rank')}
            </th>
            <th 
              onClick={() => requestSort('country')}
              className={sortConfig.key === 'country' ? 'sorted' : ''}
            >
              Country name {getSortDirectionIndicator('country')}
            </th>
            <th 
              onClick={() => requestSort('male')}
              className={sortConfig.key === 'male' ? 'sorted' : ''}
            >
              Male {getSortDirectionIndicator('male')}
            </th>
            <th 
              onClick={() => requestSort('female')}
              className={sortConfig.key === 'female' ? 'sorted' : ''}
            >
              Female {getSortDirectionIndicator('female')}
            </th>
            <th 
              onClick={() => requestSort('urban')}
              className={sortConfig.key === 'urban' ? 'sorted' : ''}
            >
              Urban {getSortDirectionIndicator('urban')}
            </th>
            <th 
              onClick={() => requestSort('rural')}
              className={sortConfig.key === 'rural' ? 'sorted' : ''}
            >
              Rural {getSortDirectionIndicator('rural')}
            </th>
            <th 
              onClick={() => requestSort('population')}
              className={sortConfig.key === 'population' ? 'sorted' : ''}
            >
              Population {getSortDirectionIndicator('population')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedCountries.map((country, index) => (
            <tr key={index}>
              <td className="rank-cell">{country.rank || index + 1}</td>
              <td className="country-cell">
                {country.flag && <img src={country.flag} alt={`${country.country} flag`} className="country-flag" />}
                {country.country}
              </td>
              <td>{formatNumber(country.male)}</td>
              <td>{formatNumber(country.female)}</td>
              <td>{formatNumber(country.urban)}</td>
              <td>{formatNumber(country.rural)}</td>
              <td className="population-cell">{formatNumber(country.population)}</td>
            </tr>
          ))}
          
          {/* Show empty rows if no data */}
          {sortedCountries.length === 0 && (
            <tr>
              <td colSpan="7" className="empty-message">No country data available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

CountryTable.propTypes = {
  countries: PropTypes.arrayOf(
    PropTypes.shape({
      rank: PropTypes.number,
      country: PropTypes.string.isRequired,
      flag: PropTypes.string,
      male: PropTypes.number.isRequired,
      female: PropTypes.number.isRequired,
      urban: PropTypes.number.isRequired,
      rural: PropTypes.number.isRequired,
      population: PropTypes.number.isRequired
    })
  )
};

export default CountryTable;