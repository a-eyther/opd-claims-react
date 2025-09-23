import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

const MultiSelectAutocomplete = ({
  label,
  value = [],
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
      const optionValue = valueField ? option[valueField] : option;
      
      // Filter out already selected items and match search term
      const isSelected = value.includes(optionValue);
      const matchesSearch = optionText.toLowerCase().includes(searchTerm.toLowerCase());
      
      return !isSelected && matchesSearch;
    });
    setFilteredOptions(filtered);
  }, [searchTerm, options, displayField, valueField, value]);

  const handleSelect = (option) => {
    const selectedValue = valueField ? option[valueField] : option;
    const newValues = [...value, selectedValue];
    onChange(newValues);
    setSearchTerm('');
    inputRef.current?.focus();
  };

  const handleRemove = (itemToRemove) => {
    const newValues = value.filter(item => item !== itemToRemove);
    onChange(newValues);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const getDisplayText = (val) => {
    if (displayField && valueField) {
      const option = options.find(opt => opt[valueField] === val);
      return option ? `${option[valueField]} - ${option[displayField]}` : val;
    }
    return val;
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      {label && <label className="label">{label}</label>}
      
      <div className="min-h-[38px] border rounded-md p-1 flex flex-wrap gap-1 items-center">
        {value.map((item, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs"
          >
            <span className="max-w-[150px] truncate" title={getDisplayText(item)}>
              {getDisplayText(item)}
            </span>
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemove(item)}
                className="hover:bg-primary-200 rounded p-0.5"
              >
                <X size={10} />
              </button>
            )}
          </span>
        ))}
        
        <div className="flex-1 min-w-[100px] relative">
          <input
            ref={inputRef}
            type="text"
            className="w-full border-0 outline-none text-sm px-1"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            placeholder={value.length === 0 ? placeholder : 'Add more...'}
            disabled={disabled}
          />
        </div>
        
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 hover:bg-gray-100 rounded ml-auto"
          disabled={disabled}
        >
          <ChevronDown 
            size={14} 
            className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>
      </div>
      
      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredOptions.map((option, index) => {
            const optionDisplay = displayField 
              ? `${option[valueField]} - ${option[displayField]}`
              : option;
            
            return (
              <div
                key={index}
                className="px-3 py-2 cursor-pointer text-sm hover:bg-gray-50"
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
          <div className="px-3 py-2 text-sm text-gray-500">
            {searchTerm ? 'No matching options' : 'All options selected'}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectAutocomplete;