import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";

interface ModalsProps {
  saveModalOpen: boolean;
  setSaveModalOpen: (open: boolean) => void;
  discardModalOpen: boolean;
  setDiscardModalOpen: (open: boolean) => void;
  onSubmit: (data: any) => void;
  onDiscard: () => void;
}

export default function Modals({
  saveModalOpen,
  setSaveModalOpen,
  discardModalOpen,
  setDiscardModalOpen,
  onSubmit,
  onDiscard,
}: ModalsProps) {
  const { handleSubmit } = useForm();

  return (
    <>
      <Dialog open={saveModalOpen} onOpenChange={setSaveModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Changes</DialogTitle>
            <DialogDescription>
              Are you sure you want to save changes to this property? This will update the listing.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setSaveModalOpen(false)} className="rounded-md h-9 border-teal-800 text-teal-800 hover:bg-teal-50">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              className="rounded-md h-9 bg-teal-800 hover:bg-teal-900 text-white"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={discardModalOpen} onOpenChange={setDiscardModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Discard Changes</DialogTitle>
            <DialogDescription>
              Are you sure you want to discard all changes? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDiscardModalOpen(false)} className="rounded-md h-9 border-teal-800 text-teal-800 hover:bg-teal-50">
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={onDiscard}
              className="rounded-md h-9 bg-red-600 hover:bg-red-700 text-white"
            >
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}