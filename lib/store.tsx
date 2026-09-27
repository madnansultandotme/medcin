"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Role = "patient" | "center" | "admin";

export interface ServiceItem {
  id: string;
  name: string;
  duration: string;
  price: number;
  category?: string;
  description?: string;
}

export interface Doctor {
  id: string;
  name: string;
  role: string;
  category: "Dental" | "Massage" | "Physio" | "Dermatology" | "Acupuncture";
  clinic: string;
  location: string;
  price: number;
  rating: number;
  reviewsCount: number;
  initials: string;
  licenseNumber: string;
  active: boolean;
  avatarBg?: string;
  bio?: string;
  services: ServiceItem[];
}

export interface Booking {
  id: string;
  reference: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientNotes?: string;
  doctorId: string;
  doctorName: string;
  doctorRole: string;
  clinicName: string;
  clinicAddress: string;
  serviceName: string;
  duration: string;
  date: string;
  time: string;
  price: number;
  status: "pending" | "confirmed" | "completed" | "flagged" | "cancelled";
  createdAt: string;
  cancellationReason?: string;
}

export interface Center {
  id: string;
  name: string;
  category: string;
  address: string;
  email: string;
  phone: string;
  licenseNumber: string;
  doctorCount: number;
  status: "active" | "pending" | "rejected";
  submittedTime?: string;
  operatingHours?: string;
  amenities?: string[];
}

export interface Dispute {
  id: string;
  bookingRef: string;
  title: string;
  description: string;
  clinicStatement?: string;
  reporter: string;
  amount: number;
  status: "open" | "resolved";
  date: string;
  resolutionNote?: string;
}

export interface PlatformSettings {
  commission: string;
  supportEmail: string;
  payoutSchedule: string;
  autoReminders: boolean;
  categories: { id: string; name: string; active: boolean }[];
}

export interface ToastNotification {
  id: string;
  type: "success" | "info" | "warning" | "error";
  title: string;
  message?: string;
}

interface MedcinStoreContextType {
  role: Role;
  setRole: (role: Role) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;

  // Toast notifications
  toasts: ToastNotification[];
  addToast: (toast: Omit<ToastNotification, "id">) => void;
  removeToast: (id: string) => void;

  // Doctors & Services
  doctors: Doctor[];
  addDoctor: (doctor: Omit<Doctor, "id">) => void;
  updateDoctor: (id: string, updates: Partial<Doctor>) => void;
  toggleDoctorStatus: (id: string) => void;
  addProcedure: (doctorId: string, proc: Omit<ServiceItem, "id">) => void;
  removeProcedure: (doctorId: string, procId: string) => void;

  // Availability
  selectedDoctorAvailability: string;
  setSelectedDoctorAvailability: (id: string) => void;
  selectedDayAvailability: string;
  setSelectedDayAvailability: (day: string) => void;
  slotStates: Record<string, "available" | "blocked" | "booked">;
  toggleSlot: (slotKey: string) => void;
  setSlotStatus: (slotKey: string, status: "available" | "blocked") => void;
  copySlotsToRestOfWeek: () => void;

  // Bookings
  bookings: Booking[];
  createBooking: (newBooking: Omit<Booking, "id" | "reference" | "createdAt">) => Booking;
  updateBookingStatus: (id: string, status: Booking["status"], reason?: string) => void;
  rescheduleBooking: (id: string, newDate: string, newTime: string) => void;

  // Centers
  centers: Center[];
  approveCenter: (id: string) => void;
  rejectCenter: (id: string) => void;
  updateCenterProfile: (profile: Partial<Center>) => void;

  // Disputes
  disputes: Dispute[];
  resolveDispute: (id: string, resolutionNote?: string) => void;

  // Settings
  settings: PlatformSettings;
  updateSettings: (newSettings: Partial<PlatformSettings>) => void;
  toggleCategorySetting: (categoryId: string) => void;
  addCategorySetting: (name: string) => void;

  // Active Draft for interactive booking flow
  activeBookingDraft: {
    doctor: Doctor | null;
    serviceId: string;
    day: string;
    time: string;
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    patientNotes: string;
  };
  setActiveBookingDraft: React.Dispatch<React.SetStateAction<{
    doctor: Doctor | null;
    serviceId: string;
    day: string;
    time: string;
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    patientNotes: string;
  }>>;
}

