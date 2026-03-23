/**
 * ASTRA UI Components
 * 
 * All popup UIs for humanity verification and gateway checks.
 * Modern, accessible, and user-friendly interfaces.
 */

class AstraUI {
  constructor() {
    // UI themes
    this.themes = {
      light: {
        primary: '#2563eb',
        secondary: '#3b82f6',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#1e293b',
        border: '#e2e8f0',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
      },
      dark: {
        primary: '#3b82f6',
        secondary: '#60a5fa',
        background: '#0f172a',
        surface: '#1e293b',
        text: '#f1f5f9',
        border: '#334155',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
      }
    };
    
    // Current theme
    this.currentTheme = 'light';
    
    // UI state
    this.activeModals = new Map();
    
    console.log('ASTRA UI System initialized');
  }

  /**
   * Show Humanity Verification Modal (OOS > 3)
   */
  showHumanityVerification(challenge, onComplete, onCancel) {
    const modalId = `humanity-verification-${Date.now()}`;
    
    const modal = {
      id: modalId,
      type: 'humanity_verification',
      challenge,
      onComplete,
      onCancel,
      createdAt: Date.now(),
      visible: true
    };
    
    this.activeModals.set(modalId, modal);
    
    // Return UI configuration
    return {
      type: 'modal',
      id: modalId,
      component: 'HumanityVerificationModal',
      props: {
        title: 'Humanity Verification Required',
        subtitle: 'Please complete this challenge to continue',
        challenge: challenge.description,
        instructions: challenge.instructions,
        timeLimit: challenge.timeLimit,
        attemptsAllowed: challenge.attempts,
        challengeType: challenge.type,
        requiresCamera: challenge.type === 'face',
        requiresMicrophone: challenge.type === 'audio',
        requiresMotion: challenge.type === 'physical',
        theme: this.themes[this.currentTheme],
        onComplete: (result) => this.handleVerificationComplete(modalId, result),
        onCancel: () => this.handleModalCancel(modalId)
      },
      style: this.getModalStyle(),
      animations: this.getModalAnimations()
    };
  }

  /**
   * Show Gateway Check Modal
   */
  showGatewayCheck(gatewayResult, onProceed, onAppeal) {
    const modalId = `gateway-check-${Date.now()}`;
    
    const modal = {
      id: modalId,
      type: 'gateway_check',
      gatewayResult,
      onProceed,
      onAppeal,
      createdAt: Date.now(),
      visible: true
    };
    
    this.activeModals.set(modalId, modal);
    
    let component = 'GatewayCheckModal';
    let props = {
      title: 'Security Check',
      message: gatewayResult.message,
      securityScore: gatewayResult.securityScore,
      details: gatewayResult.details,
      theme: this.themes[this.currentTheme],
      onProceed: () => this.handleGatewayProceed(modalId),
      onAppeal: () => this.handleGatewayAppeal(modalId)
    };
    
    // Customize based on action
    switch (gatewayResult.action) {
      case 'allow':
        component = 'GatewayPassModal';
        props.autoRedirect = true;
        props.redirectDelay = 2;
        break;
        
      case 'allow_with_monitoring':
        component = 'GatewayPassWithWarningModal';
        props.warnings = gatewayResult.details.recommendations;
        props.autoRedirect = true;
        props.redirectDelay = 5;
        break;
        
      case 'require_verification':
        component = 'GatewayVerificationModal';
        props.verificationType = 'standard';
        props.timeLimit = 60;
        break;
        
      case 'require_enhanced_verification':
        component = 'GatewayEnhancedVerificationModal';
        props.verificationType = 'enhanced';
        props.timeLimit = 120;
        props.requireMFA = true;
        break;
        
      case 'block':
        component = 'GatewayBlockModal';
        props.blockDuration = gatewayResult.details.blockDuration || 3600;
        props.contactSupport = true;
        props.appealProcess = true;
        break;
    }
    
    return {
      type: 'modal',
      id: modalId,
      component,
      props,
      style: this.getModalStyle(),
      animations: this.getModalAnimations()
    };
  }

