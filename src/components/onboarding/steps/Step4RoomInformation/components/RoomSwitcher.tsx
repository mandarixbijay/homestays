// components/Step4RoomInformation/components/RoomSwitcher.tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface RoomSwitcherProps {
  totalRooms: number;
  currentRoomIndex: number;
  setCurrentRoomIndex: (index: number) => void;
  setCurrentStep: (step: number) => void;
}

export default function RoomSwitcher({
  totalRooms,
  currentRoomIndex,
  setCurrentRoomIndex,
  setCurrentStep,
}: RoomSwitcherProps) {
  return (
    <div className="mt-4">
      <Label className="text-sm font-medium text-gray-900">Switch Room</Label>
      <Select
        value={currentRoomIndex.toString()}
        onValueChange={(value) => {
          setCurrentRoomIndex(parseInt(value));
          setCurrentStep(0);
        }}
      >
        <SelectTrigger className="mt-1 rounded-md h-10">
          <SelectValue placeholder="Select Room" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: totalRooms }).map((_, index) => (
            <SelectItem key={index} value={index.toString()}>
              Room {index + 1}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}