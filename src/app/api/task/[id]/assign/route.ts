import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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
  { params }: { params: Promise<{ id: string }> }  // ← Cambiar a Promise
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const { id: taskId } = await params;  // ← Hacer await
    const body = await request.json();
    const { userId, points } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId es requerido" },
        { status: 400 }
      );
    }

    // Verificar si ya está asignado
    const { data: existing } = await supabase
      .from("task_assignees")
      .select("*")
      .eq("taskid", taskId)
      .eq("userid", userId)
      .single();

    if (existing) {
      // Si ya existe, SUMAR los puntos
      const newPoints = (existing.points || 0) + (points || 0);      
      const { error: updateError } = await supabase
        .from("task_assignees")
        .update({ points: newPoints })
        .eq("taskid", taskId)
        .eq("userid", userId);

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }
    } else {
      // Si no existe, crear nuevo registro
      const { error: insertError } = await supabase
        .from("task_assignees")
        .insert({
          taskid: taskId,
          userid: userId,
          points: points || 0,
        });

      if (insertError) {
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }
    }

    // Actualizar puntosAsign de la tarea
    const { data: assignees } = await supabase
      .from("task_assignees")
      .select("points")
      .eq("taskid", taskId);

    const totalAssigned = assignees?.reduce(
      (sum, a) => sum + (a.points || 0),
      0
    ) || 0;

    await supabase
      .from("task")
      .update({ puntosTotal: totalAssigned })
      .eq("id", taskId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in POST /api/task/[id]/assign:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
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
  { params }: { params: Promise<{ id: string }> }  // ← Cambiar a Promise
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const { id: taskId } = await params;  // ← Hacer await
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId es requerido" },
        { status: 400 }
      );
    }

    // Eliminar la asignación
    const { error: deleteError } = await supabase
      .from("task_assignees")
      .delete()
      .eq("taskid", taskId)
      .eq("userid", userId);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    // Actualizar puntosAsign de la tarea
    const { data: assignees } = await supabase
      .from("task_assignees")
      .select("points")
      .eq("taskid", taskId);

    const totalAssigned = assignees?.reduce(
      (sum, a) => sum + (a.points || 0),
      0
    ) || 0;

    await supabase
      .from("task")
      .update({ puntosAsign: totalAssigned })
      .eq("id", taskId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/task/[id]/assign:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
