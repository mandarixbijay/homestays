import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { User, LogOut, ChevronRight, IdCard } from "lucide-react";
import AddMobileDialog from "./AddMobileDialog";

interface SidebarProps {
  selected: string;
  setSelected: (val: string) => void;
}

export default function Sidebar({ selected, setSelected }: SidebarProps) {
  return (
    <Card className="w-full md:w-80 flex flex-col gap-4 p-0 h-fit mb-4 md:mb-0">
      <div className="flex flex-row items-center gap-3 p-6 pb-2 border-b">
        <Avatar alt="David John" className="h-12 w-12" />
        <div>
          <div className="font-semibold text-lg leading-tight">Hi, David</div>
          <div className="text-xs text-muted-foreground truncate max-w-[140px] sm:max-w-full overflow-hidden whitespace-nowrap">devidjond45@gmail.com</div>
        </div>
      </div>
      <div className="flex flex-col gap-4 p-6 pt-4">
        <div className="flex items-center gap-2">
          <Badge>Blue</Badge>
          <span className="ml-auto text-sm font-semibold">$15.00</span>
        </div>
        <div className="text-xs text-muted-foreground">Includes $15.00 in OneKeyCash expiring soon</div>
        <Button variant="outline" className="w-full">View rewards activity</Button>
        <div className="border-t pt-4 mt-2">
          <div className="font-medium text-sm mb-2">Add your mobile number</div>
          <AddMobileDialog />
        </div>
        <div className="flex flex-col gap-3 text-sm">
          <Card
            className={`p-4 flex flex-row items-center gap-3 cursor-pointer hover:shadow-md transition-shadow group ${selected === "profile" ? "ring-2 ring-primary" : ""}`}
            onClick={() => setSelected("profile")}
          >
            <User className="w-5 h-5 text-muted-foreground mr-2" />
            <div className="flex-1">
              <div className="font-semibold">Profile</div>
              <div className="text-xs text-muted-foreground">Provide your personal details and travel documents</div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </Card>

          <Card
            className={`p-4 flex flex-row items-center gap-3 cursor-pointer hover:shadow-md transition-shadow group ${selected === "payment-history" ? "ring-2 ring-primary" : ""}`}
            onClick={() => setSelected("payment-history")}
          >
            <IdCard className="w-5 h-5 text-muted-foreground mr-2" />
            <div className="flex-1">
              <div className="font-semibold">Booking history</div>
              <div className="text-xs text-muted-foreground">View payment details</div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </Card>
        </div>
        <div className="flex justify-center mt-2">
          <Button variant="outline" className="text-destructive w-fit"><LogOut className="w-4 h-4 mr-2" />Sign out</Button>
        </div>
      </div>
    </Card>
  );
} 