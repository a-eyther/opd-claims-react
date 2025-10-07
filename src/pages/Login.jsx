import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, clearError, selectAuthLoading, selectAuthError, selectIsAuthenticated } from '../store/slices/authSlice';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Redirect to dashboard when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    dispatch(clearError());

    // Dispatch login action
    dispatch(loginUser({ username, password }));
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Blue Section */}
      <div className="w-full lg:w-[41%] relative flex flex-col p-8 md:p-12 lg:p-16 overflow-hidden" style={{background: 'linear-gradient(135deg, #2A5EB4 0%, rgba(42, 94, 180, 0.9) 50%, rgba(42, 94, 180, 0.8) 100%)'}}>

        {/* Decorative dots in top-left corner */}
        <div className="absolute top-4 left-4 md:top-6 md:left-6">
          <div className="grid grid-cols-5 gap-[3px]">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="w-[3px] h-[3px] bg-white/40 rounded-full"></div>
            ))}
          </div>
        </div>

        {/* Decorative rectangles on left side */}
        <div className="hidden lg:block absolute left-6 top-[15%] w-16 h-20 border border-white/10 rounded"></div>
        <div className="hidden lg:block absolute left-10 top-[22%] w-20 h-24 border border-white/10 rounded"></div>

        {/* Decorative circles on right side */}
        <div className="hidden lg:block absolute right-12 top-[8%] w-20 h-20 border border-white/10 rounded-full"></div>
        <div className="hidden lg:block absolute right-16 top-[12%] w-12 h-12 border border-white/10 rounded-full"></div>

        {/* Bottom decorative elements */}
        <div className="hidden lg:block absolute left-20 bottom-[15%] w-6 h-6 border border-white/10 rounded-full"></div>
        <div className="hidden lg:block absolute right-24 bottom-[12%] w-8 h-8 border border-white/10 rounded"></div>

        {/* Logo and Company Name - positioned in middle-left */}
        <div className="mt-8 mb-8 lg:mt-auto lg:mb-auto">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-10 h-10 md:w-11 md:h-11 bg-white rounded-full flex items-center justify-center flex-shrink-0 p-1">
              <img src="/vitraya-icon.png" alt="Vitraya Technologies" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-[20px] md:text-[24px] leading-tight">Vitraya Technologies</h3>
              <p className="text-white/80 text-[12px] md:text-[13px] mt-0.5">Edit Portal</p>
            </div>
          </div>

          {/* Welcome Text */}
          <p className="text-white/90 text-[13px] md:text-[14px] leading-[1.6] ml-0">
            Welcome back! You can sign in to access with your<br className="hidden sm:block" />
            <span className="sm:hidden"> </span>existing account.
          </p>
        </div>
      </div>

      {/* Right Panel - White Section with Form */}
      <div className="flex-1 bg-[#FAFBFC] flex items-center justify-center px-6 py-8 md:px-12 lg:px-20">
        <div className="w-full max-w-[90%] sm:max-w-[80%] md:max-w-[70%]">
          <h2 className="text-[24px] md:text-[28px] font-bold text-gray-900 mb-8 md:mb-10">Sign In</h2>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input */}
            <div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username or Email"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md text-[14px] focus:outline-none focus:ring-1 focus:ring-[#5484C7] focus:border-[#5484C7] bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-md text-[14px] focus:outline-none focus:ring-1 focus:ring-[#5484C7] focus:border-[#5484C7] bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  disabled={isLoading}
                >
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between text-[13px] pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-[15px] h-[15px] text-[#5484C7] border-gray-300 rounded focus:ring-[#5484C7] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                />
                <span className="text-gray-700">Remember me</span>
              </label>
              <a href="#" className="text-gray-500 hover:text-[#5484C7]">
                Forgot password?
              </a>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full bg-[#2A5EB4] text-white py-2.5 rounded-md text-[15px] font-medium hover:bg-[#4674b7] transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
