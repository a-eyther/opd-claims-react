import React from 'react';
import { NavLink } from 'react-router-dom';
import { FileText, Clock, BarChart3, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const Sidebar = ({ isOpen, onClose, collapsed }) => {
  const navItems = [
    { to: '/', icon: FileText, label: 'Claim List' },
    { to: '/pending', icon: Clock, label: 'Pending Claims' },
    { to: '/analytics', icon: BarChart3, label: 'Claim Analytics' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-14 left-0 h-[calc(100vh-3.5rem)] bg-primary-500 text-white z-40 transition-all duration-300",
          "md:translate-x-0",
          collapsed ? "w-16" : "w-56",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <nav className={cn("p-4 space-y-1", collapsed && "px-2")}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-md text-sm font-medium transition-colors",
                  "hover:bg-white/10",
                  collapsed ? "gap-0 px-3 py-3 justify-center" : "gap-3 px-3 py-2",
                  isActive && "bg-white/20"
                )
              }
              onClick={onClose}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Mobile close button */}
        <button
          onClick={onClose}
          className={cn(
            "absolute top-4 p-1 hover:bg-white/10 rounded md:hidden",
            collapsed ? "right-2" : "right-4"
          )}
        >
          <X size={20} />
        </button>
      </aside>
    </>
  );
};

export default Sidebar;