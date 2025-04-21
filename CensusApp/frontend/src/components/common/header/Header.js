import React from 'react';
import PropTypes from 'prop-types';
import { UserButton } from '@clerk/clerk-react';
import { Menu } from 'lucide-react';
import './Header.css';

/**
 * Header component for the dashboard
 * Fixed position header that aligns with the sidebar width
 * @component
 * @param {Object} props
 * @param {string} props.title - The current page title
 * @param {Function} props.onMenuToggle - Handler for mobile menu toggle
 * @param {boolean} props.isMobileMenuOpen - Mobile menu open state
 */
const Header = ({ title, onMenuToggle, isMobileMenuOpen }) => {
  return (
    <header className="dashboard-header">
      <div className="header-content">
        <div className="header-left">
          <button 
            className="mobile-menu-button md:hidden"
            onClick={onMenuToggle}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-800">{title}</h1>
        </div>
        
        <div className="header-right">
          <UserButton />
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  title: PropTypes.string.isRequired,
  onMenuToggle: PropTypes.func,
  isMobileMenuOpen: PropTypes.bool,
};

Header.defaultProps = {
  onMenuToggle: () => {},
  isMobileMenuOpen: false,
};

export default Header;