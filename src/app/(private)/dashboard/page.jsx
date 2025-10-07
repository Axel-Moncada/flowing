"use client";
import React, { useState, useEffect } from "react";
import { BtnMain } from "../../components/Uitools";
import { CircleSmall, Settings, GripVertical, Clock, Tag } from "lucide-react";
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { createClient } from "@/app/utils/supabase/clients"; // 👈 Importar supabase client

// ========================================
// COMPONENTE COLUMN (Droppable)
// ========================================
function Column({ id, title, children, color }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  
  return (
    <div 
      ref={setNodeRef}
      className={`rounded-lg p-4 transition-colors ${isOver ? 'bg-blue-50' : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CircleSmall fill={color} stroke={color} />
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
        <span className="font-semibold text-gray-400">
          {Array.isArray(children) ? children.length : children ? 1 : 0}
        </span>
      </div>
      
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}

// ========================================
// COMPONENTE TASKCARD (Draggable)
// ========================================
function TaskCard({ task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-[#6C6C6C] rounded-2xl p-4 mb-5 cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <h4 className="font-bold text-verde text-lg/5 my-2 mx-1 lh">
          {task.title}
        </h4>
        <GripVertical className="text-gray-400" />
      </div>

      <div className="time flex items-center gap-1 mb-3">
        <Clock className="text-gray-400" height={18} />
        <p className="text-sm text-verde">
          {new Date(task.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="category flex items-center gap-1 mb-3">
        <Tag className="text-gray-400" height={18} />
        <span className="bg-blue-500 text-sm text-white rounded-2xl py-1 w-40 px-5">
          {task.category}
        </span>
      </div>

      <p className="text-sm text-crema mb-4">
        {task.description}
      </p>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm text-crema mb-1">
          <span>Progreso</span>
          <span className="text-verde">23%</span>
        </div>
        <div className="w-full bg-[#484E5C] rounded-full h-2">
          <div
            className="bg-verde h-2 rounded-full"
            style={{ width: "23%" }}
          ></div>
        </div>
      </div>

      {/* Avatares */}
      <div className="flex justify-between items-center">
        <div className="flex -space-x-2">
          {task.task_assignees
            ?.filter((assignee) => assignee.profiles !== null)
            .map((assignee, index) => {
              const profile = assignee.profiles;
              const initials = (profile.username || profile.email || "??").substring(0, 2).toUpperCase();
              
              return (
                <div
                  key={profile.id || index}
                  className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#6C6C6C] shadow-lg"
                  title={profile.username || profile.email}
                >
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={initials}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Si la imagen falla, mostrar iniciales
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                    style={{ display: profile.avatar_url ? 'none' : 'flex' }}
                  >
                    <span className="text-white text-xs font-bold">
                      {initials}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
        <BtnMain text="Ver mas" size="sm" weight="bold" />
      </div>
    </div>
  );
}

// ========================================
// COMPONENTE PRINCIPAL - DASHBOARD
// ========================================
export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [activeFilter, setActiveFilter] = useState("team");


  const fetchTask = async (filter = "team") => {
    try {
      setLoading(true);
      setActiveFilter(filter);
      const response = await fetch(`/api/task?filter=${filter}`);
      if (!response.ok) throw new Error("Error en api task");
      const data = await response.json();
      setTasks(data.tasks || []);

      if (data.teamName) {
        setTeamName(data.teamName);
      }

      console.log("📊 respuesta data:", data);
      console.log("👥 Primera tarea con assignees:", data.tasks?.[0]?.task_assignees);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const taskId = active.id;
    const newState = over.id;
    
    // Guardar el estado anterior por si falla
    const previousTasks = tasks;
    
    // Actualizar el estado local (optimistic update)
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, state: newState }
          : task
      )
    );

    console.log(`Tarea ${taskId} movida a ${newState}`);
    
    // Actualizar en la base de datos
    try {
      const response = await fetch(`/api/task/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: newState })
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar la tarea');
      }
      
      console.log('✅ Tarea actualizada en la base de datos');
    } catch (error) {
      console.error('❌ Error al actualizar tarea:', error);
      // Revertir el cambio si falla
      setTasks(previousTasks);
      alert('Error al mover la tarea. Intenta de nuevo.');
    }
  };

  useEffect(() => {
    fetchTask();
    
    // 🔄 SUPABASE REALTIME - Sincronización en tiempo real
    const supabase = createClient();
    
    // Crear canal de realtime
    const channel = supabase
      .channel('task-changes') // Nombre del canal
      .on(
        'postgres_changes',
        {
          event: '*', // Escuchar todos los eventos: INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'task'
        },
        (payload) => {
          console.log('🔄 Cambio detectado en tiempo real:', payload);
          
          // Recargar tareas cuando hay un cambio
          // Usamos el filtro actual para no perder el contexto
          fetchTask(activeFilter);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Conectado a Realtime');
        }
        if (status === 'CLOSED') {
          console.log('❌ Desconectado de Realtime');
        }
      });

    // Cleanup: Desuscribirse cuando el componente se desmonta
    return () => {
      console.log('🧹 Limpiando suscripción de Realtime');
      supabase.removeChannel(channel);
    };
  }, [activeFilter]);

  // Agrupar tareas por estado
  const tasksByState = {
    backlog: tasks.filter(t => t.state === 'backlog'),
    en_progreso: tasks.filter(t => t.state === 'en_progreso'),
    en_revision: tasks.filter(t => t.state === 'en_revision'),
    finalizado: tasks.filter(t => t.state === 'finalizado')
  };

  // 🔍 DEBUG: Ver qué tareas y estados tenemos
  console.log('📊 Total de tareas:', tasks.length);
  console.log('🔍 Estados únicos:', [...new Set(tasks.map(t => t.state))]);
  console.log('📋 Tareas por estado:', {
    backlog: tasksByState.backlog.length,
    en_progreso: tasksByState.en_progreso.length,
    en_revision: tasksByState.en_revision.length,
    finalizado: tasksByState.finalizado.length
  });

  return (
    <div className="container w-screen">
      {/* Search and New Task Button */}
      <div className="grid place-content-between gap-4 w-full items-center">
        <div className="col-start-1 col-end-7">
          <input
            className="bg-gris text-crema rounded-2xl px-10 py-3 w-full"
            type="text"
            placeholder="Buscar..."
          />
        </div>

        <div className="col-start-9 align-self-center justify-self-end">
          <BtnMain text="Nueva tarea" size="lg" weight="semibold" />
        </div>
      </div>

      <div className="kanba">
        {/* Botones de filtro */}
        <button
          className={`btn btn-primary px-10 py-3 rounded-2xl text-sm font-semibold mx-5 my-2 ${
            activeFilter === "my" ? "bg-gris text-crema" : "bg-verde text-black"
          }`}
          onClick={() => fetchTask("my")}
        >
          Mis tareas
        </button>

        <button
          className={`btn btn-primary px-10 py-3 rounded-2xl text-sm font-semibold ${
            activeFilter === "team" ? "bg-gris text-crema" : "bg-verde text-black"
          }`}
          onClick={() => fetchTask("team")}
        >
          Tareas team
        </button>

        {/* KANBAN BOARD */}
        <div className="container w-full">
          <DndContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-4 gap-6 mt-20">
              
              {/* COLUMNA BACKLOG */}
              <Column id="backlog" title="Backlog" color="#4D6BA8">
                {tasksByState.backlog.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </Column>

              {/* COLUMNA EN PROGRESO */}
              <Column id="en_progreso" title="En curso" color="#17CF3F">
                {tasksByState.en_progreso.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </Column>

              {/* COLUMNA EN REVISIÓN */}
              <Column id="en_revision" title="En revisión" color="#F20D11">
                {tasksByState.en_revision.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </Column>

              {/* COLUMNA FINALIZADO */}
              <Column id="finalizado" title="Finalizado" color="#C7EF4D">
                {tasksByState.finalizado.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </Column>

            </div>
          </DndContext>
        </div>
      </div>
    </div>
  );
}
