import L from 'leaflet';

export interface MapLocation {
  lat: number;
  lng: number;
  name: string;
  type: 'shelter' | 'incident' | 'evacuation_route' | 'zone';
  data?: any;
}

export interface ShelterData {
  id: string;
  name: string;
  capacity: number;
  currentOccupancy: number;
  contact: string;
  address: string;
  facilities: string[];
}

export interface IncidentData {
  id: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  reporter: string;
  timestamp: Date;
}

export interface EvacuationRouteData {
  id: string;
  name: string;
  status: 'open' | 'congested' | 'closed';
  capacity: 'low' | 'medium' | 'high';
  path: [number, number][]; // [lat, lng] pairs
}

export interface ZoneData {
  id: string;
  name: string;
  level: 'safe' | 'caution' | 'danger';
  polygon: [number, number][]; // [lat, lng] pairs forming a closed polygon
}

export const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629]; // India centroid
export const DEFAULT_ZOOM = 5;

// Custom icons for different map markers
export const createCustomIcon = (type: string, color: string = '#1E90FF') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: bold;
        color: white;
      ">
        ${type === 'shelter' ? '🏠' : type === 'incident' ? '⚠️' : type === 'evacuation_route' ? '🚨' : '📍'}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

export const getSeverityColor = (severity: string): string => {
  const colors = {
    low: '#2E7D32',
    medium: '#F59E0B',
    high: '#FF5722',
    critical: '#E53935'
  };
  return colors[severity as keyof typeof colors] || '#1E90FF';
};

// India-wide coastal shelters (mock)
export const mockShelters: (ShelterData & MapLocation)[] = [
  {
    id: 'sh_mum_1',
    name: 'Mumbai Coastal Shelter',
    lat: 19.0760,
    lng: 72.8777,
    type: 'shelter',
    capacity: 500,
    currentOccupancy: 120,
    contact: '+91-22-12345678',
    address: 'Marine Drive, Mumbai',
    facilities: ['Food', 'Water', 'Medical', 'Restrooms']
  },
  {
    id: 'sh_chn_1',
    name: 'Chennai Marina Shelter',
    lat: 13.0827,
    lng: 80.2707,
    type: 'shelter',
    capacity: 400,
    currentOccupancy: 95,
    contact: '+91-44-87654321',
    address: 'Marina Beach, Chennai',
    facilities: ['Food', 'Water', 'Medical']
  },
  {
    id: 'sh_koc_1',
    name: 'Kochi Evacuation Center',
    lat: 9.9312,
    lng: 76.2673,
    type: 'shelter',
    capacity: 300,
    currentOccupancy: 60,
    contact: '+91-484-223344',
    address: 'Fort Kochi, Kochi',
    facilities: ['Food', 'Water', 'Restrooms']
  },
  {
    id: 'sh_viz_1',
    name: 'Visakhapatnam Coastal Shelter',
    lat: 17.6868,
    lng: 83.2185,
    type: 'shelter',
    capacity: 350,
    currentOccupancy: 110,
    contact: '+91-891-556677',
    address: 'RK Beach, Visakhapatnam',
    facilities: ['Food', 'Water', 'Medical', 'Restrooms']
  },
  {
    id: 'sh_kol_1',
    name: 'Haldia Relief Shelter',
    lat: 22.0253,
    lng: 88.0583,
    type: 'shelter',
    capacity: 280,
    currentOccupancy: 70,
    contact: '+91-3224-445566',
    address: 'Haldia, West Bengal',
    facilities: ['Food', 'Water']
  },
  {
    id: 'sh_man_1',
    name: 'Mangaluru Coastal Shelter',
    lat: 12.9141,
    lng: 74.8560,
    type: 'shelter',
    capacity: 220,
    currentOccupancy: 80,
    contact: '+91-824-334455',
    address: 'Panambur Beach, Mangaluru',
    facilities: ['Food', 'Water', 'Medical']
  },
  {
    id: 'sh_kky_1',
    name: 'Kanyakumari Emergency Shelter',
    lat: 8.0883,
    lng: 77.5385,
    type: 'shelter',
    capacity: 180,
    currentOccupancy: 55,
    contact: '+91-4652-223344',
    address: 'Kanyakumari Beach, TN',
    facilities: ['Food', 'Water']
  },
  {
    id: 'sh_pbd_1',
    name: 'Porbandar Relief Center',
    lat: 21.6417,
    lng: 69.6293,
    type: 'shelter',
    capacity: 200,
    currentOccupancy: 40,
    contact: '+91-286-556677',
    address: 'Porbandar, Gujarat',
    facilities: ['Food', 'Water', 'Medical']
  },
  {
    id: 'sh_prd_1',
    name: 'Paradip Coastal Shelter',
    lat: 20.3165,
    lng: 86.6085,
    type: 'shelter',
    capacity: 260,
    currentOccupancy: 100,
    contact: '+91-6722-667788',
    address: 'Paradip, Odisha',
    facilities: ['Food', 'Water', 'Restrooms']
  },
  {
    id: 'sh_tut_1',
    name: 'Tuticorin Evacuation Center',
    lat: 8.7642,
    lng: 78.1348,
    type: 'shelter',
    capacity: 240,
    currentOccupancy: 90,
    contact: '+91-461-778899',
    address: 'Thoothukudi, TN',
    facilities: ['Food', 'Water', 'Medical']
  }
];

