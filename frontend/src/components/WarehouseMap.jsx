import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const warehouseIcon = L.divIcon({
  className: "ss-warehouse-marker",
  html: '<span class="material-symbols-outlined">warehouse</span>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -18],
});

export default function WarehouseMap({ warehouses }) {
  const mappedWarehouses = warehouses.filter((warehouse) =>
    warehouse.latitude !== null &&
    warehouse.latitude !== undefined &&
    warehouse.longitude !== null &&
    warehouse.longitude !== undefined
  );

  const center = mappedWarehouses.length > 0
    ? [Number(mappedWarehouses[0].latitude), Number(mappedWarehouses[0].longitude)]
    : [-2.5489, 118.0149];

  return (
    <div className="ss-leaflet-map">
      <MapContainer center={center} zoom={mappedWarehouses.length > 0 ? 5 : 4} scrollWheelZoom className="ss-leaflet-inner">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mappedWarehouses.map((warehouse) => (
          <Marker
            key={warehouse.id}
            position={[Number(warehouse.latitude), Number(warehouse.longitude)]}
            icon={warehouseIcon}
          >
            <Popup>
              <strong>{warehouse.name}</strong>
              <br />
              {warehouse.location || "Lokasi belum diisi"}
              <br />
              {warehouse.description || "Kapasitas belum dicatat"}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {mappedWarehouses.length === 0 && (
        <div className="ss-map-empty">Belum ada gudang dengan latitude dan longitude.</div>
      )}
    </div>
  );
}
