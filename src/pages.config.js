/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Industries from './pages/Industries';
import WhyChooseUs from './pages/WhyChooseUs';
import GlobalNetwork from './pages/GlobalNetwork';
import Contact from './pages/Contact';
import RequestQuote from './pages/RequestQuote';
import TrackShipment from './pages/TrackShipment';
import Clients from './pages/Clients';
import ClientDashboard from './pages/ClientDashboard';
import ClientRFQs from './pages/ClientRFQs';
import ClientShipments from './pages/ClientShipments';
import SalesDashboard from './pages/SalesDashboard';
import SalesRFQQueue from './pages/SalesRFQQueue';
import PricingDashboard from './pages/PricingDashboard';
import PricingQueue from './pages/PricingQueue';
import OperationsDashboard from './pages/OperationsDashboard';
import CreateShipment from './pages/CreateShipment';
import OperationsShipments from './pages/OperationsShipments';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminRFQs from './pages/AdminRFQs';
import AdminShipments from './pages/AdminShipments';
import AdminActivity from './pages/AdminActivity';
import AdminAnalytics from './pages/AdminAnalytics';
import Portal from './pages/Portal';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "About": About,
    "Services": Services,
    "Industries": Industries,
    "WhyChooseUs": WhyChooseUs,
    "GlobalNetwork": GlobalNetwork,
    "Contact": Contact,
    "RequestQuote": RequestQuote,
    "TrackShipment": TrackShipment,
    "Clients": Clients,
    "ClientDashboard": ClientDashboard,
    "ClientRFQs": ClientRFQs,
    "ClientShipments": ClientShipments,
    "SalesDashboard": SalesDashboard,
    "SalesRFQQueue": SalesRFQQueue,
    "PricingDashboard": PricingDashboard,
    "PricingQueue": PricingQueue,
    "OperationsDashboard": OperationsDashboard,
    "CreateShipment": CreateShipment,
    "OperationsShipments": OperationsShipments,
    "AdminDashboard": AdminDashboard,
    "AdminUsers": AdminUsers,
    "AdminRFQs": AdminRFQs,
    "AdminShipments": AdminShipments,
    "AdminActivity": AdminActivity,
    "AdminAnalytics": AdminAnalytics,
    "Portal": Portal,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};