import { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { BottomBar, ToastContainer, SidebarContent, C } from './components/UI';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import HealthPage from './pages/HealthPage';
import HabitsPage from './pages/HabitsPage';
import GoalsPage from './pages/GoalsPage';
import MorePage from './pages/MorePage';
import ProfilePage from './pages/ProfilePage';

function AppShell() {
  const { user, loading, logout } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
      <div style={{ fontSize:52 }}>🌿</div>
      <div style={{ fontSize:18, fontWeight:700, color:C.text }}>LifeUp</div>
      <div style={{ width:32, height:32, border:'3px solid rgba(124,58,237,0.3)', borderTop:'3px solid #7c3aed', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!user) return <AuthPage />;

  const pages = {
    dashboard: <Dashboard onNav={setTab} />,
    health:    <HealthPage />,
    habits:    <HabitsPage />,
    goals:     <GoalsPage />,
    more:      <MorePage defaultTab="mood" />,
    mood:      <MorePage defaultTab="mood" />,
    finance:   <MorePage defaultTab="finance" />,
    diary:     <MorePage defaultTab="notes" />,
    profile:   <ProfilePage />,
  };

  const nav = (t) => { setTab(t); setSidebarOpen(false); };

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', background:C.bg, maxWidth:430, margin:'0 auto', position:'relative', overflow:'hidden' }}>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <>
          <div onClick={()=>setSidebarOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:200 }}/>
          <SidebarContent active={tab} onNav={nav} onClose={()=>setSidebarOpen(false)} user={user} logout={logout}/>
        </>
      )}

      {/* Page */}
      <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
        {pages[tab] || pages.dashboard}
      </div>

      <BottomBar active={tab} onNav={setTab} onMenuOpen={()=>setSidebarOpen(true)}/>
      <ToastContainer/>
    </div>
  );
}

export default function App() {
  return <AuthProvider><AppShell/></AuthProvider>;
}
