import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";

/**
 * API Route para obtener los miembros de un equipo
 * GET /api/team/[teamId]/members
 * 
 * @param request - Objeto NextRequest
 * @param params - Parámetros de la ruta (teamId)
 * @returns Promise<NextResponse> - Lista de miembros del equipo
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId } = params;

    // Verificar que el usuario pertenece a este equipo
    const { data: membership, error: membershipError } = await supabase
      .from("team_memberships")
      .select("*")
      .eq("teamid", teamId)
      .eq("userid", user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: "User is not a member of this team" },
        { status: 403 }
      );
    }

    // Obtener todos los miembros del equipo
    const { data: memberships, error: membershipsError } = await supabase
      .from("team_memberships")
      .select("userid, role")
      .eq("teamid", teamId);

    if (membershipsError) {
      console.error("Error fetching team memberships:", membershipsError);
      return NextResponse.json(
        { error: "Failed to fetch team memberships" },
        { status: 500 }
      );
    }

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({
        members: [],
        count: 0,
      });
    }

    // Obtener los IDs de los usuarios
    const userIds = memberships.map(m => m.userid);

    // Obtener los perfiles de esos usuarios
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, username, avatar_url")
      .in("id", userIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      return NextResponse.json(
        { error: "Failed to fetch user profiles" },
        { status: 500 }
      );
    }

    // Formatear la respuesta combinando memberships con profiles
    const formattedMembers = profiles?.map(profile => ({
      id: profile.id,
      email: profile.email,
      username: profile.username,
      avatar_url: profile.avatar_url,
    })) || [];

    return NextResponse.json({
      members: formattedMembers,
      count: formattedMembers.length,
    });

  } catch (error) {
    console.error("Error in GET /api/team/[teamId]/members:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
