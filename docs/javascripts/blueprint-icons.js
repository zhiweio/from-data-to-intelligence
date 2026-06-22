/**
 * Blueprint Design System — Icon Pack Registration for Mermaid
 *
 * Registers Iconify icon packs for use in architecture-beta and
 * flowchart @{ icon: } diagrams WITHOUT race conditions.
 *
 * PROBLEM: previous approach used polling + network fetch → register → mermaid.run().
 * By the time icons were registered, MkDocs Material's auto-render had already
 * run, producing blue "?" placeholders. mermaid.run() is a no-op for already-
 * rendered diagrams.
 *
 * FIX: intercept window.mermaid via a property setter. When Material's script
 * assigns window.mermaid, the setter fires FIRST, calls registerIconPacks with
 * pre-fetched icon data, then allows the original assignment to proceed.
 * This guarantees icons are registered BEFORE any internal initialize() call.
 *
 * Works with MkDocs Material's built-in Mermaid support — no plugins needed.
 *
 * Registered packs:
 *   - logos        (brand logos — aws, aws-s3, aws-redshift, salesforce, postgresql)
 *   - devicon      (developer technology icons — salesforce, apachespark, mssql, openapi)
 *   - codicon      (VS Code icons — database, globe, person, etc.)
 *   - skill-icons  (developer skill/tool icons)
 *   - gcp          (Google Cloud Platform icons)
 *   - vscode-icons (VS Code product icons)
 */
(function () {
  var PACKS = [
    'logos',
    'devicon',
    'codicon',
    'skill-icons',
    'gcp',
    'vscode-icons',
    'carbon',
  ];

  // Pre-fetch all icon packs as Promises — they resolve as soon as network
  // returns, which is typically before the Mermaid script even finishes loading.
  var iconFetches = {};
  PACKS.forEach(function (name) {
    iconFetches[name] = fetch(
      'https://unpkg.com/@iconify-json/' + name + '/icons.json'
    )
      .then(function (res) { return res.json(); })
      .catch(function (e) {
        console.warn('[Blueprint] Failed to fetch icon pack "' + name + '":', e.message);
        return null;
      });
  });

  // Intercept window.mermaid assignment.
  // When Material's script sets window.mermaid, register icon packs first.
  Object.defineProperty(window, 'mermaid', {
    configurable: true,
    enumerable: true,
    get: function () {
      return this._mermaid;
    },
    set: function (m) {
      // Allow re-assignment (e.g. HMR)
      Object.defineProperty(window, 'mermaid', {
        configurable: true,
        enumerable: true,
        writable: true,
        value: m,
      });

      try {
        var loaders = PACKS.map(function (name) {
          return {
            name: name,
            loader: function () { return iconFetches[name]; },
          };
        });
        m.registerIconPacks(loaders);
        console.log(
          '[Blueprint] Registered ' + loaders.length +
          ' icon packs before Mermaid initialization.'
        );
      } catch (e) {
        console.warn('[Blueprint] Icon pack registration failed:', e.message);
      }
    },
  });
})();
