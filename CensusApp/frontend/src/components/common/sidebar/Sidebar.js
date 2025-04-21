import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import PropTypes from 'prop-types';
import {
  Settings,
  Menu,
  BarChart2,
  Grid,
  LogOut,
  Globe,
  TrendingUp,
  Users,
  Info,
  X
} from 'lucide-react';
import './Sidebar.css';
import { useClerk } from '@clerk/clerk-react';
import { useUserProfile } from '../../../contexts/UserContext';

/**
 * NavItem component for sidebar navigation
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.icon - Icon component to display
 * @param {string} props.label - Navigation item label
 * @param {string} props.badge - Optional badge text
 * @param {boolean} props.isActive - Whether the item is currently active
 * @param {Function} props.onClick - Click handler
 */
const NavItem = ({ icon, label, badge, isActive, onClick }) => (
  <div className={`nav-item ${isActive ? 'active' : ''}`} onClick={onClick}>
    <div className="flex items-center gap-3">
      {icon}
      <span className="text-sm font-semibold">{label}</span>
    </div>
    {badge && badge !== '0' && (
      <span className="px-2 py-1 bg-red-500 text-white text-xs rounded">
        {badge}
      </span>
    )}
  </div>
);

NavItem.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  badge: PropTypes.string,
  isActive: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

/**
 * Sidebar component for application navigation
 */
const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useClerk();
  const { user } = useClerk();
  const { userProfile } = useUserProfile();
  const [userRole, setUserRole] = useState(userProfile?.role ?? 'Loading…'); 

  // Set user role from userProfile
  useEffect(() => {
    if (userProfile && userProfile.role) {
      setUserRole(userProfile.role);
    }
  }, [userProfile]);

  // Update the logout handler
  const handleLogout = async () => {
    try {
      await signOut(); // Clerk will handle clearing authentication state
      navigate('/login', { replace: true }); // Use replace to prevent going back
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Remove logout from navItems array (keep only main navigation items)
  const navItems = [
    {
      icon: <Grid className="w-4 h-4" />,
      label: 'Dashboard',
      page: '/dashboard',
    },
    { 
      icon: <Globe className="w-4 h-4" />, 
      label: 'Demographics', 
      page: '/demographics' 
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      label: 'Population Trends',
      page: '/trends',
    },
    {
      icon: <Users className="w-4 h-4" />,
      label: 'Country Statistics',
      page: '/countries',
    },
    {
      icon: <BarChart2 className="w-4 h-4" />,
      label: 'Census Data',
      page: '/census-data',
    },
    {
      icon: <Settings className="w-4 h-4" />,
      label: 'Settings', 
      page: '/settings',
    },
  ];

  const mobileClass = isOpen ? 'open' : '';

  // Adds the logout button at the bottom
  return (
    <div className={`sidebar ${mobileClass}`}>
      {/* Close button (mobile only) */}
      {isOpen && (
        <button className="mobile-close-button" onClick={onClose}>
          <X size={24} />
        </button>
      )}
      
      {/* Header */}
      <div className="header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">C</div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Census Dashboard</h1>
              <p className="text-xs text-gray-500">Population Data</p>
            </div>
          </div>
          <Menu className="w-5 h-5 text-gray-500" />
        </div>
      </div>

      {/* User Profile */}
      <div className="profile-section">
        <div className="profile-card">
          {/* Clerk-specific user icon */}
          <UserButton />
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {user && 
                // Uppercases the first letter of each name
                user.firstName.charAt(0).toUpperCase() +
                  user.firstName.slice(1) +
                  ' ' +
                  user.lastName.charAt(0).toUpperCase() +
                  user.lastName.slice(1)
              }
            </p>
            <p className="text-xs text-gray-500">{userRole}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="nav-section flex-grow">
        <p className="text-sm text-gray-500 mb-4 px-4">Main Menu</p>
        <div className="space-y-2">
          {navItems.map((item) => (
            <NavItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              badge={item.badge}
              isActive={location.pathname === item.page}
              onClick={() => {
                navigate(item.page);
                if (isOpen) onClose();
              }}
            />
          ))}
        </div>
      </nav>

      {/* About and Logout Section */}
      <div className="mt-auto border-t border-gray-200 py-4 px-4">
        <div className="space-y-2">
          <NavItem
            icon={<Info className="w-4 h-4" />}
            label="About"
            isActive={location.pathname === '/about'}
            onClick={() => {
              navigate('/about');
              if (isOpen) onClose();
            }}
          />
          <NavItem
            icon={<LogOut className="w-4 h-4" />}
            label="Logout"
            isActive={false}
            onClick={handleLogout}
          />
        </div>
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};

Sidebar.defaultProps = {
  isOpen: false,
  onClose: () => {},
};

export default Sidebar;