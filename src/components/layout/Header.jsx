import React, { useState } from 'react';
import { Bell, ChevronDown, Menu, User, LogOut, Keyboard, PanelLeftClose, PanelLeft } from 'lucide-react';
import { cn } from '../../utils/cn';

const Header = ({ onMenuClick, onToggleCollapse, sidebarCollapsed }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-gradient-to-r from-primary-500 to-primary-600 text-white z-50 shadow-md">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden p-1.5 hover:bg-white/10 rounded-md transition-colors"
          >
            <Menu size={20} />
          </button>
          
          <button
            onClick={onToggleCollapse}
            className="hidden md:block p-1.5 hover:bg-white/10 rounded-md transition-colors"
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center">
              <div className="w-5 h-5 bg-primary-500 rounded-full"></div>
            </div>
            <span className="text-lg font-semibold">OPD MODULE</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="relative p-1.5 hover:bg-white/10 rounded-md transition-colors"
            title="Keyboard Shortcuts"
          >
            <Keyboard size={18} />
          </button>
          
          <button className="relative p-1.5 hover:bg-white/10 rounded-md transition-colors">
            <Bell size={18} />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-2xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-md transition-colors"
            >
              <div className="w-7 h-7 bg-white text-primary-500 rounded-full flex items-center justify-center text-xs font-semibold">
                JE
              </div>
              <ChevronDown size={14} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 text-gray-700">
                <div className="px-4 py-2 border-b border-gray-200">
                  <div className="text-sm font-medium">John Executive</div>
                  <div className="text-xs text-gray-500">Junior Executive</div>
                </div>
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                  <User size={14} />
                  Profile Settings
                </button>
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600">
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            )}
          </div>
          
          {showShortcuts && (
            <div className="absolute right-12 top-12 mt-2 bg-white rounded-lg shadow-lg p-4 text-gray-700 min-w-[280px]">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Keyboard size={16} />
                Keyboard Shortcuts
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Save Changes</span>
                  <kbd className="px-2 py-0.5 bg-gray-100 rounded font-mono">Ctrl/Cmd + S</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Undo Last Change</span>
                  <kbd className="px-2 py-0.5 bg-gray-100 rounded font-mono">Ctrl/Cmd + Z</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Open Query Panel</span>
                  <kbd className="px-2 py-0.5 bg-gray-100 rounded font-mono">Ctrl/Cmd + Q</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Step 1: Claim Info</span>
                  <kbd className="px-2 py-0.5 bg-gray-100 rounded font-mono">Alt + 1</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Step 2: Digitization</span>
                  <kbd className="px-2 py-0.5 bg-gray-100 rounded font-mono">Alt + 2</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Step 3: Clinical Validation</span>
                  <kbd className="px-2 py-0.5 bg-gray-100 rounded font-mono">Alt + 3</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Close Panels</span>
                  <kbd className="px-2 py-0.5 bg-gray-100 rounded font-mono">Esc</kbd>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;