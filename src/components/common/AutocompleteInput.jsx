import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

const AutocompleteInput = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Type to search...',
  disabled = false,
  displayField = null,
  valueField = null,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search term
  useEffect(() => {
    const filtered = options.filter(option => {
      const optionText = displayField 
        ? `${option[valueField]} - ${option[displayField]}`
        : option;
      return optionText.toLowerCase().includes(searchTerm.toLowerCase());
    });
    setFilteredOptions(filtered);
  }, [searchTerm, options, displayField, valueField]);

  // Update search term when value changes
  useEffect(() => {
    if (value) {
      if (displayField && valueField) {
        const selectedOption = options.find(opt => opt[valueField] === value);
        if (selectedOption) {
          setSearchTerm(`${selectedOption[valueField]} - ${selectedOption[displayField]}`);
        }
      } else {
        setSearchTerm(value);
      }
    } else {
      setSearchTerm('');
    }
  }, [value, options, displayField, valueField]);

  const handleSelect = (option) => {
    const selectedValue = valueField ? option[valueField] : option;
    const displayText = displayField 
      ? `${option[valueField]} - ${option[displayField]}`
      : option;
    
    onChange(selectedValue);
    setSearchTerm(displayText);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setSearchTerm('');
    setFilteredOptions(options);
    inputRef.current?.focus();
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    if (!e.target.value) {
      onChange('');
    }
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      {label && <label className="label">{label}</label>}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className="input pr-16"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded"
              disabled={disabled}
            >
              <X size={14} className="text-gray-400" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-gray-100 rounded"
            disabled={disabled}
          >
            <ChevronDown 
              size={14} 
              className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            />
          </button>
        </div>
      </div>
      
      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredOptions.map((option, index) => {
            const optionValue = valueField ? option[valueField] : option;
            const optionDisplay = displayField 
              ? `${option[valueField]} - ${option[displayField]}`
              : option;
            const isSelected = optionValue === value;
            
            return (
              <div
                key={index}
                className={`px-3 py-2 cursor-pointer text-sm hover:bg-gray-50 ${
                  isSelected ? 'bg-primary-50 text-primary-600' : ''
                }`}
                onClick={() => handleSelect(option)}
              >
                {optionDisplay}
              </div>
            );
          })}
        </div>
      )}
      
      {isOpen && filteredOptions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg">
          <div className="px-3 py-2 text-sm text-gray-500">No options found</div>
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;