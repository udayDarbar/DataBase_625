import Dashboard from '../pages/Dashboard/Dashboard';
import Login from '../pages/Login/Login';
import Signup from '../pages/Signup/Signup';
// import DemographicsPage from '../pages/Demographics/Demographics';
// import PopulationTrends from '../pages/PopulationTrends/PopulationTrends';
// import CountryStatistics from '../pages/CountryStatistics/CountryStatistics';

/**
 * Application route configuration
 * Contains all route definitions and their associated metadata
 */
export const ROUTES = {
  Login: {
    path: '/login',
    title: 'Login',
    element: Login,
  },
  SignUp: {
    path: '/sign-up',
    title: 'Signup',
    element: Signup,
  },
  dashboard: {
    path: '/dashboard',
    title: 'Dashboard',
    element: Dashboard,
  },
  /**demographics: {
    path: '/demographics',
    title: 'Demographics',
    element: DemographicsPage,
  },
  trends: {
    path: '/trends',
    title: 'Population Trends',
    element: PopulationTrends,
  },
  countries: {
    path: '/countries',
    title: 'Country Statistics',
    element: CountryStatistics,
  },*/
};


/**
 * Get page title from current path
 * @param {string} pathname - Current location pathname
 * @returns {string} Page title
 */
export const getPageTitle = (pathname) => {
  const route = Object.values(ROUTES).find((route) => route.path === pathname);
  return route?.title || 'Dashboard';
};