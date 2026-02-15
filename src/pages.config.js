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
import About from './pages/About';
import AdminActivity from './pages/AdminActivity';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminDashboard from './pages/AdminDashboard';
import AdminRFQs from './pages/AdminRFQs';
import AdminShipments from './pages/AdminShipments';
import AdminUsers from './pages/AdminUsers';
import ClientDashboard from './pages/ClientDashboard';
import ClientPreferences from './pages/ClientPreferences';
import ClientRFQs from './pages/ClientRFQs';
import ClientShipments from './pages/ClientShipments';
import Clients from './pages/Clients';
import Contact from './pages/Contact';
import CreateShipment from './pages/CreateShipment';
import GlobalNetwork from './pages/GlobalNetwork';
import Home from './pages/Home';
import Industries from './pages/Industries';
import OperationsDashboard from './pages/OperationsDashboard';
import OperationsShipments from './pages/OperationsShipments';
import Portal from './pages/Portal';
import PricingDashboard from './pages/PricingDashboard';
import PricingQueue from './pages/PricingQueue';
import RequestQuote from './pages/RequestQuote';
import SalesDashboard from './pages/SalesDashboard';
import SalesRFQQueue from './pages/SalesRFQQueue';
import Services from './pages/Services';
import TrackShipment from './pages/TrackShipment';
import WhyChooseUs from './pages/WhyChooseUs';
import SeaFreight from './pages/SeaFreight';
import AirFreight from './pages/AirFreight';
import InlandTransport from './pages/InlandTransport';
import CustomsClearance from './pages/CustomsClearance';
import Warehousing from './pages/Warehousing';
import ProjectLogistics from './pages/ProjectLogistics';
import RoRoServices from './pages/RoRoServices';
import Consultancy from './pages/Consultancy';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import ClientSupport from './pages/ClientSupport';
import OperationsFlow from './pages/OperationsFlow';
import AdminReporting from './pages/AdminReporting';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "AdminActivity": AdminActivity,
    "AdminAnalytics": AdminAnalytics,
    "AdminDashboard": AdminDashboard,
    "AdminRFQs": AdminRFQs,
    "AdminShipments": AdminShipments,
    "AdminUsers": AdminUsers,
    "ClientDashboard": ClientDashboard,
    "ClientPreferences": ClientPreferences,
    "ClientRFQs": ClientRFQs,
    "ClientShipments": ClientShipments,
    "Clients": Clients,
    "Contact": Contact,
    "CreateShipment": CreateShipment,
    "GlobalNetwork": GlobalNetwork,
    "Home": Home,
    "Industries": Industries,
    "OperationsDashboard": OperationsDashboard,
    "OperationsShipments": OperationsShipments,
    "Portal": Portal,
    "PricingDashboard": PricingDashboard,
    "PricingQueue": PricingQueue,
    "RequestQuote": RequestQuote,
    "SalesDashboard": SalesDashboard,
    "SalesRFQQueue": SalesRFQQueue,
    "Services": Services,
    "TrackShipment": TrackShipment,
    "WhyChooseUs": WhyChooseUs,
    "SeaFreight": SeaFreight,
    "AirFreight": AirFreight,
    "InlandTransport": InlandTransport,
    "CustomsClearance": CustomsClearance,
    "Warehousing": Warehousing,
    "ProjectLogistics": ProjectLogistics,
    "RoRoServices": RoRoServices,
    "Consultancy": Consultancy,
    "PrivacyPolicy": PrivacyPolicy,
    "TermsOfService": TermsOfService,
    "ClientSupport": ClientSupport,
    "OperationsFlow": OperationsFlow,
    "AdminReporting": AdminReporting,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};