
// This is a helper script to load Google Maps API
function loadGoogleMapsApi() {
  // Check if already loaded
  if (window.google && window.google.maps) {
    return;
  }
  
  // Try to get the API key from environment variables
  const apiKey = window.ENV_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || 'your-google-maps-api-key';
  
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&libraries=marker&v=beta`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
  
  // Global callback for when Maps loads
  window.initMap = function() {
    console.log('Google Maps API loaded successfully');
    
    // Dispatch a custom event when Maps API is loaded
    const event = new CustomEvent('google-maps-loaded');
    window.dispatchEvent(event);
  };
}

// Execute on page load
window.addEventListener('DOMContentLoaded', loadGoogleMapsApi);