const INITIAL_DOCTORS: Doctor[] = [
  {
    id: "doc-1",
    name: "Dr. Alina Petraitė",
    role: "Dentist · General & Aesthetic Oral Health",
    category: "Dental",
    clinic: "Vilnius Dental Studio",
    location: "Gedimino pr. 12, Vilnius",
    price: 35,
    rating: 4.95,
    reviewsCount: 142,
    initials: "AP",
    licenseNumber: "LT-DENT-8842",
    active: true,
    bio: "Specializing in gentle dental hygiene, airflow polishing, painless veneer restorations, and preventive clinical dentistry with over 9 years of medical experience.",
    services: [
      { id: "s1", name: "Dental cleaning & airflow polish", duration: "30 min", price: 35, description: "Ultrasonic scaling, airflow plaque removal, fluoridation treatment." },
      { id: "s2", name: "Root canal therapy & sealing", duration: "45 min", price: 120, description: "Microscope-guided endodontic cleaning and bio-ceramic seal." },
      { id: "s3", name: "Teeth whitening LED session", duration: "60 min", price: 95, description: "Clinical Philips Zoom LED phototherapy with enamel desensitizer." },
    ],
  },
  {
    id: "doc-2",
    name: "Dr. Mantas Ruzas",
    role: "Massage therapist · Neuromuscular & Sports Recovery",
    category: "Massage",
    clinic: "Vilnius Wellness Lounge",
    location: "Didžioji g. 24, Vilnius",
    price: 40,
    rating: 5.0,
    reviewsCount: 118,
    initials: "MR",
    licenseNumber: "LT-MASS-5521",
    active: true,
    bio: "Certified neuromuscular therapist focusing on spinal decompression, posture mechanics, myofascial trigger point release, and professional athletic recovery.",
    services: [
      { id: "s4", name: "Deep tissue therapeutic massage", duration: "60 min", price: 40, description: "Targeted firm pressure targeting sub-layer musculature and fascia." },
      { id: "s5", name: "Sports recovery massage", duration: "45 min", price: 32, description: "Post-training lactic flush, joint decompression, and mobility release." },
      { id: "s6", name: "Myofascial trigger point therapy", duration: "30 min", price: 28, description: "Focused ischemic compression to release localized knot spasms." },
    ],
  },
  {
    id: "doc-3",
    name: "Dr. Gabija Šimkė",
    role: "Physiotherapist · Functional Rehab & Spine",
    category: "Physio",
    clinic: "Kaunas Physio Center",
    location: "Laisvės al. 58, Kaunas",
    price: 38,
    rating: 4.88,
    reviewsCount: 96,
    initials: "GŠ",
    licenseNumber: "LT-PHYS-9930",
    active: true,
    bio: "Post-surgical kinetic rehabilitation, scoliosis correction, biomechanical gait analysis, and personalized ergonomics conditioning.",
    services: [
      { id: "s7", name: "Physiotherapy diagnostic evaluation", duration: "45 min", price: 38, description: "Full postural analysis, range of motion test, and treatment prescription." },
      { id: "s8", name: "Spine & posture correction protocol", duration: "60 min", price: 48, description: "Manual spinal mobilization, corrective core traction, and exercise regimen." },
    ],
  },
  {
    id: "doc-4",
    name: "Dr. Kasparas Ilgis",
    role: "Dentist · Orthodontics & Dental Implants",
    category: "Dental",
    clinic: "Vilnius Dental Studio",
    location: "Gedimino pr. 12, Vilnius",
    price: 50,
    rating: 4.92,
    reviewsCount: 78,
    initials: "KI",
    licenseNumber: "LT-DENT-7740",
    active: true,
    bio: "Precision orthodontics using 3D intraoral scanning, clear aligner therapy, and titanium implant osseointegration procedures.",
    services: [
      { id: "s9", name: "Orthodontic 3D scan & consultation", duration: "30 min", price: 50, description: "Digital intraoral simulation, bite alignment plan, and appliance quote." },
      { id: "s10", name: "Dental implant initial assessment", duration: "45 min", price: 75, description: "Bone density review, 3D radiograph analysis, and surgical roadmap." },
    ],
  },
  {
    id: "doc-5",
    name: "Dr. Saulė Vaitkutė",
    role: "Dermatologist · Clinical & Aesthetic Dermatology",
    category: "Dermatology",
    clinic: "Baltic Skin Institute",
    location: "Jogailos g. 9, Vilnius",
    price: 55,
    rating: 4.96,
    reviewsCount: 134,
    initials: "SV",
    licenseNumber: "LT-DERM-3329",
    active: true,
    bio: "Clinical dermoscopy, mole mapping, dermatological allergy screening, and non-invasive epidermal barrier treatments.",
    services: [
      { id: "s11", name: "Clinical dermoscopy mole mapping", duration: "30 min", price: 55, description: "Digital dermatoscopic imaging of cutaneous lesions and oncological check." },
      { id: "s12", name: "Medical chemical renewal peel", duration: "45 min", price: 70, description: "Multi-acid dermatological resurfacing for pigmentation and acne recovery." },
    ],
  },
];

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: "b-1",
    reference: "MED-1042",
    patientName: "Jonas Kazlauskas",
    patientEmail: "jonas@example.com",
    patientPhone: "+370 600 12345",
    patientNotes: "Slight tooth sensitivity on upper right quadrant.",
    doctorId: "doc-1",
    doctorName: "Dr. Alina Petraitė",
    doctorRole: "Dentist",
    clinicName: "Vilnius Dental Studio",
    clinicAddress: "Gedimino pr. 12, Vilnius",
    serviceName: "Dental cleaning & airflow polish",
    duration: "30 min",
    date: "Mon 29 Sep",
    time: "09:00",
    price: 35,
    status: "pending",
    createdAt: "2026-09-27T10:15:00Z",
  },
  {
    id: "b-2",
    reference: "MED-1038",
    patientName: "Rūta Astrauskaitė",
    patientEmail: "ruta.a@example.com",
    patientPhone: "+370 611 98765",
    patientNotes: "Chronic lumbar tightness from desk work.",
    doctorId: "doc-2",
    doctorName: "Dr. Mantas Ruzas",
    doctorRole: "Massage therapist",
    clinicName: "Vilnius Wellness Lounge",
    clinicAddress: "Didžioji g. 24, Vilnius",
    serviceName: "Deep tissue therapeutic massage",
    duration: "60 min",
    date: "Mon 29 Sep",
    time: "10:30",
    price: 40,
    status: "confirmed",
    createdAt: "2026-09-26T14:20:00Z",
  },
  {
    id: "b-3",
    reference: "MED-1031",
    patientName: "Eglė Venckutė",
    patientEmail: "egle.v@example.com",
    patientPhone: "+370 622 33445",
    patientNotes: "Routine six-month checkup.",
    doctorId: "doc-1",
    doctorName: "Dr. Alina Petraitė",
    doctorRole: "Dentist",
    clinicName: "Vilnius Dental Studio",
    clinicAddress: "Gedimino pr. 12, Vilnius",
    serviceName: "Dental cleaning & airflow polish",
    duration: "30 min",
    date: "Mon 29 Sep",
    time: "15:15",
    price: 35,
    status: "pending",
    createdAt: "2026-09-27T08:05:00Z",
  },
  {
    id: "b-4",
    reference: "MED-0998",
    patientName: "Tomas Paulauskas",
    patientEmail: "tomas.p@example.com",
    patientPhone: "+370 655 44332",
    patientNotes: "Left shoulder impingement assessment.",
    doctorId: "doc-3",
    doctorName: "Dr. Gabija Šimkė",
    doctorRole: "Physiotherapist",
    clinicName: "Kaunas Physio Center",
    clinicAddress: "Laisvės al. 58, Kaunas",
    serviceName: "Physiotherapy diagnostic evaluation",
    duration: "45 min",
    date: "Tue 30 Sep",
    time: "15:15",
    price: 38,
    status: "confirmed",
    createdAt: "2026-09-25T11:40:00Z",
  },
  {
    id: "b-5",
    reference: "MED-0920",
    patientName: "Jonas Kazlauskas",
    patientEmail: "jonas@example.com",
    patientPhone: "+370 600 12345",
    doctorId: "doc-1",
    doctorName: "Dr. Alina Petraitė",
    doctorRole: "Dentist",
    clinicName: "Vilnius Dental Studio",
    clinicAddress: "Gedimino pr. 12, Vilnius",
    serviceName: "Dental cleaning",
    duration: "30 min",
    date: "10 Sep",
    time: "11:00",
    price: 35,
    status: "completed",
    createdAt: "2026-09-08T09:00:00Z",
  },
];

