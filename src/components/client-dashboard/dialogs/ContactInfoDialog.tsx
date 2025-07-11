"use client";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ContactInfoDialog({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="px-0 h-auto">Edit</Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-lg sm:max-w-lg max-h-[90vh] overflow-y-auto p-2 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Contact information</DialogTitle>
          <div className="text-sm text-muted-foreground mt-1">You can sign in, receive account activity alerts, and get trip updates by sharing this information.</div>
        </DialogHeader>
        <form className="space-y-4 mt-4">
          <div>
            <Label htmlFor="mobile" className="font-semibold">Mobile number</Label>
            <Input id="mobile" placeholder="Enter your mobile number" />
          </div>
          <div>
            <Label htmlFor="emergency" className="font-semibold">Emergency contact</Label>
            <Input id="emergency" placeholder="Enter emergency contact" />
          </div>
          <div>
            <Label htmlFor="email" className="font-semibold">Email</Label>
            <Input id="email" placeholder="Enter your email" defaultValue="devidjond45@gmail.com" />
          </div>
          <div>
            <Label htmlFor="address" className="font-semibold">Address</Label>
            <Input id="address" placeholder="Enter your address" />
          </div>
          <Button type="submit" className="w-full mt-4">Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 