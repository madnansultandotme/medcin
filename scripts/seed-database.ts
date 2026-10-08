// Database Seeding Script
import { config } from "dotenv";
import { db } from "../db";
import { users, centers, doctors, services, patientProfiles, bookings, slots, settings } from "../db/schema";
import { eq } from "drizzle-orm";

// Load environment variables
config({ path: ".env.local" });

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seed...");

    // 1. Create Admin User
    console.log("Creating admin user...");
    const [adminUser] = await db
      .insert(users)
      .values({
        authUid: "admin_test_auth_id",
        email: "admin@medcin.com",
        name: "Admin User",
        phone: "+1234567890",
        role: "ADMIN",
      })
      .returning();
    console.log("✓ Admin user created:", adminUser.id);

    // 2. Create Center User & Center
    console.log("Creating center user and center...");
    const [centerUser] = await db
      .insert(users)
      .values({
        authUid: "center_test_auth_id",
        email: "center@wellness.com",
        name: "City Wellness Center",
        phone: "+1234567891",
        role: "CENTER",
      })
      .returning();

    const [wellnessCenter] = await db
      .insert(centers)
      .values({
        userId: centerUser.id,
        name: "City Wellness Center",
        category: "Multi-Specialty Clinic",
        address: "123 Health Street, Medical District",
        email: "center@wellness.com",
        phone: "+1234567891",
        licenseNumber: "CWC-2024-001",
        status: "ACTIVE",
        logoUrl: "https://via.placeholder.com/200x200?text=CWC",
        operatingHours: "Mon-Fri: 9AM-6PM, Sat: 9AM-2PM",
        amenities: ["Parking", "Wheelchair Access", "Pharmacy", "Lab Services"],
      })
      .returning();
    console.log("✓ Center created:", wellnessCenter.id);

    // 3. Create Doctors
    console.log("Creating doctors...");
    const [doctor1] = await db
      .insert(doctors)
      .values({
        centerId: wellnessCenter.id,
        name: "Dr. Sarah Johnson",
        role: "Primary Care Physician",
        category: "General Medicine",
        price: 150.0,
        rating: 4.8,
        reviewsCount: 127,
        licenseNumber: "MD-2024-001",
        bio: "Board-certified physician with 15 years of experience in family medicine.",
        imageUrl: "https://via.placeholder.com/150?text=Dr.Sarah",
        active: true,
      })
      .returning();

    const [doctor2] = await db
      .insert(doctors)
      .values({
        centerId: wellnessCenter.id,
        name: "Dr. Michael Chen",
        role: "Cardiologist",
        category: "Cardiology",
        price: 250.0,
        rating: 4.9,
        reviewsCount: 89,
        licenseNumber: "MD-2024-002",
        bio: "Specialist in cardiovascular health with focus on preventive cardiology.",
        imageUrl: "https://via.placeholder.com/150?text=Dr.Chen",
        active: true,
      })
      .returning();

    const [doctor3] = await db
      .insert(doctors)
      .values({
        centerId: wellnessCenter.id,
        name: "Dr. Emily Rodriguez",
        role: "Pediatrician",
        category: "Pediatrics",
        price: 120.0,
        rating: 5.0,
        reviewsCount: 201,
        licenseNumber: "MD-2024-003",
        bio: "Passionate about child healthcare and development with 10 years experience.",
        imageUrl: "https://via.placeholder.com/150?text=Dr.Emily",
        active: true,
      })
      .returning();

    console.log("✓ Doctors created:", doctor1.id, doctor2.id, doctor3.id);

    // 4. Create Services
    console.log("Creating services...");
    await db.insert(services).values([
      {
        doctorId: doctor1.id,
        name: "General Consultation",
        duration: "30 minutes",
        price: 150.0,
        description: "Comprehensive health check-up and consultation",
      },
      {
        doctorId: doctor1.id,
        name: "Annual Physical",
        duration: "60 minutes",
        price: 200.0,
        description: "Complete annual physical examination",
      },
      {
        doctorId: doctor2.id,
        name: "Cardiac Consultation",
        duration: "45 minutes",
        price: 250.0,
        description: "Specialized cardiovascular examination",
      },
      {
        doctorId: doctor2.id,
        name: "ECG Test",
        duration: "20 minutes",
        price: 100.0,
        description: "Electrocardiogram test and analysis",
      },
      {
        doctorId: doctor3.id,
        name: "Child Check-up",
        duration: "30 minutes",
        price: 120.0,
        description: "Routine pediatric health examination",
      },
      {
        doctorId: doctor3.id,
        name: "Vaccination",
        duration: "15 minutes",
        price: 80.0,
        description: "Childhood vaccination services",
      },
    ]);
    console.log("✓ Services created");

    // 5. Create Patient Users & Profiles
    console.log("Creating patient users and profiles...");
    const [patient1User] = await db
      .insert(users)
      .values({
        authUid: "patient1_test_auth_id",
        email: "john.doe@email.com",
        name: "John Doe",
        phone: "+1234567892",
        role: "PATIENT",
      })
      .returning();

    const [patient1Profile] = await db
      .insert(patientProfiles)
      .values({
        userId: patient1User.id,
        location: "Downtown Area",
        emergencyName: "Jane Doe",
        emergencyRelation: "Spouse",
        emergencyPhone: "+1234567893",
        medicalNotes: "No known allergies",
        insuranceProvider: "HealthFirst Insurance",
        insurancePolicy: "HF-123456",
      })
      .returning();

    const [patient2User] = await db
      .insert(users)
      .values({
        authUid: "patient2_test_auth_id",
        email: "mary.smith@email.com",
        name: "Mary Smith",
        phone: "+1234567894",
        role: "PATIENT",
      })
      .returning();

    const [patient2Profile] = await db
      .insert(patientProfiles)
      .values({
        userId: patient2User.id,
        location: "Suburbs",
        emergencyName: "Tom Smith",
        emergencyRelation: "Brother",
        emergencyPhone: "+1234567895",
        medicalNotes: "Diabetic - Type 2",
        insuranceProvider: "MediCare Plus",
        insurancePolicy: "MCP-789012",
      })
      .returning();

    console.log("✓ Patient profiles created:", patient1Profile.id, patient2Profile.id);

    // 6. Create Time Slots (sample only)
    console.log("Creating time slots...");
    const dates = ["2024-12-15", "2024-12-16", "2024-12-17"];
    const timeSlots = [
      { start: "09:00", end: "10:00" },
      { start: "10:00", end: "11:00" },
      { start: "14:00", end: "15:00" },
      { start: "15:00", end: "16:00" },
    ];

    // Only create slots for first doctor to speed up seeding
    for (const date of dates) {
      for (const slot of timeSlots) {
        await db.insert(slots).values({
          doctorId: doctor1.id,
          date: date,
          startTime: slot.start,
          endTime: slot.end,
          status: "AVAILABLE",
        });
      }
    }
    console.log("✓ Time slots created");

    // 7. Create Sample Bookings
    console.log("Creating sample bookings...");
    const services1 = await db.select().from(services).where(eq(services.doctorId, doctor1.id)).limit(1);
    const services2 = await db.select().from(services).where(eq(services.doctorId, doctor2.id)).limit(1);
    const availableSlots = await db.select().from(slots).where(eq(slots.doctorId, doctor1.id)).limit(2);

    await db.insert(bookings).values([
      {
        reference: "BK-2024-001",
        patientId: patient1Profile.id,
        doctorId: doctor1.id,
        slotId: availableSlots[0].id,
        serviceId: services1[0]?.id,
        date: "2024-12-15",
        time: "10:00",
        status: "CONFIRMED",
        price: 150.0,
        patientNotes: "Follow-up for annual check-up",
        paymentMethod: "Pay at Clinic",
      },
      {
        reference: "BK-2024-002",
        patientId: patient2Profile.id,
        doctorId: doctor2.id,
        slotId: availableSlots[1]?.id || availableSlots[0].id,
        serviceId: services2[0]?.id,
        date: "2024-12-16",
        time: "14:00",
        status: "PENDING",
        price: 250.0,
        patientNotes: "Experiencing chest discomfort",
        paymentMethod: "Pay at Clinic",
      },
    ]);
    console.log("✓ Sample bookings created");

    // 8. Create Settings
    console.log("Creating settings...");
    await db.insert(settings).values([
      {
        key: "platform_name",
        value: "Medcin - Healthcare Booking Platform",
      },
      {
        key: "support_email",
        value: "support@medcin.com",
      },
      {
        key: "booking_cancellation_hours",
        value: "24",
      },
      {
        key: "max_advance_booking_days",
        value: "90",
      },
    ]);
    console.log("✓ Settings created");

    console.log("\n✅ Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log("- 3 Users (1 Admin, 1 Center, 1 Patient)");
    console.log("- 1 Center");
    console.log("- 3 Doctors");
    console.log("- 6 Services");
    console.log("- 2 Patient Profiles");
    console.log("- 12 Time Slots (3 dates × 4 time slots)");
    console.log("- 2 Sample Bookings");
    console.log("- 4 Settings");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run the seed function
seedDatabase()
  .then(() => {
    console.log("\n🎉 All done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Seeding failed:", error);
    process.exit(1);
  });
