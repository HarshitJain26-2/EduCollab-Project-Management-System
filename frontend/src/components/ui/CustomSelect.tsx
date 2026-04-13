'use client';
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
    id: string;
    name: string;
}

interface CustomSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    width?: string | number;
}

export default function CustomSelect({ options, value, onChange, placeholder = "Select option", label = "All Projects", width = 200 }: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(o => o.id === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (id: string) => {
        onChange(id);
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} style={{ position: 'relative', width }}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: 'var(--bg-secondary)',
                    border: `1px solid ${isOpen ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    borderRadius: '12px',
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isOpen ? '0 0 0 3px rgba(108, 99, 255, 0.15)' : 'none',
                    userSelect: 'none'
                }}
            >
                <span style={{ 
                    fontSize: '14px', 
                    color: value ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {selectedOption ? selectedOption.name : label}
                </span>
                <ChevronDown 
                    size={16} 
                    style={{ 
                        color: 'var(--text-muted)', 
                        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0)'
                    }} 
                />
            </div>

            {/* Dropdown Menu */}
            <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                right: 0,
                background: 'rgba(26, 26, 46, 0.95)',
                backdropFilter: 'blur(16px)',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '6px',
                zIndex: 1000,
                boxShadow: 'var(--shadow-lg)',
                visibility: isOpen ? 'visible' : 'hidden',
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.95)',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                pointerEvents: isOpen ? 'all' : 'none'
            }}>
                <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                    <div 
                        onClick={() => handleSelect('')}
                        style={{
                            padding: '10px 12px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            color: !value ? 'var(--accent-secondary)' : 'var(--text-primary)',
                            background: !value ? 'rgba(108, 99, 255, 0.1)' : 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => !value ? null : e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                        onMouseLeave={(e) => !value ? null : e.currentTarget.style.background = 'transparent'}
                    >
                        <span>{label}</span>
                        {!value && <Check size={14} />}
                    </div>
                    {options.map(option => (
                        <div 
                            key={option.id}
                            onClick={() => handleSelect(option.id)}
                            style={{
                                padding: '10px 12px',
                                borderRadius: '8px',
                                fontSize: '13px',
                                color: value === option.id ? 'var(--accent-secondary)' : 'var(--text-primary)',
                                background: value === option.id ? 'rgba(108, 99, 255, 0.1)' : 'transparent',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                transition: 'all 0.2s ease',
                                marginTop: '2px'
                            }}
                            onMouseEnter={(e) => value === option.id ? null : e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                            onMouseLeave={(e) => value === option.id ? null : e.currentTarget.style.background = 'transparent'}
                        >
                            <span>{option.name}</span>
                            {value === option.id && <Check size={14} />}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