// Ocean-related incidents along India coastline (mock)
export const mockIncidents: (IncidentData & MapLocation)[] = [
  {
    id: 'in_cyc_viz',
    category: 'Cyclone',
    severity: 'high',
    description: 'Cyclone system approaching the Andhra coast',
    status: 'pending',
    reporter: 'INCOIS',
    timestamp: new Date(),
    lat: 18.1000,
    lng: 84.0000,
    name: 'Cyclone Warning - Bay of Bengal',
    type: 'incident'
  },
  {
    id: 'in_stm_chn',
    category: 'Storm Surge',
    severity: 'critical',
    description: 'Storm surge expected near Chennai shoreline',
    status: 'approved',
    reporter: 'IMD',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    lat: 12.8000,
    lng: 80.3000,
    name: 'Storm Surge Alert - Chennai',
    type: 'incident'
  },
  {
    id: 'in_tsu_east',
    category: 'Tsunami Advisory',
    severity: 'medium',
    description: 'Distant tsunami advisory, monitor updates',
    status: 'pending',
    reporter: 'INCOIS',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    lat: 16.8000,
    lng: 82.8000,
    name: 'Tsunami Advisory - East Coast',
    type: 'incident'
  },
  {
    id: 'in_fld_mum',
    category: 'Coastal Flooding',
    severity: 'high',
    description: 'High tide and heavy rain causing coastal flooding',
    status: 'approved',
    reporter: 'BMC',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    lat: 19.1000,
    lng: 72.9000,
    name: 'Coastal Flooding - Mumbai',
    type: 'incident'
  },
  {
    id: 'in_oil_prd',
    category: 'Oil Spill',
    severity: 'medium',
    description: 'Reported oil sheen near Paradip port',
    status: 'pending',
    reporter: 'Coast Guard',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    lat: 20.3000,
    lng: 86.7000,
    name: 'Oil Spill - Paradip',
    type: 'incident'
  },
  {
    id: 'in_wav_kky',
    category: 'High Waves',
    severity: 'medium',
    description: 'High swell waves near Kanyakumari',
    status: 'pending',
    reporter: 'Fishermen Network',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    lat: 8.2000,
    lng: 77.6000,
    name: 'High Waves - Kanyakumari',
    type: 'incident'
  }
];

export const mockEvacuationRoutes: (MapLocation & { data: EvacuationRouteData })[] = [
  {
    name: 'Mumbai Coastal Evacuation',
    lat: 19.0600,
    lng: 72.8800,
    type: 'evacuation_route',
    data: {
      id: 'r_mum',
      name: 'Mumbai Coastal Evacuation',
      status: 'open',
      capacity: 'high',
      path: [
        [19.1000, 72.8300],
        [19.0500, 72.8800],
        [19.0000, 72.9000]
      ]
    }
  },
  {
    name: 'Chennai Marina Evacuation',
    lat: 13.0700,
    lng: 80.2900,
    type: 'evacuation_route',
    data: {
      id: 'r_chn',
      name: 'Chennai Marina Evacuation',
      status: 'congested',
      capacity: 'medium',
      path: [
        [13.0500, 80.2700],
        [13.0700, 80.2900],
        [13.1000, 80.3000]
      ]
    }
  },
  {
    name: 'Visakhapatnam Coastal Route',
    lat: 17.7200,
    lng: 83.2400,
    type: 'evacuation_route',
    data: {
      id: 'r_viz',
      name: 'Visakhapatnam Coastal Route',
      status: 'open',
      capacity: 'high',
      path: [
        [17.7000, 83.2000],
        [17.7200, 83.2400],
        [17.7400, 83.2800]
      ]
    }
  },
  {
    name: 'Kochi Coastal Route',
    lat: 9.9300,
    lng: 76.2700,
    type: 'evacuation_route',
    data: {
      id: 'r_koc',
      name: 'Kochi Coastal Route',
      status: 'open',
      capacity: 'medium',
      path: [
        [9.9500, 76.2500],
        [9.9300, 76.2700],
        [9.9000, 76.3000]
      ]
    }
  }
]

export const mockZones: (MapLocation & { data: ZoneData })[] = [
  {
    name: 'Bay of Bengal Risk Zone',
    lat: 18.0000,
    lng: 84.0000,
    type: 'zone',
    data: {
      id: 'z_bob',
      name: 'Bay of Bengal Risk Zone',
      level: 'caution',
      polygon: [
        [18.5000, 84.0000],
        [18.0000, 84.5000],
        [17.5000, 83.8000],
        [18.0000, 83.5000]
      ]
    }
  },
  {
    name: 'Arabian Sea Coastal Caution',
    lat: 9.9000,
    lng: 76.2000,
    type: 'zone',
    data: {
      id: 'z_ara',
      name: 'Arabian Sea Coastal Caution',
      level: 'caution',
      polygon: [
        [10.2000, 76.1000],
        [9.9000, 76.4000],
        [9.7000, 76.2000],
        [9.9000, 75.9000]
      ]
    }
  },
  {
    name: 'Mumbai Coastal Flood Zone',
    lat: 19.0500,
    lng: 72.9000,
    type: 'zone',
    data: {
      id: 'z_mum',
      name: 'Mumbai Coastal Flood Zone',
      level: 'danger',
      polygon: [
        [19.2000, 72.7500],
        [19.0000, 72.8000],
        [19.0000, 73.0000],
        [19.2000, 72.9500]
      ]
    }
  }
]

export const getRouteColor = (status: string): string => {
  const colors = { open: '#16a34a', congested: '#f59e0b', closed: '#dc2626' }
  return colors[status as keyof typeof colors] || '#2563eb'
}

export const getZoneColor = (level: string): string => {
  const colors = { safe: '#22c55e', caution: '#f97316', danger: '#ef4444' }
  return colors[level as keyof typeof colors] || '#64748b'
}

export const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};