'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Search, Loader2, Compass, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AdminSchoolMapPickerProps {
  initialLat?: number;
  initialLng?: number;
  initialEndereco?: string;
  onCoordinatesChange: (coords: { lat: number; lng: number; endereco?: string }) => void;
}

export const AdminSchoolMapPicker: React.FC<AdminSchoolMapPickerProps> = ({
  initialLat = -7.1153,
  initialLng = -34.8610,
  initialEndereco = '',
  onCoordinatesChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [lat, setLat] = useState<number>(initialLat);
  const [lng, setLng] = useState<number>(initialLng);
  const [endereco, setEndereco] = useState<string>(initialEndereco);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [geocodeFeedback, setGeocodeFeedback] = useState<string | null>(null);

  // Inicialização do Leaflet no lado do cliente
  useEffect(() => {
    let isMounted = true;

    async function initLeaflet() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      const L = await import('leaflet');

      // Corrige ícones padrão do Leaflet no Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!leafletMapRef.current && mapContainerRef.current) {
        const map = L.map(mapContainerRef.current).setView([lat, lng], 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        const customMarker = L.marker([lat, lng], { draggable: true }).addTo(map);

        customMarker.on('dragend', (e: any) => {
          const position = e.target.getLatLng();
          if (isMounted) {
            setLat(position.lat);
            setLng(position.lng);
            onCoordinatesChange({ lat: position.lat, lng: position.lng });
          }
        });

        map.on('click', (e: any) => {
          const { lat: newLat, lng: newLng } = e.latlng;
          if (isMounted) {
            setLat(newLat);
            setLng(newLng);
            customMarker.setLatLng([newLat, newLng]);
            onCoordinatesChange({ lat: newLat, lng: newLng });
          }
        });

        leafletMapRef.current = map;
        markerRef.current = customMarker;
      }
    }

    initLeaflet();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Geocodificação Gratuita com a API do Nominatim (OpenStreetMap)
  const handleGeocodeSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!endereco.trim()) return;

    setIsGeocoding(true);
    setGeocodeFeedback(null);

    try {
      // Adiciona João Pessoa, PB se não informado para maior precisão
      const searchQuery = endereco.toLowerCase().includes('joão pessoa')
        ? endereco
        : `${endereco}, João Pessoa, Paraíba, Brasil`;

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1`,
        {
          headers: {
            'Accept-Language': 'pt-BR,pt;q=0.9',
            'User-Agent': 'SAG-IniciativaFuturo-App/2.0',
          },
        }
      );

      const data = await response.json();

      if (data && data.length > 0) {
        const foundLat = parseFloat(data[0].lat);
        const foundLng = parseFloat(data[0].lon);

        setLat(foundLat);
        setLng(foundLng);

        if (leafletMapRef.current && markerRef.current) {
          leafletMapRef.current.setView([foundLat, foundLng], 16);
          markerRef.current.setLatLng([foundLat, foundLng]);
        }

        onCoordinatesChange({ lat: foundLat, lng: foundLng, endereco });
        setGeocodeFeedback(`✅ Coordenadas capturadas via Nominatim: ${foundLat.toFixed(4)}, ${foundLng.toFixed(4)}`);
      } else {
        setGeocodeFeedback(
          '⚠️ Endereço não encontrado na busca automática. Clique diretamente no mapa abaixo para selecionar a localização exata!'
        );
      }
    } catch (err: any) {
      console.warn('Erro ao consultar API Nominatim:', err);
      setGeocodeFeedback(
        '⚠️ Falha na busca automática do Nominatim. Você pode clicar no mapa para definir as coordenadas manualmente.'
      );
    } finally {
      setIsGeocoding(false);
    }
  };

  return (
    <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 uppercase tracking-wider">
          <Compass className="w-4 h-4 text-red-600" />
          <span>Geocodificação Automática (Nominatim OpenStreetMap)</span>
        </div>
        <span className="text-[11px] bg-red-50 text-red-700 font-extrabold px-2.5 py-0.5 rounded-full border border-red-200">
          100% Gratuito
        </span>
      </div>

      {/* Input de Endereço + Busca Nominatim */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            placeholder="Ex: Av. Epitácio Pessoa, 1200, Bairro dos Estados, João Pessoa"
            className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-xl p-3 font-semibold focus:ring-2 focus:ring-red-500 shadow-inner pr-10"
          />
        </div>
        <button
          type="button"
          onClick={() => handleGeocodeSearch()}
          disabled={isGeocoding}
          className="btn-primary px-4 py-3 text-xs font-extrabold flex items-center justify-center gap-2 whitespace-nowrap shadow-md"
        >
          {isGeocoding ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Buscando...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4 text-white" />
              <span>Geocodificar Endereço</span>
            </>
          )}
        </button>
      </div>

      {geocodeFeedback && (
        <div
          className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
            geocodeFeedback.includes('✅')
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-amber-50 text-amber-900 border border-amber-200'
          }`}
        >
          {geocodeFeedback.includes('✅') ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <span>{geocodeFeedback}</span>
        </div>
      )}

      {/* Exibição dos Valores Capturados */}
      <div className="grid grid-cols-2 gap-3 text-xs font-semibold bg-white p-3 rounded-xl border border-slate-200">
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Latitude Capturada:</span>
          <span className="font-mono font-extrabold text-red-700">{lat.toFixed(6)}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Longitude Capturada:</span>
          <span className="font-mono font-extrabold text-red-700">{lng.toFixed(6)}</span>
        </div>
      </div>

      {/* Container do Mapa Interativo Leaflet */}
      <div>
        <p className="text-[11px] text-slate-500 font-bold mb-1 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-red-600" />
          Ou clique/arraste o pino no mapa para ajustar a localização exata:
        </p>
        <div
          ref={mapContainerRef}
          className="w-full h-64 rounded-xl border-2 border-slate-300 shadow-inner z-10"
        />
      </div>
    </div>
  );
};

export default AdminSchoolMapPicker;