const INITIAL_CENTERS: Center[] = [
  {
    id: "c-1",
    name: "Vilnius Dental Studio",
    category: "Dental clinic",
    address: "Gedimino pr. 12, Vilnius",
    email: "hello@vilniusdental.lt",
    phone: "+370 5 212 3456",
    licenseNumber: "LT-VDS-9902-MED",
    doctorCount: 2,
    status: "active",
    operatingHours: "Mon-Fri 08:30 – 19:30, Sat 09:00 – 16:00",
    amenities: ["Wheelchair Accessible", "Digital 3D X-Ray", "Card / Apple Pay", "On-site Pharmacy"],
  },
  {
    id: "c-2",
    name: "Kaunas Physio Center",
    category: "Physiotherapy & Spine Clinic",
    address: "Laisvės al. 58, Kaunas",
    email: "info@kaunasphysio.lt",
    phone: "+370 37 321 987",
    licenseNumber: "LT-KPC-4410-MED",
    doctorCount: 3,
    status: "active",
    operatingHours: "Mon-Sat 08:00 – 20:00",
    amenities: ["Hydrotherapy Pool", "Recovery Gym", "Free Parking", "Private Changing Rooms"],
  },
  {
    id: "c-3",
    name: "Zen Massage Vilnius",
    category: "Massage & Somatic Recovery",
    address: "Subačiaus g. 14, Vilnius",
    email: "contact@zenmassage.lt",
    phone: "+370 5 244 8899",
    licenseNumber: "LT-ZMV-7711-MED",
    doctorCount: 2,
    status: "pending",
    submittedTime: "Submitted 2 days ago",
    operatingHours: "Mon-Sun 09:00 – 21:00",
    amenities: ["Shower Suites", "Aromatherapy Oils", "Herbal Tea Lounge"],
  },
  {
    id: "c-4",
    name: "Baltic Physio Hub",
    category: "Physical Rehabilitation",
    address: "Taikos pr. 45, Klaipėda",
    email: "rehab@balticphysio.lt",
    phone: "+370 46 889 001",
    licenseNumber: "LT-BPH-1200-MED",
    doctorCount: 2,
    status: "pending",
    submittedTime: "Submitted yesterday",
    operatingHours: "Mon-Fri 08:00 – 18:00",
    amenities: ["Spinal Traction Units", "Kinetic Walkways"],
  },
];

