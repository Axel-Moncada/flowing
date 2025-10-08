import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";

/**
 * API Route para actualizar una tarea específica
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Obtener el id de la tarea
    const params = await context.params;
    const taskId = params.id;
    
   
    
    const supabase = await createClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ No autenticado');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });    }

    // Obtener los datos a actualizar
    const body = await request.json();
   
    const { state } = body;
    if (!state) {
      return NextResponse.json({ error: "State is required" }, { status: 400 });
    }

   
    const { data: existingTask, error: fetchError } = await supabase
      .from("task")
      .select("id, state")
      .eq("id", taskId)
      .maybeSingle();

    if (fetchError) {
      console.error("❌ Error al buscar tarea:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!existingTask) {
      console.error("❌ Tarea no encontrada o sin permisos");
      return NextResponse.json({ 
        error: "Task not found or you don't have permission to update it" 
      }, { status: 404 });
    }

   

    // Actualizar la tarea
    const { data: updatedTask, error: updateError } = await supabase
      .from("task")
      .update({ 
        state: state,
        updated_at: new Date().toISOString()
      })
      .eq("id", taskId)
      .select()
      .maybeSingle();

    if (updateError) {
      console.error("❌ Error al actualizar:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    if (!updatedTask) {
      console.error("❌ No se pudo actualizar la tarea");
      return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
    }

   
    return NextResponse.json({ 
      message: "Task updated successfully",
      task: updatedTask 
    });

  } catch (error: any) {
    console.error("❌ Error en PATCH:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
