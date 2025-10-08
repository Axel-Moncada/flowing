import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";

/**
 * API Route para asignar un usuario a una tarea
 * POST /api/task/[id]/assign
 * 
 * Body: { userId: string, points: number }
 * 
 * @param request - Objeto NextRequest con userId y points en el body
 * @param params - Parámetros de la ruta (id de la tarea)
 * @returns Promise<NextResponse> - Confirmación de asignación
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const taskId = params.id;
    const body = await request.json();
    const { userId, points } = body;

    // Validar campos requeridos
    if (!userId || points === undefined || points === null) {
      return NextResponse.json(
        { error: "Missing required fields: userId, points" },
        { status: 400 }
      );
    }

    // Validar que points sea un número positivo
    if (typeof points !== 'number' || points < 0) {
      return NextResponse.json(
        { error: "Points must be a positive number" },
        { status: 400 }
      );
    }

    // Obtener la tarea para verificar permisos
    const { data: task, error: taskError } = await supabase
      .from("task")
      .select("teamid, puntosAsign, puntosTotal")
      .eq("id", taskId)
      .single();

    if (taskError || !task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Verificar que el usuario pertenece al mismo equipo
    const { data: membership, error: membershipError } = await supabase
      .from("team_memberships")
      .select("*")
      .eq("teamid", task.teamid)
      .eq("userid", user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: "You don't have permission to assign users to this task" },
        { status: 403 }
      );
    }

    // Verificar que el usuario a asignar también pertenece al equipo
    const { data: assigneeMembership, error: assigneeMembershipError } = await supabase
      .from("team_memberships")
      .select("*")
      .eq("teamid", task.teamid)
      .eq("userid", userId)
      .single();

    if (assigneeMembershipError || !assigneeMembership) {
      return NextResponse.json(
        { error: "User to assign is not a member of this team" },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya está asignado a esta tarea
    const { data: existingAssignment, error: existingError } = await supabase
      .from("task_assignees")
      .select("points")
      .eq("taskid", taskId)
      .eq("userid", userId)
      .single();

    let newPuntosAsign: number;
    let newPuntosTotal: number;

    if (existingAssignment) {
      // Si ya está asignado, AUMENTAR sus puntos
      const oldPoints = existingAssignment.points || 0;
      const newPoints = oldPoints + points;

      const { error: updateAssignError } = await supabase
        .from("task_assignees")
        .update({ points: newPoints })
        .eq("taskid", taskId)
        .eq("userid", userId);

      if (updateAssignError) {
        console.error("Error updating assignment points:", updateAssignError);
        return NextResponse.json(
          { error: "Failed to update assignment points", details: updateAssignError.message },
          { status: 500 }
        );
      }

      // Actualizar contadores: solo sumar los puntos NUEVOS
      newPuntosAsign = (task.puntosAsign || 0) + points;
      newPuntosTotal = (task.puntosTotal || 0) + points;

    } else {
      // Si NO está asignado, crear nueva asignación
      const { error: assignError } = await supabase
        .from("task_assignees")
        .insert({
          taskid: taskId,
          userid: userId,
          points: points,
        });

      if (assignError) {
        console.error("Error assigning user to task:", assignError);
        return NextResponse.json(
          { error: "Failed to assign user to task", details: assignError.message },
          { status: 500 }
        );
      }

      // Actualizar contadores: sumar todos los puntos
      newPuntosAsign = (task.puntosAsign || 0) + points;
      newPuntosTotal = (task.puntosTotal || 0) + points;
    }

    const { error: updateError } = await supabase
      .from("task")
      .update({
        puntosAsign: newPuntosAsign,
        puntosTotal: newPuntosTotal,
      })
      .eq("id", taskId);

    if (updateError) {
      console.error("Error updating task points:", updateError);
      // No fallar si falla la actualización de puntos
    }

    return NextResponse.json(
      { 
        message: "User assigned successfully",
        puntosAsign: newPuntosAsign,
        puntosTotal: newPuntosTotal,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error in POST /api/task/[id]/assign:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * API Route para desasignar un usuario de una tarea
 * DELETE /api/task/[id]/assign?userId=xxx
 * 
 * @param request - Objeto NextRequest
 * @param params - Parámetros de la ruta (id de la tarea)
 * @returns Promise<NextResponse> - Confirmación de desasignación
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const taskId = params.id;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing required parameter: userId" },
        { status: 400 }
      );
    }

    // Obtener la asignación para recuperar los puntos antes de eliminarla
    const { data: assignment, error: assignmentError } = await supabase
      .from("task_assignees")
      .select("points")
      .eq("taskid", taskId)
      .eq("userid", userId)
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Eliminar la asignación
    const { error: deleteError } = await supabase
      .from("task_assignees")
      .delete()
      .eq("taskid", taskId)
      .eq("userid", userId);

    if (deleteError) {
      console.error("Error removing assignment:", deleteError);
      return NextResponse.json(
        { error: "Failed to remove assignment" },
        { status: 500 }
      );
    }

    // Actualizar los puntos de la tarea (restar SOLO de puntosAsign, NO de puntosTotal)
    const { data: task, error: taskError } = await supabase
      .from("task")
      .select("puntosAsign")
      .eq("id", taskId)
      .single();

    if (task) {
      const pointsToSubtract = assignment.points || 0;
      const newPuntosAsign = Math.max(0, (task.puntosAsign || 0) - pointsToSubtract);
      // puntosTotal NO se modifica, solo se suma, nunca se resta

      await supabase
        .from("task")
        .update({
          puntosAsign: newPuntosAsign,
          // puntosTotal se mantiene igual
        })
        .eq("id", taskId);
    }

    return NextResponse.json(
      { message: "User unassigned successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error in DELETE /api/task/[id]/assign:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
