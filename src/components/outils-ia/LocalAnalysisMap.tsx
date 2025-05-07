import { useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Target, Users, Navigation } from "lucide-react";

// Add the necessary Google Maps types via declaration
declare global {
  interface Window {
    google: typeof google;
    selectLocal: (id: number) => void;
    ENV_GOOGLE_MAPS_API_KEY?: string; // Add this to window type
  }
}

// This ensures the Google Maps API key is available to the loader script
useEffect(() => {
  // Check if we have an API key from Vite environment variables
  if (import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    window.ENV_GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  }
}, []);

export interface LocalData {
  id: number;
  address: string;
  score: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  competitorAnalysis: {
    totalCompetitors: number;
    marketSaturation: number;
  };
  accessibility: string;
  patientFlow: number;
}

interface LocalAnalysisMapProps {
  locals: LocalData[];
  selectedId?: number;
  onSelectLocal: (local: LocalData) => void;
}

const LocalAnalysisMap = ({ locals, selectedId, onSelectLocal }: LocalAnalysisMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    // Make sure the API key is available to the loader script
    if (import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
      window.ENV_GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    }
    
    // Fonction pour initialiser la carte
    const initMap = () => {
      if (!mapContainerRef.current) return;
      
      // Calculer le centre de la carte basé sur tous les locaux
      const bounds = new google.maps.LatLngBounds();
      locals.forEach(local => {
        bounds.extend(new google.maps.LatLng(
          local.coordinates.lat, 
          local.coordinates.lng
        ));
      });

      // Créer la carte
      const mapOptions: google.maps.MapOptions = {
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: true,
        styles: [
          {
            featureType: "all",
            elementType: "labels.text.fill",
            stylers: [{ color: "#5C4E3D" }]
          },
          {
            featureType: "all",
            elementType: "labels.text.stroke",
            stylers: [{ visibility: "on" }, { color: "#f5f2ee" }, { weight: 2 }]
          },
          {
            featureType: "administrative",
            elementType: "geometry.fill",
            stylers: [{ color: "#f5f2ee" }]
          },
          {
            featureType: "landscape",
            elementType: "geometry.fill",
            stylers: [{ color: "#f5f2ee" }]
          },
          {
            featureType: "poi",
            elementType: "geometry.fill",
            stylers: [{ color: "#e9e2d6" }]
          },
          {
            featureType: "poi.park",
            elementType: "geometry.fill",
            stylers: [{ color: "#c9e2bf" }]
          },
          {
            featureType: "road",
            elementType: "geometry.fill",
            stylers: [{ color: "#ffffff" }]
          },
          {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#d6d6d6" }]
          },
          {
            featureType: "water",
            elementType: "geometry.fill",
            stylers: [{ color: "#cce4ee" }]
          }
        ]
      };

      mapRef.current = new google.maps.Map(mapContainerRef.current, mapOptions);
      mapRef.current.fitBounds(bounds);
      
      // Créer une fenêtre d'information
      infoWindowRef.current = new google.maps.InfoWindow();

      // Ajouter des marqueurs pour chaque local
      addMarkers();
    };

    // Fonction pour ajouter les marqueurs
    const addMarkers = () => {
      if (!mapRef.current) return;
      
      // Nettoyer les marqueurs existants
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      // Ajouter de nouveaux marqueurs
      locals.forEach(local => {
        const isSelected = local.id === selectedId;
        
        // Create marker using standard approach
        const marker = new google.maps.Marker({
          position: { 
            lat: local.coordinates.lat, 
            lng: local.coordinates.lng 
          },
          map: mapRef.current,
          title: local.address,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="15" cy="15" r="15" fill="${isSelected ? '#B88E23' : '#5C4E3D'}"/>
                <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${local.score}</text>
              </svg>
            `),
            scaledSize: new google.maps.Size(isSelected ? 36 : 30, isSelected ? 36 : 30),
            anchor: new google.maps.Point(15, 15)
          }
        });
        
        // Add click event
        marker.addListener('click', () => {
          handleMarkerClick(marker, local);
        });
        
        markersRef.current.push(marker);
      });
    };

    const handleMarkerClick = (marker: google.maps.Marker, local: LocalData) => {
      if (infoWindowRef.current && mapRef.current) {
        // Contenu de la fenêtre d'information
        const contentString = `
          <div style="width: 250px; padding: 8px;">
            <h3 style="margin: 0 0 8px; font-size: 14px; color: #5C4E3D;">${local.address}</h3>
            <div style="display: flex; gap: 8px; margin-bottom: 8px;">
              <span style="background-color: #f0ebe5; color: #B88E23; padding: 2px 8px; border-radius: 9999px; font-size: 12px;">
                Score: ${local.score}
              </span>
              <span style="background-color: #f0ebe5; color: #5C4E3D; padding: 2px 8px; border-radius: 9999px; font-size: 12px;">
                Concurrence: ${local.competitorAnalysis.totalCompetitors} cabinets
              </span>
            </div>
            <button 
              style="width: 100%; padding: 6px; background-color: #B88E23; color: white; border: none; border-radius: 4px; cursor: pointer;"
              onclick="window.selectLocal(${local.id})"
            >
              Voir détails
            </button>
          </div>
        `;
        
        infoWindowRef.current.setContent(contentString);
        infoWindowRef.current.open(mapRef.current, marker);
        
        // Fonction globale pour gérer le clic depuis l'infoWindow
        window.selectLocal = (id: number) => {
          const selectedLocal = locals.find(l => l.id === id);
          if (selectedLocal) {
            onSelectLocal(selectedLocal);
          }
        };
      }
    };

    // Vérifier si l'API Google Maps est chargée
    if (window.google && window.google.maps) {
      initMap();
    } else {
      // Simuler une carte avec un message de chargement
      if (mapContainerRef.current) {
        mapContainerRef.current.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; background-color: #f5f2ee;">
            <div>
              <div style="width: 40px; height: 40px; border: 4px solid #B88E23; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
              <p style="margin-top: 16px; color: #5C4E3D;">Chargement de la carte...</p>
            </div>
          </div>
          <style>
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        `;
      }
    }

    // Nettoyer les marqueurs à la sortie
    return () => {
      if (markersRef.current) {
        markersRef.current.forEach(marker => marker.setMap(null));
      }
    };
  }, [locals, selectedId, onSelectLocal]);

  // Mettre à jour les marqueurs lorsque le local sélectionné change
  useEffect(() => {
    if (mapRef.current && window.google) {
      // Mettre à jour l'apparence des marqueurs
      markersRef.current.forEach(marker => {
        const position = marker.getPosition();
        if (!position) return;
        
        const local = locals.find(l => 
          l.coordinates.lat === position.lat() && 
          l.coordinates.lng === position.lng()
        );
        
        if (local) {
          const isSelected = local.id === selectedId;
          
          // Update the marker icon
          marker.setIcon({
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="15" cy="15" r="15" fill="${isSelected ? '#B88E23' : '#5C4E3D'}"/>
                <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${local.score}</text>
              </svg>
            `),
            scaledSize: new google.maps.Size(isSelected ? 36 : 30, isSelected ? 36 : 30),
            anchor: new google.maps.Point(15, 15)
          });
        }
      });
    }
  }, [selectedId, locals]);

  return (
    <div className="h-full w-full relative">
      <div ref={mapContainerRef} className="h-full w-full rounded-lg overflow-hidden" />
      
      {/* Légende de la carte */}
      <div className="absolute bottom-4 left-4 z-10">
        <Card className="p-2 bg-white/90 shadow-sm">
          <div className="text-xs text-[#5C4E3D] font-medium mb-1">Légende</div>
          <div className="flex gap-2 items-center">
            <div className="h-4 w-4 rounded-full bg-[#5C4E3D]" />
            <span className="text-xs">Local analysé</span>
          </div>
          <div className="flex gap-2 items-center">
            <div className="h-4 w-4 rounded-full bg-[#B88E23]" />
            <span className="text-xs">Local sélectionné</span>
          </div>
        </Card>
      </div>

      {/* Filtres de la carte */}
      <div className="absolute top-4 right-4 z-10 flex flex-wrap gap-1">
        <Badge variant="outline" className="bg-white/90 hover:bg-white">
          <MapPin className="h-3 w-3 mr-1" />
          Locaux
        </Badge>
        <Badge variant="outline" className="bg-white/90 hover:bg-white">
          <Target className="h-3 w-3 mr-1" />
          Concurrence
        </Badge>
        <Badge variant="outline" className="bg-white/90 hover:bg-white">
          <Users className="h-3 w-3 mr-1" />
          Démographie
        </Badge>
        <Badge variant="outline" className="bg-white/90 hover:bg-white">
          <Navigation className="h-3 w-3 mr-1" />
          Accessibilité
        </Badge>
      </div>
    </div>
  );
};

export default LocalAnalysisMap;
