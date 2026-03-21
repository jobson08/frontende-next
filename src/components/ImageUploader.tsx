/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Input } from "@/src/components/ui/input";
import api from "@/src/lib/api";

interface ImageUploaderProps {
  currentImageUrl?: string | null;
  entityName: string;           // "Aluno Futebol", "Escolinha", etc. (só para fallback)
  onUploadSuccess?: (url: string) => void;
  onRemove?: () => void;
  size?: "sm" | "md" | "lg";    // tamanho do avatar
  className?: string;
  uploadEndpoint: string;       // ex: "/tenant/aluno-futebol/foto", "/tenant/escolinha/logo"
  id?: string;                  // id da entidade (opcional, se for update)
}

export function ImageUploader({
  currentImageUrl,
  entityName,
  onUploadSuccess,
  onRemove,
  size = "md",
  className = "",
  uploadEndpoint,
  id,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [uploading, setUploading] = useState(false);

  const avatarSize = {
    sm: "h-16 w-16 text-xl",
    md: "h-32 w-32 text-3xl",
    lg: "h-40 w-40 text-4xl",
  }[size];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione apenas imagens");
      return;
    }

    // Preview imediato
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload real
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (id) formData.append("id", id); // se for update

      const res = await api.post(uploadEndpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newUrl = res.data.url || res.data.fotoUrl || res.data.logoUrl || res.data.bannerUrl;
      setPreview(newUrl);
      onUploadSuccess?.(newUrl);
      toast.success("Imagem atualizada com sucesso!");
    } catch (err: any) {
      toast.error("Erro ao fazer upload da imagem", {
        description: err.response?.data?.error || "Tente novamente",
      });
      setPreview(currentImageUrl || null); // reverte preview
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onRemove?.();
    toast.info("Imagem removida (salve para confirmar)");
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <Avatar className={`${avatarSize} ring-4 ring-blue-100`}>
        <AvatarImage src={preview || undefined} />
        <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white font-bold">
          {entityName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?"}
        </AvatarFallback>
      </Avatar>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Camera className="mr-2 h-4 w-4" />
          )}
          {uploading ? "Enviando..." : "Escolher foto"}
        </Button>

        {preview && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemove}
            disabled={uploading}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remover
          </Button>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}