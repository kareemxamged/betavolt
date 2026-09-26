'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, AlertCircle, Check } from 'lucide-react';
import {
  SupportedCountryCode,
  SUPPORTED_COUNTRIES,
  SUPPORTED_COUNTRIES_LIST,
  validateRegionalPhone,
  RegionalPhoneValidationResult,
} from '@/lib/validation/regional-phone-validator';

interface RegionalPhoneInputProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string, result: RegionalPhoneValidationResult) => void;
  defaultCountry?: SupportedCountryCode;
  locale?: 'ar' | 'en';
  required?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  variant?: 'modal-dark' | 'standard'; // 'modal-dark' for LeadMagnetModal, 'standard' for QuoteModal & forms
  showHint?: boolean;
  error?: string | null;
  onErrorChange?: (error: string | null) => void;
}

export default function RegionalPhoneInput({
  id = 'regional-phone-input',
  name = 'phone',
  value,
  onChange,
  defaultCountry = 'SA',
  locale = 'ar',
  required = true,
  disabled = false,
  autoFocus = false,
  className = '',
  variant = 'standard',
  showHint = true,
  error: controlledError,
  onErrorChange,
}: RegionalPhoneInputProps) {
  const isAr = locale === 'ar';
  const [selectedCountry, setSelectedCountry] = useState<SupportedCountryCode>(defaultCountry);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayError = controlledError !== undefined ? controlledError : internalError;

  // Active country info
  const currentCountry = SUPPORTED_COUNTRIES[selectedCountry] || SUPPORTED_COUNTRIES.SA;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update error and notify parent
  const setError = (err: string | null) => {
    setInternalError(err);
    if (onErrorChange) {
      onErrorChange(err);
    }
  };

  // Run validation
  const handleValidate = (val: string, country: SupportedCountryCode) => {
    if (!val.trim()) {
      if (required) {
        const res = validateRegionalPhone(val, country, locale);
        setError(res.message);
        return res;
      }
      setError(null);
      return { isValid: true, message: '', messageAr: '', messageEn: '' } as RegionalPhoneValidationResult;
    }

    const res = validateRegionalPhone(val, country, locale);
    if (!res.isValid) {
      setError(res.message);
    } else {
      setError(null);
    }
    return res;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;

    // Check if user pasted an international number starting with + or 00
    if (rawVal.startsWith('+') || rawVal.startsWith('00')) {
      const normalized = rawVal.replace(/^(00|\+)/, '');
      const matched = SUPPORTED_COUNTRIES_LIST.find(c => normalized.startsWith(c.dialDigits));
      if (matched) {
        setSelectedCountry(matched.code);
        const nationalPart = normalized.slice(matched.dialDigits.length);
        const res = handleValidate(nationalPart, matched.code);
        onChange(rawVal, res);
        return;
      }
    }

    const res = handleValidate(rawVal, selectedCountry);
    onChange(rawVal, res);
  };

  const handleCountrySelect = (countryCode: SupportedCountryCode) => {
    setSelectedCountry(countryCode);
    setDropdownOpen(false);
    if (value) {
      const res = handleValidate(value, countryCode);
      onChange(value, res);
    }
    inputRef.current?.focus();
  };

  const isModalDark = variant === 'modal-dark';

  return (
    <div className={`w-full ${className}`}>
      <div className="relative flex items-center">
        {/* Country Selector Dropdown Trigger */}
        <div ref={dropdownRef} className="relative shrink-0">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`
              flex items-center gap-1.5 px-3 py-2.5 h-[42px]
              ${isAr ? 'rounded-r-xl border-l-0 border-r border-y' : 'rounded-l-xl border-r-0 border-l border-y'}
              ${
                isModalDark
                  ? 'bg-[#0E1526] hover:bg-[#131E35] border-[#1E2D4A] text-slate-200'
                  : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200'
              }
              text-xs sm:text-sm font-semibold transition-colors
              focus:outline-none focus:z-10
            `}
            title={isAr ? currentCountry.nameAr : currentCountry.nameEn}
            aria-label="Select Country"
          >
            <span className="text-base select-none">{currentCountry.flag}</span>
            <span dir="ltr" className="font-mono text-xs text-slate-400 dark:text-slate-300">
              {currentCountry.dialCode}
            </span>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div
              className={`
                absolute z-50 mt-1.5 w-60 py-1.5 shadow-2xl rounded-xl
                ${isAr ? 'right-0' : 'left-0'}
                ${
                  isModalDark
                    ? 'bg-[#0B1220] border border-[#1E2D4A] divide-y divide-[#17233B]'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800'
                }
                max-h-64 overflow-y-auto focus:outline-none
              `}
            >
              {SUPPORTED_COUNTRIES_LIST.map((c) => {
                const isSelected = c.code === selectedCountry;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleCountrySelect(c.code)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 text-xs transition-colors
                      ${
                        isSelected
                          ? isModalDark
                            ? 'bg-blue-600/20 text-cyan-400 font-bold'
                            : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold'
                          : isModalDark
                          ? 'text-slate-300 hover:bg-[#131E35]'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base select-none">{c.flag}</span>
                      <span className="truncate">{isAr ? c.nameAr : c.nameEn}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span dir="ltr" className="font-mono text-[11px] text-slate-400">
                        {c.dialCode}
                      </span>
                      {isSelected && <Check size={14} className="text-cyan-400 shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* National Number Input */}
        <div className="relative flex-1">
          <input
            ref={inputRef}
            id={id}
            name={name}
            type="tel"
            required={required}
            disabled={disabled}
            autoFocus={autoFocus}
            autoComplete="tel-national"
            placeholder={currentCountry.placeholder}
            value={value}
            onChange={handleInputChange}
            onBlur={() => handleValidate(value, selectedCountry)}
            dir="ltr"
            className={`
              w-full py-2.5 px-3.5 h-[42px]
              ${isAr ? 'rounded-l-xl text-right' : 'rounded-r-xl text-left'}
              ${
                isModalDark
                  ? `bg-[#070B14] ${displayError ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : 'border-[#1E2D4A] focus:ring-cyan-400 focus:border-cyan-400'} text-white placeholder:text-slate-600`
                  : `bg-slate-50 dark:bg-slate-900/60 ${displayError ? 'border-red-500 dark:border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500'} text-slate-900 dark:text-white placeholder:text-slate-400`
              }
              border text-xs sm:text-sm font-medium
              focus:outline-none focus:ring-1 transition-colors
            `}
          />
        </div>
      </div>

      {/* Error / Hint Messages */}
      {displayError ? (
        <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400 flex items-start gap-1 font-medium leading-tight">
          <AlertCircle size={13} className="shrink-0 mt-0.5" />
          <span>{displayError}</span>
        </p>
      ) : showHint ? (
        <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
          {isAr
            ? `نقبل فقط أرقام هواتف فعالة لدول الخليج العربي ومصر (${currentCountry.placeholder})`
            : `Active phone numbers from GCC & Egypt only (${currentCountry.placeholder})`}
        </p>
      ) : null}
    </div>
  );
}
