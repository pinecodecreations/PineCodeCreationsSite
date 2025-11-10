class PopupManager {
    constructor() {
        this.popups = [];
        this.activePopup = null;
        this.scrollThrottleTimer = null;
        this.exitIntentTriggered = false;
        
        this.init();
    }
    
    init() {
        // Find all popup elements
        const popupElements = document.querySelectorAll('.popup');
        
        popupElements.forEach(element => {
            const popup = this.createPopupObject(element);
            
            // Only add active popups that pass schedule and device checks
            if (this.shouldShowPopup(popup)) {
                this.popups.push(popup);
                this.setupPopupListeners(popup);
            }
        });
        
        // Setup triggers for each popup
        this.popups.forEach(popup => this.setupTriggers(popup));
    }
    
    createPopupObject(element) {
        return {
            id: element.dataset.popupId,
            element: element,
            trigger: element.dataset.trigger,
            scrollPercentage: parseInt(element.dataset.scrollPercentage) || 50,
            timeDelay: parseInt(element.dataset.timeDelay) || 5,
            frequency: element.dataset.frequency,
            hideAfterClose: element.dataset.hideAfterClose === 'true',
            hideAfterAction: element.dataset.hideAfterAction === 'true',
            mobile: element.dataset.mobile === 'true',
            desktop: element.dataset.desktop === 'true',
            startDate: element.dataset.startDate ? new Date(element.dataset.startDate) : null,
            endDate: element.dataset.endDate ? new Date(element.dataset.endDate) : null,
            status: element.dataset.status,
            customLink: element.dataset.customLink || null,
            buttonAction: element.dataset.buttonAction || 'subscribe',
            shown: false
        };
    }
    
    shouldShowPopup(popup) {
        // Check if popup is active
        if (popup.status !== 'active') return false;
        
        // Check device preference
        const isMobile = window.innerWidth < 768;
        if (isMobile && !popup.mobile) return false;
        if (!isMobile && !popup.desktop) return false;
        
        // Check schedule
        const now = new Date();
        if (popup.startDate && now < popup.startDate) return false;
        if (popup.endDate && now > popup.endDate) return false;
        
        // Check if popup was previously dismissed
        if (this.wasPopupDismissed(popup)) return false;
        
        // Check frequency
        return this.checkFrequency(popup);
    }
    
    wasPopupDismissed(popup) {
        const storage = this.getStorage(popup);
        const dismissed = storage.getItem(`popup_dismissed_${popup.id}`);
        return dismissed === 'true';
    }
    
    checkFrequency(popup) {
        const storage = this.getStorage(popup);
        const lastShown = storage.getItem(`popup_last_shown_${popup.id}`);
        
        if (!lastShown) return true;
        
        const lastShownDate = new Date(parseInt(lastShown));
        const now = new Date();
        
        switch (popup.frequency) {
            case 'once-per-visit':
                return false; // Already shown in this visit
            case 'once-per-session':
                return false; // Already shown in this session
            case 'once-per-day':
                const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
                return lastShownDate < oneDayAgo;
            case 'every-time':
                return true;
            default:
                return true;
        }
    }
    
    getStorage(popup) {
        // Use sessionStorage for once-per-session, localStorage for others
        return popup.frequency === 'once-per-session' ? sessionStorage : localStorage;
    }
    
    setupTriggers(popup) {
        switch (popup.trigger) {
            case 'entrance':
                setTimeout(() => this.showPopup(popup), 500);
                break;
                
            case 'exit':
                this.setupExitIntent(popup);
                break;
                
            case 'scroll':
                this.setupScrollTrigger(popup);
                break;
                
            case 'time':
                setTimeout(() => this.showPopup(popup), popup.timeDelay * 1000);
                break;
        }
    }
    
    setupExitIntent(popup) {
        document.addEventListener('mouseout', (e) => {
            if (!this.exitIntentTriggered && e.clientY <= 0 && e.relatedTarget == null) {
                this.exitIntentTriggered = true;
                this.showPopup(popup);
            }
        });
    }
    
    setupScrollTrigger(popup) {
        window.addEventListener('scroll', () => {
            if (this.scrollThrottleTimer) return;
            
            this.scrollThrottleTimer = setTimeout(() => {
                const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
                
                if (scrollPercentage >= popup.scrollPercentage && !popup.shown) {
                    this.showPopup(popup);
                }
                
                this.scrollThrottleTimer = null;
            }, 100);
        });
    }
    
    setupPopupListeners(popup) {
        const closeBtn = popup.element.querySelector('.popup__close');
        const overlay = popup.element.querySelector('.popup__overlay');
        const form = popup.element.querySelector('.popup__form');
        const copyBtn = popup.element.querySelector('.popup__promo-copy');
        const linkBtn = popup.element.querySelector('.popup__button--link');
        
        // Close button
        closeBtn?.addEventListener('click', () => {
            this.closePopup(popup, 'close');
        });
        
        // Overlay click
        // Default: clicking the overlay (outside the popup) should NOT close the popup.
        // Make overlay-close opt-in by setting `data-overlay-close="true"` on the popup element.
        if (popup.element && popup.element.dataset && popup.element.dataset.overlayClose === 'true') {
            overlay?.addEventListener('click', () => {
                this.closePopup(popup, 'close');
            });
        }
        
        // Form submission
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit(popup, form);
        });
        
        // Link button click (tracks action before navigation)
        linkBtn?.addEventListener('click', () => {
            this.closePopup(popup, 'action');
        });
        
        // Copy promo code button
        copyBtn?.addEventListener('click', () => {
            const code = copyBtn.dataset.code;
            this.copyToClipboard(code, copyBtn);
        });
        
        // ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activePopup === popup) {
                this.closePopup(popup, 'close');
            }
        });
    }
    
    copyToClipboard(text, button) {
        navigator.clipboard.writeText(text).then(() => {
            // Visual feedback
            const originalHTML = button.innerHTML;
            button.innerHTML = '<span style="font-size: 12px;">✓</span>';
            button.style.background = '#22c55e';
            
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.style.background = '';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    }
    
    showPopup(popup) {
        if (popup.shown || this.activePopup) return;
        
        popup.shown = true;
        this.activePopup = popup;
        
        // Add visible class
        popup.element.classList.add('popup--visible');
        document.body.style.overflow = 'hidden';
        
        // Track that popup was shown
        const storage = this.getStorage(popup);
        storage.setItem(`popup_last_shown_${popup.id}`, Date.now().toString());
        
        // Trigger custom event
        window.dispatchEvent(new CustomEvent('popupShown', { detail: { popupId: popup.id } }));
    }
    
    closePopup(popup, reason) {
        popup.element.classList.remove('popup--visible');
        document.body.style.overflow = '';
        this.activePopup = null;
        
        // Handle stopping conditions
        if (reason === 'close' && popup.hideAfterClose) {
            const storage = this.getStorage(popup);
            storage.setItem(`popup_dismissed_${popup.id}`, 'true');
        }
        
        if (reason === 'action' && popup.hideAfterAction) {
            const storage = this.getStorage(popup);
            storage.setItem(`popup_dismissed_${popup.id}`, 'true');
        }
        
        // Trigger custom event
        window.dispatchEvent(new CustomEvent('popupClosed', { 
            detail: { popupId: popup.id, reason: reason } 
        }));
    }
    
    handleFormSubmit(popup, form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Trigger custom event for form submission
        window.dispatchEvent(new CustomEvent('popupFormSubmit', { 
            detail: { 
                popupId: popup.id, 
                action: form.dataset.action,
                data: data 
            } 
        }));
        
        // If there's a custom link, redirect to it
        if (popup.customLink) {
            window.location.href = popup.customLink;
            return;
        }
        
        // Close popup after action
        this.closePopup(popup, 'action');
        
        // You can add your form submission logic here
        console.log('Popup form submitted:', data);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new PopupManager();
    });
} else {
    new PopupManager();
}