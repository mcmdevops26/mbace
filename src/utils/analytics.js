/**
 * Central analytics helper — wraps gtag so nothing breaks if GA hasn't loaded.
 * All events show up in GA4 under Reports > Engagement > Events.
 */
export function track(eventName, params = {}) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params)
  }
}