  /**
   * Show Face Verification UI
   */
  showFaceVerification(onCapture, onCancel) {
    return {
      type: 'component',
      component: 'FaceVerificationUI',
      props: {
        title: 'Face Verification',
        instructions: 'Position your face within the frame and maintain eye contact',
        requireBlink: true,
        requireHeadMovement: false,
        timeLimit: 30,
        theme: this.themes[this.currentTheme],
        onCapture: (faceData) => {
          onCapture(faceData);
          this.closeActiveModal();
        },
        onCancel: () => {
          onCancel();
          this.closeActiveModal();
        }
      },
      style: this.getFullscreenStyle()
    };
  }

  /**
   * Show Audio Verification UI
   */
  showAudioVerification(sentence, onRecord, onCancel) {
    return {
      type: 'component',
      component: 'AudioVerificationUI',
      props: {
        title: 'Audio Verification',
        instructions: 'Say the following sentence clearly',
        sentence,
        timeLimit: 30,
        theme: this.themes[this.currentTheme],
        onRecord: (audioData) => {
          onRecord(audioData);
          this.closeActiveModal();
        },
        onCancel: () => {
          onCancel();
          this.closeActiveModal();
        }
      },
      style: this.getCenteredStyle()
    };
  }

  /**
   * Show Cognitive Verification UI
   */
  showCognitiveVerification(photoDescription, onSubmit, onCancel) {
    return {
      type: 'component',
      component: 'CognitiveVerificationUI',
      props: {
        title: 'Describe What You See',
        instructions: 'Look at the photo and describe it in 10 words or less',
        focus: photoDescription.focus,
        keywords: photoDescription.keywords,
        wordLimit: 10,
        timeLimit: 45,
        theme: this.themes[this.currentTheme],
        onSubmit: (description) => {
          onSubmit(description);
          this.closeActiveModal();
        },
        onCancel: () => {
          onCancel();
          this.closeActiveModal();
        }
      },
      style: this.getCenteredStyle()
    };
  }

  /**
   * Show Physical Verification UI
   */
  showPhysicalVerification(pattern, onComplete, onCancel) {
    return {
      type: 'component',
      component: 'PhysicalVerificationUI',
      props: {
        title: 'Device Verification',
        instructions: 'Tilt your device following the pattern',
        patternDescription: pattern.description,
        patternSequence: pattern.sequence,
        timeLimit: 30,
        theme: this.themes[this.currentTheme],
        onComplete: (motionData) => {
          onComplete(motionData);
          this.closeActiveModal();
        },
        onCancel: () => {
          onCancel();
          this.closeActiveModal();
        }
      },
      style: this.getCenteredStyle()
    };
  }

  /**
   * Show Progress Indicator
   */
  showProgress(message, progress = 0) {
    return {
      type: 'overlay',
      component: 'ProgressOverlay',
      props: {
        message,
        progress,
        indeterminate: progress === 0,
        theme: this.themes[this.currentTheme]
      },
      style: this.getOverlayStyle()
    };
  }

  /**
   * Show Success Message
   */
  showSuccess(message, duration = 3000) {
    return {
      type: 'toast',
      component: 'SuccessToast',
      props: {
        message,
        duration,
        theme: this.themes[this.currentTheme]
      },
      style: this.getToastStyle('success')
    };
  }

  /**
   * Show Error Message
   */
  showError(message, duration = 5000) {
    return {
      type: 'toast',
      component: 'ErrorToast',
      props: {
        message,
        duration,
        theme: this.themes[this.currentTheme]
      },
      style: this.getToastStyle('error')
    };
  }

  /**
   * Show Warning Message
   */
  showWarning(message, duration = 4000) {
    return {
      type: 'toast',
      component: 'WarningToast',
      props: {
        message,
        duration,
        theme: this.themes[this.currentTheme]
      },
      style: this.getToastStyle('warning')
    };
  }

  /**
   * Handle verification completion
   */
  handleVerificationComplete(modalId, result) {
    const modal = this.activeModals.get(modalId);
    if (modal && modal.onComplete) {
      modal.onComplete(result);
    }
    this.activeModals.delete(modalId);
  }

