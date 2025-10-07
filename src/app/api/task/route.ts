import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";

/**
 * Interfaz que define la estructura de una tarea
 */
interface Task {
  id: string;
  title: string;
  teamid: string;
  category: string;
  priority: string;
  state: string;
  description: string;
  createdby: string;
  created_at: string;
  updated_at: string;
}

/**
 * API Route para obtener tareas filtradas por tipo
 *
 * Endpoints soportados:
 * - GET /api/task?filter=team - Obtiene todas las tareas de los equipos del usuario
 * - GET /api/task?filter=my - Obtiene solo las tareas asignadas al usuario
 * - GET /api/task - Por defecto devuelve tareas del equipo
 *
 * @param request - Objeto NextRequest que contiene los parámetros de la petición
 * @returns Promise<NextResponse> - Respuesta JSON con las tareas o mensaje de error
 */
export async function GET(request: NextRequest) {
  try {
    // Extraer parámetros de consulta de la URL
    const { searchParams } = new URL(request.url);
    const filterParam = searchParams.get("filter") || "team";

    // Inicializar cliente de Supabase y obtener usuario autenticado
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Verificar autenticación
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /**Filtro 'team': Obtiene tareas de todos los equipos donde el usuario es miembro*/
    if (filterParam === "team") {
      // 1. Obtener todos los equipos donde el usuario es miembro
      const { data: memberships, error: membershipError } = await supabase
        .from("team_memberships")
        .select("teamid")
        .eq("userid", user.id);

      // Verificar si el usuario pertenece a algún equipo
      if (membershipError || !memberships || memberships.length === 0) {
        return NextResponse.json(
          { error: "User not in any team" },
          { status: 404 }
        );
      }

      // 2. Extraer los IDs de los equipos
      const teamIds = memberships.map((membership) => membership.teamid);

      // 3. Obtener todas las tareas de esos equipos
      const { data: tasks, error: tasksError } = await supabase
        .from("task")
        .select(
          `
          *,
          task_assignees (
            profiles (
              id,
              email,
              username,
              avatar_url
            )
          )
        `
        )
        .in("teamid", teamIds);

      if (tasksError) {
        return NextResponse.json(
          { error: tasksError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ tasks: tasks || [] });
    }

    /**Filtro 'my': Obtiene solo las tareas asignadas específicamente al usuario */
    if (filterParam === "my") {
      // Buscar en la tabla de asignaciones para obtener tareas del usuario
      const { data: assignments, error: tasksError } = await supabase
        .from("task_assignees")
        .select(
          `
      task:taskid (
        id,
        title,
        teamid,
        category,
        priority,
        state,
        description,
        createdby,
        created_at,
        updated_at,
        task_assignees (
          profiles (
            id,
            email,
            username,
            avatar_url
          )
        )
      )
      `
        )
        .eq("userid", user.id);

      if (tasksError) {
        return NextResponse.json(
          { error: tasksError.message },
          { status: 500 }
        );
      }

      // Extraer solo los objetos de tareas del resultado
      const tasks =
        assignments?.map((assignment) => assignment.task).filter(Boolean) || [];

      return NextResponse.json({ tasks: tasks });
    }

    // Filtro no válido
    return NextResponse.json(
      { error: "Invalid filter parameter. Use 'team' or 'my'" },
      { status: 400 }
    );
  } catch (error) {
    // Manejo de errores inesperados
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
