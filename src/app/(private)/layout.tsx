import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { createClient } from "../utils/supabase/server";
import { SidebarNav } from "../components/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserProvider } from "../context/UserContext";

interface PrivateLayoutProps {
  children: ReactNode;
}

export default async function PrivateLayout({ children }: PrivateLayoutProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <UserProvider user={user}>
      <SidebarProvider>
        <div className="min-h-screen bg-crema flex w-full">
          <SidebarNav user={user} />
          <main className="flex-1">
            <div className="flex items-center gap-4 p-4 border-b">
              <SidebarTrigger className="rounded text-gris hover:text-verde hover:border-verde" />
              <h1 className="text-gris">Dashboard</h1>
            </div>
            <div className="w-full h-full px-6 py-6">
              {children}
            </div>
          </main>       
        </div>
      </SidebarProvider>
    </UserProvider>
  );
}
