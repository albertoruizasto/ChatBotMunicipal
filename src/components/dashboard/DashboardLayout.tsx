import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import DashboardHeader from './DashboardHeader'

export default function DashboardLayout() {
  const [collapsed, setCollapsed]     = useState(false) // desktop collapsed
  const [mobileOpen, setMobileOpen]   = useState(false) // mobile drawer

  const handleMenuClick = () => {
    // En móvil abre/cierra el drawer; en desktop colapsa/expande
    const isMobile = window.innerWidth < 768
    if (isMobile) {
      setMobileOpen((o) => !o)
    } else {
      setCollapsed((c) => !c)
    }
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <DashboardHeader onMenuClick={handleMenuClick} />

        {/* Área de contenido — las páginas controlan su propio overflow */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
