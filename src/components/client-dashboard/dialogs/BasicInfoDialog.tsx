"use client";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";

export default function BasicInfoDialog({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="px-0 h-auto">Edit</Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-lg sm:max-w-lg max-h-[90vh] overflow-y-auto p-2 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Basic information</DialogTitle>
          <div className="text-sm text-muted-foreground mt-1">Make sure this information matches your travel ID, like your passport or license.</div>
        </DialogHeader>
        <form className="space-y-4 mt-4">
          <div>
            <Label className="font-semibold">Full name</Label>
            <div className="grid grid-cols-1 gap-2 mt-2">
              <div className="flex flex-col gap-1">
                <Label htmlFor="firstName">First name <span className="text-red-500">*</span></Label>
                <Input id="firstName" placeholder="First name" defaultValue="David" required />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="middleName">Middle name</Label>
                <Input id="middleName" placeholder="Middle name" />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="lastName">Last name <span className="text-red-500">*</span></Label>
                <Input id="lastName" placeholder="Last name" defaultValue="John" required />
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="bio" className="font-semibold">About you</Label>
            <Textarea id="bio" placeholder="Help future hosts get to know you better. You can share your travel style, hobbies, interests, and more." className="mt-1" rows={3} />
          </div>
          <div>
            <Label className="font-semibold">Date of birth</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <Input placeholder="MM" maxLength={2} />
              <Input placeholder="DD" maxLength={2} />
              <Input placeholder="YYYY" maxLength={4} />
            </div>
          </div>
          <div>
            <Label className="font-semibold">Gender</Label>
            <RadioGroup defaultValue="unspecified" className="flex flex-col gap-2 mt-1">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female">Female</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male">Male</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="unspecified" id="unspecified" />
                <Label htmlFor="unspecified">Unspecified (X)</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="undisclosed" id="undisclosed" />
                <Label htmlFor="undisclosed">Undisclosed (U)</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label className="font-semibold">Accessibility needs</Label>
            <div className="text-xs text-muted-foreground mb-1">Help us build features that make travel accessible for all by sharing this information.</div>
            <Select defaultValue="not_provided">
              <SelectTrigger>
                <SelectValue placeholder="Choose an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_provided">Not provided</SelectItem>
                <SelectItem value="wheelchair">Wheelchair access</SelectItem>
                <SelectItem value="hearing">Hearing assistance</SelectItem>
                <SelectItem value="vision">Vision assistance</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full mt-4">Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 