
import React, { useState } from 'react';
import { Route, Switch, Router, useLocation } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Barrels from './pages/Barrels';
import BarrelDetail from './pages/BarrelDetail';
import ScanQR from './pages/ScanQR';
import Metrics from './pages/Metrics';
import Locations from './pages/Locations';
import HistoryPage from './pages/History';
import Recipes from './pages/Recipes';
import Events from './pages/Events';
import AIAgent from './pages/AIAgent';
import AIChatWidget from './components/AIChatWidget';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [location] = useLocation();

  const isAIPage = location === '/ai-agent';

  return (
    <div className="flex bg-[#f8fafc] dark:bg-slate-950 min-h-screen transition-colors duration-300 overflow-x-hidden">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className="flex-1 flex flex-col min-h-screen relative w-full overflow-x-hidden">
        <Header isCollapsed={isCollapsed} />
        <main 
          className={`flex-1 transition-all duration-300 ease-in-out 
            ${isAIPage ? 'p-0 md:p-8' : 'p-4 md:p-8'} 
            ${isCollapsed ? 'md:ml-20' : 'md:ml-64'} 
            mt-16 mb-20 md:mb-0 overflow-x-hidden`}
        >
          <div className={`${isAIPage ? 'max-w-full' : 'max-w-7xl'} mx-auto h-full`}>
            {children}
          </div>
        </main>
        {/* Hide widget if already on the dedicated AI page */}
        {!isAIPage && <AIChatWidget />}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router hook={useHashLocation}>
      <Layout>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/barrels" component={Barrels} />
          <Route path="/barrels/:id" component={BarrelDetail} />
          <Route path="/scan" component={ScanQR} />
          <Route path="/locations" component={Locations} />
          <Route path="/history" component={HistoryPage} />
          <Route path="/metrics" component={Metrics} />
          <Route path="/recipes" component={Recipes} />
          <Route path="/events" component={Events} />
          <Route path="/ai-agent" component={AIAgent} />
          <Route>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 px-4">
              <h1 className="text-4xl font-bold text-secondary dark:text-white">404</h1>
              <p className="text-slate-500 dark:text-slate-400">Página no encontrada</p>
              <button 
                onClick={() => window.location.hash = '#/'}
                className="bg-primary text-white px-6 py-2 rounded-xl font-bold shadow-md"
              >
                Volver al Dashboard
              </button>
            </div>
          </Route>
        </Switch>
      </Layout>
    </Router>
  );
};

export default App;
