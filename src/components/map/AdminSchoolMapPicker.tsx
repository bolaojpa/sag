'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Search, Loader2, Compass, AlertCircle, CheckCircle2, Navigation } from 'lucide-react';

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

  // Geocodificação Reversa via Server API Route (Lat/Lng -> Texto do Endereço)
  const fetchReverseGeocode = async (targetLat: number, targetLng: number) => {
    setIsGeocoding(true);
    setGeocodeFeedback(null);

    // Notifica o formulário pai imediatamente com as novas coordenadas
    onCoordinatesChange({ lat: targetLat, lng: targetLng, endereco: endereco });

    try {
      const response = await fetch(`/api/geocode/reverse?lat=${targetLat}&lng=${targetLng}`);
      const data = await response.json();

      if (data && data.address) {
        const formattedAddress = data.address;
        setEndereco(formattedAddress);
        onCoordinatesChange({ lat: targetLat, lng: targetLng, endereco: formattedAddress });
        setGeocodeFeedback(`✅ Endereço capturado pelo pino: "${formattedAddress}"`);
      } else {
        onCoordinatesChange({ lat: targetLat, lng: targetLng });
        setGeocodeFeedback(`📍 Pino fixado em: ${targetLat.toFixed(6)}, ${targetLng.toFixed(6)}`);
      }
    } catch (err) {
      console.warn('Erro na Geocodificação Reversa:', err);
      onCoordinatesChange({ lat: targetLat, lng: targetLng });
      setGeocodeFeedback(`📍 Pino fixado em: ${targetLat.toFixed(6)}, ${targetLng.toFixed(6)}`);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Inicialização do Leaflet no cliente
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

        // Arrasto do pino -> Atualiza Posição + Geocodificação Reversa
        customMarker.on('dragend', (e: any) => {
          const position = e.target.getLatLng();
          if (isMounted) {
            setLat(position.lat);
            setLng(position.lng);
            if (leafletMapRef.current) {
              leafletMapRef.current.panTo([position.lat, position.lng]);
            }
            fetchReverseGeocode(position.lat, position.lng);
          }
        });

        // Clique no mapa -> Move pino + Geocodificação Reversa
        map.on('click', (e: any) => {
          const { lat: newLat, lng: newLng } = e.latlng;
          if (isMounted) {
            setLat(newLat);
            setLng(newLng);
            customMarker.setLatLng([newLat, newLng]);
            map.panTo([newLat, newLng]);
            fetchReverseGeocode(newLat, newLng);
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

  // Geocodificação Direta por Texto via Multi-Pass Server Proxy
  const handleGeocodeSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!endereco.trim()) return;

    setIsGeocoding(true);
    setGeocodeFeedback(null);

    try {
      const response = await fetch(`/api/geocode/search?q=${encodeURIComponent(endereco)}`);
      const data = await response.json();

      if (data && data.lat && data.lng) {
        const foundLat = data.lat;
        const foundLng = data.lng;
        const foundAddress = data.displayName || endereco;

        setLat(foundLat);
        setLng(foundLng);
        setEndereco(foundAddress);

        if (leafletMapRef.current && markerRef.current) {
          leafletMapRef.current.setView([foundLat, foundLng], 17);
          markerRef.current.setLatLng([foundLat, foundLng]);
        }

        onCoordinatesChange({ lat: foundLat, lng: foundLng, endereco: foundAddress });
        setGeocodeFeedback(`✅ Endereço localizado! Pino fixado em (${foundLat.toFixed(4)}, ${foundLng.toFixed(4)})`);
      } else {
        setGeocodeFeedback(
          '⚠️ Não foi possível encontrar a rua exata por texto. Por favor, clique ou arraste o pino no mapa abaixo para marcar a localização exata!'
        );
      }
    } catch (err: any) {
      console.warn('Erro ao consultar API Server Proxy:', err);
      setGeocodeFeedback(
        '⚠️ Falha na busca por texto. Por favor, clique no pino do mapa para capturar o endereço.'
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
          <span>Geocodificação Reversa & Direta (Server Proxy OpenStreetMap)</span>
        </div>
        <span className="text-[11px] bg-red-50 text-red-700 font-extrabold px-2.5 py-0.5 rounded-full border border-red-200 flex items-center gap-1">
          <Navigation className="w-3 h-3 text-red-600" />
          Pinagem Ativa
        </span>
      </div>

      {/* Input de Endereço + Busca Nominatim */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={endereco}
            onChange={(e) => {
              const val = e.target.value;
              setEndereco(val);
              onCoordinatesChange({ lat, lng, endereco: val });
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleGeocodeSearch(e);
            }}
            placeholder="Digite o endereço OU clique no mapa abaixo para capturar via pino..."
            className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-xl p-3 font-semibold focus:ring-2 focus:ring-red-500 shadow-inner"
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
              <span>Processando...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4 text-white" />
              <span>Buscar por Texto</span>
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
          <span className="leading-relaxed">{geocodeFeedback}</span>
        </div>
      )}

      {/* Exibição dos Valores Capturados */}
      <div className="grid grid-cols-2 gap-3 text-xs font-semibold bg-white p-3 rounded-xl border border-slate-200">
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Latitude do Pino:</span>
          <span className="font-mono font-extrabold text-red-700">{lat.toFixed(6)}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Longitude do Pino:</span>
          <span className="font-mono font-extrabold text-red-700">{lng.toFixed(6)}</span>
        </div>
      </div>

      {/* Container do Mapa Interativo Leaflet */}
      <div>
        <p className="text-[11px] text-slate-800 font-extrabold mb-1 flex items-center gap-1">
          <MapPin className="w-4 h-4 text-red-600" />
          Clique ou arraste o pino no mapa para obter o Endereço Reversível na hora:
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
