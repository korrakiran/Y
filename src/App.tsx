import { useState } from "react";
import { Home, Bell, DollarSign, Calendar, HelpCircle, User, Navigation, Phone, Star, MapPin, Clock, Award, Car, ChevronRight, TrendingUp, Menu } from "lucide-react";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { Separator } from "./components/ui/separator";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import { Switch } from "./components/ui/switch";
import { toast } from "sonner";
import { Toaster } from "./components/ui/sonner";

// Mock Data - Single Driver Focus
const mockDriver = {
  id: "D001",
  name: "Rizwan",
  photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
  email: "rizwan@ydriver.com",
  phone: "+91 8247548949",
  vehicleInfo: "Toyota Camry 2022 - Black",
  licensePlate: "ABC 1234",
  licenseNumber: "DL-12345678",
  rating: 4.8,
  totalRides: 342,
  totalEarnings: 12450.50,
  status: "online"
};

const mockRides = [
  {
    id: "R001",
    pickupLocation: "123 Main St, Downtown",
    dropoffLocation: "456 Park Ave, Uptown",
    fare: 25.50,
    status: "completed",
    customerName: "Sarah Miller",
    customerRating: 4.9,
    distance: "5.2 miles",
    duration: "18 min",
    startTime: "2025-11-01T09:30:00",
    endTime: "2025-11-01T09:48:00",
    driverId: "D001"
  },
  {
    id: "R002",
    pickupLocation: "789 Oak St, Westside",
    dropoffLocation: "321 Elm St, Eastside",
    fare: 18.00,
    status: "completed",
    customerName: "John Davis",
    customerRating: 5.0,
    distance: "3.8 miles",
    duration: "12 min",
    startTime: "2025-11-01T08:00:00",
    endTime: "2025-11-01T08:12:00",
    driverId: "D001"
  },
  {
    id: "R003",
    pickupLocation: "555 Maple Dr, Northside",
    dropoffLocation: "777 Beach Blvd, Coastal",
    fare: 32.75,
    status: "completed",
    customerName: "Emma Wilson",
    customerRating: 4.7,
    distance: "7.1 miles",
    duration: "25 min",
    startTime: "2025-11-01T07:15:00",
    endTime: "2025-11-01T07:40:00",
    driverId: "D001"
  }
];

const mockNotifications = [
  {
    id: "N001",
    pickupArea: "Downtown Plaza",
    dropArea: "Airport Terminal 2",
    estimatedFare: 45.00,
    customerRating: 4.9,
    distance: "12.3 miles",
    timestamp: new Date().toISOString(),
    status: "pending",
    driverId: "D001"
  },
  {
    id: "N002",
    pickupArea: "Shopping Mall",
    dropArea: "Riverside Park",
    estimatedFare: 15.50,
    customerRating: 4.6,
    distance: "2.8 miles",
    timestamp: new Date().toISOString(),
    status: "pending",
    driverId: "D001"
  }
];

