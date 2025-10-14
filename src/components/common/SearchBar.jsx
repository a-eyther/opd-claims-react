/**
 * Search Bar Component
 * @param {Object} props
 * @param {string} props.placeholder - Search placeholder text
 * @param {string} props.value - Search input value
 * @param {Function} props.onChange - Change handler
 */
const SearchBar = ({ placeholder, value, onChange }) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          className="h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   text-sm text-gray-900 placeholder-gray-400 bg-white"
        placeholder={placeholder}
      />
    </div>
  );
};

export default SearchBar;
