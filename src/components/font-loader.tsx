'use client';

import { useEffect } from 'react';

export function FontLoader() {
  useEffect(() => {
    // Simple font loading - only runs on client
    if (typeof window !== 'undefined') {
      const checkFont = () => {
        try {
          if ('fonts' in document) {
            const sfProRounded = document.fonts.check('16px "SF Pro Rounded"');
            
            if (sfProRounded) {
              document.body.classList.add('font-loaded');
            }
          }
        } catch (error) {
          // Silent fail
        }
      };

      // Check immediately
      checkFont();
      
      // Check after fonts are ready
      if ('fonts' in document) {
        document.fonts.ready.then(() => {
          checkFont();
        }).catch(() => {
          // Silent fail
        });
      }
      
      // Fallback check after a delay
      setTimeout(checkFont, 1000);
    }
  }, []);

  return null;
}
