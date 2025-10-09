import { createClient } from "@/app/utils/supabase/server";
import { create } from "domain";
import {NextRequest, NextResponse} from "next/server";



// Funcion GET para traer los comentarios de una tarea
export async function GET (
    request: NextRequest,
    {params}: { params: { id: string } }
) { 
    const supabase = await createClient();
     const { id: taskId } = await params;  // ← Hacer await


    // traigo los comentarios de la base de datos
    const {data: comments, error } = await supabase
        .from("comments")
        .select(`
            id,
            text,
            created_at,
            profiles:userid (
                id,
                username,
                email,
                avatar_url
            )
        `)
        .eq("taskid", taskId)
        .order("created_at", {ascending: false});


        // manejar errores

        if(error) {
           return NextResponse.json ({error: error.message}, {status: 500});
        }

        return NextResponse.json ({comments}, {status: 200});
}


// Funcion POST para crear un comentario en una tarea
 export async function POST (
    request : NextRequest,
    {params} : {params : {id:string}}
 ) {
    const supabase = await createClient()
    const taskId = params.id;

    const {text} = await request.json()

    // Verificamos usuario
    const {data: {user} } = await supabase.auth.getUser()
     if(!user){
        return NextResponse.json({error: "No autenticado"}, {status: 401})
     }

     if( !text || text.trim() === ""){
 return NextResponse.json ({Error: "El comentario no puede estar vacio"}, {status: 400})
     }


     // Crear comentario y guardarlo 

     const {data: comment,error} = await supabase
     .from("comments")
     .insert({
        taskid: taskId,
        userid: user.id,
        text: text.trim(),
    
        })
        .select(`
            id,
            text,
            created_at,
            profiles:userid (
                id,
                username,
                email,
                avatar_url
                )
            `)
            .single();

            if(error) {
                return NextResponse.json ({error: 'Error al crear comentario'}, {status: 500});
            }

            return NextResponse.json ({comment }, {status: 201});

 }

