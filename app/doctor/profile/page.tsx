/**
 * Doctor Profile Page
 * 
 * View and edit doctor profile information.
 */

export const dynamic = 'force-dynamic';

import { requireDoctor, getUserDoctorId } from '@/lib/middleware/permissions';
import { db } from '@/db';
import { doctors, centers } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function getDoctorProfile(doctorId: string) {
  const doctorData = await db
    .select({
      doctor: doctors,
      center: centers,
    })
    .from(doctors)
    .leftJoin(centers, eq(doctors.centerId, centers.id))
    .where(eq(doctors.id, doctorId))
    .limit(1);

  return doctorData[0] || null;
}

export default async function DoctorProfilePage() {
  const authResult = await requireDoctor();
  if ('error' in authResult) {
    return <div>Unauthorized</div>;
  }

  const { context } = authResult;
  const { user } = context;

  const doctorId = await getUserDoctorId(user.id);
  if (!doctorId) {
    return <div>Doctor profile not found</div>;
  }

  const profileData = await getDoctorProfile(doctorId);
  if (!profileData) {
    return <div>Profile not found</div>;
  }

  const { doctor, center } = profileData;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-2 text-gray-600">View your professional information</p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {doctor.imageUrl ? (
                <img
                  src={doctor.imageUrl}
                  alt={doctor.name}
                  className="h-24 w-24 rounded-full border-4 border-white"
                />
              ) : (
                <div className="h-24 w-24 rounded-full border-4 border-white bg-white flex items-center justify-center">
                  <span className="text-4xl text-blue-600">👨‍⚕️</span>
                </div>
              )}
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-white">Dr. {doctor.name}</h2>
              <p className="text-blue-100">{doctor.specialization || doctor.category}</p>
              <p className="text-blue-100 text-sm mt-1">
                {center ? `${center.name}` : 'Independent Doctor'}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfileField label="Name" value={doctor.name} />
            <ProfileField label="Email" value={user.email} />
            <ProfileField label="Phone" value={user.phone || 'Not provided'} />
            <ProfileField label="Role" value={doctor.role} />
            <ProfileField label="Category" value={doctor.category} />
            <ProfileField label="Specialization" value={doctor.specialization || 'General'} />
            <ProfileField label="License Number" value={doctor.licenseNumber} />
            <ProfileField label="Consultation Fee" value={`SGD ${doctor.consultationFee || doctor.price}`} />
          </div>

          {doctor.bio && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Biography</h3>
              <p className="text-gray-900">{doctor.bio}</p>
            </div>
          )}

          {center && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Affiliated Center</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProfileField label="Center Name" value={center.name} />
                <ProfileField label="Category" value={center.category} />
                <ProfileField label="Address" value={center.address} />
                <ProfileField label="Phone" value={center.phone} />
              </div>
            </div>
          )}

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Status</h3>
            <div className="flex items-center space-x-4">
              <StatusBadge active={doctor.active} />
              {doctor.provisioned && (
                <span className="text-sm text-gray-600">
                  Provisioned on {new Date(doctor.provisionedAt!).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-500">{label}</h3>
      <p className="mt-1 text-gray-900">{value || 'N/A'}</p>
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  if (active) {
    return (
      <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
        ✓ Active
      </span>
    );
  }

  return (
    <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-red-100 text-red-800">
      Inactive
    </span>
  );
}
