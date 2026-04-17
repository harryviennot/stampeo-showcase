import Script from "next/script";

/**
 * Tiny inline script that powers scroll-reveal animations without React hydration.
 * Uses a single IntersectionObserver for all [data-sr] elements on the page.
 * ~300 bytes minified — runs after hydration to avoid mismatch.
 */
export function ScrollRevealInit() {
  return (
    <Script
      id="scroll-reveal-init"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `(function(){var o=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("revealed");o.unobserve(e.target)}})},{threshold:.1,rootMargin:"0px 0px -50px 0px"});function s(r){r.querySelectorAll("[data-sr]:not(.revealed)").forEach(function(el){o.observe(el)})}s(document);new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(function(n){if(n.nodeType===1){if(n.hasAttribute&&n.hasAttribute("data-sr"))o.observe(n);if(n.querySelectorAll)s(n)}})})}).observe(document.body,{childList:true,subtree:true})})();`,
      }}
    />
  );
}