const mockSchedule = [
  { hour: "6 AM", demand: 30, label: "6am" },
  { hour: "7 AM", demand: 55, label: "7am" },
  { hour: "8 AM", demand: 85, label: "8am" },
  { hour: "9 AM", demand: 70, label: "9am" },
  { hour: "10 AM", demand: 45, label: "10am" },
  { hour: "11 AM", demand: 40, label: "11am" },
  { hour: "12 PM", demand: 60, label: "12pm" },
  { hour: "1 PM", demand: 50, label: "1pm" },
  { hour: "2 PM", demand: 45, label: "2pm" },
  { hour: "3 PM", demand: 55, label: "3pm" },
  { hour: "4 PM", demand: 75, label: "4pm" },
  { hour: "5 PM", demand: 95, label: "5pm" },
  { hour: "6 PM", demand: 90, label: "6pm" },
  { hour: "7 PM", demand: 80, label: "7pm" },
  { hour: "8 PM", demand: 65, label: "8pm" },
  { hour: "9 PM", demand: 70, label: "9pm" },
  { hour: "10 PM", demand: 55, label: "10pm" },
  { hour: "11 PM", demand: 40, label: "11pm" },
];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [driver, setDriver] = useState(mockDriver);
  const [rides, setRides] = useState(mockRides);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [isOnline, setIsOnline] = useState(true);

  // Get active ride
  const activeRide = rides.find(r => r.status === "active");
  const completedRides = rides.filter(r => r.status === "completed");
  const todayEarnings = completedRides.reduce((sum, r) => sum + r.fare, 0);

  const handleAcceptRide = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      const newRide = {
        id: `R${Date.now()}`,
        pickupLocation: notification.pickupArea,
        dropoffLocation: notification.dropArea,
        fare: notification.estimatedFare,
        status: "active" as const,
        customerName: "New Customer",
        customerRating: notification.customerRating,
        distance: notification.distance,
        duration: "Calculating...",
        startTime: new Date().toISOString(),
        endTime: null,
        driverId: driver.id
      };
      
      setRides([...rides, newRide]);
      setNotifications(notifications.filter(n => n.id !== notificationId));
      toast.success("Ride accepted! Navigate to customer.");
      setActiveTab("dashboard");
    }
  };

  const handleDeclineRide = (notificationId: string) => {
    setNotifications(notifications.filter(n => n.id !== notificationId));
    toast.info("Ride request declined");
  };

  const handleCompleteRide = () => {
    if (activeRide) {
      const updatedRides = rides.map(r => 
        r.id === activeRide.id 
          ? { ...r, status: "completed" as const, endTime: new Date().toISOString() }
          : r
      );
      setRides(updatedRides);
      setDriver({ ...driver, totalRides: driver.totalRides + 1, totalEarnings: driver.totalEarnings + activeRide.fare });
      toast.success(`Ride completed! You earned $${activeRide.fare.toFixed(2)}`);
    }
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    toast.info(isOnline ? "You're now offline" : "You're now online");
  };

  // Welcome/Onboarding Screen
  const WelcomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="w-24 h-24 bg-black rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
          <span className="text-yellow-500 text-6xl">Y</span>
        </div>

        {/* Headline */}
        <h1 className="text-white mb-4">Make money, work when you want.</h1>
        <p className="text-yellow-50 text-lg mb-12">
          Drive or make deliveries. Sign up now!
        </p>

        {/* Feature highlights */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 text-white">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Car size={20} />
              </div>
              <div className="text-left">
                <p>Choose your schedule</p>
                <p className="text-sm text-yellow-50">Work when you want</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <DollarSign size={20} />
              </div>
              <div className="text-left">
                <p>Track your earnings</p>
                <p className="text-sm text-yellow-50">Get paid weekly</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <TrendingUp size={20} />
              </div>
              <div className="text-left">
                <p>Grow your income</p>
                <p className="text-sm text-yellow-50">The more you drive, the more you earn</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button 
            className="w-full bg-black hover:bg-gray-900 text-white h-14 text-lg"
            onClick={() => setIsLoggedIn(true)}
          >
            Sign Up to Drive
          </Button>
          <Button 
            variant="outline" 
            className="w-full bg-white/20 backdrop-blur-sm border-white text-white hover:bg-white/30 h-14 text-lg"
            onClick={() => setIsLoggedIn(true)}
          >
            Log In
          </Button>
        </div>

        <p className="text-yellow-50 text-sm mt-8">
          You're in control. Start earning today.
        </p>
      </div>
    </div>
  );

  // Dashboard Screen
  const DashboardScreen = () => (
    <div className="space-y-6">
      {/* Header with Online/Offline Toggle */}
      <Card className="bg-gradient-to-r from-yellow-400 to-yellow-500">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-white mb-1">Start your day!</h2>
              <p className="text-yellow-50">You're all set to roll!</p>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-white text-sm">{isOnline ? "Online" : "Offline"}</span>
              <Switch checked={isOnline} onCheckedChange={toggleOnlineStatus} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 mb-1">Rides Today</p>
                <p className="text-3xl">{completedRides.length}</p>
              </div>
              <Navigation className="text-yellow-500" size={32} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 mb-1">Earned Today</p>
                <p className="text-3xl">${todayEarnings.toFixed(0)}</p>
              </div>
              <DollarSign className="text-yellow-500" size={32} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Ride or Find Customer */}
      {activeRide ? (
        <Card className="border-yellow-500 border-2 shadow-lg">
          <CardHeader className="bg-yellow-50">
            <CardTitle className="flex items-center gap-2">
              <Navigation className="text-yellow-500" />
              Active Ride in Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {/* Customer Info */}
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-yellow-500 text-black">
                  {activeRide.customerName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p>{activeRide.customerName}</p>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Star size={14} className="fill-yellow-500 text-yellow-500" />
                  <span>{activeRide.customerRating}</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Phone size={16} />
                Call
              </Button>
            </div>

            <Separator />

            {/* Trip Details */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="w-0.5 h-8 bg-gray-300"></div>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Pickup Location</p>
                    <p className="mb-1">{activeRide.pickupLocation}</p>
                    <Button variant="link" className="p-0 h-auto text-yellow-600 text-sm">
                      View Pickup Location →
                    </Button>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Dropoff Location</p>
                    <p className="mb-1">{activeRide.dropoffLocation}</p>
                    <Button variant="link" className="p-0 h-auto text-yellow-600 text-sm">
                      View Dropoff Location →
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Trip Stats */}
            <div className="grid grid-cols-3 gap-4 text-center bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-500 mb-1">Distance</p>
                <p>{activeRide.distance}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Duration</p>
                <p>{activeRide.duration}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Earnings</p>
                <p className="text-green-600">${activeRide.fare.toFixed(2)}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="gap-2">
                <Navigation size={16} />
                Navigate
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700 gap-2"
                onClick={handleCompleteRide}
              >
                Complete Ride
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="text-center py-16 bg-gradient-to-br from-gray-50 to-white">
          <CardContent>
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Car className="text-yellow-600" size={40} />
            </div>
            <h3 className="mb-2">Ready to earn?</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              {isOnline 
                ? "Find your next customer and start driving" 
                : "Go online to start accepting ride requests"}
            </p>
            {isOnline && (
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black h-14 px-8 text-lg gap-2">
                <Car size={20} />
                Find Customer / Ride
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      {isOnline && !activeRide && notifications.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Bell className="text-blue-600" size={24} />
              <div className="flex-1">
                <p className="mb-1">New ride requests available!</p>
                <p className="text-sm text-gray-600">{notifications.length} customers nearby</p>
              </div>
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setActiveTab("requests")}
              >
                View
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Requests Screen
  const RequestsScreen = () => (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2">Ride Requests</h1>
        <p className="text-gray-500">Accept or decline incoming requests</p>
      </div>

      {!isOnline && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="mb-2">You're currently offline</p>
              <p className="text-sm text-gray-600 mb-4">Go online to start receiving ride requests</p>
              <Button 
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
                onClick={toggleOnlineStatus}
              >
                Go Online
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isOnline && notifications.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <Bell className="mx-auto mb-4 text-gray-400" size={64} />
            <h3 className="mb-2">No requests right now</h3>
            <p className="text-gray-500 mb-4">New ride requests will appear here</p>
            <p className="text-sm text-gray-400">Stay online and nearby popular areas</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map(notification => (
            <Card key={notification.id} className="border-yellow-500 border-2 shadow-lg overflow-hidden">
              <div className="bg-yellow-500 px-4 py-2 flex items-center justify-between">
                <Badge className="bg-black text-yellow-500">New Request</Badge>
                <p className="text-black">
                  <span className="text-2xl">${notification.estimatedFare.toFixed(0)}</span>
                  <span className="text-sm ml-1">est.</span>
                </p>
              </div>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Star size={16} className="fill-yellow-500 text-yellow-500" />
                  <span className="text-sm">Customer Rating: {notification.customerRating}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-500">{notification.distance}</span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex gap-3">
                    <MapPin className="text-green-500 mt-1 flex-shrink-0" size={20} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Pickup</p>
                      <p>{notification.pickupArea}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <MapPin className="text-red-500 mt-1 flex-shrink-0" size={20} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Dropoff</p>
                      <p>{notification.dropArea}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => handleDeclineRide(notification.id)}
                  >
                    Decline
                  </Button>
                  <Button 
                    className="bg-yellow-500 hover:bg-yellow-600 text-black"
                    onClick={() => handleAcceptRide(notification.id)}
                  >
                    Accept Ride
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // Earnings Screen
  const EarningsScreen = () => (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2">Earnings</h1>
        <p className="text-gray-500">Track your income and performance</p>
      </div>

      {/* Summary Cards */}
      <Card className="bg-gradient-to-r from-yellow-400 to-yellow-500 border-0">
        <CardContent className="pt-6">
          <p className="text-yellow-50 mb-2">Total Earnings</p>
          <p className="text-white text-4xl mb-1">${driver.totalEarnings.toFixed(2)}</p>
          <p className="text-yellow-50 text-sm">{driver.totalRides} rides completed</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <DollarSign className="mx-auto mb-2 text-yellow-500" size={28} />
            <p className="text-2xl mb-1">${todayEarnings.toFixed(0)}</p>
            <p className="text-xs text-gray-500">Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Navigation className="mx-auto mb-2 text-yellow-500" size={28} />
            <p className="text-2xl mb-1">{completedRides.length}</p>
            <p className="text-xs text-gray-500">Rides Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Star className="mx-auto mb-2 fill-yellow-500 text-yellow-500" size={28} />
            <p className="text-2xl mb-1">{driver.rating}</p>
            <p className="text-xs text-gray-500">Rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Rides */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3>Recent Rides</h3>
          <Button variant="link" className="text-yellow-600">View All</Button>
        </div>
        
        {completedRides.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Navigation className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-500">No completed rides yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {completedRides.map(ride => (
              <Card key={ride.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gray-200">
                          {ride.customerName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="mb-1">{ride.customerName}</p>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Star size={12} className="fill-yellow-500 text-yellow-500" />
                          <span>{ride.customerRating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-600 mb-1">${ride.fare.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{new Date(ride.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1 pl-13">
                    <p className="flex items-start gap-2">
                      <MapPin size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{ride.pickupLocation}</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <MapPin size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                      <span>{ride.dropoffLocation}</span>
                    </p>
                    <p className="text-xs text-gray-500">{ride.distance} • {ride.duration}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Download Summary */}
      <Button variant="outline" className="w-full gap-2">
        <DollarSign size={16} />
        Download Earnings Summary
      </Button>
    </div>
  );

  // Schedule & Forecast Screen
  const ScheduleScreen = () => {
    const peakHours = mockSchedule.filter(s => s.demand >= 75);
    const currentHour = new Date().getHours();
    
    return (
      <div className="space-y-6">
        <div>
          <h1 className="mb-2">Schedule & Forecast</h1>
          <p className="text-gray-500">Plan your shifts around peak demand</p>
        </div>

        {/* Peak Hours Alert */}
        <Card className="bg-gradient-to-r from-green-500 to-green-600 border-0">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-white">
              <TrendingUp size={32} />
              <div>
                <p className="mb-1">Peak Hours Today</p>
                <p className="text-green-100 text-sm">
                  {peakHours.map(h => h.label).join(", ")} - High demand expected
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demand Forecast Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="text-yellow-500" />
              24-Hour Demand Forecast
            </CardTitle>
            <CardDescription>Plan your day for maximum earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockSchedule.map((slot, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 w-16">{slot.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        slot.demand >= 75 ? 'bg-green-500' : 
                        slot.demand >= 50 ? 'bg-yellow-500' : 
                        'bg-gray-300'
                      }`}
                      style={{ width: `${slot.demand}%` }}
                    ></div>
                    <span className="absolute inset-0 flex items-center justify-center text-sm">
                      {slot.demand >= 75 ? '🔥 High' : slot.demand >= 50 ? 'Medium' : 'Low'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="border-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="text-yellow-500" />
              Maximize Your Earnings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span>🔥</span>
              </div>
              <div>
                <p className="mb-1">Drive during peak hours</p>
                <p className="text-sm text-gray-500">5-6 PM typically has highest demand</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span>📍</span>
              </div>
              <div>
                <p className="mb-1">Position yourself strategically</p>
                <p className="text-sm text-gray-500">Stay near airports, malls, and downtown areas</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span>⭐</span>
              </div>
              <div>
                <p className="mb-1">Maintain high ratings</p>
                <p className="text-sm text-gray-500">Better ratings = more ride requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Support Screen
  const SupportScreen = () => (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2">Support</h1>
        <p className="text-gray-500">Get help when you need it</p>
      </div>

      {/* First Time Driving */}
      <Card className="border-yellow-500 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="text-yellow-500" />
            First Time Driving?
          </CardTitle>
          <CardDescription>Take the fear out of your first trip</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="w-6 h-6 bg-yellow-500 text-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs">1</span>
            </div>
            <div>
              <p className="mb-1">Verify the customer's name</p>
              <p className="text-sm text-gray-600">Always confirm before starting the trip</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 bg-yellow-500 text-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs">2</span>
            </div>
            <div>
              <p className="mb-1">Use in-app navigation</p>
              <p className="text-sm text-gray-600">Tap "Navigate" to get turn-by-turn directions</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 bg-yellow-500 text-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs">3</span>
            </div>
            <div>
              <p className="mb-1">Keep your phone charged</p>
              <p className="text-sm text-gray-600">Bring a car charger for longer shifts</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 bg-yellow-500 text-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs">4</span>
            </div>
            <div>
              <p className="mb-1">Be professional and friendly</p>
              <p className="text-sm text-gray-600">Great service = better ratings and tips</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 bg-yellow-500 text-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs">5</span>
            </div>
            <div>
              <p className="mb-1">Complete ride only after dropoff</p>
              <p className="text-sm text-gray-600">Wait until customer safely exits the vehicle</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p>How do I get paid?</p>
              <ChevronRight size={20} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">Earnings are automatically deposited to your account every week on Monday.</p>
          </div>
          <Separator />
          <div>
            <div className="flex items-center justify-between mb-2">
              <p>What if a customer cancels?</p>
              <ChevronRight size={20} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">You'll receive a cancellation fee if the customer cancels after you've started driving to pickup.</p>
          </div>
          <Separator />
          <div>
            <div className="flex items-center justify-between mb-2">
              <p>How do I improve my rating?</p>
              <ChevronRight size={20} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">Provide excellent service, keep your car clean, be punctual, and be polite.</p>
          </div>
          <Separator />
          <div>
            <div className="flex items-center justify-between mb-2">
              <p>Can I decline ride requests?</p>
              <ChevronRight size={20} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">Yes, but declining too many requests may affect your acceptance rate.</p>
          </div>
          <Separator />
          <div>
            <div className="flex items-center justify-between mb-2">
              <p>What about fuel costs?</p>
              <ChevronRight size={20} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">You're responsible for fuel. Track your mileage for tax deductions.</p>
          </div>
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card>
        <CardHeader>
          <CardTitle>Report an Issue</CardTitle>
          <CardDescription>We're here to help</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm">Issue Type</label>
            <Input placeholder="e.g., Payment Issue, Technical Problem" />
          </div>
          <div className="space-y-2">
            <label className="text-sm">Describe your issue</label>
            <Textarea placeholder="Tell us what happened..." rows={4} />
          </div>
          <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black">
            Submit Support Ticket
          </Button>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="bg-red-50 border-red-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Phone className="text-red-600" size={24} />
            <div className="flex-1">
              <p className="mb-1">Emergency Support</p>
              <p className="text-sm text-gray-600">For urgent safety issues</p>
            </div>
            <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
              Call Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Profile Screen
  const ProfileScreen = () => (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2">Profile</h1>
        <p className="text-gray-500">Manage your driver information</p>
      </div>

      {/* Driver Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="w-24 h-24 border-4 border-yellow-500">
              <AvatarImage src={driver.photo} />
              <AvatarFallback className="text-2xl">{driver.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="mb-2">{driver.name}</h2>
              <div className="flex items-center gap-2 mb-2">
                <Star className="fill-yellow-500 text-yellow-500" size={18} />
                <span className="text-lg">{driver.rating}</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-500">{driver.totalRides} rides</span>
              </div>
              <Badge className={isOnline ? "bg-green-500" : "bg-gray-500"}>
                {isOnline ? "Online" : "Offline"}
              </Badge>
            </div>
          </div>

          <Separator className="mb-6" />

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Phone size={18} className="text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Phone</p>
                <p>{driver.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Car size={18} className="text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Vehicle</p>
                <p>{driver.vehicleInfo}</p>
                <p className="text-sm text-gray-500">{driver.licensePlate}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Award size={18} className="text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">License Number</p>
                <p>{driver.licenseNumber}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <DollarSign className="mx-auto mb-2 text-yellow-500" size={32} />
            <p className="text-3xl mb-1">${driver.totalEarnings.toFixed(0)}</p>
            <p className="text-sm text-gray-500">Total Earnings</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <Navigation className="mx-auto mb-2 text-yellow-500" size={32} />
            <p className="text-3xl mb-1">{driver.totalRides}</p>
            <p className="text-sm text-gray-500">Total Rides</p>
          </CardContent>
        </Card>
      </div>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Documents & Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white">✓</span>
              </div>
              <div>
                <p className="mb-1">Driver's License</p>
                <p className="text-sm text-gray-500">Verified</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">View</Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white">✓</span>
              </div>
              <div>
                <p className="mb-1">Vehicle Registration</p>
                <p className="text-sm text-gray-500">Verified</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">View</Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white">✓</span>
              </div>
              <div>
                <p className="mb-1">Insurance</p>
                <p className="text-sm text-gray-500">Verified</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-3">
        <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black h-12">
          Edit Profile
        </Button>
        <Button variant="outline" className="w-full h-12">
          Download Earnings Summary
        </Button>
        <Button variant="outline" className="w-full h-12 text-red-600 border-red-600 hover:bg-red-50">
          Log Out
        </Button>
      </div>
    </div>
  );

  // If not logged in, show welcome screen
  if (!isLoggedIn) {
    return <WelcomeScreen />;
  }

  // Main App Layout
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      
      {/* Header */}
      <header className="bg-black text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-black text-2xl">Y</span>
          </div>
          <div className="flex-1">
            <h2 className="text-white">Y Drive</h2>
            <p className="text-gray-400 text-sm">Make money, work when you want</p>
          </div>
          <Button variant="ghost" size="icon" className="text-white">
            <Menu size={24} />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-24 p-4 max-w-2xl mx-auto">
        {activeTab === "dashboard" && <DashboardScreen />}
        {activeTab === "requests" && <RequestsScreen />}
        {activeTab === "earnings" && <EarningsScreen />}
        {activeTab === "schedule" && <ScheduleScreen />}
        {activeTab === "support" && <SupportScreen />}
        {activeTab === "profile" && <ProfileScreen />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-10">
        <div className="flex justify-around max-w-2xl mx-auto">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
              activeTab === "dashboard" ? "text-yellow-500" : "text-gray-500"
            }`}
          >
            <Home size={24} />
            <span className="text-xs">Home</span>
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex-1 py-3 flex flex-col items-center gap-1 relative transition-colors ${
              activeTab === "requests" ? "text-yellow-500" : "text-gray-500"
            }`}
          >
            <Bell size={24} />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1/4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {notifications.length}
              </span>
            )}
            <span className="text-xs">Requests</span>
          </button>
          <button
            onClick={() => setActiveTab("earnings")}
            className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
              activeTab === "earnings" ? "text-yellow-500" : "text-gray-500"
            }`}
          >
            <DollarSign size={24} />
            <span className="text-xs">Earnings</span>
          </button>
          <button
            onClick={() => setActiveTab("schedule")}
            className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
              activeTab === "schedule" ? "text-yellow-500" : "text-gray-500"
            }`}
          >
            <Calendar size={24} />
            <span className="text-xs">Schedule</span>
          </button>
          <button
            onClick={() => setActiveTab("support")}
            className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
              activeTab === "support" ? "text-yellow-500" : "text-gray-500"
            }`}
          >
            <HelpCircle size={24} />
            <span className="text-xs">Support</span>
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
              activeTab === "profile" ? "text-yellow-500" : "text-gray-500"
            }`}
          >
            <User size={24} />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
