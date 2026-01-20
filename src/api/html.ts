import { useQuery, useMutation } from '@tanstack/react-query';

const API_BASE = 'http://localhost:3000';

export interface HtmlFile {
  filename: string;
  content?: string;
}

export const fetchFiles = async (): Promise<string[]> => {
  const res = await fetch(`${API_BASE}/files`);
  if (!res.ok) throw new Error('Failed to fetch files');
  return res.json();
};

export const fetchFile = async (filename?: string): Promise<HtmlFile> => {
  if (!filename) {
    throw Error("Please provide a file name")
  }
  const res = await fetch(`${API_BASE}/files/${filename}`);
  if (!res.ok) throw new Error('Failed to fetch file');
  const content = await res.text();
  return { filename, content };
};

export const createFileFetcher = async ({ filename, content }: HtmlFile) => {
  const res = await fetch(`${API_BASE}/files`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, content }),
  });
  if (!res.ok) throw new Error('Failed to create file');
  return res.json();
};

export const updateFileFetcher = async ({ filename, content }: HtmlFile) => {
  const res = await fetch(`${API_BASE}/files/${filename}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error('Failed to update file');
  return res.json();
};


export const useFiles = () => {
  return useQuery<string[]>({ queryKey: ['files'], queryFn: fetchFiles });
};

export const useFile = (filename?: string) => {
  return useQuery<HtmlFile>(
    {
      queryKey: ['file', filename],
      queryFn: () => fetchFile(filename),
      enabled: !!filename

    }
  );
};

export const useCreateFile = () => {
  return useMutation({
    mutationFn: (payload: HtmlFile) => createFileFetcher(payload),
  });
};

export const useUpdateFile = () => {
  return useMutation({
    mutationFn: (payload: HtmlFile) => updateFileFetcher(payload)
  });
};
