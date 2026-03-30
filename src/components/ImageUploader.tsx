/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/ImageUploader.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { Camera, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import api from "@/src/lib/api";

interface ImageUploaderProps {
  currentImageUrl?: string | null;
  entityName: string;
  uploadEndpoint: string;
  deleteEndpoint?: string;           // ← Novo: endpoint para deletar
  onUploadSuccess?: (url: string) => void;
  onRemove?: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function ImageUploader({
  currentImageUrl = null,
  entityName,
  uploadEndpoint,
  deleteEndpoint,
  onUploadSuccess,
  onRemove,
  size = "md",
  className = "",
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Sincroniza preview com a prop do servidor
  useEffect(() => {
    setPreview(currentImageUrl);
  }, [currentImageUrl]);

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

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post(uploadEndpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newUrl = res.data.url || res.data.secure_url || res.data.fotoUrl || res.data.logoUrl;

      if (newUrl) {
        setPreview(newUrl);
        onUploadSuccess?.(newUrl);
        toast.success("Imagem enviada com sucesso!");
      }
    } catch (err: any) {
      console.error("Erro no upload:", err);
      toast.error("Erro ao enviar imagem", {
        description: err.response?.data?.error || "Tente novamente",
      });
      setPreview(currentImageUrl);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

const handleRemove = async () => {
  if (!currentImageUrl) return;

  setDeleting(true);

  try {
    // Extrai o public_id do URL do Cloudinary
    // Exemplo de URL: https://res.cloudinary.com/demo/image/upload/v1234567890/edupay/escolinha/arquivo.jpg
    const publicIdMatch = currentImageUrl.match(/\/v\d+\/(.+?)\./);
    const publicId = publicIdMatch ? publicIdMatch[1] : null;

    if (deleteEndpoint && publicId) {
      await api.delete(deleteEndpoint, {
        data: { publicId },   // envia o publicId para o backend deletar
      });
    } else if (deleteEndpoint) {
      // Fallback: só limpa a URL no banco
      await api.delete(deleteEndpoint);
    }

    setPreview(null);
    onRemove?.();
    toast.success("Imagem removida com sucesso!");
  } catch (err: any) {
    console.error("Erro ao remover imagem:", err);
    toast.error("Erro ao remover imagem", {
      description: err.response?.data?.error || "Tente novamente",
    });
  } finally {
    setDeleting(false);
  }
};

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`} suppressHydrationWarning>
      <Avatar className={`${avatarSize} ring-4 ring-blue-100`} suppressHydrationWarning>
        <AvatarImage src={preview || undefined} />
        <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white font-bold">
          {entityName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?"}
        </AvatarFallback>
      </Avatar>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || deleting}
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
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            {deleting ? "Removendo..." : "Remover"}
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

export default ImageUploader;