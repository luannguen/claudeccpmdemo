/**
 * Experience Module - Test Scenarios
 * 
 * Testing matrix theo QRUpdatePlan Section 12
 * 
 * Device Matrix:
 * - iOS Safari / Zalo WebView
 * - Android Chrome / Zalo WebView  
 * - Desktop Chrome / Safari
 * 
 * Video Sources:
 * - YouTube embed
 * - Vimeo embed
 * - Direct MP4
 * - HLS (m3u8)
 * 
 * Edge Cases:
 * - Autoplay blocked
 * - Poster missing
 * - Weak network
 * - 404 video
 * - Invalid code
 */

export const TEST_SCENARIOS = {
  // ============= DEVICE MATRIX =============
  devices: [
    {
      id: 'ios-safari',
      name: 'iOS Safari',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      expectations: {
        autoplay: 'muted-only',
        playsInline: true,
        safeArea: true
      }
    },
    {
      id: 'ios-zalo',
      name: 'iOS Zalo WebView',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Zalo/3.0',
      expectations: {
        autoplay: 'blocked',
        playsInline: true,
        fallbackRequired: true
      }
    },
    {
      id: 'android-chrome',
      name: 'Android Chrome',
      userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      expectations: {
        autoplay: 'muted-only',
        playsInline: true
      }
    },
    {
      id: 'android-zalo',
      name: 'Android Zalo WebView',
      userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.0.0 Mobile Safari/537.36 Zalo',
      expectations: {
        autoplay: 'blocked',
        fallbackRequired: true
      }
    },
    {
      id: 'desktop-chrome',
      name: 'Desktop Chrome',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      expectations: {
        autoplay: 'muted-only',
        keyboardShortcuts: true
      }
    },
    {
      id: 'desktop-safari',
      name: 'Desktop Safari',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
      expectations: {
        autoplay: 'muted-only'
      }
    }
  ],

  // ============= VIDEO SOURCES =============
  videoSources: [
    {
      id: 'youtube',
      name: 'YouTube',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      expectedStrategy: 'youtube',
      expectations: {
        embedSupport: true,
        autoplayParam: 'autoplay=1&mute=1'
      }
    },
    {
      id: 'vimeo',
      name: 'Vimeo',
      url: 'https://vimeo.com/123456789',
      expectedStrategy: 'vimeo',
      expectations: {
        embedSupport: true,
        autoplayParam: 'autoplay=1&muted=1'
      }
    },
    {
      id: 'mp4-direct',
      name: 'Direct MP4',
      url: 'https://cdn.example.com/video.mp4',
      expectedStrategy: 'html5',
      expectations: {
        nativePlayer: true,
        preload: 'metadata'
      }
    },
    {
      id: 'hls',
      name: 'HLS Stream',
      url: 'https://cdn.example.com/stream.m3u8',
      expectedStrategy: 'html5',
      expectations: {
        nativePlayer: true,
        hlsSupport: 'safari-native-or-hls.js'
      }
    }
  ],

  // ============= EDGE CASES =============
  edgeCases: [
    {
      id: 'autoplay-blocked',
      name: 'Autoplay Blocked',
      setup: { simulateAutoplayBlock: true },
      expectations: {
        showPoster: true,
        showPlayButton: true,
        ctaVisible: true,
        skipVisible: true
      }
    },
    {
      id: 'poster-missing',
      name: 'Poster Missing',
      setup: { posterUrl: null },
      expectations: {
        fallbackToVideoFrame: true,
        ctaVisible: true
      }
    },
    {
      id: 'weak-network',
      name: 'Weak Network (2G/Save-Data)',
      setup: { 
        effectiveType: '2g',
        saveData: true
      },
      expectations: {
        posterFirst: true,
        noAutoload: true
      }
    },
    {
      id: 'video-404',
      name: 'Video 404/Error',
      setup: { videoError: true },
      expectations: {
        showPoster: true,
        showRetryButton: true,
        ctaVisible: true,
        skipVisible: true
      }
    },
    {
      id: 'invalid-code',
      name: 'Invalid Experience Code',
      setup: { code: 'invalid-xxx' },
      expectations: {
        redirectToEcard: true,
        noWhiteScreen: true
      }
    },
    {
      id: 'reduced-motion',
      name: 'Prefers Reduced Motion',
      setup: { prefersReducedMotion: true },
      expectations: {
        noAutoplay: true,
        staticPoster: true
      }
    },
    {
      id: 'timeout',
      name: 'Video Load Timeout (>5s)',
      setup: { simulateTimeout: 5000 },
      expectations: {
        showPoster: true,
        showRetryButton: true,
        ctaVisible: true
      }
    }
  ],

  // ============= REGRESSION TESTS =============
  regression: [
    {
      id: 'ecard-layout-abc',
      name: 'E-Card Layout A/B/C intact',
      checks: [
        'Avatar renders correctly',
        'Name/Title/Bio visible',
        'Contact info respects visibility toggles',
        'Extensions buttons render when data available',
        'Action group functional'
      ]
    },
    {
      id: 'privacy-toggles',
      name: 'Privacy Toggles Work',
      checks: [
        'show_posts=false hides Posts button',
        'show_shop=false hides Shop button',
        'show_contact=false hides Contact section'
      ]
    },
    {
      id: 'view-count',
      name: 'View Count Increments',
      checks: [
        'view_count increases after 3s play',
        'No duplicate count on replay',
        'Count persists after navigation'
      ]
    },
    {
      id: 'qr-mode-switch',
      name: 'QR Mode Switching',
      checks: [
        'DIRECT mode goes straight to E-Card',
        'INTRO mode goes to Experience page',
        'QR regenerates when mode changes'
      ]
    }
  ],

  // ============= ACCEPTANCE CRITERIA =============
  acceptanceCriteria: [
    {
      id: 'ac-1',
      description: 'UI khả dụng <1.5s, không trắng màn hình',
      metric: 'time-to-interactive',
      threshold: 1500
    },
    {
      id: 'ac-2', 
      description: 'CTA/Skip luôn sẵn sàng',
      check: 'buttons-always-visible'
    },
    {
      id: 'ac-3',
      description: 'Không render nút rỗng',
      check: 'no-empty-buttons'
    },
    {
      id: 'ac-4',
      description: 'Privacy toggles hoạt động',
      check: 'toggles-functional'
    },
    {
      id: 'ac-5',
      description: 'Không có API call trực tiếp trong UI',
      check: 'no-direct-api-calls'
    },
    {
      id: 'ac-6',
      description: 'Tuân thủ AnimatedIcon, không dùng window.alert/confirm',
      check: 'ui-compliance'
    }
  ]
};

