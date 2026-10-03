import { UserRole, ActiveView } from '../types';

export interface RoleProfile {
  role: UserRole;
  name: string;
  nameHi: string;
  title: string;
  titleHi: string;
  department: string;
  departmentHi: string;
  id: string;
  passkey: string;
  avatar: string;
  badge: string;
  colorClass: string;
  badgeColor: string;
  descEn: string;
  descHi: string;
  defaultView: ActiveView;
}

export interface RolePermissions {
  allowedViews: ActiveView[];
  defaultView: ActiveView;
}

export const ROLE_PROFILES: Record<UserRole, RoleProfile> = {
  'Warehouse Operations Director': {
    role: 'Warehouse Operations Director',
    name: 'Vikram Malhotra',
    nameHi: 'विक्रम मल्होत्रा',
    title: 'Chief Warehouse Operations Officer',
    titleHi: 'मुख्य वेयरहाउस परिचालन अधिकारी',
    department: 'Autonomous Fleet Control HQ',
    departmentHi: 'स्वायत्त फ्लीट नियंत्रण मुख्यालय',
    id: 'USR-OPS-DIR',
    passkey: 'admin2026',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    badge: 'HQ Command',
    colorClass: 'from-blue-500/20 to-indigo-500/20 border-blue-500/40 text-blue-400',
    badgeColor: '#0071E3',
    descEn: 'Full AMR fleet control, digital twin navigation, task allocation, and warehouse throughput analytics.',
    descHi: 'संपूर्ण एएमआर फ्लीट नियंत्रण, डिजिटल ट्विन नेविगेशन और वेयरहाउस सांख्यिकी।',
    defaultView: 'overview'
  },
  'Fleet Systems Engineer': {
    role: 'Fleet Systems Engineer',
    name: 'Dr. Ananya Roy',
    nameHi: 'डॉ. अनन्या रॉय',
    title: 'Lead Multi-Robot Robotics Engineer',
    titleHi: 'मुख्य रोबोटिक्स इंजीनियर',
    department: 'Multi-Robot Coordination & Dynamics',
    departmentHi: 'मल्टी-रोबोट समन्वय एवं गतिकी',
    id: 'USR-FLEET-ENG',
    passkey: 'fleet2026',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    badge: 'Robotics Core',
    colorClass: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-400',
    badgeColor: '#34C759',
    descEn: 'A* path planning, collision avoidance engine, route conflict management, and wireless telemetry.',
    descHi: 'ए* पाथ प्लानिंग, टक्कर निवारण इंजन एवं वायरलेस टेलीमेट्री।',
    defaultView: 'coordination'
  },
  'Safety & Edge AI Specialist': {
    role: 'Safety & Edge AI Specialist',
    name: 'Kabir Mehta',
    nameHi: 'कबीर मेहता',
    title: 'Embedded Vision Lead',
    titleHi: 'एम्बेडेड विज़न प्रमुख',
    department: 'Embedded Vision & Perception',
    departmentHi: 'एम्बेडेड विज़न एवं परसेप्शन',
    id: 'USR-EDGE-AI',
    passkey: 'edge2026',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    badge: 'Edge Vision',
    colorClass: 'from-purple-500/20 to-indigo-500/20 border-purple-500/40 text-purple-400',
    badgeColor: '#AF52DE',
    descEn: 'Onboard TensorRT YOLOv8 object detection feeds, obstacle extraction, and local vs central intelligence.',
    descHi: 'ऑनबोर्ड ऑब्जेक्ट डिटेक्शन फीड्स और स्थानीय बाधा निष्कर्षण।',
    defaultView: 'edge-ai'
  },
  'Warehouse Floor Supervisor': {
    role: 'Warehouse Floor Supervisor',
    name: 'Rajesh Nair',
    nameHi: 'राजेश नायर',
    title: 'Floor Logistics Operations Lead',
    titleHi: 'फ्लोर लॉजिस्टिक्स परिचालन प्रमुख',
    department: 'Floor Logistics & Dispatch',
    departmentHi: 'फ्लोर लॉजिस्टिक्स एवं प्रेषण',
    id: 'USR-FLOOR-SUP',
    passkey: 'floor2026',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    badge: 'Floor Dispatch',
    colorClass: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-400',
    badgeColor: '#FF9F0A',
    descEn: 'Pickup/drop-off job creation, station dispatching, and manual robot overrides.',
    descHi: 'पिकअप/ड्रॉप-ऑफ कार्य निर्माण और स्टेशन प्रेषण।',
    defaultView: 'tasks'
  }
};

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  'Warehouse Operations Director': {
    allowedViews: ['overview', 'fleet', 'warehouse', 'tasks', 'coordination', 'edge-ai', 'alerts', 'analytics', 'simulation', 'api-explorer', 'settings'],
    defaultView: 'overview'
  },
  'Fleet Systems Engineer': {
    allowedViews: ['overview', 'fleet', 'warehouse', 'coordination', 'edge-ai', 'alerts', 'analytics', 'simulation', 'api-explorer', 'settings'],
    defaultView: 'coordination'
  },
  'Safety & Edge AI Specialist': {
    allowedViews: ['overview', 'fleet', 'edge-ai', 'alerts', 'analytics', 'simulation', 'api-explorer', 'settings'],
    defaultView: 'edge-ai'
  },
  'Warehouse Floor Supervisor': {
    allowedViews: ['overview', 'fleet', 'warehouse', 'tasks', 'alerts', 'api-explorer', 'settings'],
    defaultView: 'tasks'
  }
};

export function isViewAllowedForRole(view: ActiveView, role: UserRole): boolean {
  return ROLE_PERMISSIONS[role]?.allowedViews.includes(view) ?? false;
}

export function getDefaultViewForRole(role: UserRole): ActiveView {
  return ROLE_PERMISSIONS[role]?.defaultView || 'overview';
}
