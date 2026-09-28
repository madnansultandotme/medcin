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
  resolution?: string;
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
  createBooking: (newBooking: Omit<Booking, "id" | "reference" | "createdAt" | "status"> & { status?: Booking["status"] }) => Booking;
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
    name: "Dr. Kenneth Tan",
    role: "Senior Aesthetic Physician & Dermatologist",
    category: "Dermatology",
    clinic: "Novena Premier Specialist Medical",
    location: "10 Sinaran Drive, Novena Medical Hub, Singapore",
    price: 120,
    rating: 4.98,
    reviewsCount: 184,
    initials: "KT",
    licenseNumber: "SMC-MED-59281",
    active: true,
    bio: "MBBS (Singapore), MRCP (UK), Dip. Dermatology. Specializing in clinical laser therapeutics, dermoscopic pigment analysis, non-invasive facial rejuvenation, and preventive skin barrier health.",
    services: [
      { id: "s1", name: "Comprehensive Dermatological Consultation", duration: "30 min", price: 120, description: "Digital dermoscopic mole mapping, acne evaluation, and skin barrier diagnostics." },
      { id: "s2", name: "Fractional Picosecond Laser Rejuvenation", duration: "45 min", price: 280, description: "Ultra-fast acoustic laser targeting pigment dyschromia and dermal collagen renewal." },
      { id: "s3", name: "Medical Barrier Hydration Therapy", duration: "45 min", price: 160, description: "Sonophoresis infused hyaluronic complex and calming peptide application." },
    ],
  },
  {
    id: "doc-2",
    name: "Dr. Somchai Prasert",
    role: "Longevity Specialist · Cellular & Anti-Aging Medicine",
    category: "Massage",
    clinic: "Aisana Longevity & Aesthetic Wellness",
    location: "Sukhumvit 24, Bangkok, Thailand",
    price: 95,
    rating: 4.96,
    reviewsCount: 162,
    initials: "SP",
    licenseNumber: "TMC-THA-44910",
    active: true,
    bio: "Board-certified anti-aging and integrative cellular physician. Over 14 years specializing in biological age biomarker screening, metabolic optimization, and restorative neuromuscular therapies.",
    services: [
      { id: "s4", name: "Deep Tissue Neuromuscular Release", duration: "60 min", price: 95, description: "Therapeutic deep myofascial release with medical-grade herbal balms." },
      { id: "s5", name: "Athletic Recovery & Postural Traction", duration: "45 min", price: 75, description: "Passive kinetic stretching, joint decompression, and lymphatic flush." },
      { id: "s6", name: "Myofascial Trigger Therapy & Heat Wrap", duration: "45 min", price: 85, description: "Focused ischemic pressure targeting chronic lumbar and cervical tension." },
    ],
  },
  {
    id: "doc-3",
    name: "Dr. Farah Nadira Azman",
    role: "Lead Physiotherapist · Sports Medicine & Spine",
    category: "Physio",
    clinic: "Kinetica Sports & Spine Rehabilitation",
    location: "KLCC Petronas Corridor, Kuala Lumpur, Malaysia",
    price: 85,
    rating: 4.94,
    reviewsCount: 128,
    initials: "FA",
    licenseNumber: "MMC-PHYS-33921",
    active: true,
    bio: "BSc Physiotherapy (Honours), Sports Physiotherapy Fellow. Certified in kinetic biomechanical motion tracking, spinal disc decompression, and ACL postoperative rehabilitation.",
    services: [
      { id: "s7", name: "Biomechanical Motion & Posture Assessment", duration: "45 min", price: 85, description: "Dynamic gait analysis, spinal alignment assessment, and custom kinetic prescription." },
      { id: "s8", name: "Targeted Spine Rehabilitation & Decompression", duration: "60 min", price: 110, description: "Manual spinal mobilization, mechanical decompression, and core stabilization." },
    ],
  },
  {
    id: "doc-4",
    name: "Dr. Cheryl Lim",
    role: "Aesthetic Dental Surgeon · Digital Smile Design",
    category: "Dental",
    clinic: "Orchard Dental Aesthetics Studio",
    location: "391 Orchard Road, Ngee Ann City, Singapore",
    price: 90,
    rating: 4.97,
    reviewsCount: 146,
    initials: "CL",
    licenseNumber: "SDC-DENT-88421",
    active: true,
    bio: "BDS (Singapore), Advanced Aesthetic Restorations. Specializes in 3D digital smile simulations, porcelain veneers, airflow guided biofilm therapy, and clear aligner orthodontics.",
    services: [
      { id: "s9", name: "Airflow Guided Biofilm Dental Cleaning", duration: "30 min", price: 90, description: "Comfortable air-polishing plaque removal, ultrasonic scaling, and remineralization." },
      { id: "s10", name: "Digital Smile Simulation & 3D Scan", duration: "45 min", price: 150, description: "Full intraoral photogrammetry, facial proportion analysis, and restorative plan." },
    ],
  },
  {
    id: "doc-5",
    name: "Dr. Narinthorn Sukhum",
    role: "Integrative Somatic Therapist",
    category: "Massage",
    clinic: "Andaman Somatic Recovery Lounge",
    location: "Laguna Phuket, Thailand",
    price: 75,
    rating: 4.95,
    reviewsCount: 94,
    initials: "NS",
    licenseNumber: "TMC-PHYS-77312",
    active: true,
    bio: "Certified in traditional Thai medical manipulation, somatic nervous system downregulation, and myofascial kinetic balancing with 12 years clinical resort experience.",
    services: [
      { id: "s11", name: "Traditional Clinical Somatic Bodywork", duration: "60 min", price: 75, description: "Meridian energy compression, assisted yogic stretches, and warm herbal compress." },
      { id: "s12", name: "Deep Myofascial Tension Protocol", duration: "45 min", price: 85, description: "Intense pressure point work for chronic travel stiffness and postural fatigue." },
    ],
  },
];

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: "b-1",
    reference: "MED-1042",
    patientName: "Marcus Wei",
    patientEmail: "marcus.wei@example.sg",
    patientPhone: "+65 9123 4567",
    patientNotes: "Skin sensitivity flare-up after outdoor swimming.",
    doctorId: "doc-1",
    doctorName: "Dr. Kenneth Tan",
    doctorRole: "Dermatologist",
    clinicName: "Novena Premier Specialist Medical",
    clinicAddress: "10 Sinaran Drive, Novena Medical Hub, Singapore",
    serviceName: "Comprehensive Dermatological Consultation",
    duration: "30 min",
    date: "Mon 29 Sep",
    time: "09:00",
    price: 120,
    status: "pending",
    createdAt: "2026-09-27T10:15:00Z",
  },
  {
    id: "b-2",
    reference: "MED-1038",
    patientName: "Ananya Charoen",
    patientEmail: "ananya.c@example.th",
    patientPhone: "+66 81 234 5678",
    patientNotes: "Severe lower back stiffness from frequent regional flights.",
    doctorId: "doc-2",
    doctorName: "Dr. Somchai Prasert",
    doctorRole: "Longevity Specialist",
    clinicName: "Aisana Longevity & Aesthetic Wellness",
    clinicAddress: "Sukhumvit 24, Bangkok, Thailand",
    serviceName: "Deep Tissue Neuromuscular Release",
    duration: "60 min",
    date: "Mon 29 Sep",
    time: "10:30",
    price: 95,
    status: "confirmed",
    createdAt: "2026-09-26T14:20:00Z",
  },
  {
    id: "b-3",
    reference: "MED-1031",
    patientName: "Ahmad Razak",
    patientEmail: "ahmad.r@example.my",
    patientPhone: "+60 12 345 6789",
    patientNotes: "Knee rehab assessment following half-marathon.",
    doctorId: "doc-3",
    doctorName: "Dr. Farah Nadira Azman",
    doctorRole: "Lead Physiotherapist",
    clinicName: "Kinetica Sports & Spine Rehabilitation",
    clinicAddress: "KLCC Petronas Corridor, Kuala Lumpur, Malaysia",
    serviceName: "Biomechanical Motion & Posture Assessment",
    duration: "45 min",
    date: "Tue 30 Sep",
    time: "14:00",
    price: 85,
    status: "confirmed",
    createdAt: "2026-09-25T11:40:00Z",
  },
  {
    id: "b-4",
    reference: "MED-0998",
    patientName: "Evelyn Chew",
    patientEmail: "evelyn.chew@example.sg",
    patientPhone: "+65 8234 5678",
    patientNotes: "Regular airflow cleaning and checkup.",
    doctorId: "doc-4",
    doctorName: "Dr. Cheryl Lim",
    doctorRole: "Aesthetic Dental Surgeon",
    clinicName: "Orchard Dental Aesthetics Studio",
    clinicAddress: "391 Orchard Road, Ngee Ann City, Singapore",
    serviceName: "Airflow Guided Biofilm Dental Cleaning",
    duration: "30 min",
    date: "Wed 01 Oct",
    time: "11:30",
    price: 90,
    status: "pending",
    createdAt: "2026-09-27T08:05:00Z",
  },
  {
    id: "b-5",
    reference: "MED-0920",
    patientName: "Marcus Wei",
    patientEmail: "marcus.wei@example.sg",
    patientPhone: "+65 9123 4567",
    doctorId: "doc-1",
    doctorName: "Dr. Kenneth Tan",
    doctorRole: "Dermatologist",
    clinicName: "Novena Premier Specialist Medical",
    clinicAddress: "10 Sinaran Drive, Novena Medical Hub, Singapore",
    serviceName: "Comprehensive Dermatological Consultation",
    duration: "30 min",
    date: "10 Sep",
    time: "11:00",
    price: 120,
    status: "completed",
    createdAt: "2026-09-08T09:00:00Z",
  },
];