/**
 * Run test scenario (mock implementation for documentation)
 * @param {string} scenarioId
 * @returns {Object} Test result
 */
export function runTestScenario(scenarioId) {
  // This is a documentation/placeholder function
  // Actual testing would be done manually or with testing framework
  return {
    scenarioId,
    status: 'pending',
    message: 'Manual testing required - see TEST_SCENARIOS for checklist'
  };
}

/**
 * Generate test report template
 * @returns {Object}
 */
export function generateTestReportTemplate() {
  return {
    date: new Date().toISOString(),
    tester: '',
    environment: '',
    results: {
      devices: TEST_SCENARIOS.devices.map(d => ({ id: d.id, name: d.name, passed: null, notes: '' })),
      videoSources: TEST_SCENARIOS.videoSources.map(v => ({ id: v.id, name: v.name, passed: null, notes: '' })),
      edgeCases: TEST_SCENARIOS.edgeCases.map(e => ({ id: e.id, name: e.name, passed: null, notes: '' })),
      regression: TEST_SCENARIOS.regression.map(r => ({ id: r.id, name: r.name, passed: null, notes: '' })),
      acceptanceCriteria: TEST_SCENARIOS.acceptanceCriteria.map(a => ({ id: a.id, description: a.description, passed: null, notes: '' }))
    },
    summary: {
      totalTests: 0,
      passed: 0,
      failed: 0,
      blocked: 0
    }
  };
}

export default TEST_SCENARIOS;