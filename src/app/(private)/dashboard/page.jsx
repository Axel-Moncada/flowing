"use client";
import React, { useState, useEffect, useRef } from "react";
import { BtnMain } from "../../components/Uitools";
import { CircleSmall, Settings, GripVertical, Clock, Tag } from "lucide-react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { createClient } from "@/app/utils/supabase/clients";
import CreateTaskModal from "@/app/components/CreateTaskModal";
import ShowMore from "@/app/components/ShowMore";

// ========================================
// COMPONENTE COLUMN (Droppable)
// ========================================
function Column({ id, title, children, color }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg p-4 transition-colors ${
        isOver ? "bg-verde/20" : ""
      }`}
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

      <div className="space-y-3">{children}</div>
    </div>
  );
}

// ========================================
// COMPONENTE TASKCARD (Draggable)
// ========================================
function TaskCard({ task, onTaskUpdate, onOpenDetail }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-[#6C6C6C] rounded-2xl p-4 mb-5 cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex justify-between items-start">
        <h4 className="font-bold text-verde text-lg/5 my-2 mx-1 lh">
          {task.title}
        </h4>
        <GripVertical className="text-gray-400" />
      </div>

      <div className="time flex items-center gap-1 ">
        <Clock className="text-gray-400" height={18} />
        <p className="text-sm text-verde">
          {new Date(task.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="category flex items-center gap-1 mb-3">
        <Tag className="text-gray-400" height={18} />
        <span className="text-sm text-gray-300 rounded-2xl w-40 ">
          {task.category}
        </span>
      </div>

      <p
        className="text-sm text-crema mb-4"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          textOverflow: "ellipsis",
          wordBreak: "break-all",
        }}
      >
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
          {task.task_assignees &&
            task.task_assignees.length > 0 &&
            task.task_assignees
              ?.filter((assignee) => assignee.profiles !== null)
              .map((assignee, index) => {
                const profile = assignee.profiles;
                const initials = (profile.username || profile.email || "??")
                  .substring(0, 2)
                  .toUpperCase();

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
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                      style={{ display: profile.avatar_url ? "none" : "flex" }}
                    >
                      <span className="text-white text-xs font-bold">
                        {initials}
                      </span>
                    </div>
                  </div>
                );
              })}
        </div>

        <div
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <BtnMain
            text="Ver mas"
            size="sm"
            weight="bold"
            onClick={() => onOpenDetail(task)}
          />
        </div>
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
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const isFetchingRef = useRef(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleOpenDetail = (task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedTask(null);
  };

  const handleTaskCreated = () => {
    fetchTask();
    handleCloseModal();
  };

  const fetchTask = async () => {
    if (isFetchingRef.current) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/task?filter=team`);
      if (!response.ok) throw new Error("Error en api task");
      const data = await response.json();
      setTasks(data.tasks || []);

      if (selectedTask) {
        const updated = (data.tasks || []).find(
          (t) => t.id === selectedTask.id
        );
        if (updated) {
          setSelectedTask(updated);
        }
      }


      
      if (data.teamName) {
        setTeamName(data.teamName);
      }
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
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, state: newState } : task
      )
    );

    // Actualizar en la base de datos
    try {
      const response = await fetch(`/api/task/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: newState }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar la tarea");
      }

      // NO recargar aquí - el update optimista ya actualizó la UI
      // Realtime se encargará de sincronizar si hay cambios de otros usuarios
    } catch (error) {
      console.error("❌ Error al actualizar tarea:", error);
      // Revertir el cambio si falla
      setTasks(previousTasks);
      alert("Error al mover la tarea. Intenta de nuevo.");
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id);
    };

    fetchUser();
    fetchTask();
  }, []);

  useEffect(() => {
    const supabase = createClient();

    // Debounce timer
    let timeoutId;

    const channel = supabase
      .channel("task-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "task",
        },
        (payload) => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            fetchTask();
          }, 500);
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };
  }, []);

  // Filtrar las tareas según el filtro activo

  const filteredTasks =
    activeFilter === "my" && currentUserId
      ? tasks.filter((task) =>
          task.task_assignees?.some(
            (assignee) => assignee.profiles?.id === currentUserId
          )
        )
      : tasks;

  // Agrupar tareas por estado
  const tasksByState = {
    backlog: filteredTasks.filter((t) => t.state === "backlog"),
    en_progreso: filteredTasks.filter((t) => t.state === "en_progreso"),
    en_revision: filteredTasks.filter((t) => t.state === "en_revision"),
    finalizado: filteredTasks.filter((t) => t.state === "finalizado"),
  };

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
          <BtnMain
            text="Nueva tarea"
            size="lg"
            weight="semibold"
            onClick={handleOpenModal}
          />
        </div>
      </div>

      {/* Modal para crear tarea */}
      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onTaskCreated={handleTaskCreated}
      />

      <div className="kanba">
        {/* Botones de filtro */}
        <button
          className={`btn btn-primary px-10 py-3 rounded-2xl text-sm font-semibold mx-5 my-2 ${
            activeFilter === "my" ? "bg-gris text-crema" : "bg-verde text-black"
          }`}
          onClick={() => setActiveFilter("my")}
        >
          Mis tareas
        </button>

        <button
          className={`btn btn-primary px-10 py-3 rounded-2xl text-sm font-semibold ${
            activeFilter === "team"
              ? "bg-gris text-crema"
              : "bg-verde text-black"
          }`}
          onClick={() => setActiveFilter("team")}
        >
          Tareas team
        </button>

        {/* KANBAN BOARD */}
        <div className="container w-full">
          <DndContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-4 gap-6 mt-20">
              {/* COLUMNA BACKLOG */}
              <Column id="backlog" title="Backlog" color="#4D6BA8">
                {tasksByState.backlog.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onTaskUpdate={fetchTask}
                    onOpenDetail={handleOpenDetail}
                  />
                ))}
              </Column>

              {/* COLUMNA EN PROGRESO */}
              <Column id="en_progreso" title="En curso" color="#17CF3F">
                {tasksByState.en_progreso.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onTaskUpdate={fetchTask}
                    onOpenDetail={handleOpenDetail}
                  />
                ))}
              </Column>

              {/* COLUMNA EN REVISIÓN */}
              <Column id="en_revision" title="En revisión" color="#F20D11">
                {tasksByState.en_revision.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onTaskUpdate={fetchTask}
                    onOpenDetail={handleOpenDetail}
                  />
                ))}
              </Column>

              {/* COLUMNA FINALIZADO */}
              <Column id="finalizado" title="Finalizado" color="#C7EF4D">
                {tasksByState.finalizado.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onTaskUpdate={fetchTask}
                    onOpenDetail={handleOpenDetail}
                  />
                ))}
              </Column>
            </div>
          </DndContext>
        </div>
        {selectedTask && (
          <ShowMore
            isOpen={isDetailModalOpen}
            onClose={handleCloseDetail}
            task={selectedTask}
            onTaskUpdate={fetchTask}
          />
        )}
      </div>
    </div>
  );
}