const INITIAL_CENTERS: Center[] = [
  {
    id: "c-1",
    name: "Novena Premier Specialist Medical",
    category: "Specialist Diagnostics & Aesthetics",
    address: "10 Sinaran Drive, Novena Medical Hub, Singapore",
    email: "appointments@novenamedical.sg",
    phone: "+65 6712 8900",
    licenseNumber: "MOH-SG-NOV-8812",
    doctorCount: 8,
    status: "active",
    operatingHours: "Mon-Fri 08:30 – 18:30, Sat 09:00 – 14:00",
    amenities: ["Wheelchair Accessible", "Novena MRT Link", "Private Recovery Suites", "On-site High-Res Ultrasound"],
  },
  {
    id: "c-2",
    name: "Aisana Longevity & Aesthetic Wellness",
    category: "Anti-Aging & Cellular Longevity Clinic",
    address: "Sukhumvit 24, Bangkok, Thailand",
    email: "care@aisanawellness.th",
    phone: "+66 2 258 7700",
    licenseNumber: "MOPH-THA-BKK-3390",
    doctorCount: 12,
    status: "active",
    operatingHours: "Mon-Sun 09:00 – 21:00",
    amenities: ["JCI Accredited Facility", "Valet Parking", "Herbal Infusion Lounge", "Multilingual Concierge"],
  },
  {
    id: "c-3",
    name: "Kinetica Sports & Spine Rehabilitation",
    category: "Kinetic Physiotherapy & Orthopedic Center",
    address: "KLCC Petronas Corridor, Kuala Lumpur, Malaysia",
    email: "rehab@kineticasports.my",
    phone: "+60 3 2181 4455",
    licenseNumber: "MOH-MY-KLCC-7714",
    doctorCount: 9,
    status: "active",
    operatingHours: "Mon-Sat 08:00 – 20:00",
    amenities: ["Kinetic Motion Lab", "Spinal Decompression Beds", "Shower Suites", "Gym Turf Integration"],
  },
  {
    id: "c-4",
    name: "Andaman Somatic Recovery Lounge",
    category: "Therapeutic Somatic Wellness",
    address: "Laguna Phuket, Thailand",
    email: "concierge@andamanrecovery.th",
    phone: "+66 76 324 888",
    licenseNumber: "MOPH-THA-PKT-2219",
    doctorCount: 6,
    status: "pending",
    submittedTime: "Submitted yesterday",
    operatingHours: "Mon-Sun 10:00 – 22:00",
    amenities: ["Laguna Shuttle", "Organic Herbal Apothecary", "Private Salt Cabanas"],
  },
];

