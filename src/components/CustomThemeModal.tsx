
"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Modal from '@/components/Modal';
import { useLocalStorage } from '@/hooks/use-local-storage';

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
    
    const [savedPrimary, setSavedPrimary] = useLocalStorage('--custom-primary', '#7c3aed');
    const [savedAccent, setSavedAccent] = useLocalStorage('--custom-accent', '#a855f7');
    const [savedBackground, setSavedBackground] = useLocalStorage('--custom-background', '#0a0a0a');

    const [primary, setPrimary] = useState(savedPrimary);
    const [accent, setAccent] = useState(savedAccent);
    const [background, setBackground] = useState(savedBackground);
    
    useEffect(() => {
        if (isOpen) {
            // When modal opens, sync state with saved values
            setPrimary(savedPrimary);
            setAccent(savedAccent);
            setBackground(savedBackground);
            setTheme('custom');
        }
    }, [isOpen, setTheme, savedPrimary, savedAccent, savedBackground]);
    
    useEffect(() => {
        if (isOpen) {
            // Live preview effect
            document.documentElement.setAttribute('data-theme', 'custom');
            document.documentElement.style.setProperty('--primary', hexToHsl(primary));
            document.documentElement.style.setProperty('--accent', hexToHsl(accent));
            document.documentElement.style.setProperty('--background', hexToHsl(background));
        } else {
            // Revert to saved theme when modal is closed without saving
            document.documentElement.style.setProperty('--primary', hexToHsl(savedPrimary));
            document.documentElement.style.setProperty('--accent', hexToHsl(savedAccent));
            document.documentElement.style.setProperty('--background', hexToHsl(savedBackground));
        }
    }, [isOpen, primary, accent, background, savedPrimary, savedAccent, savedBackground]);

    const handleSave = () => {
        setSavedPrimary(primary);
        setSavedAccent(accent);
        setSavedBackground(background);
        onClose();
    };
    
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
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
            
            <div className="mt-8 p-6 rounded-lg border" style={{ backgroundColor: background }}>
                 <div className="text-center" style={{ color: primary }}>
                    <h3 className="text-xl font-bold">Theme Preview</h3>
                    <p className="mt-2" style={{ color: accent }}>This is how your theme looks.</p>
                 </div>
            </div>
        </Modal>
    );
};

export default CustomThemeModal;
