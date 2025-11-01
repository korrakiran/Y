import { motion } from 'motion/react';
import { ArrowLeft, Bike, Car, TramFront, MapPin, Calendar, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface RideHistoryProps {
  onBack: () => void;
}

interface RideRecord {
  id: string;
  date: string;
  time: string;
  pickup: string;
  drop: string;
  distance: number;
  fare: number;
  vehicleType: 'Bike' | 'Auto' | 'Cab';
  status: 'completed' | 'cancelled';
}

export default function RideHistory({ onBack }: RideHistoryProps) {
  // Mock ride history data
  const rideHistory: RideRecord[] = [
    {
      id: '1',
      date: 'Nov 1, 2025',
      time: '10:30 AM',
      pickup: 'Koramangala, Bangalore',
      drop: 'MG Road, Bangalore',
      distance: 7.2,
      fare: 95.40,
      vehicleType: 'Auto',
      status: 'completed'
    },
    {
      id: '2',
      date: 'Oct 31, 2025',
      time: '6:45 PM',
      pickup: 'Indiranagar, Bangalore',
      drop: 'Whitefield, Bangalore',
      distance: 12.5,
      fare: 168.50,
      vehicleType: 'Cab',
      status: 'completed'
    },
    {
      id: '3',
      date: 'Oct 30, 2025',
      time: '2:15 PM',
      pickup: 'HSR Layout, Bangalore',
      drop: 'Electronic City, Bangalore',
      distance: 4.8,
      fare: 54.80,
      vehicleType: 'Bike',
      status: 'completed'
    },
    {
      id: '4',
      date: 'Oct 29, 2025',
      time: '9:00 AM',
      pickup: 'Jayanagar, Bangalore',
      drop: 'BTM Layout, Bangalore',
      distance: 3.2,
      fare: 0,
      vehicleType: 'Auto',
      status: 'cancelled'
    },
    {
      id: '5',
      date: 'Oct 28, 2025',
      time: '7:30 PM',
      pickup: 'Malleshwaram, Bangalore',
      drop: 'Rajajinagar, Bangalore',
      distance: 5.6,
      fare: 78.40,
      vehicleType: 'Auto',
      status: 'completed'
    }
  ];

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'Bike': return Bike;
      case 'Auto': return TramFront;
      case 'Cab': return Car;
      default: return Car;
    }
  };

  const completedRides = rideHistory.filter(r => r.status === 'completed');
  const cancelledRides = rideHistory.filter(r => r.status === 'cancelled');

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-4 pt-12">
        <div className="flex items-center gap-3 mb-4">
          <Button
            size="icon"
            variant="ghost"
            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl">Ride History</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <p className="text-2xl text-green-600">{completedRides.length}</p>
            <p className="text-xs text-gray-600">Completed</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <p className="text-2xl text-blue-600">
              ₹{completedRides.reduce((sum, r) => sum + r.fare, 0).toFixed(0)}
            </p>
            <p className="text-xs text-gray-600">Total Spent</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg text-center">
            <p className="text-2xl text-purple-600">
              {completedRides.reduce((sum, r) => sum + r.distance, 0).toFixed(0)}
            </p>
            <p className="text-xs text-gray-600">km Traveled</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4 grid grid-cols-3">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="flex-1 overflow-y-auto p-4 space-y-3">
          {rideHistory.map((ride, index) => (
            <RideCard key={ride.id} ride={ride} index={index} getVehicleIcon={getVehicleIcon} />
          ))}
        </TabsContent>

        <TabsContent value="completed" className="flex-1 overflow-y-auto p-4 space-y-3">
          {completedRides.map((ride, index) => (
            <RideCard key={ride.id} ride={ride} index={index} getVehicleIcon={getVehicleIcon} />
          ))}
        </TabsContent>

        <TabsContent value="cancelled" className="flex-1 overflow-y-auto p-4 space-y-3">
          {cancelledRides.length > 0 ? (
            cancelledRides.map((ride, index) => (
              <RideCard key={ride.id} ride={ride} index={index} getVehicleIcon={getVehicleIcon} />
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No cancelled rides</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RideCard({ 
  ride, 
  index, 
  getVehicleIcon 
}: { 
  ride: RideRecord; 
  index: number; 
  getVehicleIcon: (type: string) => any;
}) {
  const VehicleIcon = getVehicleIcon(ride.vehicleType);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-xl shadow-sm border p-4"
    >
      <div className="flex items-start gap-3">
        <div className={`p-3 rounded-full ${
          ride.status === 'completed' ? 'bg-green-100' : 'bg-gray-100'
        }`}>
          <VehicleIcon className={`w-5 h-5 ${
            ride.status === 'completed' ? 'text-green-600' : 'text-gray-400'
          }`} />
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-3 h-3" />
                <span>{ride.date}</span>
                <Clock className="w-3 h-3 ml-2" />
                <span>{ride.time}</span>
              </div>
            </div>
            {ride.status === 'completed' && (
              <p className="text-lg text-green-600">₹{ride.fare}</p>
            )}
            {ride.status === 'cancelled' && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                Cancelled
              </span>
            )}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-1.5" />
              <p className="text-gray-700 flex-1">{ride.pickup}</p>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-2 h-2 text-red-600 fill-red-600 mt-1.5" />
              <p className="text-gray-700 flex-1">{ride.drop}</p>
            </div>
          </div>

          {ride.status === 'completed' && (
            <div className="mt-3 flex items-center gap-4 text-xs text-gray-600">
              <span>{ride.vehicleType}</span>
              <span>•</span>
              <span>{ride.distance} km</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
