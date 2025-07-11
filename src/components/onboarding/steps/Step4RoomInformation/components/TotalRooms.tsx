// components/Step4RoomInformation/components/TotalRooms.tsx
import { useFormContext, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";
import { Step4FormData } from "@/app/list-your-property/owner-registration/types";

interface TotalRoomsProps {
  setCurrentRoomIndex: (index: number) => void;
  setCurrentStep: (step: number) => void;
}

export default function TotalRooms({ setCurrentRoomIndex, setCurrentStep }: TotalRoomsProps) {
  const { register, formState: { errors }, setValue } = useFormContext<Step4FormData>();

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="space-y-2">
        <Label htmlFor="total-rooms" className="text-lg font-semibold text-gray-900">
          Total Rooms
        </Label>
        <p className="text-sm text-gray-500">
          Specify how many rooms are available in your property.
        </p>
        <Input
          id="total-rooms"
          type="number"
          {...register("totalRooms", {
            required: "Total rooms is required",
            min: { value: 1, message: "At least 1 room is required" },
            valueAsNumber: true,
          })}
          placeholder="e.g., 5"
          className="mt-2 rounded-md border-gray-200 focus:ring-1 focus:ring-blue-500 h-10 text-base"
          min="1"
          aria-describedby="total-rooms-error"
          onChange={(e) => {
            const value = parseInt(e.target.value, 10);
            if (value >= 1) {
              setValue("totalRooms", value, { shouldValidate: true });
              setCurrentRoomIndex(0);
              setCurrentStep(0);
            }
          }}
        />
        {errors.totalRooms && (
          <p
            id="total-rooms-error"
            className="text-sm text-red-600 mt-1 flex items-center gap-1"
            role="alert"
          >
            <Info className="h-4 w-4" />
            {errors.totalRooms.message}
          </p>
        )}
      </div>
    </div>
  );
}