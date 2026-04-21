/** @type {import('@lhci/cli').Config} */
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'node .next/standalone/server.js',
      startServerReadyPattern: 'Ready',
      startServerReadyTimeout: 30000,
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/programme-fondateur',
        'http://localhost:3000/blog',
        'http://localhost:3000/features/analytiques',
      ],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        // 0.83 accommodates the Content-Signal directive in robots.txt, which
        // Lighthouse's audit flags as "unknown" (the directive is valid per the
        // contentsignals.org draft; real crawlers ignore unknown directives per
        // RFC 9309). Drop a second audit below this line and CI still fails.
        'categories:seo': ['error', { minScore: 0.83 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 3500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.15 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
