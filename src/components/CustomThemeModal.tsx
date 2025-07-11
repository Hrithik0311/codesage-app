
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
    
    const [customPrimary, setCustomPrimary] = useLocalStorage('--custom-primary', '#7c3aed');
    const [customAccent, setCustomAccent] = useLocalStorage('--custom-accent', '#a855f7');
    const [customBackground, setCustomBackground] = useLocalStorage('--custom-background', '#0a0a0a');

    useEffect(() => {
        if (isOpen) {
            setTheme('custom');
        }
    }, [isOpen, setTheme]);
    
    useEffect(() => {
        if (isOpen) {
            document.documentElement.setAttribute('data-theme', 'custom');
            document.documentElement.style.setProperty('--primary', hexToHsl(customPrimary));
            document.documentElement.style.setProperty('--accent', hexToHsl(customAccent));
            document.documentElement.style.setProperty('--background', hexToHsl(customBackground));
        }
    }, [isOpen, customPrimary, customAccent, customBackground]);
    
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create Custom Theme"
        >
            <div className="space-y-8 py-4">
                <div className="flex items-center justify-between">
                    <label htmlFor="primary-color" className="font-medium text-lg">Primary Color</label>
                    <input id="primary-color" type="color" value={customPrimary} onChange={(e) => setCustomPrimary(e.target.value)} className="w-24 h-10 border-none cursor-pointer bg-transparent rounded-md" />
                </div>
                <div className="flex items-center justify-between">
                    <label htmlFor="accent-color" className="font-medium text-lg">Accent Color</label>
                    <input id="accent-color" type="color" value={customAccent} onChange={(e) => setCustomAccent(e.target.value)} className="w-24 h-10 border-none cursor-pointer bg-transparent rounded-md" />
                </div>
                 <div className="flex items-center justify-between">
                    <label htmlFor="bg-color" className="font-medium text-lg">Background Color</label>
                    <input id="bg-color" type="color" value={customBackground} onChange={(e) => setCustomBackground(e.target.value)} className="w-24 h-10 border-none cursor-pointer bg-transparent rounded-md" />
                </div>
            </div>
            
            <div className="mt-8 p-6 rounded-lg border" style={{ backgroundColor: customBackground }}>
                 <div className="text-center" style={{ color: customPrimary }}>
                    <h3 className="text-xl font-bold">Theme Preview</h3>
                    <p className="mt-2" style={{ color: customAccent }}>This is how your theme looks.</p>
                 </div>
            </div>
        </Modal>
    );
};

export default CustomThemeModal;
