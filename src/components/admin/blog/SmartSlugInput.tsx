"use client";

import React, { useState, useEffect } from 'react';
import { Link2, RefreshCw, Check, AlertTriangle, Info } from 'lucide-react';
import { generateSEOSlug, validateSlug } from '@/lib/utils/seoUtils';

interface SmartSlugInputProps {
    title: string;
    value: string;
    onChange: (slug: string) => void;
    onValidationChange?: (valid: boolean) => void;
    checkAvailability?: (slug: string) => Promise<boolean>;
}

export const SmartSlugInput: React.FC<SmartSlugInputProps> = ({
    title,
    value,
    onChange,
    onValidationChange,
    checkAvailability
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [validationResult, setValidationResult] = useState<ReturnType<typeof validateSlug>>({
        valid: true,
        issues: []
    });

    // Auto-generate slug from title if not editing manually
    useEffect(() => {
        if (!isEditing && title && !value) {
            const generated = generateSEOSlug(title);
            onChange(generated);
        }
    }, [title, isEditing, value, onChange]);

    // Validate slug whenever it changes
    useEffect(() => {
        if (value) {
            const result = validateSlug(value);
            setValidationResult(result);
            onValidationChange?.(result.valid && (isAvailable !== false));
        }
    }, [value, isAvailable, onValidationChange]);

    // Check availability when slug changes
    useEffect(() => {
        if (!value || !checkAvailability) return;

        const timeoutId = setTimeout(async () => {
            setIsChecking(true);
            try {
                const available = await checkAvailability(value);
                setIsAvailable(available);
            } catch (error) {
                console.error('Failed to check slug availability:', error);
                setIsAvailable(null);
            } finally {
                setIsChecking(false);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [value, checkAvailability]);

    const handleRegenerate = () => {
        if (title) {
            const generated = generateSEOSlug(title);
            onChange(generated);
            setIsEditing(false);
        }
    };

    const handleManualChange = (newValue: string) => {
        setIsEditing(true);
        // Auto-sanitize as user types
        const sanitized = newValue
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-{2,}/g, '-')
            .replace(/^-|-$/g, '');
        onChange(sanitized);
    };

    const getStatusIcon = () => {
        if (isChecking) {
            return <RefreshCw className="h-4 w-4 text-[#1A403D] animate-spin" />;
        }

        if (!validationResult.valid) {
            return <AlertTriangle className="h-4 w-4 text-red-500" />;
        }

        if (isAvailable === false) {
            return <AlertTriangle className="h-4 w-4 text-orange-500" />;
        }

        if (isAvailable === true) {
            return <Check className="h-4 w-4 text-green-500" />;
        }

        return <Link2 className="h-4 w-4 text-gray-400" />;
    };

    const getStatusText = () => {
        if (isChecking) return 'Checking availability...';
        if (!validationResult.valid) return 'Invalid slug format';
        if (isAvailable === false) return 'Slug already taken';
        if (isAvailable === true) return 'Slug available';
        return '';
    };

    return (
        <div className="space-y-2">
            {/* Label */}
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700 ">
                    URL Slug <span className="text-red-500">*</span>
                </label>
                <button
                    type="button"
                    onClick={handleRegenerate}
                    className="flex items-center gap-1 text-xs text-[#1A403D] hover:text-blue-700 transition-colors"
                    disabled={!title}
                    title="Generate from title"
                >
                    <RefreshCw className="h-3 w-3" />
                    Auto-generate
                </button>
            </div>

            {/* Input with Preview */}
            <div className="relative">
                {/* Domain Preview */}
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-sm text-gray-500 ">
                    .../blogs/
                </div>

                <input
                    type="text"
                    value={value}
                    onChange={(e) => handleManualChange(e.target.value)}
                    className={`block w-full pl-24 pr-10 py-2.5 rounded-lg border transition-colors
 ${!validationResult.valid || isAvailable === false
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                            : validationResult.valid && isAvailable === true
                                ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                                : 'border-gray-300 focus:border-[#1A403D] focus:ring-[#1A403D]'
                        }
 bg-white text-gray-900 
 placeholder-gray-500 
 focus:outline-none focus:ring-2
 `}
 placeholder="auto-generated-from-title"
 />

 {/* Status Icon */}
 <div className="absolute inset-y-0 right-0 flex items-center pr-3">
 {getStatusIcon()}
 </div>
 </div>

 {/* Character Count */}
 <div className="flex items-center justify-between text-xs">
 <span className={`${
 value.length > 60 ? 'text-orange-600' :
 value.length > 50 ? 'text-yellow-600' :
 'text-gray-500'
 }`}>
 {value.length}/60 characters
 </span>
 {getStatusText() && (
 <span className={`flex items-center gap-1 ${
 isAvailable === false || !validationResult.valid
 ? 'text-red-600'
 : isAvailable === true
 ? 'text-green-600'
 : 'text-gray-500'
 }`}>
 {getStatusText()}
 </span>
 )}
 </div>

 {/* Validation Messages */}
 {validationResult.issues.length > 0 && (
 <div className="space-y-1">
 {validationResult.issues.map((issue, idx) => (
 <div key={idx} className="flex items-start gap-2 text-xs text-orange-600 ">
 <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
 <span>{issue}</span>
 </div>
 ))}
 </div>
 )}

 {/* Helper Text */}
 {!validationResult.issues.length && (
 <p className="text-xs text-gray-500 ">
 URL-friendly version of the title. Keep it short (under 60 chars) and descriptive.
 </p>
 )}

 {/* Preview URL */}
 {value && validationResult.valid && (
 <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200 ">
 <div className="text-xs text-gray-600 mb-1">Preview URL:</div>
 <div className="text-sm text-[#1A403D] font-mono break-all">
 https://nepalhomestays.com/blogs/{value}
 </div>
 </div>
 )}
 </div>
 );
};

export default SmartSlugInput;
