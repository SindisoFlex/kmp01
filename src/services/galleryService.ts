import { supabase } from "@/lib/supabase";
import type { GalleryCollection } from "@/utils/galleryUtils";

type UserGalleryRow = {
  id: string;
  user_id: string;
  booking_id: string | null;
  file_url: string;
  thumbnail_url: string | null;
  media_type: "image" | "video";
  created_at: string;
  visibility: "private" | "public";
};

const addMonthsIso = (dateValue: string, months: number): string => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  date.setMonth(date.getMonth() + months);
  return date.toISOString();
};

export const getUserGalleryCollections = async (userId: string): Promise<GalleryCollection[]> => {
  const { data, error } = await supabase
    .from("user_gallery")
    .select("id, user_id, booking_id, file_url, thumbnail_url, media_type, created_at, visibility")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const rows = (data ?? []) as UserGalleryRow[];

  return rows.map((row) => ({
    id: row.id,
    title: row.booking_id ? `Booking ${row.booking_id.slice(0, 8)}` : `Media ${row.id.slice(0, 8)}`,
    description: row.media_type === "video" ? "Video upload" : "Photo upload",
    date: row.created_at,
    serviceCategory: "event",
    thumbnailUrl: row.thumbnail_url || row.file_url,
    itemCount: 1,
    expirationDate: addMonthsIso(row.created_at, 24),
  }));
};
