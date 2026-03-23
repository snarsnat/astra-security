/**
 * ASTRA UI Components
 * 
 * Popup UIs for Humanity Verification and Gateway Checks
 */

class AstraUIComponents {
  constructor() {
    // UI themes
    this.themes = {
      light: {
        primary: '#2563eb',
        secondary: '#3b82f6',
        background: '#ffffff',
        text: '#1f2937',
        border: '#e5e7eb',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6'
      },
      dark: {
        primary: '#3b82f6',
        secondary: '#60a5fa',
        background: '#111827',
        text: '#f9fafb',
        border: '#374151',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6'
      }
    };
    
    // Component styles
    this.styles = {
      modal: {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '9999'
      },
      container: {
        backgroundColor: 'var(--background)',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      },
      header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--border)'
      },
      title: {
        fontSize: '20px',
        fontWeight: '600',
        color: 'var(--text)',
        margin: '0'
      },
      subtitle: {
        fontSize: '14px',
        color: 'var(--text-secondary)',
        marginTop: '4px',
        opacity: '0.8'
      },
      content: {
        marginBottom: '24px'
      },
      footer: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        marginTop: '24px',
        paddingTop: '16px',
        borderTop: '1px solid var(--border)'
      },
      button: {
        padding: '10px 20px',
        borderRadius: '8px',
        border: 'none',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s'
      },
      buttonPrimary: {
        backgroundColor: 'var(--primary)',
        color: 'white'
      },
      buttonSecondary: {
        backgroundColor: 'var(--secondary)',
        color: 'white'
      },
      buttonDanger: {
        backgroundColor: 'var(--danger)',
        color: 'white'
      },
      buttonOutline: {
        backgroundColor: 'transparent',
        border: '1px solid var(--border)',
        color: 'var(--text)'
      }
    };
  }

  /**
   * Generate Humanity Verification Popup
   */
  generateHumanityVerificationUI(challengeData, theme = 'light') {
    const themeColors = this.themes[theme];
    
    return {
      type: 'humanity_verification',
      theme,
      html: `
        <div class="astra-modal" style="${this.cssToString(this.styles.modal)}">
          <div class="astra-container" style="${this.cssToString(this.styles.container)}">
            <div class="astra-header" style="${this.cssToString(this.styles.header)}">
              <div>
                <h2 style="${this.cssToString(this.styles.title)}">
                  🔒 Humanity Verification Required
                </h2>
                <p style="${this.cssToString(this.styles.subtitle)}">
                  Please complete this challenge to continue
                </p>
              </div>
              <div class="astra-logo">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M16 2L30 16L16 30L2 16L16 2Z" fill="${themeColors.primary}"/>
                  <circle cx="16" cy="16" r="8" fill="white"/>
                  <path d="M16 10L22 16L16 22L10 16L16 10Z" fill="${themeColors.secondary}"/>
                </svg>
              </div>
            </div>
            
            <div class="astra-content" style="${this.cssToString(this.styles.content)}">
              ${this.generateChallengeContent(challengeData, themeColors)}
            </div>
            
            <div class="astra-footer" style="${this.cssToString(this.styles.footer)}">
              <button class="astra-button-outline" style="${this.cssToString({...this.styles.button, ...this.styles.buttonOutline})}">
                Need Help?
              </button>
              <button class="astra-button-primary" style="${this.cssToString({...this.styles.button, ...this.styles.buttonPrimary})}">
                Start Verification
              </button>
            </div>
          </div>
        </div>
      `,
      css: this.generateCSS(themeColors),
      javascript: this.generateVerificationJS(challengeData),
      challengeData
    };
  }

  /**
   * Generate Gateway Check Popup
   */
  generateGatewayCheckUI(checkData, theme = 'light') {
    const themeColors = this.themes[theme];
    const riskLevel = this.getRiskLevel(checkData.riskScore);
    
    return {
      type: 'gateway_check',
      theme,
      html: `
        <div class="astra-modal" style="${this.cssToString(this.styles.modal)}">
          <div class="astra-container" style="${this.cssToString(this.styles.container)}">
            <div class="astra-header" style="${this.cssToString(this.styles.header)}">
              <div>
                <h2 style="${this.cssToString(this.styles.title)}">
                  ${this.getGatewayIcon(riskLevel)} ASTRA Gateway Check
                </h2>
                <p style="${this.cssToString(this.styles.subtitle)}">
                  Checking your connection and security...
                </p>
              </div>
              <div class="astra-risk-badge" style="
                padding: 4px 12px;
                border-radius: 20px;
                background: ${this.getRiskColor(riskLevel, themeColors)};
                color: white;
                font-size: 12px;
                font-weight: 600;
              ">
                ${riskLevel.toUpperCase()} RISK
              </div>
            </div>
            
            <div class="astra-content" style="${this.cssToString(this.styles.content)}">
              ${this.generateGatewayContent(checkData, themeColors)}
            </div>
            
            <div class="astra-footer" style="${this.cssToString(this.styles.footer)}">
              ${checkData.accessGranted ? `
                <button class="astra-button-primary" style="${this.cssToString({...this.styles.button, ...this.styles.buttonPrimary})}">
                  Continue to Site
                </button>
              ` : `
                <button class="astra-button-outline" style="${this.cssToString({...this.styles.button, ...this.styles.buttonOutline})}">
                  Try Again
                </button>
                <button class="astra-button-primary" style="${this.cssToString({...this.styles.button, ...this.styles.buttonPrimary})}">
                  Contact Support
                </button>
              `}
            </div>
          </div>
        </div>
      `,
      css: this.generateCSS(themeColors),
      javascript: this.generateGatewayJS(checkData),
      checkData
    };
  }

  /**
   * Generate Face Verification UI
   */
  generateFaceVerificationUI(challengeData, theme = 'light') {
    const themeColors = this.themes[theme];
    
    return {
      type: 'face_verification',
      theme,
      html: `
        <div class="astra-modal" style="${this.cssToString(this.styles.modal)}">
          <div class="astra-container" style="${this.cssToString(this.styles.container)}">
            <div class="astra-header" style="${this.cssToString(this.styles.header)}">
              <h2 style="${this.cssToString(this.styles.title)}">
                👤 Face Verification
              </h2>
            </div>
            
            <div class="astra-content" style="${this.cssToString(this.styles.content)}">
              <div class="camera-container" style="
                width: 100%;
                height: 300px;
                background: var(--border);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 20px;
                position: relative;
                overflow: hidden;
              ">
                <div class="camera-feed" style="
                  width: 100%;
                  height: 100%;
                  background: linear-gradient(45deg, #333, #666);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                ">
                  <div class="face-guide" style="
                    width: 200px;
                    height: 200px;
                    border: 2px dashed ${themeColors.primary};
                    border-radius: 50%;
                    position: relative;
                  ">
                    <div class="guide-text" style="
                      position: absolute;
                      bottom: -40px;
                      left: 0;
                      right: 0;
                      text-align: center;
                      color: ${themeColors.text};
                      font-size: 14px;
                    ">
                      Position your face here
                    </div>
                  </div>
                </div>
                
                <div class="camera-status" style="
                  position: absolute;
                  top: 16px;
                  right: 16px;
                  background: rgba(0,0,0,0.7);
                  color: white;
                  padding: 8px 12px;
                  border-radius: 20px;
                  font-size: 12px;
                  display: flex;
                  align-items: center;
                  gap: 6px;
                ">
                  <div class="status-indicator" style="
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: ${themeColors.success};
                    animation: pulse 2s infinite;
                  "></div>
                  Camera Active
                </div>
              </div>
              
              <div class="instructions" style="
                background: var(--border);
                padding: 16px;
                border-radius: 8px;
                margin-bottom: 20px;
              ">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; color: var(--text);">
                  Instructions:
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: var(--text-secondary);">
                  <li>Make sure your face is well-lit</li>
                  <li>Look directly at the camera</li>
                  <li>Remove glasses if they cause glare</li>
                  <li>Stay still for 3 seconds</li>
                </ul>
              </div>
              
              <div class="progress-container" style="
                margin-bottom: 20px;
              ">
                <div class="progress-bar" style="
                  height: 6px;
                  background: var(--border);
                  border-radius: 3px;
                  overflow: hidden;
                ">
                  <div class="progress-fill" style="
                    height: 100%;
                    width: 0%;
                    background: ${themeColors.primary};
                    transition: width 0.3s;
                  "></div>
                </div>
                <div class="progress-text" style="
                  display: flex;
                  justify-content: space-between;
                  margin-top: 8px;
                  font-size: 12px;
                  color: var(--text-secondary);
                ">
                  <span>Verification in progress...</span>
                  <span class="time-remaining">3s</span>
                </div>
              </div>
            </div>
            
            <div class="astra-footer" style="${this.cssToString(this.styles.footer)}">
              <button class="astra-button-outline" style="${this.cssToString({...this.styles.button, ...this.styles.buttonOutline})}">
                Cancel
              </button>
              <button class="astra-button-primary" style="${this.cssToString({...this.styles.button, ...this.styles.buttonPrimary})}">
                Verify Face
              </button>
            </div>
          </div>
        </div>
      `,
      css: this.generateCSS(themeColors) + `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `,
      javascript: this.generateFaceVerificationJS(),
      challengeData
    };
  }

  /**
   * Generate Audio Verification UI
   */
  generateAudioVerificationUI(challengeData, theme = 'light') {
    const themeColors = this.themes[theme];
    
    return {
      type: 'audio_verification',
      theme,
      html: `
        <div class="astra-modal" style="${this.cssToString(this.styles.modal)}">
          <div class="astra-container" style="${this.cssToString(this.styles.container)}">
            <div class="astra-header" style="${this.cssToString(this.styles.header)}">
              <h2 style="${this.cssToString(this.styles.title)}">
                🎤 Audio Verification
              </h2>
            </div>
            
            <div class="astra-content" style="${this.cssToString(this.styles.content)}">
              <div class="sentence-display" style="
                background: var(--border);
                padding: 24px;
                border-radius: 8px;
                text-align: center;
                margin-bottom: 24px;
                font-size: 18px;
                font-weight: 500;
                color: var(--text);
                line-height: 1.5;
              ">
                "${challengeData.sentence || 'Please say the following sentence'}"
              </div>
              
              <div class="audio-visualizer" style="
                width: 100%;
                height: 100px;
                background: var(--border);
                border-radius: 8px;
                margin-bottom: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                overflow: hidden;
              ">
                <div class="waveform" style="
                  width: 100%;
                  height: 100%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 2px;
                ">
                  ${Array(40).fill(0).map((_, i) => `
                    <div class="wave-bar" style="
                      width: 4px;
                      height: 20px;
                      background: ${themeColors.primary};
                      border-radius: 2px;
                      transition: height 0.1s;
                    "></div>
                  `).join('')}
                </div>
                
                <div class="audio-status" style="
                  position: absolute;
                  top: 16px;
                  right: 16px;
                  background: rgba(0,0,0,0.7);
                  color: white;
                  padding: 8px 12px;
                  border-radius: 20px;
                  font-size: 12px;
                  display: flex;
                  align-items: center;
                  gap: 6px;
                ">
                  <div class="status-indicator" style="
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: ${themeColors.success};
                  "></div>
                  Microphone Ready
                </div>
              </div>
              
              <div class="instructions" style="
                background: var(--border);
                padding: 16px;
                border-radius: 8px;
                margin-bottom: 20px;
              ">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; color: var(--text);">
                  How to complete:
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: var(--text-secondary);">
                  <li>Speak clearly and at a normal volume</li>
                  <li>Make sure you're in a quiet environment</li>
                  <li>Hold the microphone close to your mouth</li>
                  <li>Click "Start Recording" when ready</li>
                </ul>
              </div>
              
              <div class="recording-controls" style="
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 16px;
                margin-bottom: 20px;
              ">
                <button class="record-button" style="
                  width: 60px;
                  height: 60px;
                  border-radius: 50%;
                  border: none;
                  background: ${themeColors.primary};
                  color: white;
                  font-size: 14px;
                  font-weight: 600;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  transition: all 0.2s;
                ">
                  <span class="record-icon">●</span>
                </button>
                
                <div class="recording-timer" style="
                  font-size: 24px;
                  font-weight: 600;
                  color: var(--text);
                  font-family: monospace;
                ">
                  00:00
                </div>
              </div>
            </div>
            
            <div class="astra-footer" style="${this.cssToString(this.styles.fyles.footer)}">
              <button class="astra-button-outline" style