const INITIAL_DISPUTES: Dispute[] = [
  {
    id: "disp-1",
    bookingRef: "#1042",
    title: "Patient no-show fee contest",
    description: "Clinic flagged patient failed to arrive for appointment slot without giving 24-hour advance written notice.",
    clinicStatement: "Doctor waited in treatment room for 25 minutes. No cancellation received prior.",
    reporter: "Vilnius Dental Studio",
    amount: 35,
    status: "open",
    date: "Today, 09:30",
  },
  {
    id: "disp-2",
    bookingRef: "#1031",
    title: "Procedure surcharge disparity",
    description: "Patient claims billed amount included supplementary digital intraoral scan that was not explicitly requested beforehand.",
    clinicStatement: "Intraoral scan was deemed medically necessary to diagnose root fracture before endodontics.",
    reporter: "Patient Eglė V.",
    amount: 120,
    status: "open",
    date: "Yesterday, 16:45",
  },
  {
    id: "disp-3",
    bookingRef: "#0998",
    title: "Duplicate payment hold refund",
    description: "Patient card debited twice during slot checkout due to banking gateway delay. Immediate refund requested.",
    clinicStatement: "Dual authorization acknowledged on payment processing logs. Verified.",
    reporter: "Patient Tomas P.",
    amount: 40,
    status: "resolved",
    date: "3 days ago",
    resolutionNote: "Full €40.00 refund reversed to patient original card via Stripe gateway.",
  },
];

const INITIAL_SLOT_STATES: Record<string, "available" | "blocked" | "booked"> = {
  "doc-1-Mon-09:00": "available",
  "doc-1-Mon-09:30": "available",
  "doc-1-Mon-10:00": "blocked",
  "doc-1-Mon-10:30": "available",
  "doc-1-Mon-11:00": "blocked",
  "doc-1-Mon-11:30": "available",
  "doc-1-Mon-14:00": "available",
  "doc-1-Mon-14:30": "available",
  "doc-1-Mon-15:00": "available",
  "doc-1-Mon-15:30": "blocked",
  "doc-2-Mon-10:30": "available",
  "doc-2-Mon-11:15": "available",
  "doc-2-Mon-12:00": "blocked",
  "doc-2-Mon-14:00": "available",
  "doc-2-Mon-14:45": "available",
  "doc-2-Mon-15:30": "blocked",
  "doc-3-Mon-09:00": "available",
  "doc-3-Mon-10:00": "available",
  "doc-3-Mon-11:00": "available",
  "doc-3-Mon-14:00": "available",
  "doc-3-Mon-15:00": "blocked",
};

