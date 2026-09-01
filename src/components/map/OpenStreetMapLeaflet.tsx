import React, { useMemo, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

interface OpenStreetMapLeafletProps {
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  isDark?: boolean;
  zoom?: number;
  onMapLoaded?: () => void;
  onError?: () => void;
}

export function OpenStreetMapLeaflet({
  latitude,
  longitude,
  title = 'Teslimat Adresi',
  description = '',
  isDark = false,
  zoom = 15,
  onMapLoaded,
  onError,
}: OpenStreetMapLeafletProps) {
  const [loading, setLoading] = useState(true);

  // Güvenli koordinat kontrolleri
  const validLat = typeof latitude === 'number' && !isNaN(latitude) ? latitude : 41.0082;
  const validLng = typeof longitude === 'number' && !isNaN(longitude) ? longitude : 28.9784;

  const safeTitle = (title || 'Teslimat Adresi').replace(/'/g, "\\'");
  const safeDesc = (description || '').replace(/'/g, "\\'");

  const htmlContent = useMemo(() => {
    // Açık / Koyu tema için optimize edilmiş CartoDB ve OpenStreetMap tile kaynakları
    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    const tileAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

    const bgMapColor = isDark ? '#111827' : '#f8fafc';
    const popupBg = isDark ? '#1f2937' : '#ffffff';
    const popupTextColor = isDark ? '#f9fafb' : '#0f172a';
    const popupSubColor = isDark ? '#9ca3af' : '#64748b';
    const pinPrimaryColor = '#00236f';
    const pinGlowColor = isDark ? 'rgba(59, 130, 246, 0.4)' : 'rgba(0, 35, 111, 0.25)';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
    }
    html, body, #map {
      width: 100%;
      height: 100%;
      background-color: ${bgMapColor};
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .leaflet-control-attribution {
      font-size: 8px !important;
      opacity: 0.6;
      background: rgba(255, 255, 255, 0.7) !important;
    }
    ${isDark ? '.leaflet-control-attribution { background: rgba(0, 0, 0, 0.6) !important; color: #9ca3af !important; }' : ''}
    
    /* Özel Animasyonlu Kargo / Teslimat Pin Markeri */
    .custom-pin-container {
      position: relative;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .pin-pulse {
      position: absolute;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: ${pinGlowColor};
      animation: pulse 2s infinite ease-in-out;
      z-index: 1;
    }
    .pin-badge {
      position: relative;
      width: 34px;
      height: 34px;
      border-radius: 17px;
      background: ${pinPrimaryColor};
      border: 2.5px solid #ffffff;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
    }
    .pin-badge svg {
      width: 18px;
      height: 18px;
      fill: #ffffff;
    }
    @keyframes pulse {
      0% { transform: scale(0.6); opacity: 0.8; }
      50% { transform: scale(1.15); opacity: 0.3; }
      100% { transform: scale(0.6); opacity: 0.8; }
    }

    /* Özel Popup Stili */
    .leaflet-popup-content-wrapper {
      background: ${popupBg} !important;
      color: ${popupTextColor} !important;
      border-radius: 12px !important;
      padding: 4px !important;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25) !important;
      border: 1px solid ${isDark ? '#374151' : '#e2e8f0'} !important;
    }
    .leaflet-popup-tip {
      background: ${popupBg} !important;
    }
    .popup-title {
      font-size: 13px;
      font-weight: 700;
      color: ${popupTextColor};
      margin-bottom: 2px;
    }
    .popup-desc {
      font-size: 11px;
      color: ${popupSubColor};
      line-height: 1.3;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <script>
    try {
      const lat = ${validLat};
      const lng = ${validLng};

      const map = L.map('map', {
        center: [lat, lng],
        zoom: ${zoom},
        zoomControl: false,
        attributionControl: true
      });

      L.tileLayer('${tileUrl}', {
        maxZoom: 19,
        attribution: '${tileAttribution}'
      }).addTo(map);

      // Özel SVG HTML Pin
      const pinIcon = L.divIcon({
        className: 'custom-pin-wrapper',
        html: \`
          <div class="custom-pin-container">
            <div class="pin-pulse"></div>
            <div class="pin-badge">
              <svg viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            </div>
          </div>
        \`,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -20]
      });

      const marker = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
      
      const popupHtml = \`
        <div>
          <div class="popup-title">${safeTitle}</div>
          \${'${safeDesc}' ? '<div class="popup-desc">' + '${safeDesc}' + '</div>' : ''}
        </div>
      \`;

      marker.bindPopup(popupHtml).openPopup();

      // Harita hazır olduğunda boyutunu güncelle
      setTimeout(function() {
        map.invalidateSize();
      }, 300);

      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage('MAP_LOADED');
      }
    } catch (e) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage('MAP_ERROR');
      }
    }
  </script>
</body>
</html>
    `;
  }, [validLat, validLng, safeTitle, safeDesc, isDark, zoom]);

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={[styles.webView, { backgroundColor: isDark ? '#111827' : '#f8fafc' }]}
        scrollEnabled={false}
        overScrollMode="never"
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onLoadEnd={() => {
          setLoading(false);
          onMapLoaded?.();
        }}
        onError={() => {
          setLoading(false);
          onError?.();
        }}
        onMessage={(event) => {
          if (event.nativeEvent.data === 'MAP_LOADED') {
            setLoading(false);
            onMapLoaded?.();
          } else if (event.nativeEvent.data === 'MAP_ERROR') {
            setLoading(false);
            onError?.();
          }
        }}
      />
      {loading && (
        <View style={[styles.loadingOverlay, { backgroundColor: isDark ? '#111827' : '#f8fafc' }]}>
          <ActivityIndicator size="small" color="#00236f" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
});
