import {
  LayoutDashboard,
  Radio,
  History,
  Users,
  HardDrive,
  FileBarChart,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Real-Time Log", url: "/realtime", icon: Radio },
  { title: "Historical Logs", url: "/history", icon: History },
  { title: "Users", url: "/users", icon: Users },
  { title: "Devices", url: "/devices", icon: HardDrive },
  { title: "Reports", url: "/reports", icon: FileBarChart },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img src="/biotime_logo.png" alt="BioTime" className="h-8 w-auto" />
          <div className="leading-tight">
            {/* <span className="text-sm font-bold text-sidebar-primary-foreground">
              BioTime
            </span> */}
            <span className="block text-[10px] text-sidebar-foreground/70">
              Time & Attendance
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
