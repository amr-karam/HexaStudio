'use client';

/**
 * HEXA Studio Feature Flags Configuration
 * 
 * Feature flag system for gradual rollout of new portal features
 * Supports localStorage for persistent user-specific preferences
 * 
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';

export type FeatureFlagKey = 
  | 'bentoGridEnabled'
  | 'enhancedNavigationEnabled'
  | 'commandPaletteEnabled'
  | 'newDashboardEnabled'
  | 'staggeredAnimationsEnabled'
  | 'enhancedSidebarEnabled'
  | 'newOnboardingFlowEnabled';

export interface FeatureFlagConfig {
  bentoGridEnabled: boolean;
  enhancedNavigationEnabled: boolean;
  commandPaletteEnabled: boolean;
  newDashboardEnabled: boolean;
  staggeredAnimationsEnabled: boolean;
  enhancedSidebarEnabled: boolean;
  newOnboardingFlowEnabled: boolean;
}

export type FeatureFlagScope = 'user' | 'workspace' | 'global';

class FeatureFlags {
  private static instance: FeatureFlags;
  private storageKey = 'hexa-feature-flags';
  
  constructor() {
    if (!FeatureFlags.instance) {
      FeatureFlags.instance = this;
    }
    return FeatureFlags.instance;
  }

  getFlag<K extends FeatureFlagKey>(key: K, scope: FeatureFlagScope = 'user'): boolean {
    try {
      let storage: Storage;
      
      switch (scope) {
        case 'user':
          storage = window.localStorage;
          break;
        case 'workspace':
          storage = window.localStorage;
          break;
        case 'global':
          storage = window.sessionStorage;
          break;
        default:
          storage = window.localStorage;
      }
      
      const stored = storage.getItem(this.storageKey);
      const flags = stored ? JSON.parse(stored) as Partial<FeatureFlagConfig> : {};
      
      // Default values
      const defaults: Partial<FeatureFlagConfig> = {
        bentoGridEnabled: false,
        enhancedNavigationEnabled: false,
        commandPaletteEnabled: false,
        newDashboardEnabled: false,
        staggeredAnimationsEnabled: true,
        enhancedSidebarEnabled: false,
        newOnboardingFlowEnabled: false,
      };
      
      return flags[key] ?? defaults[key] as boolean;
    } catch {
      return false;
    }
  }

  setFlag<K extends FeatureFlagKey>(key: K, value: boolean, scope: FeatureFlagScope = 'user'): void {
    try {
      let storage: Storage;
      
      switch (scope) {
        case 'user':
          storage = window.localStorage;
          break;
        case 'workspace':
          storage = window.localStorage;
          break;
        case 'global':
          storage = window.sessionStorage;
          break;
        default:
          storage = window.localStorage;
      }
      
      const stored = storage.getItem(this.storageKey);
      const flags = stored ? JSON.parse(stored) as Partial<FeatureFlagConfig> : {};
      
      flags[key] = value;
      
      storage.setItem(this.storageKey, JSON.stringify(flags));
    } catch {
      console.warn('Failed to set feature flag:', key, value);
    }
  }

  getAllFlags(scope: FeatureFlagScope = 'user'): FeatureFlagConfig {
    try {
      let storage: Storage;
      
      switch (scope) {
        case 'user':
          storage = window.localStorage;
          break;
        case 'workspace':
          storage = window.localStorage;
          break;
        case 'global':
          storage = window.sessionStorage;
          break;
        default:
          storage = window.localStorage;
      }
      
      const stored = storage.getItem(this.storageKey);
      const flags = stored ? JSON.parse(stored) as Partial<FeatureFlagConfig> : {};
      
      // Default values for undefined flags
      return {
        bentoGridEnabled: flags.bentoGridEnabled ?? false,
        enhancedNavigationEnabled: flags.enhancedNavigationEnabled ?? false,
        commandPaletteEnabled: flags.commandPaletteEnabled ?? false,
        newDashboardEnabled: flags.newDashboardEnabled ?? false,
        staggeredAnimationsEnabled: flags.staggeredAnimationsEnabled ?? true,
        enhancedSidebarEnabled: flags.enhancedSidebarEnabled ?? false,
        newOnboardingFlowEnabled: flags.newOnboardingFlowEnabled ?? false,
      };
    } catch {
      // Return default flags on error
      return {
        bentoGridEnabled: false,
        enhancedNavigationEnabled: false,
        commandPaletteEnabled: false,
        newDashboardEnabled: false,
        staggeredAnimationsEnabled: true,
        enhancedSidebarEnabled: false,
        newOnboardingFlowEnabled: false,
      };
    }
  }

  setAllFlags(flags: Partial<FeatureFlagConfig>, scope: FeatureFlagScope = 'user'): void {
    try {
      let storage: Storage;
      
      switch (scope) {
        case 'user':
          storage = window.localStorage;
          break;
        case 'workspace':
          storage = window.localStorage;
          break;
        case 'global':
          storage = window.sessionStorage;
          break;
        default:
          storage = window.localStorage;
      }
      
      const stored = storage.getItem(this.storageKey);
      const currentFlags = stored ? JSON.parse(stored) as Partial<FeatureFlagConfig> : {};
      
      // Merge new flags with current
      const merged = { ...currentFlags, ...flags };
      
      storage.setItem(this.storageKey, JSON.stringify(merged));
    } catch {
      console.warn('Failed to set all feature flags');
    }
  }

  // Quick methods for common toggles
  enableFeature(key: FeatureFlagKey, scope: FeatureFlagScope = 'user'): void {
    this.setFlag(key, true, scope);
  }

  disableFeature(key: FeatureFlagKey, scope: FeatureFlagScope = 'user'): void {
    this.setFlag(key, false, scope);
  }

  toggleFeature(key: FeatureFlagKey, scope: FeatureFlagScope = 'user'): void {
    const current = this.getFlag(key, scope);
    this.setFlag(key, !current, scope);
  }

  isFeatureEnabled(key: FeatureFlagKey, scope: FeatureFlagScope = 'user'): boolean {
    return this.getFlag(key, scope);
  }

  // Reset all flags to defaults
  reset(scope: FeatureFlagScope = 'user'): void {
    try {
      let storage: Storage;
      
      switch (scope) {
        case 'user':
          storage = window.localStorage;
          break;
        case 'workspace':
          storage = window.localStorage;
          break;
        case 'global':
          storage = window.sessionStorage;
          break;
        default:
          storage = window.localStorage;
      }
      
      const defaults: Partial<FeatureFlagConfig> = {
        bentoGridEnabled: false,
        enhancedNavigationEnabled: false,
        commandPaletteEnabled: false,
        newDashboardEnabled: false,
        staggeredAnimationsEnabled: true,
        enhancedSidebarEnabled: false,
        newOnboardingFlowEnabled: false,
      };
      
      storage.setItem(this.storageKey, JSON.stringify(defaults));
    } catch {
      console.warn('Failed to reset feature flags');
    }
  }
}

const featureFlags = new FeatureFlags();

export default featureFlags;

// Utility hooks for React components
export function useFeatureFlag(key: FeatureFlagKey, scope: FeatureFlagScope = 'user') {
  const [isEnabled, setIsEnabled] = useState(false);
  
  useEffect(() => {
    setIsEnabled(featureFlags.getFlag(key, scope));
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === featureFlags['storageKey']) {
        setIsEnabled(featureFlags.getFlag(key, scope));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, scope]);
  
  const toggle = (value?: boolean) => {
    const newValue = value !== undefined ? value : !isEnabled;
    featureFlags.setFlag(key, newValue, scope);
    setIsEnabled(newValue);
  };
  
  return {
    isEnabled,
    enable: () => featureFlags.enableFeature(key, scope),
    disable: () => featureFlags.disableFeature(key, scope),
    toggle,
  };
}
