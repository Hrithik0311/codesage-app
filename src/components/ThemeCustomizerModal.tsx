
"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Modal from '@/components/Modal';
import { useLocalStorage } from '@/hooks/use-local-storage';

type CustomThemeSettings = {
    primary: string;
    accent: string;
    background: string;
    backgroundStart: string;
    backgroundEnd: string;
};

// Helper to calculate a contrasting foreground color
function getContrastingColor(hex: string): string {
    if (!hex) return '#FFFFFF';
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#FFFFFF';
}

function hexToHsl(hex: string): string {
    if (!hex) return '0 0% 0%';
    hex = hex.replace(/^#/, '');
    const bigint = parseInt(hex, 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;

    r /= 255; g /= 255; b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

interface ThemeCustomizerModalProps {
    isOpen: boolean;
    onClose: () => void;
    themeToEdit: 'custom' | 'liquid-glass' | null;
}

const ThemeCustomizerModal = ({ isOpen, onClose, themeToEdit }: ThemeCustomizerModalProps) => {
    const { setTheme } = useTheme();
    
    const [savedSettings, setSavedSettings] = useLocalStorage<CustomThemeSettings>('custom-theme-settings', {
        primary: '#7c3aed',
        accent: '#a855f7',
        background: '#0a0a0a',
        backgroundStart: '#0f0c29',
        backgroundEnd: '#24243e',
    });

    const [currentSettings, setCurrentSettings] = useState(savedSettings);
    
    useEffect(() => {
        if (isOpen) {
            setCurrentSettings(savedSettings);
        }
    }, [isOpen, savedSettings]);
    
    const applyCustomThemeStyles = (settings: CustomThemeSettings) => {
        const docStyle = document.documentElement.style;
        docStyle.setProperty('--custom-primary', hexToHsl(settings.primary));
        docStyle.setProperty('--custom-accent', hexToHsl(settings.accent));
        docStyle.setProperty('--custom-background', hexToHsl(settings.background));
        const foreground = getContrastingColor(settings.background);
        docStyle.setProperty('--custom-foreground', hexToHsl(foreground));
        docStyle.setProperty('--custom-primary-foreground', hexToHsl(getContrastingColor(settings.primary)));
    };

    const handleSave = () => {
        setSavedSettings(currentSettings);
        if (themeToEdit) {
            setTheme(themeToEdit); // This triggers the ThemeEffect in the provider
            // For custom theme, we need to apply styles immediately as it's not handled by ThemeEffect
            if (themeToEdit === 'custom') {
                applyCustomThemeStyles(currentSettings);
            }
        }
        onClose();
    };
    
    const handleSettingChange = (key: keyof CustomThemeSettings, value: string) => {
        setCurrentSettings(prev => ({...prev, [key]: value}));
    };

    if (!themeToEdit) return null;

    const CustomThemeEditor = (
        <>
            <h3 className="font-headline text-lg font-semibold text-foreground border-b pb-2 mb-4">Custom Theme Colors</h3>
            <div className="flex items-center justify-between">
                <label htmlFor="primary-color" className="font-medium">Primary Color</label>
                <input id="primary-color" type="color" value={currentSettings.primary} onChange={(e) => handleSettingChange('primary', e.target.value)} className="w-24 h-10 border-none cursor-pointer bg-transparent rounded-md" />
            </div>
            <div className="flex items-center justify-between">
                <label htmlFor="accent-color" className="font-medium">Accent Color</label>
                <input id="accent-color" type="color" value={currentSettings.accent} onChange={(e) => handleSettingChange('accent', e.target.value)} className="w-24 h-10 border-none cursor-pointer bg-transparent rounded-md" />
            </div>
            <div className="flex items-center justify-between">
                <label htmlFor="bg-color" className="font-medium">Background Color</label>
                <input id="bg-color" type="color" value={currentSettings.background} onChange={(e) => handleSettingChange('background', e.target.value)} className="w-24 h-10 border-none cursor-pointer bg-transparent rounded-md" />
            </div>
        </>
    );

    const LiquidGlassEditor = (
         <>
            <h3 className="font-headline text-lg font-semibold text-foreground border-b pb-2 mb-4">Liquid Glass Tints</h3>
            <div className="flex items-center justify-between">
                <label htmlFor="bg-start-color" className="font-medium">Gradient Start</label>
                <input id="bg-start-color" type="color" value={currentSettings.backgroundStart} onChange={(e) => handleSettingChange('backgroundStart', e.target.value)} className="w-24 h-10 border-none cursor-pointer bg-transparent rounded-md" />
            </div>
            <div className="flex items-center justify-between">
                <label htmlFor="bg-end-color" className="font-medium">Gradient End</label>
                <input id="bg-end-color" type="color" value={currentSettings.backgroundEnd} onChange={(e) => handleSettingChange('backgroundEnd', e.target.value)} className="w-24 h-10 border-none cursor-pointer bg-transparent rounded-md" />
            </div>
        </>
    );
    
    const previewStyle: React.CSSProperties = themeToEdit === 'liquid-glass' 
        ? { background: `linear-gradient(135deg, ${currentSettings.backgroundStart}, ${currentSettings.backgroundEnd})`, color: '#FFFFFF' }
        : { background: currentSettings.background, color: getContrastingColor(currentSettings.background) };

    const previewTitleStyle: React.CSSProperties = themeToEdit === 'custom'
        ? { color: currentSettings.primary }
        : {};

    const previewDescStyle: React.CSSProperties = themeToEdit === 'custom'
        ? { color: currentSettings.accent }
        : {};

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Customize: ${themeToEdit === 'custom' ? 'Custom Theme' : 'Liquid Glass'}`}
            buttons={[
                { text: 'Save', action: handleSave, isPrimary: true }
            ]}
        >
            <div className="space-y-8 py-4">
                {themeToEdit === 'custom' ? CustomThemeEditor : LiquidGlassEditor}
            </div>
            
            <div className="mt-8 p-6 rounded-lg border" style={previewStyle}>
                 <div className="text-center">
                    <h3 className="text-xl font-bold" style={previewTitleStyle}>Theme Preview</h3>
                    <p className="mt-2" style={previewDescStyle}>This is how your theme looks.</p>
                 </div>
            </div>
        </Modal>
    );
};

export default ThemeCustomizerModal;
