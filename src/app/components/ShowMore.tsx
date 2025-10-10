"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tag, Plus, X } from "lucide-react";
import { BtnMain } from "./Uitools";

interface ShowMoreProps {
  isOpen: boolean;
  onClose: () => void;
  task: any;
  onTaskUpdate?: () => void; // Callback para actualizar la tarea
}

export default function ShowMore({
  isOpen,
  onClose,
  task,
  onTaskUpdate,
}: ShowMoreProps) {
  const [showAssignSelector, setShowAssignSelector] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [points, setPoints] = useState<number>(0);
  const [assigning, setAssigning] = useState(false);

  // Estados para el diálogo de confirmación
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [userToRemove, setUserToRemove] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [removing, setRemoving] = useState(false);

  // Estados para los comentarios
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [lastAssignedPoints, setLastAssignedPoints] = useState<number | null>(
    null
  );
  if (!task) return null;

  // Estados Tabs
  const [activeTab, setActiveTab] = useState<
    "subtareas" | "adjuntos" | "comentarios"
  >("subtareas");

  // Configuración de colores y textos por estado
  const stateConfig: Record<string, { bg: string; text: string }> = {
    backlog: { bg: "bg-backlog/50", text: "Backlog" },
    en_progreso: { bg: "bg-en_progreso/50", text: "En curso" },
    en_revision: { bg: "bg-en_revision/50", text: "En revisión" },
    finalizado: { bg: "bg-finalizado/50", text: "Finalizado" },
  };

  // UseEffect para cargar comentarios al abrir el modal
  useEffect(() => {
    if (isOpen && activeTab === "comentarios" && comments.length === 0) {
      fetchComments();
    }
  }, [isOpen, activeTab]);

  const currentState = stateConfig[task.state] || stateConfig.backlog;

  const lastAssignee = task.task_assignees.length - 1;
  const avatarUrl = task.task_assignees[lastAssignee]?.profiles.avatar_url;

  

  // Fetch team members when assign selector is opened
  const fetchTeamMembers = async () => {
    console.log("🚀 fetchTeamMembers iniciado");
    console.log("🆔 task.teamid:", task.teamid);

    if (!task.teamid) {
      console.log("❌ No hay teamid, abortando");
      return;
    }

    setLoadingMembers(true);
    try {
      const url = `/api/team/${task.teamid}/members`;
      console.log("📡 Fetching:", url);

      const response = await fetch(url);
      console.log("📬 Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Data recibida:", data);

        // Mostrar TODOS los miembros (incluyendo los ya asignados)
        setTeamMembers(data.members);
        console.log("✅ Todos los miembros:", data.members);
      } else {
        const errorData = await response.json();
        console.error("❌ Error en response:", errorData);
      }
    } catch (error) {
      console.error("❌ Error fetching team members:", error);
    } finally {
      setLoadingMembers(false);
      console.log("🏁 fetchTeamMembers finalizado");
    }
  };

  const handleAssignUser = async () => {
    if (!selectedUser || points < 0) return;

    setAssigning(true);
    try {
      const response = await fetch(`/api/task/${task.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser, points }),
      });

      if (response.ok) {
        // Cerrar el selector y resetear
        setShowAssignSelector(false);
        setSelectedUser("");
        setPoints(0);

        setLastAssignedPoints(points);
        // Llamar al callback para actualizar la tarea (reactivo)
        if (onTaskUpdate) {
          onTaskUpdate();
        }
      } else {
        const error = await response.json();
        alert(error.error || "Error al asignar usuario");
      }
    } catch (error) {
      console.error("Error assigning user:", error);
      alert("Error al asignar usuario");
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveAssignee = async (userId: string, userName: string) => {
    // Abrir el diálogo de confirmación
    setUserToRemove({ id: userId, name: userName });
    setShowConfirmDialog(true);
  };

  const confirmRemoveAssignee = async () => {
    if (!userToRemove) return;

    setRemoving(true);
    try {
      const response = await fetch(
        `/api/task/${task.id}/assign?userId=${userToRemove.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setShowConfirmDialog(false);
        setUserToRemove(null);

        // Llamar al callback para actualizar la tarea (reactivo)
        if (onTaskUpdate) {
          onTaskUpdate();
        }
      } else {
        const error = await response.json();
        alert(error.error || "Error al desasignar usuario");
      }
    } catch (error) {
      console.error("Error removing assignee:", error);
      alert("Error al desasignar usuario");
    } finally {
      setRemoving(false);
    }
  };

  const cancelRemoveAssignee = () => {
    setShowConfirmDialog(false);
    setUserToRemove(null);
  };

  // handle para comentarios
  const fetchComments = async () => {
    if (!task?.id) return;

    setIsLoadingComments(true);
    try {
      const response = await fetch(`/api/task/${task.id}/comments`);
      const datacomment = await response.json();

      if (response.ok) {
        setComments(datacomment.comments || []);
      } else {
        console.log("Error al cargar comentarios", datacomment.error);
      }
    } catch (error) {
      console.error("Error al cargar comentarios", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  // hanfle para guardar comentarios

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const response = await fetch(`/api/task/${task.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newComment }),
      });

      if (response.ok) {
        setNewComment("");
        fetchComments();
      } else {
        const error = await response.json();
        alert(error.error || "Error al agregar comentario");
      }
    } catch (error) {
      console.error("Error al agregar comentario:", error);
      alert("Error al agregar comentario");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    < >
      <Dialog open={isOpen} onOpenChange={onClose} >
        <DialogContent
          className="bg-[#6C6C6C] !px-14 border-none !max-w-[1200px] w-[95vw] max-h-[70vh] h-full flex flex-col"
          aria-describedby="task-details-description"
        >
          <DialogHeader>
            <DialogTitle className="text-white font-light text-lg">
              Detalles de tarea
            </DialogTitle>
          </DialogHeader>

          {/* NUEVO: wrapper scrollable */}
          <div className="overflow-y-auto flex-1 scrollbar-thin pr-20 -mr-25">
            <div id="task-details-description" className="grid grid-cols-2 gap-20 h-full">
              
              {/* Columna Izquierda */}
              <div className="space-y-4 flex flex-col ">
                {/* Categoría Badge */}
                <div className="category flex items-center gap-1 mb-1">
                  <Tag className="text-gray-400" height={18} />
                  <span className="text-sm text-gray-300 rounded-2xl w-40 ">
                    {task.category}
                  </span>
                </div>

                {/* Título */}
                <h2 className="text-verde text-3xl font-bold">{task.title}</h2>

                {/* Estatus */}
                <div className="flex flex-row space-between gap-10">
                  <div>
                    <label className="text-crema text-sm">Estatus</label>
                    <div className="mt-1">
                      <span
                        className={`text-white font-medium text-sm px-3 py-1 rounded-2xl ${currentState.bg}`}
                      >
                        {currentState.text}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-crema text-sm">Fecha de inicio:</label>
                    <p className="text-verde">
                      {new Date(task.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Prioridad */}
                  <div>
                    <label className="text-crema text-sm">Prioridad</label>
                    <p className="text-verde capitalize">
                      {task.priority || "Media"}
                    </p>
                  </div>
                </div>
                <hr className="mx-2 border-gray-400" />
                {/* Asignado a */}
                <div className="mt-10">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-crema text-sm">Asignado a:</label>
                    <button
                      type="button"
                      onPointerDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        setShowAssignSelector(!showAssignSelector);
                        if (!showAssignSelector) {
                          console.log("📥 Llamando fetchTeamMembers...");
                          fetchTeamMembers();
                        }
                      }}
                      className="text-verde hover:text-verde/80 flex items-center gap-1 text-sm cursor-pointer"
                    >
                      <Plus size={16} />
                      Asignar
                    </button>
                  </div>

                  {/* Selector de miembros */}
                  {showAssignSelector && (
                    <div className="bg-gris rounded-lg p-4 mb-3">
                      <div className="space-y-3">
                        <div>
                          <label className="text-crema text-xs">
                            Seleccionar miembro
                          </label>
                          <select
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            className="w-full bg-[#6C6C6C] text-crema rounded px-3 py-2 mt-1"
                            disabled={loadingMembers}
                          >
                            <option value="">
                              {loadingMembers
                                ? "Cargando..."
                                : "Seleccionar usuario"}
                            </option>
                            {teamMembers.map((member) => {
                              const assignment = task.task_assignees?.find(
                                (a: any) => a.profiles?.id === member.id
                              );

                              const userPoints = assignment?.points || 0;

                              const isAssigned = !!assignment;

                              return (
                                <option key={member.id} value={member.id}>
                                  {member.username || member.email}
                                 
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        <div>
                          <label className="text-crema text-xs">
                            {selectedUser &&
                            task.task_assignees?.find(
                              (a: any) => a.profiles?.id === selectedUser
                            )
                              ? "Puntos a AÑADIR (se sumarán a los actuales)"
                              : "Puntos a asignar"}
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={points}
                            onChange={(e) => setPoints(Number(e.target.value))}
                            className="w-full bg-[#6C6C6C] text-crema rounded px-3 py-2 mt-1"
                            placeholder="0"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onPointerDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleAssignUser();
                            }}
                            disabled={!selectedUser || assigning}
                            className="bg-verde text-black px-4 py-2 rounded font-semibold hover:bg-verde/80 disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                          >
                            {assigning ? "Asignando..." : "Confirmar"}
                          </button>
                          <button
                            type="button"
                            onPointerDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setShowAssignSelector(false);
                              setSelectedUser("");
                              setPoints(0);
                            }}
                            className="bg-gris text-crema px-4 py-2 rounded hover:bg-gris/80"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Lista de usuarios asignados */}
                  <div className="mt-2 space-y-2">
                    {task.task_assignees && task.task_assignees.length > 0 ? (
                      task.task_assignees.map((assignee: any, index: number) => {
                        const profile = assignee.profiles;
                        if (!profile) return null;

                        const initials = (
                          profile.username ||
                          profile.email ||
                          "??"
                        )
                          .substring(0, 2)
                          .toUpperCase();

                        return (
                          <div
                            key={index}
                            className="flex items-center  justify-between bg-gris rounded-lg px-3 py-2"
                          >
                            <div className="flex items-center gap-2">
                              {profile.avatar_url ? (
                                <img
                                  src={profile.avatar_url}
                                  alt={profile.username}
                                  className="w-8 h-8 rounded-full"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">
                                    {initials}
                                  </span>
                                </div>
                              )}
                              <span className="text-verde">
                                {profile.username || profile.email}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-crema text-sm">
                                {lastAssignedPoints|| 0} pts
                              </span>
                              <button
                                type="button"
                                onPointerDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleRemoveAssignee(
                                    profile.id,
                                    profile.username || profile.email || "Usuario"
                                  );
                                }}
                                className="text-red-400 hover:text-red-300 cursor-pointer"
                                title="Desasignar"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-gray-400 text-sm">Sin asignar</p>
                    )}
                  </div>
                </div>

                {/* Fecha de inicio */}

                {/* Puntos asignados y totales */}
                
                <div className="grid grid-cols-2 gap-4 mt-20">
                  
                  <div>
                    
                    <label className="text-crema text-sm">
                      Ultima asignacion
                    </label>
                    <p className="text-verde text-2xl font-bold">
                      {lastAssignedPoints}
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={
                         
                            "Avatar"
                          }
                          className="inline-block ml-2 w-6 h-6 rounded-full object-cover"
                        />
                      ) : null}
                    </p>
                  </div>
                  <div>
                    <label className="text-crema text-sm">Puntos Totales</label>
                    <p className="text-verde text-2xl font-bold">
                      {task.puntosTotal || 0}
                    </p>
                  </div>
                </div>

                {/* Actividad (placeholder) */}
                <div>
                  <h3 className="text-verde font-semibold mb-2">Actividad</h3>
                  <div className="space-y-2 text-sm text-crema">
                    <p>
                      Creado el {new Date(task.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Columna Derecha */}
              <div className="space-y-6  flex flex-col h-full ">
                {/* Descripción */}
                <div>
                  <h3 className="text-verde font-semibold mb-2">
                    Descripción de la tarea
                  </h3>
                  <div className="bg-gris rounded-lg p-4">
                    <p
                      className="text-crema text-sm whitespace-pre-wrap "
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 10,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        wordBreak: "break-all",
                      }}
                    >
                      {task.description}
                    </p>
                  </div>
                </div>

                {/* Tabs: Subtareas, Adjuntos, Comentarios */}
                <div>
                  <div className="flex gap-4 border-b border-gray-600 mb-4">
                    <button
                      onClick={() => setActiveTab("subtareas")}
                      className={`pb-2 border-b-2 font-semibold ${
                        activeTab === "subtareas"
                          ? "text-verde border-verde"
                          : "text-gray-400 border-transparent"
                      }`}
                    >
                      Subtareas
                    </button>
                    <button
                      onClick={() => setActiveTab("adjuntos")}
                      className={`pb-2 border-b-2 ${
                        activeTab === "adjuntos"
                          ? "text-verde border-verde"
                          : "text-gray-400 border-transparent"
                      }`}
                    >
                      Adjuntos
                    </button>
                    <button
                      onClick={() => setActiveTab("comentarios")}
                      className={`pb-2 border-b-2 ${
                        activeTab === "comentarios"
                          ? "text-verde border-verde"
                          : "text-gray-400 border-transparent"
                      }`}
                    >
                      Comentarios
                    </button>
                  </div>

                  {/* Contenido de cada tab */}
                  {activeTab === "subtareas" && (
                    <div className="space-y-2">
                      <p className="text-crema text-sm">No hay subtareas aún</p>
                    </div>
                  )}

                  {activeTab === "adjuntos" && (
                    <div className="space-y-2">
                      <p className="text-crema text-sm">No hay adjuntos aún</p>
                    </div>
                  )}

                  {activeTab === "comentarios" && (
                    <div className="space-y-4">
                      {/* Formulario para nuevo comentario */}
                      <div className="bg-gris rounded-lg p-4">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Escribe un comentario..."
                          className="w-full bg-[#6C6C6C] text-crema rounded px-3 py-2 min-h-[80px] resize-none"
                          disabled={isSubmittingComment}
                        />
                        <button
                          type="button"
                          onPointerDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddComment();
                          }}
                          disabled={!newComment.trim() || isSubmittingComment}
                          className="mt-2 bg-verde text-black px-4 py-2 rounded font-semibold hover:bg-verde/80 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmittingComment ? "Enviando..." : "Comentar"}
                        </button>
                      </div>

                      {/* Lista de comentarios */}
                      <div className="space-y-3">
                        {isLoadingComments ? (
                          <p className="text-crema text-sm">
                            Cargando comentarios...
                          </p>
                        ) : comments.length > 0 ? (
                          comments.map((comment) => (
                            <div
                              key={comment.id}
                              className="bg-gris rounded-lg p-3"
                            >
                              <div className="flex items-start gap-2">
                                {comment.profiles?.avatar_url ? (
                                  <img
                                    src={comment.profiles.avatar_url}
                                    alt={
                                      comment.profiles?.username ||
                                      comment.profiles?.email
                                    }
                                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-xs font-bold">
                                      {(
                                        comment.profiles?.username ||
                                        comment.profiles?.email ||
                                        "??"
                                      )
                                        .substring(0, 2)
                                        .toUpperCase()}
                                    </span>
                                  </div>
                                )}

                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-verde text-sm font-semibold">
                                      {comment.profiles?.username ||
                                        comment.profiles?.email}
                                    </span>
                                    <span className="text-gray-400 text-xs">
                                      {new Date(
                                        comment.created_at
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-crema text-sm">
                                    {comment.text}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-crema text-sm">
                            No hay comentarios aún
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Created by */}
                <div className="flex flex-col align-content-end mt-auto">
                  <label className="text-crema text-sm">Tarea creada por: </label>
                  <div className="mt-2 flex items-center gap-2">
                    {task.createdby ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={task.createdby.avatar_url}
                          alt={
                            task.createdby?.username ||
                            task.createdby?.email ||
                            "Avatar"
                          }
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                        <span className="text-crema text-sm  font-light">
                        {task.createdby?.username ||
                          task.createdby?.email ||
                          "??"}{" "}
                          </span>
                      </div>
                    ) : (
                      null
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación para desasignar */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent
          className="bg-[#6C6C6C] border-none max-w-md"
          aria-describedby="confirm-remove-description"
        >
          <DialogHeader>
            <DialogTitle className="text-white text-xl">
              ¿Estás seguro de desasignar este usuario?
            </DialogTitle>
          </DialogHeader>

          <div id="confirm-remove-description" className="space-y-4">
            <p className="text-crema">
              Estás a punto de desasignar a{" "}
              <span className="text-verde font-semibold">
                {userToRemove?.name}
              </span>{" "}
              de esta tarea.
            </p>
            <p className="text-crema text-sm">
              Los puntos asignados se restarán del contador de "Puntos
              asignados", pero se mantendrán en "Puntos Totales".
            </p>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  confirmRemoveAssignee();
                }}
                disabled={removing}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {removing ? "Desasignando..." : "Sí, desasignar"}
              </button>
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  cancelRemoveAssignee();
                }}
                disabled={removing}
                className="flex-1 bg-gris hover:bg-gris/80 text-crema px-4 py-2 rounded font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