const INITIAL_DISPUTES: Dispute[] = [
  {
    id: "disp-1",
    bookingRef: "#1042",
    title: "Patient schedule modification contest",
    description: "Clinic flagged patient cancellation submitted 18 hours before appointment time; patient requests waiver due to flight delay between Bangkok and Singapore.",
    clinicStatement: "Physician suite was reserved for 45 minutes. Standard cancellation policy is 24 hours.",
    reporter: "Novena Premier Specialist Medical",
    amount: 120,
    status: "open",
    date: "Today, 09:30",
  },
  {
    id: "disp-2",
    bookingRef: "#1031",
    title: "Biomechanical scan package clarity",
    description: "Patient inquired if dynamic foot pressure mapping was included in the primary sports evaluation invoice.",
    clinicStatement: "Dynamic mapping was performed as part of personalized recovery roadmap without auxiliary fee.",
    reporter: "Patient Ahmad Razak",
    amount: 85,
    status: "resolved",
    date: "Yesterday",
    resolution: "uphold_clinic",
    resolutionNote: "Full diagnostic record validated with patient agreement; no excess charge found.",
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

  const createBooking = (newBookingData: Omit<Booking, "id" | "reference" | "createdAt" | "status"> & { status?: Booking["status"] }): Booking => {
    const randomRef = Math.floor(1000 + Math.random() * 9000);
    const newBooking: Booking = {
      status: "confirmed",
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