const MedcinStoreContext = createContext<MedcinStoreContextType | null>(null);

export function MedcinProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("patient");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [centers, setCenters] = useState<Center[]>(INITIAL_CENTERS);
  const [disputes, setDisputes] = useState<Dispute[]>(INITIAL_DISPUTES);
  const [slotStates, setSlotStates] = useState<Record<string, "available" | "blocked" | "booked">>(INITIAL_SLOT_STATES);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const [selectedDoctorAvailability, setSelectedDoctorAvailability] = useState("doc-1");
  const [selectedDayAvailability, setSelectedDayAvailability] = useState("Mon");

  const [activeBookingDraft, setActiveBookingDraft] = useState<{
    doctor: Doctor | null;
    serviceId: string;
    day: string;
    time: string;
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    patientNotes: string;
  }>({
    doctor: INITIAL_DOCTORS[1],
    serviceId: "s4",
    day: "Mon 29",
    time: "10:30",
    patientName: "Jonas Kazlauskas",
    patientEmail: "jonas@example.com",
    patientPhone: "+370 600 12345",
    patientNotes: "First visit for chronic muscle tension.",
  });

  const [settings, setSettings] = useState<PlatformSettings>({
    commission: "8%",
    supportEmail: "support@medcin.app",
    payoutSchedule: "Weekly (Every Monday)",
    autoReminders: true,
    categories: [
      { id: "c-dental", name: "Dental", active: true },
      { id: "c-massage", name: "Massage", active: true },
      { id: "c-physio", name: "Physiotherapy", active: true },
      { id: "c-derm", name: "Dermatology", active: true },
      { id: "c-acup", name: "Acupuncture", active: false },
      { id: "c-wellness", name: "Mental Wellness", active: true },
      { id: "c-chiro", name: "Chiropractic Care", active: true },
    ],
  });

  // LocalStorage persistence on client
  useEffect(() => {
    try {
      const savedBookings = localStorage.getItem("medcin_bookings");
      if (savedBookings) setBookings(JSON.parse(savedBookings));

      const savedCenters = localStorage.getItem("medcin_centers");
      if (savedCenters) setCenters(JSON.parse(savedCenters));

      const savedDisputes = localStorage.getItem("medcin_disputes");
      if (savedDisputes) setDisputes(JSON.parse(savedDisputes));

      const savedSlots = localStorage.getItem("medcin_slots");
      if (savedSlots) setSlotStates(JSON.parse(savedSlots));

      const savedSettings = localStorage.getItem("medcin_settings");
      if (savedSettings) setSettings(JSON.parse(savedSettings));

      const savedTheme = localStorage.getItem("medcin_theme");
      if (savedTheme === "dark" || savedTheme === "light") setTheme(savedTheme);
    } catch {
      // Ignore storage errors on SSR or incognito
    }
  }, []);

  const saveToStorage = (key: string, data: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // Ignore
    }
  };

  // Sync theme
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      try {
        localStorage.setItem("medcin_theme", theme);
      } catch {
        // Ignore
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const addToast = (toast: Omit<ToastNotification, "id">) => {
    const id = `toast-${Date.now()}`;
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addDoctor = (doc: Omit<Doctor, "id">) => {
    const newDoc: Doctor = {
      ...doc,
      id: `doc-${Date.now()}`,
    };
    setDoctors((prev) => [...prev, newDoc]);
    addToast({
      type: "success",
      title: "Practitioner Added",
      message: `${doc.name} successfully registered in roster.`,
    });
  };

  const updateDoctor = (id: string, updates: Partial<Doctor>) => {
    setDoctors((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
    addToast({
      type: "info",
      title: "Doctor Profile Updated",
      message: "Credentials and services have been synchronized.",
    });
  };

  const toggleDoctorStatus = (id: string) => {
    setDoctors((prev) =>
      prev.map((d) => (d.id === id ? { ...d, active: !d.active } : d))
    );
  };

  const addProcedure = (doctorId: string, proc: Omit<ServiceItem, "id">) => {
    setDoctors((prev) =>
      prev.map((doc) => {
        if (doc.id === doctorId) {
          return {
            ...doc,
            services: [
              ...doc.services,
              {
                id: `proc-${Date.now()}`,
                name: proc.name,
                duration: proc.duration,
                price: proc.price,
                description: proc.description,
              },
            ],
          };
        }
        return doc;
      })
    );
    addToast({
      type: "success",
      title: "Procedure Added",
      message: `${proc.name} added to transparent pricing schedule.`,
    });
  };

  const removeProcedure = (doctorId: string, procId: string) => {
    setDoctors((prev) =>
      prev.map((doc) => {
        if (doc.id === doctorId) {
          return {
            ...doc,
            services: doc.services.filter((s) => s.id !== procId),
          };
        }
        return doc;
      })
    );
  };

  const toggleSlot = (slotKey: string) => {
    setSlotStates((prev) => {
      const current = prev[slotKey] || "available";
      const nextStatus: "available" | "blocked" = current === "available" ? "blocked" : "available";
      const updated: Record<string, "available" | "blocked" | "booked"> = { ...prev, [slotKey]: nextStatus };
      saveToStorage("medcin_slots", updated);
      return updated;
    });
  };

  const setSlotStatus = (slotKey: string, status: "available" | "blocked") => {
    setSlotStates((prev) => {
      const updated: Record<string, "available" | "blocked" | "booked"> = { ...prev, [slotKey]: status };
      saveToStorage("medcin_slots", updated);
      return updated;
    });
  };

  const copySlotsToRestOfWeek = () => {
    const days = ["Tue", "Wed", "Thu", "Fri"];
    const baseDay = selectedDayAvailability;
    setSlotStates((prev) => {
      const next: Record<string, "available" | "blocked" | "booked"> = { ...prev };
      const hours = ["08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00"];
      days.forEach((day) => {
        hours.forEach((hour) => {
          const baseKey = `${selectedDoctorAvailability}-${baseDay}-${hour}`;
          const targetKey = `${selectedDoctorAvailability}-${day}-${hour}`;
          next[targetKey] = prev[baseKey] || "available";
        });
      });
      saveToStorage("medcin_slots", next);
      return next;
    });
    addToast({
      type: "success",
      title: "Schedule Cloned",
      message: `${selectedDayAvailability} availability applied to Tue through Fri.`,
    });
  };

  const createBooking = (newBookingData: Omit<Booking, "id" | "reference" | "createdAt">): Booking => {
    const randomRef = Math.floor(1000 + Math.random() * 9000);
    const newBooking: Booking = {
      ...newBookingData,
      id: `b-${Date.now()}`,
      reference: `MED-${randomRef}`,
      createdAt: new Date().toISOString(),
    };
    setBookings((prev) => {
      const updated = [newBooking, ...prev];
      saveToStorage("medcin_bookings", updated);
      return updated;
    });

    addToast({
      type: "success",
      title: "Booking Confirmed",
      message: `Appointment ${newBooking.reference} registered with ${newBooking.doctorName}.`,
    });

    return newBooking;
  };

  const updateBookingStatus = (id: string, status: Booking["status"], reason?: string) => {
    setBookings((prev) => {
      const updated = prev.map((b) =>
        b.id === id ? { ...b, status, ...(reason ? { cancellationReason: reason } : {}) } : b
      );
      saveToStorage("medcin_bookings", updated);
      return updated;
    });

    const statusLabels: Record<string, string> = {
      confirmed: "Appointment Accepted & Confirmed",
      cancelled: "Appointment Cancelled",
      completed: "Marked as Completed",
      flagged: "Booking Flagged for Review",
      pending: "Moved to Pending",
    };

    addToast({
      type: status === "confirmed" ? "success" : "info",
      title: statusLabels[status] || "Status Updated",
      message: `Booking record updated in live ledger.`,
    });
  };

  const rescheduleBooking = (id: string, newDate: string, newTime: string) => {
    setBookings((prev) => {
      const updated = prev.map((b) =>
        b.id === id ? { ...b, date: newDate, time: newTime, status: "confirmed" as const } : b
      );
      saveToStorage("medcin_bookings", updated);
      return updated;
    });
    addToast({
      type: "success",
      title: "Appointment Rescheduled",
      message: `New time: ${newDate} at ${newTime}. SMS sent to patient.`,
    });
  };

  const approveCenter = (id: string) => {
    setCenters((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, status: "active" as const } : c));
      saveToStorage("medcin_centers", updated);
      return updated;
    });
    addToast({
      type: "success",
      title: "Clinic Verified & Approved",
      message: "Medical practice moved to active network directory.",
    });
  };

  const rejectCenter = (id: string) => {
    setCenters((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, status: "rejected" as const } : c));
      saveToStorage("medcin_centers", updated);
      return updated;
    });
    addToast({
      type: "warning",
      title: "Application Rejected",
      message: "Clinic application rejected with audit note.",
    });
  };

  const updateCenterProfile = (profile: Partial<Center>) => {
    setCenters((prev) => {
      const updated = prev.map((c) => (c.id === "c-1" ? { ...c, ...profile } : c));
      saveToStorage("medcin_centers", updated);
      return updated;
    });
    addToast({
      type: "success",
      title: "Center Profile Saved",
      message: "Clinical specifications and license details updated.",
    });
  };

  const resolveDispute = (id: string, resolutionNote?: string) => {
    setDisputes((prev) => {
      const updated = prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: "resolved" as const,
              resolutionNote: resolutionNote || "Arbitrated by platform operations team.",
            }
          : d
      );
      saveToStorage("medcin_disputes", updated);
      return updated;
    });
    addToast({
      type: "success",
      title: "Dispute Resolved",
      message: "Ticket closed and settlement registered in financial ledger.",
    });
  };

  const updateSettings = (newSettings: Partial<PlatformSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveToStorage("medcin_settings", updated);
      return updated;
    });
    addToast({
      type: "success",
      title: "Platform Settings Saved",
      message: "Global parameters updated across network nodes.",
    });
  };

  const toggleCategorySetting = (categoryId: string) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        categories: prev.categories.map((c) =>
          c.id === categoryId ? { ...c, active: !c.active } : c
        ),
      };
      saveToStorage("medcin_settings", updated);
      return updated;
    });
  };

  const addCategorySetting = (name: string) => {
    setSettings((prev) => {
      const newCat = {
        id: `c-${Date.now()}`,
        name,
        active: true,
      };
      const updated = {
        ...prev,
        categories: [...prev.categories, newCat],
      };
      saveToStorage("medcin_settings", updated);
      return updated;
    });
    addToast({
      type: "success",
      title: "Category Added",
      message: `Taxonomy '${name}' activated on booking platform.`,
    });
  };

  return (
    <MedcinStoreContext.Provider
      value={{
        role,
        setRole,
        theme,
        toggleTheme,
        toasts,
        addToast,
        removeToast,
        doctors,
        addDoctor,
        updateDoctor,
        toggleDoctorStatus,
        addProcedure,
        removeProcedure,
        selectedDoctorAvailability,
        setSelectedDoctorAvailability,
        selectedDayAvailability,
        setSelectedDayAvailability,
        slotStates,
        toggleSlot,
        setSlotStatus,
        copySlotsToRestOfWeek,
        bookings,
        createBooking,
        updateBookingStatus,
        rescheduleBooking,
        centers,
        approveCenter,
        rejectCenter,
        updateCenterProfile,
        disputes,
        resolveDispute,
        settings,
        updateSettings,
        toggleCategorySetting,
        addCategorySetting,
        activeBookingDraft,
        setActiveBookingDraft,
      }}
    >
      {children}
      {/* Toast Render Floating Stack */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto border border-[var(--mist)] bg-[var(--surface)] p-3 shadow-md border-l-4 flex items-start justify-between gap-3 text-xs animate-in slide-in-from-bottom-2 duration-200"
            style={{
              borderLeftColor:
                t.type === "success"
                  ? "var(--sage)"
                  : t.type === "warning"
                  ? "var(--amber)"
                  : t.type === "error"
                  ? "var(--clay)"
                  : "var(--clay)",
            }}
          >
            <div>
              <div className="font-semibold text-[var(--ink)]">{t.title}</div>
              {t.message && (
                <div className="text-[11px] font-mono-ledger text-[var(--muted)] mt-0.5">
                  {t.message}
                </div>
              )}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-[var(--muted)] hover:text-[var(--ink)] font-mono-ledger text-xs"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </MedcinStoreContext.Provider>
  );
}

export function useMedcinStore() {
  const context = useContext(MedcinStoreContext);
  if (!context) {
    throw new Error("useMedcinStore must be used within a MedcinProvider");
  }
  return context;
}
