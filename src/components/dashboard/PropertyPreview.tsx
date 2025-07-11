import { Button } from "@/components/ui/button";

interface PropertyPreviewProps {
  getValues: any;
}

export default function PropertyPreview({ getValues }: PropertyPreviewProps) {
  return (
    <div className="mt-4 bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Preview</h2>
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-600">Name</h3>
          <p className="text-base text-gray-900">{getValues("step1.propertyName") || "N/A"}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-600">Address</h3>
          <p className="text-base text-gray-900">{getValues("step1.address") || "N/A"}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-600">Total Rooms</h3>
          <p className="text-base text-gray-900">{getValues("step4.totalRooms") || 0}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-600">Facilities</h3>
          <p className="text-base text-gray-900">
            {(getValues("step3.selectedFacilities") || []).join(", ") || "N/A"}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-600">Check-In / Check-Out</h3>
          <p className="text-base text-gray-900">
            {getValues("step7.checkInTime") || "N/A"} - {getValues("step7.checkOutTime") || "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}