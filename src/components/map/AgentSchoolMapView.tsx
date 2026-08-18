'use client';

import React, { useEffect, useRef } from 'react';
import { Escola } from '@/types/database';
import { MapPin, Navigation, Building2, CheckCircle2, Clock } from 'lucide-react';

interface AgentSchoolMapViewProps {
  escolas: Escola[];
  grupoNome?: string;
}

export const AgentSchoolMapView: React.FC<AgentSchoolMapViewProps> = ({
  escolas,
  grupoNome = 'Grupo de Campo 01',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function initAgentMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      const L = await import('leaflet');

      // Corrige ícones padrão do Leaflet no Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Posição central padrão em João Pessoa - PB (-7.1153, -34.8610)
      const centerLat = escolas.length > 0 && escolas[0].latitude ? escolas[0].latitude : -7.1153;
      const centerLng = escolas.length > 0 && escolas[0].longitude ? escolas[0].longitude : -34.8610;

      if (!leafletMapRef.current && mapContainerRef.current) {
        const map = L.map(mapContainerRef.current).setView([centerLat, centerLng], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        leafletMapRef.current = map;
      }

      if (leafletMapRef.current && isMounted) {
        const map = leafletMapRef.current;

        // Limpa marcadores anteriores se houver
        map.eachLayer((layer: any) => {
          if (layer instanceof L.Marker) {
            map.removeLayer(layer);
          }
        });

        const bounds = L.latLngBounds([]);

        escolas.forEach((escola) => {
          // Extrai latitude e longitude (ou faz fallback de lat_lng_oficial)
          let lat = escola.latitude;
          let lng = escola.longitude;

          if ((!lat || !lng) && escola.lat_lng_oficial) {
            const parts = escola.lat_lng_oficial.split(',');
            if (parts.length === 2) {
              lat = parseFloat(parts[0]);
              lng = parseFloat(parts[1]);
            }
          }

          if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
            const marker = L.marker([lat, lng]).addTo(map);
            bounds.extend([lat, lng]);

            const isVisitado = escola.statusVisita === 'visitado';
            const statusBadge = isVisitado
              ? '<span style="background-color: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; padding: 2px 8px; border-radius: 9999px; font-weight: 800; font-size: 11px;">🟢 Visitado Hoje</span>'
              : '<span style="background-color: #ffe4e6; color: #9f1239; border: 1px solid #fecdd3; padding: 2px 8px; border-radius: 9999px; font-weight: 800; font-size: 11px;">🔴 Visita Pendente</span>';

            const gpsRouteUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

            const popupContent = `
              <div style="font-family: system-ui, sans-serif; padding: 4px; max-width: 220px;">
                <div style="font-weight: 900; font-size: 14px; color: #0f172a; margin-bottom: 4px;">
                  🏫 ${escola.nome}
                </div>
                <div style="font-size: 11px; color: #64748b; margin-bottom: 8px; font-weight: 600;">
                  📍 ${escola.regiao} ${escola.endereco ? '• ' + escola.endereco : ''}
                </div>
                <div style="margin-bottom: 12px;">
                  ${statusBadge}
                </div>
                <a 
                  href="${gpsRouteUrl}" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style="display: flex; align-items: center; justify-content: center; gap: 6px; background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 8px 12px; border-radius: 10px; font-weight: 800; font-size: 12px; text-align: center; box-shadow: 0 2px 4px rgba(220, 38, 38, 0.3);"
                >
                  🚀 Rotear no GPS (Waze / Maps)
                </a>
              </div>
            `;

            marker.bindPopup(popupContent);
          }
        });

        if (bounds.isValid() && escolas.length > 1) {
          map.fitBounds(bounds, { padding: [40, 40] });
        }
      }
    }

    initAgentMap();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [escolas]);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-red-50 text-red-600 rounded-xl">
            <Building2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Mapa de Rotas de Campo — OpenStreetMap
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Escolas escaladas hoje para o <span className="font-extrabold text-red-700">{grupoNome}</span> ({escolas.length} unidades)
            </p>
          </div>
        </div>

        <span className="text-xs bg-red-50 text-red-700 font-extrabold px-3 py-1 rounded-full border border-red-200 flex items-center gap-1.5 shadow-sm">
          <Navigation className="w-3.5 h-3.5 text-red-600 animate-pulse" />
          GPS Rota Direta
        </span>
      </div>

      {/* Container do Mapa Leaflet para Agentes */}
      <div
        ref={mapContainerRef}
        className="w-full h-80 rounded-2xl border-2 border-slate-300 shadow-inner z-10"
      />
    </div>
  );
};
