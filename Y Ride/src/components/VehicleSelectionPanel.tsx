import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bike, Car, TramFront, ChevronRight, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

interface VehicleSelectionPanelProps {
  distance: number;
  duration: number;
  onSelectVehicle: (vehicle: 'Bike' | 'Auto' | 'Cab', fare: number) => void;
  onClose: () => void;
}

interface VehicleOption {
  type: 'Bike' | 'Auto' | 'Cab';
  icon: any;
  name: string;
  baseFare: number;
  perKm: number;
  eta: number;
  capacity: string;
}

export default function VehicleSelectionPanel({
  distance,
  duration,
  onSelectVehicle,
  onClose
}: VehicleSelectionPanelProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<'Bike' | 'Auto' | 'Cab'>('Auto');
  const [fares, setFares] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const vehicles: VehicleOption[] = [
    {
      type: 'Bike',
      icon: Bike,
      name: 'RideMate Bike',
      baseFare: 25,
      perKm: 6,
      eta: Math.round(duration * 0.8),
      capacity: '1 person'
    },
    {
      type: 'Auto',
      icon: TramFront,
      name: 'RideMate Auto',
      baseFare: 35,
      perKm: 9,
      eta: duration,
      capacity: '3 people'
    },
    {
      type: 'Cab',
      icon: Car,
      name: 'RideMate Cab',
      baseFare: 60,
      perKm: 12,
      eta: Math.round(duration * 1.1),
      capacity: '4 people'
    }
  ];

  useEffect(() => {
    // Simulate AI API call for fare prediction
    const fetchFares = async () => {
      setLoading(true);
      
      // Mock API call with delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real app: Call AI API
      // const response = await fetch('/api/fare-predict', {
      //   method: 'POST',
      //   body: JSON.stringify({ city: 'Bangalore', distance, vehicleType: 'Auto' })
      // });
      // const data = await response.json();
      
      // Fallback fare calculation
      const calculatedFares: Record<string, number> = {};
      vehicles.forEach(vehicle => {
        // Add some randomness to simulate AI prediction
        const baseFare = vehicle.baseFare;
        const distanceFare = vehicle.perKm * distance;
        const aiVariation = (Math.random() - 0.5) * 20; // ±10 variation
        calculatedFares[vehicle.type] = Math.round((baseFare + distanceFare + aiVariation) * 100) / 100;
      });
      
      setFares(calculatedFares);
      setLoading(false);
    };

    fetchFares();
  }, [distance]);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/20 z-20"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-30 max-h-[70vh] overflow-y-auto"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        <div className="p-6">
          <h2 className="text-xl mb-1">Choose a ride</h2>
          <p className="text-sm text-gray-600 mb-6">
            {distance} km • {duration} min trip
          </p>

          {/* Vehicle Options */}
          <div className="space-y-3">
            {vehicles.map((vehicle) => {
              const Icon = vehicle.icon;
              const fare = fares[vehicle.type];
              const isSelected = selectedVehicle === vehicle.type;

              return (
                <motion.button
                  key={vehicle.type}
                  onClick={() => setSelectedVehicle(vehicle.type)}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${
                      isSelected ? 'bg-green-600' : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        isSelected ? 'text-white' : 'text-gray-700'
                      }`} />
                    </div>

                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base">{vehicle.name}</h3>
                        {vehicle.type === 'Bike' && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            Fast
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {vehicle.eta} min • {vehicle.capacity}
                      </p>
                    </div>

                    <div className="text-right">
                      {loading ? (
                        <Skeleton className="h-6 w-16" />
                      ) : (
                        <motion.p
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-lg"
                        >
                          ₹{fare}
                        </motion.p>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* API Integration Note */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800">
              🔌 <span className="font-semibold">AI Fare Prediction:</span> Fares calculated using Distance Matrix API + AI fare model
            </p>
          </div>

          {/* Book Button */}
          <Button
            onClick={() => {
              const fare = fares[selectedVehicle];
              if (fare) {
                onSelectVehicle(selectedVehicle, fare);
              }
            }}
            disabled={loading}
            className="w-full mt-6 bg-green-600 hover:bg-green-700 h-12"
          >
            {loading ? 'Calculating fare...' : `Book ${selectedVehicle}`}
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </motion.div>
    </>
  );
}
