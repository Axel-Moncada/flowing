"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Description } from "@radix-ui/react-dialog";
import { title } from "process";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  onTaskCreated,
}: CreateTaskModalProps) {
  // Obtener la fecha de hoy en formato YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    priority: "media",
    description: "",
    startDate: today,
    descriptiontask: "",
    attachments: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          priority: formData.priority,
          description: formData.description,
          startDate: formData.startDate,
          descriptiontask: formData.descriptiontask,
          attachments: formData.attachments,
          state: "backlog",
        }),

        
      });

      if (!response.ok) {
        throw new Error("Error al crear la tarea");
      }

      const newTask = await response.json();
      onTaskCreated();
      onClose();
      setFormData({
        title: "",
        category: "",
        priority: "media",
        description: "",
        startDate: today,
        descriptiontask: "",
        attachments: "",
      });
    } catch (error) {
      console.error("❌ Error al crear la tarea:", error);
      alert("Error al crear la tarea. Por favor, inténtalo de nuevo.");
    }

  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} >
      <DialogContent className="bg-[#6C6C6C] border-none  max-w-md">
        <DialogHeader>
          <DialogTitle className="text-verde text-xl">Tarea Nueva</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="text-verde text-sm block mb-2">Nombre</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-crema rounded-lg px-4 py-2 text-black"
              placeholder="Nombre de la tarea"
            />
          </div>

          {/* Categoría y Prioridad */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-verde text-sm block mb-2">Categoría</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-crema rounded-lg px-4 py-2 text-black"
              >
                <option value="">Seleccionar categoría</option>
                
                <optgroup label="🏦 Productos Financieros">
                  <option value="Captaciones">Captaciones</option>
                  <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                  <option value="Cupo Rotativo">Cupo Rotativo</option>
                  <option value="Libranza Cupo">Libranza Cupo</option>
                  <option value="Credioro">Credioro</option>
                  <option value="Seguros">Seguros</option>
                  <option value="Divisas">Divisas</option>
                  <option value="Convenios">Convenios</option>
                </optgroup>
                
                <optgroup label="🏢 Áreas Corporativas">
                  <option value="Presidencia">Presidencia</option>
                  <option value="Administrativo">Administrativo</option>
                  <option value="Financiero">Financiero</option>
                  <option value="Contabilidad">Contabilidad</option>
                  <option value="Tesorería">Tesorería</option>
                  <option value="Compras">Compras</option>
                  <option value="Cobranzas">Cobranzas</option>
                  <option value="Educación Financiera">Educación Financiera</option>
                </optgroup>
                
                <optgroup label="💻 Canales y Servicios">
                  <option value="Canales Digitales">Canales Digitales</option>
                  <option value="Correspondencia">Correspondencia</option>
                  <option value="Recaudos">Recaudos</option>
                  <option value="Western Union">Western Union</option>
                  
                </optgroup>
              </select>
            </div>

            <div>
              <label className="text-verde text-sm block mb-2">Prioridad</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full bg-crema rounded-lg px-4 py-2 text-black"
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>
          </div>

          {/* Fecha de inicio */}
          <div>
            <label className="text-verde text-sm block mb-2">Fecha de inicio</label>
            
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full bg-crema rounded-lg px-4 py-2 text-black"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="text-verde text-sm block mb-2">Descripción</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-crema rounded-lg px-4 py-2 text-black h-24 resize-none"
              placeholder="Describe la tarea..."
            />
          </div>

          {/* Adjuntos */}
          <div>
            <label className="text-verde text-sm block mb-2">Adjuntos</label>
            <textarea
              value={formData.attachments}
              onChange={(e) => setFormData({ ...formData, attachments: e.target.value })}
              className="w-full bg-crema rounded-lg px-4 py-2 text-black h-20 resize-none"
              placeholder="Links o referencias..."
            />
          </div>

          {/* Botón Crear */}
          <button
            type="submit"
            className="w-full bg-verde text-black font-bold py-3 rounded-lg hover:bg-gris hover:text-verde transition-colors"
          >
            + Crear tarea
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
