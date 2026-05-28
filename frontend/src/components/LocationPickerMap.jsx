import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const pickerIcon = L.divIcon({
  className: "ss-location-picker-marker",
  html: '<span class="material-symbols-outlined">location_on</span>',
  iconSize: [36, 36],
  iconAnchor: [18, 34],
});

function ClickHandler({ onPick }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

export default function LocationPickerMap({ latitude, longitude, onPick }) {
  const hasPosition = latitude !== "" && longitude !== "" && latitude !== null && longitude !== null;
  const position = hasPosition ? [Number(latitude), Number(longitude)] : [-2.5489, 118.0149];

  return (
    <div className="ss-location-picker">
      <MapContainer center={position} zoom={hasPosition ? 13 : 5} scrollWheelZoom className="ss-location-picker-inner">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPick={onPick} />
        {hasPosition && (
          <Marker
            position={position}
            icon={pickerIcon}
            draggable
            eventHandlers={{
              dragend(event) {
                const marker = event.target;
                const next = marker.getLatLng();
                onPick(next.lat, next.lng);
              },
            }}
          />
        )}
      </MapContainer>
      <p>Klik lokasi gudang pada peta atau geser marker untuk mengisi koordinat otomatis.</p>
    </div>
  );
}
