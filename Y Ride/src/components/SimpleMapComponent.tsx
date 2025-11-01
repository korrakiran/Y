import { useEffect, useRef, useState } from 'react';

interface SimpleMapComponentProps {
  pickupCoords: [number, number] | null;
  dropCoords: [number, number] | null;
  pickupLocation: string;
  dropLocation: string;
  onPickupMarkerDrag?: (coords: [number, number]) => void;
  onDropMarkerDrag?: (coords: [number, number]) => void;
}

export default function SimpleMapComponent({
  pickupCoords,
  dropCoords,
  pickupLocation,
  dropLocation,
  onPickupMarkerDrag,
  onDropMarkerDrag
}: SimpleMapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [zoom] = useState(13);
  const [isDraggingPickup, setIsDraggingPickup] = useState(false);
  const [isDraggingDrop, setIsDraggingDrop] = useState(false);
  const [draggedPickupPixel, setDraggedPickupPixel] = useState<{ x: number; y: number } | null>(null);
  const [draggedDropPixel, setDraggedDropPixel] = useState<{ x: number; y: number } | null>(null);
  
  // Calculate center point between pickup and drop
  const getCenter = (): [number, number] => {
    if (pickupCoords && dropCoords) {
      return [
        (pickupCoords[0] + dropCoords[0]) / 2,
        (pickupCoords[1] + dropCoords[1]) / 2
      ];
    }
    return pickupCoords || [12.9716, 77.5946];
  };

  const center = getCenter();

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

  const pickupPixel = draggedPickupPixel || (pickupCoords 
    ? latLngToPixel(pickupCoords[0], pickupCoords[1], center[0], center[1], zoom, width, height)
    : null);
    
  const dropPixel = draggedDropPixel || (dropCoords
    ? latLngToPixel(dropCoords[0], dropCoords[1], center[0], center[1], zoom, width, height)
    : null);

  // Convert pixel position to lat/lng
  const pixelToLatLng = (pixelX: number, pixelY: number, mapLat: number, mapLng: number, mapZoom: number, width: number, height: number): [number, number] => {
    const scale = 256 * Math.pow(2, mapZoom);
    
    const mapWorldCoordX = (mapLng + 180) / 360 * scale;
    const mapWorldCoordY = (1 - Math.log(Math.tan(mapLat * Math.PI / 180) + 1 / Math.cos(mapLat * Math.PI / 180)) / Math.PI) / 2 * scale;
    
    const worldCoordX = mapWorldCoordX + (pixelX - width / 2);
    const worldCoordY = mapWorldCoordY + (pixelY - height / 2);
    
    const lng = (worldCoordX / scale) * 360 - 180;
    const latRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * worldCoordY / scale)));
    const lat = latRad * 180 / Math.PI;
    
    return [lat, lng];
  };

  // Handle marker dragging
  const handleMouseDown = (type: 'pickup' | 'drop') => (e: React.MouseEvent) => {
    e.preventDefault();
    if (type === 'pickup') {
      setIsDraggingPickup(true);
    } else {
      setIsDraggingDrop(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDraggingPickup) {
      setDraggedPickupPixel({ x, y });
    } else if (isDraggingDrop) {
      setDraggedDropPixel({ x, y });
    }
  };

  const handleMouseUp = () => {
    if (isDraggingPickup && draggedPickupPixel && onPickupMarkerDrag) {
      const coords = pixelToLatLng(draggedPickupPixel.x, draggedPickupPixel.y, center[0], center[1], zoom, width, height);
      onPickupMarkerDrag(coords);
      setDraggedPickupPixel(null);
    } else if (isDraggingDrop && draggedDropPixel && onDropMarkerDrag) {
      const coords = pixelToLatLng(draggedDropPixel.x, draggedDropPixel.y, center[0], center[1], zoom, width, height);
      onDropMarkerDrag(coords);
      setDraggedDropPixel(null);
    }
    setIsDraggingPickup(false);
    setIsDraggingDrop(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDraggingPickup || isDraggingDrop) {
        handleMouseUp();
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDraggingPickup, isDraggingDrop, draggedPickupPixel, draggedDropPixel]);

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
    <div 
      ref={mapRef} 
      className="absolute inset-0 z-0 bg-gray-200 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ cursor: isDraggingPickup || isDraggingDrop ? 'grabbing' : 'default' }}
    >
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
      {pickupPixel && (
        <div
          className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
          style={{ left: pickupPixel.x, top: pickupPixel.y }}
          onMouseDown={handleMouseDown('pickup')}
        >
          <div className={`bg-green-600 rounded-full p-3 shadow-lg border-4 border-white transition-transform ${isDraggingPickup ? 'scale-110' : 'hover:scale-105'}`}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <polygon points="5 3 19 12 5 21 5 3" fill="white"/>
            </svg>
          </div>
          <div className="bg-white px-3 py-1 rounded-full shadow-md mt-2 text-sm whitespace-nowrap text-center">
            {isDraggingPickup ? 'Move to set' : 'Pickup'}
          </div>
        </div>
      )}

      {/* Drop Marker */}
      {dropPixel && (
        <div
          className="absolute z-10 transform -translate-x-1/2 -translate-y-full cursor-grab active:cursor-grabbing"
          style={{ left: dropPixel.x, top: dropPixel.y }}
          onMouseDown={handleMouseDown('drop')}
        >
          <div className={`bg-red-600 rounded-full p-3 shadow-lg border-4 border-white transition-transform ${isDraggingDrop ? 'scale-110' : 'hover:scale-105'}`}>
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          <div className="bg-white px-3 py-1 rounded-full shadow-md mt-2 text-sm whitespace-nowrap text-center">
            {isDraggingDrop ? 'Move to set' : 'Drop'}
          </div>
        </div>
      )}

      {/* Route Line */}
      {pickupPixel && dropPixel && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-5">
          <line
            x1={pickupPixel.x}
            y1={pickupPixel.y}
            x2={dropPixel.x}
            y2={dropPixel.y}
            stroke="#16a34a"
            strokeWidth="4"
            strokeDasharray="10,5"
            opacity="0.7"
          />
        </svg>
      )}

      {/* Attribution */}
      <div className="absolute bottom-0 right-0 bg-white/80 px-2 py-1 text-xs z-10">
        © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline">OpenStreetMap</a>
      </div>
    </div>
  );
}
