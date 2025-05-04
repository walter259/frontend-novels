import Link from "next/link";
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import data from "./data";
export default function NavLinks() {
  const { routes } = data();
  return routes.map((item) => {
    return (
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton asChild>
          <Link href={item.link}>
            <item.icon />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  });
}
