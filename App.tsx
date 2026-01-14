
import React, { useState, useEffect } from 'react';
import { Route, Switch, Router, useLocation } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Barrels from './pages/Barrels';
import BarrelDetail from './pages/BarrelDetail';
import Batches from './pages/Batches';
import ScanQR from './pages/ScanQR';
import Metrics from './pages/Metrics';
import Locations from './pages/Locations';
import HistoryPage from './pages/History';
import Recipes from './pages/Recipes';
import Events from './pages/Events';
import AIAgent from './pages/AIAgent';
import AIChatWidget from './components/AIChatWidget';
import Login from './pages/Login';
import { authService, UserSession } from './services/authService';

const Layout: React.FC<{ children: React.ReactNode; user: UserSession; onLogout: () => void }> = ({ children, user, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [location] = useLocation();

  const isAIPage = location === '/ai-agent';

  return (
    <div className="flex bg-[#f8fafc] dark:bg-slate-950 min-h-screen transition-colors duration-300 overflow-x-hidden">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} user={user} onLogout={onLogout} />
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
        {!isAIPage && <AIChatWidget />}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const currentSession = authService.getCurrentSession();
    setSession(currentSession);
    setIsInitializing(false);
  }, []);

  const handleLoginSuccess = () => {
    setSession(authService.getCurrentSession());
  };

  const handleLogout = () => {
    authService.logout();
    setSession(null);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Cargando Sistema...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Router hook={useHashLocation}>
      <Layout user={session} onLogout={handleLogout}>
        <Switch>
          <Route path="/">
            <Dashboard user={session} />
          </Route>
          <Route path="/barrels" component={Barrels} />
          <Route path="/barrels/:id" component={BarrelDetail} />
          <Route path="/batches" component={Batches} />
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
