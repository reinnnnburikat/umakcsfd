import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn('Supabase credentials not configured. File uploads will not work.');
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
  },
});

// Storage bucket names
export const STORAGE_BUCKETS = {
  DOCUMENTS: 'documents',
  CERTIFICATES: 'certificates',
  TEMPLATES: 'templates',
} as const;

// Upload file to Supabase Storage
export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Buffer,
  contentType?: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType: contentType || 'application/octet-stream',
        upsert: true,
      });

    if (error) {
      return { url: null, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { url: urlData.publicUrl, error: null };
  } catch (err) {
    return { url: null, error: 'Failed to upload file' };
  }
}

// Delete file from Supabase Storage
export async function deleteFile(
  bucket: string,
  path: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: 'Failed to delete file' };
  }
}
