export const ASSETS = {
  emblem: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDETjAGXjgRghlQZhPFhpiFo38lB0sj_2uzu0_tvK522T0Fy9njGUK7y8MXtgkjuGFXCsi_niNKwEM1scegn-jrHqw_NK45P5I-dJ3eZgli5bHKwy8p6Yp78WESy4c8QThLdouHvbxVFQFFksjjM0ZeUPBC69tct9YgdqedKSwyHBcG16zGJKIBb9UueUP8Src0PLhdQiB7_Bu9XAir9ZdTknwm-rbt6iXHLYak-KVUvG8IspNUEFfU',
  adminAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  warehouseMap: '/assets/warehouse_grid_blueprint.jpg'
};

export const GOV_TICKER_BULLETINS = [
  'NEXUS AMR OS v2.6 Active: Real-time Multi-Robot Coordination & Sub-18ms Edge Perception online.',
  'Task Allocation Engine: Dynamic scoring (Distance 35%, Battery 25%, Workload 20%, Priority 10%, Congestion 10%).',
  'Safety Interlock System: Edge YOLOv8 vision active on AMRs 1..6 with automatic E-Stop override.'
];

export const TRANSLATIONS: Record<'en' | 'hi', Record<string, string>> = {
  en: {
    dashboard: 'Digital Twin Dashboard',
    liveMap: '2D Spatial Grid Map',
    safetyComplaints: 'Edge Vision Feeds',
    accidentBlackspots: 'Conflict & Collision Monitor',
    ticketsWorkOrders: 'Task Allocation Engine',
    analyticsReports: 'Warehouse Analytics',
    fleetMonitoring: 'AMR Fleet Manager',
    multiAgency: 'Coordination Engine',
    notifications: 'Operational Alerts',
    settings: 'NEXUS System Settings',
    allServices: 'Warehouse Zones & Storage',
    newWorkOrder: '+ Create Logistics Task'
  },
  hi: {
    dashboard: 'डिजिटल जुड़वा डैशबोर्ड',
    liveMap: '2D स्थानिक ग्रिड मानचित्र',
    safetyComplaints: 'एज विज़न फीड',
    accidentBlackspots: 'टकराव एवं पाथ मॉनिटर',
    ticketsWorkOrders: 'कार्य आवंटन इंजन',
    analyticsReports: 'वेयरहाउस सांख्यिकी',
    fleetMonitoring: 'एएमआर फ्लीट मैनेजर',
    multiAgency: 'समन्वय इंजन',
    notifications: 'ऑपरेशनल अलर्ट',
    settings: 'नेक्सस सिस्टम सेटिंग्स',
    allServices: 'वेयरहाउस क्षेत्र एवं भंडारण',
    newWorkOrder: '+ लॉजिस्टिक्स कार्य बनाएं'
  }
};
