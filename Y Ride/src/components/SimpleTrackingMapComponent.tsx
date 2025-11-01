import { useRef } from 'react';

interface SimpleTrackingMapComponentProps {
  pickupCoords: [number, number];
  driverCoords: [number, number];
}

export default function SimpleTrackingMapComponent({
  pickupCoords,
  driverCoords
}: SimpleTrackingMapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const zoom = 14;
  
  // Calculate center point between pickup and driver
  const center: [number, number] = [
    (pickupCoords[0] + driverCoords[0]) / 2,
    (pickupCoords[1] + driverCoords[1]) / 2
  ];

  // Convert lat/lng to pixel position
  const latLngToPixel = (lat: number, lng: number, mapLat: number, mapLng: number, mapZoom: number, width: number, height: number) => {
    const scale = 256 * Math.pow(2, mapZoom);
    const worldCoordX = (lng + 180) / 360 * scale;
    const worldCoordY = (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * scale;
    
    const mapWorldCoordX = (mapLng + 180) / 360 * scale;
    const mapWorldCoordY = (1 - Math.log(Math.tan(mapLat * Math.PI / 180) + 1 / Math.cos(mapLat * Math.PI / 180)) / Math.PI) / 2 * scale;
    
    return {
      x: width / 2 + (worldCoordX - mapWorldCoordX),
      y: height / 2 + (worldCoordY - mapWorldCoordY)
    };
  };

  const width = mapRef.current?.clientWidth || 800;
  const height = mapRef.current?.clientHeight || 600;

  const pickupPixel = latLngToPixel(pickupCoords[0], pickupCoords[1], center[0], center[1], zoom, width, height);
  const driverPixel = latLngToPixel(driverCoords[0], driverCoords[1], center[0], center[1], zoom, width, height);

  // Calculate tile coordinates
  const getTileUrl = (x: number, y: number, z: number) => {
    return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
  };

  const tileSize = 256;
  const tilesX = Math.ceil(width / tileSize) + 2;
  const tilesY = Math.ceil(height / tileSize) + 2;
  
  const centerTileX = Math.floor((center[1] + 180) / 360 * Math.pow(2, zoom));
  const centerTileY = Math.floor((1 - Math.log(Math.tan(center[0] * Math.PI / 180) + 1 / Math.cos(center[0] * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));

  const tiles = [];
  for (let x = -Math.floor(tilesX / 2); x < Math.ceil(tilesX / 2); x++) {
    for (let y = -Math.floor(tilesY / 2); y < Math.ceil(tilesY / 2); y++) {
      const tileX = centerTileX + x;
      const tileY = centerTileY + y;
      if (tileX >= 0 && tileY >= 0 && tileX < Math.pow(2, zoom) && tileY < Math.pow(2, zoom)) {
        tiles.push({ x: tileX, y: tileY, offsetX: x * tileSize, offsetY: y * tileSize });
      }
    }
  }

  return (
    <div ref={mapRef} className="absolute inset-0 z-0 bg-gray-200 overflow-hidden">
      {/* Tiles */}
      <div className="absolute inset-0 flex items-center justify-center">
        {tiles.map((tile) => (
          <img
            key={`${tile.x}-${tile.y}`}
            src={getTileUrl(tile.x, tile.y, zoom)}
            alt="Map tile"
            className="absolute"
            style={{
              width: tileSize,
              height: tileSize,
              left: `calc(50% + ${tile.offsetX}px)`,
              top: `calc(50% + ${tile.offsetY}px)`,
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}
      </div>

      {/* Pickup Marker */}
      <div
        className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000"
        style={{ left: pickupPixel.x, top: pickupPixel.y }}
      >
        <div className="bg-green-600 rounded-full p-3 shadow-lg border-4 border-white">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <polygon points="5 3 19 12 5 21 5 3" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Driver Marker */}
      <div
        className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000"
        style={{ left: driverPixel.x, top: driverPixel.y }}
      >
        <div className="bg-blue-600 rounded-full p-3 shadow-lg border-4 border-white animate-pulse">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
          </svg>
        </div>
        <div className="bg-white px-3 py-1 rounded-full shadow-md mt-2 text-sm whitespace-nowrap text-center">
          Driver
        </div>
      </div>

      {/* Route Line */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-5">
        <line
          x1={driverPixel.x}
          y1={driverPixel.y}
          x2={pickupPixel.x}
          y2={pickupPixel.y}
          stroke="#16a34a"
          strokeWidth="4"
          strokeDasharray="5,5"
          opacity="0.7"
        />
      </svg>

      {/* Attribution */}
      <div className="absolute bottom-0 right-0 bg-white/80 px-2 py-1 text-xs z-10">
        © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline">OpenStreetMap</a>
      </div>
    </div>
  );
}
