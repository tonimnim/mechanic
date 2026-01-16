'use client';

import { useState, useEffect } from 'react';

interface DeviceDetectState {
  isMobile: boolean;
  isLoading: boolean;
}

const MOBILE_BREAKPOINT = 768; // Matches Tailwind's md breakpoint

export function useDeviceDetect(): DeviceDetectState {
  const [state, setState] = useState<DeviceDetectState>({
    isMobile: false,
    isLoading: true,
  });

  useEffect(() => {
    const checkDevice = () => {
      // Check screen width
      const isMobileWidth = window.innerWidth < MOBILE_BREAKPOINT;

      // Also check user agent for mobile devices
      const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

      // Consider mobile if either condition is true
      const isMobile = isMobileWidth || isMobileUserAgent;

      setState({
        isMobile,
        isLoading: false,
      });
    };

    // Initial check
    checkDevice();

    // Listen for resize events (in case user resizes browser)
    window.addEventListener('resize', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, []);

  return state;
}
