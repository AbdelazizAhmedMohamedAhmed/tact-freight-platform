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
import AdminClients from './pages/AdminClients';
import AdminDashboard from './pages/AdminDashboard';
import AdminRFQs from './pages/AdminRFQs';
import AdminReporting from './pages/AdminReporting';
import AdminShipments from './pages/AdminShipments';
import AdminUsers from './pages/AdminUsers';
import AirFreight from './pages/AirFreight';
import BizDevPartners from './pages/BizDevPartners';
import ClientDashboard from './pages/ClientDashboard';
import ClientPreferences from './pages/ClientPreferences';
import ClientRFQs from './pages/ClientRFQs';
import ClientShipmentDetail from './pages/ClientShipmentDetail';
import ClientShipments from './pages/ClientShipments';
import ClientSupport from './pages/ClientSupport';
import Clients from './pages/Clients';
import Consultancy from './pages/Consultancy';
import Contact from './pages/Contact';
import CreateShipment from './pages/CreateShipment';
import CustomsClearance from './pages/CustomsClearance';
import GlobalNetwork from './pages/GlobalNetwork';
import Home from './pages/Home';
import Industries from './pages/Industries';
import InlandTransport from './pages/InlandTransport';
import MyWorkspace from './pages/MyWorkspace';
import OperationsDashboard from './pages/OperationsDashboard';
import OperationsFlow from './pages/OperationsFlow';
import OperationsShipmentDetail from './pages/OperationsShipmentDetail';
import OperationsShipments from './pages/OperationsShipments';
import PendingAmendments from './pages/PendingAmendments';
import Portal from './pages/Portal';
import PricingContactSales from './pages/PricingContactSales';
import PricingCreateQuotation from './pages/PricingCreateQuotation';
import PricingDashboard from './pages/PricingDashboard';
import PricingQueue from './pages/PricingQueue';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Profile from './pages/Profile';
import ProjectLogistics from './pages/ProjectLogistics';
import RoRoServices from './pages/RoRoServices';
import SalesCRM from './pages/SalesCRM';
import SalesCompanies from './pages/SalesCompanies';
import SalesCreateRFQ from './pages/SalesCreateRFQ';
import SalesDashboard from './pages/SalesDashboard';
import SalesManagePricing from './pages/SalesManagePricing';
import SalesRFQQueue from './pages/SalesRFQQueue';
import SeaFreight from './pages/SeaFreight';
import Services from './pages/Services';
import SupervisorDashboard from './pages/SupervisorDashboard';
import TermsOfService from './pages/TermsOfService';
import TrackShipment from './pages/TrackShipment';
import Warehousing from './pages/Warehousing';
import WhyChooseUs from './pages/WhyChooseUs';
import ClientReporting from './pages/ClientReporting';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "AdminActivity": AdminActivity,
    "AdminAnalytics": AdminAnalytics,
    "AdminClients": AdminClients,
    "AdminDashboard": AdminDashboard,
    "AdminRFQs": AdminRFQs,
    "AdminReporting": AdminReporting,
    "AdminShipments": AdminShipments,
    "AdminUsers": AdminUsers,
    "AirFreight": AirFreight,
    "BizDevPartners": BizDevPartners,
    "ClientDashboard": ClientDashboard,
    "ClientPreferences": ClientPreferences,
    "ClientRFQs": ClientRFQs,
    "ClientShipmentDetail": ClientShipmentDetail,
    "ClientShipments": ClientShipments,
    "ClientSupport": ClientSupport,
    "Clients": Clients,
    "Consultancy": Consultancy,
    "Contact": Contact,
    "CreateShipment": CreateShipment,
    "CustomsClearance": CustomsClearance,
    "GlobalNetwork": GlobalNetwork,
    "Home": Home,
    "Industries": Industries,
    "InlandTransport": InlandTransport,
    "MyWorkspace": MyWorkspace,
    "OperationsDashboard": OperationsDashboard,
    "OperationsFlow": OperationsFlow,
    "OperationsShipmentDetail": OperationsShipmentDetail,
    "OperationsShipments": OperationsShipments,
    "PendingAmendments": PendingAmendments,
    "Portal": Portal,
    "PricingContactSales": PricingContactSales,
    "PricingCreateQuotation": PricingCreateQuotation,
    "PricingDashboard": PricingDashboard,
    "PricingQueue": PricingQueue,
    "PrivacyPolicy": PrivacyPolicy,
    "Profile": Profile,
    "ProjectLogistics": ProjectLogistics,
    "RoRoServices": RoRoServices,
    "SalesCRM": SalesCRM,
    "SalesCompanies": SalesCompanies,
    "SalesCreateRFQ": SalesCreateRFQ,
    "SalesDashboard": SalesDashboard,
    "SalesManagePricing": SalesManagePricing,
    "SalesRFQQueue": SalesRFQQueue,
    "SeaFreight": SeaFreight,
    "Services": Services,
    "SupervisorDashboard": SupervisorDashboard,
    "TermsOfService": TermsOfService,
    "TrackShipment": TrackShipment,
    "Warehousing": Warehousing,
    "WhyChooseUs": WhyChooseUs,
    "ClientReporting": ClientReporting,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};