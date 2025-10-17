import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, selectUser } from '../../store/slices/authSlice';

/**
 * Sidebar Navigation Component
 * @param {Object} props
 * @param {boolean} props.isOpen - Sidebar open state (for mobile)
 * @param {Function} props.onClose - Callback to close sidebar
 */
const Sidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const executeLogout = () => {
    setShowLogoutConfirm(false);
    setIsAccountMenuOpen(false);
    handleLogout();
  };

  const menuItems = [
    {
      name: 'Edit Management',
      path: '/dashboard/edit-management',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  const accountItems = [
    // {
    //   name: 'Profile',
    //   icon: (
    //     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    //     </svg>
    //   ),
    //   action: () => navigate('/dashboard/profile'),
    // },
    // {
    //   name: 'Settings',
    //   icon: (
    //     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    //     </svg>
    //   ),
    //   action: () => navigate('/dashboard/settings'),
    // },
    {
      name: 'Logout',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
      action: confirmLogout,
      className: 'text-red-500 hover:bg-gray-100',
    },
  ];

  return (
    <>
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          bg-white border-r border-gray-200
          transition-all duration-300 ease-in-out
          ${isOpen ? 'w-[250px]' : 'w-0 lg:w-16 -translate-x-full lg:translate-x-0'}
          flex flex-col overflow-hidden
        `}
      >
        {/* Logo Section */}
        <div className={`border-b border-gray-200 ${isOpen ? 'px-4 py-5' : 'px-2 py-4'}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#4472C4] rounded-full flex items-center justify-center flex-shrink-0 p-1.5">
              <img
                src="/vitraya-icon.png"
                alt="Vitraya Technologies"
                className="w-full h-full object-contain"
              />
            </div>
            {isOpen && (
              <div>
                <h3 className="text-sm font-semibold leading-tight text-gray-900">Vitraya Technologies</h3>
                <p className="text-xs text-gray-500 leading-tight">OPD Module</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className={`flex-1 py-4 space-y-1 overflow-y-auto ${isOpen ? 'px-3' : 'px-2'}`}>
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center rounded-lg transition-colors
                ${isOpen ? 'gap-3 px-3 py-2.5' : 'justify-center px-2 py-2.5'}
                ${
                  isActive
                    ? 'bg-[#4472C4] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
              title={!isOpen ? item.name : ''}
            >
              {item.icon}
              {isOpen && <span className="text-sm font-medium whitespace-nowrap">{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        {/* My Account Section */}
        {isOpen ? (
          <div className="border-t border-gray-200">
            {/* Dropdown Menu - Appears above profile */}
            {isAccountMenuOpen && (
              <div className="px-4 py-4 space-y-1 border-b border-gray-200">
                {accountItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      item.action();
                      setIsAccountMenuOpen(false);
                      onClose();
                    }}
                    className={`
                      w-full flex items-center gap-2.5 px-2 py-2 rounded
                      transition-colors text-left text-sm
                      ${
                        item.className ||
                        'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    {item.icon}
                    <span className="font-normal">{item.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* User Info - Clickable to toggle dropdown */}
            <button
              onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.firstName || 'Dr. Alok Mehta'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.role || 'Clinical Auditor'}
                </p>
              </div>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${isAccountMenuOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        ) : (
          <div className="border-t border-gray-200 px-2 py-3">
            <button
              onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              className="w-full p-2 flex items-center justify-center hover:bg-gray-50 transition-colors rounded-lg"
              title="My Account"
            >
              <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
