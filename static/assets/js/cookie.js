(function() {
    'use strict';
    
    window.CookieConsent = {
        // Configuration
        COOKIE_NAME: 'cookie_consent_preferences',
        COOKIE_EXPIRY_DAYS: 365,
        
        /**
         * Get cookie value by name
         */
        getCookie: function(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
            return null;
        },
        
        /**
         * Set cookie with expiry
         */
        setCookie: function(name, value, days) {
            const expires = new Date();
            expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
            document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax;Secure`;
        },
        
        /**
         * Delete cookie
         */
        deleteCookie: function(name) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        },
        
        /**
         * Get stored consent preferences
         */
        getConsent: function() {
            const consent = this.getCookie(this.COOKIE_NAME);
            if (consent) {
                try {
                    return JSON.parse(decodeURIComponent(consent));
                } catch (e) {
                    console.error('Error parsing consent cookie:', e);
                    return null;
                }
            }
            return null;
        },
        
        /**
         * Save consent preferences and update GTM
         */
        saveConsent: function(consent) {
            // Save to cookie
            this.setCookie(
                this.COOKIE_NAME, 
                encodeURIComponent(JSON.stringify(consent)), 
                this.COOKIE_EXPIRY_DAYS
            );
            
            // Update Google Consent Mode
            this.updateGTMConsent(consent);
            
            // Show floating button
            this.showFloatingButton();
            
            console.log('Cookie consent saved:', consent);
        },
        
        /**
         * Update Google Tag Manager consent state
         */
        updateGTMConsent: function(consent) {
            if (typeof gtag === 'function') {
                gtag('consent', 'update', {
                    'analytics_storage': consent.analytics ? 'granted' : 'denied',
                    'ad_storage': consent.marketing ? 'granted' : 'denied',
                    'ad_user_data': consent.marketing ? 'granted' : 'denied',
                    'ad_personalization': consent.marketing ? 'granted' : 'denied'
                });
                
                // Push consent update event to dataLayer
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    'event': 'consent_update',
                    'consent_analytics': consent.analytics,
                    'consent_marketing': consent.marketing
                });
                
                console.log('GTM consent updated');
            }
        },
        
        /**
         * Delete tracking cookies when consent is withdrawn
         */
        deleteTrackingCookies: function() {
            const trackingCookies = [
                '_ga', '_gid', '_gat', '__utma', '__utmt', '__utmb', 
                '__utmc', '__utmz', '__utmv', '_gcl_au', '_fbp', '_fbc'
            ];
            
            const domain = window.location.hostname;
            const domains = [domain, '.' + domain];
            
            trackingCookies.forEach(cookieName => {
                domains.forEach(d => {
                    document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${d}`;
                });
                // Also try without domain
                document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
            });
        },
        
        /**
         * Accept all cookies
         */
        acceptAll: function() {
            const consent = {
                essential: true,
                analytics: true,
                marketing: true,
                timestamp: new Date().toISOString()
            };
            this.saveConsent(consent);
            this.hideBanner();
        },
        
        /**
         * Accept only essential cookies
         */
        acceptEssential: function() {
            const consent = {
                essential: true,
                analytics: false,
                marketing: false,
                timestamp: new Date().toISOString()
            };
            this.saveConsent(consent);
            this.deleteTrackingCookies();
            this.hideBanner();
        },
        
        /**
         * Show settings modal
         */
        showSettings: function() {
            const modal = document.getElementById('cookieModal');
            const consent = this.getConsent() || { essential: true, analytics: false, marketing: false };
            
            // Set toggle states
            document.getElementById('analytics-toggle').checked = consent.analytics;
            document.getElementById('marketing-toggle').checked = consent.marketing;
            
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        },
        
        /**
         * Close settings modal
         */
        closeSettings: function() {
            document.getElementById('cookieModal').classList.remove('show');
            document.body.style.overflow = '';
        },
        
        /**
         * Save settings from modal
         */
        saveSettings: function() {
            const analyticsEnabled = document.getElementById('analytics-toggle').checked;
            const marketingEnabled = document.getElementById('marketing-toggle').checked;
            
            const consent = {
                essential: true,
                analytics: analyticsEnabled,
                marketing: marketingEnabled,
                timestamp: new Date().toISOString()
            };
            
            // If tracking was disabled, delete tracking cookies
            if (!analyticsEnabled || !marketingEnabled) {
                this.deleteTrackingCookies();
            }
            
            this.saveConsent(consent);
            this.closeSettings();
            this.hideBanner();
        },
        
        /**
         * Show cookie banner
         */
        showBanner: function() {
            const banner = document.getElementById('cookieBanner');
            if (banner) {
                setTimeout(function() {
                    banner.classList.add('show');
                }, 500);
            }
        },
        
        /**
         * Hide cookie banner
         */
        hideBanner: function() {
            const banner = document.getElementById('cookieBanner');
            if (banner) {
                banner.classList.remove('show');
            }
        },
        
        /**
         * Show floating settings button
         */
        showFloatingButton: function() {
            const btn = document.getElementById('cookieSettingsBtn');
            if (btn) {
                btn.classList.add('show');
            }
        },
        
        /**
         * Hide floating settings button
         */
        hideFloatingButton: function() {
            const btn = document.getElementById('cookieSettingsBtn');
            if (btn) {
                btn.classList.remove('show');
            }
        },
        
        /**
         * Initialize the consent manager
         */
        init: function() {
            const self = this;
            const consent = this.getConsent();
            
            if (!consent) {
                // No consent yet - show banner
                this.showBanner();
                this.hideFloatingButton();
            } else {
                // Has consent - apply it and show floating button
                this.updateGTMConsent(consent);
                this.showFloatingButton();
            }
            
            // Close modal when clicking outside
            const modal = document.getElementById('cookieModal');
            if (modal) {
                modal.addEventListener('click', function(e) {
                    if (e.target === modal) {
                        self.closeSettings();
                    }
                });
            }
            
            // Close modal on Escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    self.closeSettings();
                }
            });
            
            console.log('Cookie Consent Manager initialized');
        }
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            CookieConsent.init();
        });
    } else {
        CookieConsent.init();
    }
})();