
"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Modal from '@/components/Modal';
import { useLocalStorage } from '@/hooks/use-local-storage';

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

const CustomThemeModal = ({ isOpen, onClose }) => {
    const { setTheme } = useTheme();
    
    // Use local storage to persist custom theme settings
    const [savedPrimary, setSavedPrimary] = useLocalStorage('custom-primary-color', '#7c3aed');
    const [savedAccent, setSavedAccent] = useLocalStorage('custom-accent-color', '#a855f7');
    const [savedBackground, setSavedBackground] = useLocalStorage('custom-background-color', '#0a0a0a');

    // Local state for the color pickers in the modal for live preview
    const [primary, setPrimary] = useState(savedPrimary);
    const [accent, setAccent] = useState(savedAccent);
    const [background, setBackground] = useState(savedBackground);
    
    // When the modal opens, sync the local state with the saved values
    useEffect(() => {
        if (isOpen) {
            setPrimary(savedPrimary);
            setAccent(savedAccent);
            setBackground(savedBackground);
        }
    }, [isOpen, savedPrimary, savedAccent, savedBackground]);
    
    // Live preview effect for when the modal is open
    useEffect(() => {
        if (isOpen) {
            document.documentElement.setAttribute('data-theme', 'custom');
            document.documentElement.style.setProperty('--custom-primary', hexToHsl(primary));
            document.documentElement.style.setProperty('--custom-accent', hexToHsl(accent));
            document.documentElement.style.setProperty('--custom-background', hexToHsl(background));
            const foreground = getContrastingColor(background);
            document.documentElement.style.setProperty('--custom-foreground', hexToHsl(foreground));
            document.documentElement.style.setProperty('--custom-primary-foreground', hexToHsl(getContrastingColor(primary)));
        }
    }, [isOpen, primary, accent, background]);

    const handleSave = () => {
        setSavedPrimary(primary);
        setSavedAccent(accent);
        setSavedBackground(background);
        setTheme('custom'); // Ensure the theme is set to custom
        onClose();
    };

    const handleClose = () => {
        // Revert any live preview changes if the user cancels
        document.documentElement.style.removeProperty('--custom-primary');
        document.documentElement.style.removeProperty('--custom-accent');
        document.documentElement.style.removeProperty('--custom-background');
        document.documentElement.style.removeProperty('--custom-foreground');
        document.documentElement.style.removeProperty('--custom-primary-foreground');
        onClose();
    };
    
    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Create Custom Theme"
            buttons={[
                { text: 'Save', action: handleSave, isPrimary: true }
            ]}
        >
            <div className="space-y-8 py-4">
                <div className="flex items-center justify-between">
                    <label htmlFor="primary-color" className="font-medium text-lg">Primary Color</label>
                    <input id="primary-color" type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} className="w-24 h-10 border-none cursor-pointer bg-transparent rounded-md" />
                </div>
                <div className="flex items-center justify-between">
                    <label htmlFor="accent-color" className="font-medium text-lg">Accent Color</label>
                    <input id="accent-color" type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="w-24 h-10 border-none cursor-pointer bg-transparent rounded-md" />
                </div>
                 <div className="flex items-center justify-between">
                    <label htmlFor="bg-color" className="font-medium text-lg">Background Color</label>
                    <input id="bg-color" type="color" value={background} onChange={(e) => setBackground(e.target.value)} className="w-24 h-10 border-none cursor-pointer bg-transparent rounded-md" />
                </div>
            </div>
            
            <div className="mt-8 p-6 rounded-lg border" style={{ backgroundColor: background, color: getContrastingColor(background) }}>
                 <div className="text-center">
                    <h3 className="text-xl font-bold" style={{ color: primary }}>Theme Preview</h3>
                    <p className="mt-2" style={{ color: accent }}>This is how your theme looks.</p>
                 </div>
            </div>
        </Modal>
    );
};

export default CustomThemeModal;