  /**
   * Handle modal cancellation
   */
  handleModalCancel(modalId) {
    const modal = this.activeModals.get(modalId);
    if (modal && modal.onCancel) {
      modal.onCancel();
    }
    this.activeModals.delete(modalId);
  }

  /**
   * Handle gateway proceed
   */
  handleGatewayProceed(modalId) {
    const modal = this.activeModals.get(modalId);
    if (modal && modal.onProceed) {
      modal.onProceed();
    }
    this.activeModals.delete(modalId);
  }

  /**
   * Handle gateway appeal
   */
  handleGatewayAppeal(modalId) {
    const modal = this.activeModals.get(modalId);
    if (modal && modal.onAppeal) {
      modal.onAppeal();
    }
    this.activeModals.delete(modalId);
  }

  /**
   * Close active modal
   */
  closeActiveModal() {
    // Close the most recent modal
    const entries = Array.from(this.activeModals.entries());
    if (entries.length > 0) {
      const [modalId, modal] = entries[entries.length - 1];
      this.activeModals.delete(modalId);
      
      // Return close event
      return {
        type: 'modal_close',
        modalId,
        modalType: modal.type
      };
    }
    
    return null;
  }

  /**
   * Get modal style
   */
  getModalStyle() {
    const theme = this.themes[this.currentTheme];
    
    return {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '90%',
      maxWidth: '500px',
      backgroundColor: theme.background,
      border: `1px solid ${theme.border}`,
      borderRadius: '12px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      zIndex: 1000,
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    };
  }

  /**
   * Get fullscreen style
   */
  getFullscreenStyle() {
    const theme = this.themes[this.currentTheme];
    
    return {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.background,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    };
  }

  /**
   * Get centered style
   */
  getCenteredStyle() {
    const theme = this.themes[this.currentTheme];
    
    return {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '90%',
      maxWidth: '400px',
      backgroundColor: theme.background,
      border: `1px solid ${theme.border}`,
      borderRadius: '12px',
      padding: '24px',
      zIndex: 1000,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    };
  }

  /**
   * Get overlay style
   */
  getOverlayStyle() {
    const theme = this.themes[this.currentTheme];
    
    return {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    };
  }

  /**
   * Get toast style
   */
  getToastStyle(type) {
    const theme = this.themes[this.currentTheme];
    const color = theme[type] || theme.info;
    
    return {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      backgroundColor: color,
      color: '#ffffff',
      padding: '12px 24px',
      borderRadius: '8px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      zIndex: 1001,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeight: '500',
      maxWidth: '400px'
    };
  }

  /**
   * Get modal animations
   */
  getModalAnimations() {
    return {
      enter: {
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 200,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
      },
      exit: {
        opacity: [1, 0],
        scale: [1, 0.9],
        duration: 150,
        easing: 'cubic-bezier(0.4, 0, 1, 1)'
      }
    };
  }

  /**
   * Set theme
   */
  setTheme(themeName) {
    if (this.themes[themeName]) {
      this.currentTheme = themeName;
      return { success: true, theme: themeName };
    }
    return { success: false, error: 'Theme not found' };
  }

  /**
   * Get active modals
   */
  getActiveModals() {
    return Array.from(this.activeModals.values()).map(modal => ({
      id: modal.id,
      type: modal.type,
      visible: modal.visible,
      age: Date.now() - modal.createdAt
    }));
  }

  /**
   * Clear all modals
   */
  clearAllModals() {
    const count = this.activeModals.size;
    this.activeModals.clear();
    return { cleared: count };
  }

  /**
   * Get UI statistics
   */
  getStatistics() {
    const modals = this.getActiveModals();
    
    return {
      activeModals: modals.length,
      modalTypes: modals.reduce((acc, modal) => {
        acc[modal.type] = (acc[modal.type] || 0) + 1;
        return acc;
      }, {}),
      currentTheme: this.currentTheme,
      timestamp: Date.now()
    };
  }
}

module.exports = AstraUI;