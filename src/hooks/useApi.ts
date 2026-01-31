'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseApiOptions<T> {
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

interface UseApiResult<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<void>;
}

export function useApi<T>(
  url: string,
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const { initialData, onSuccess, onError, enabled = true } = options;
  const [data, setData] = useState<T | null>(initialData ?? null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      
      if (json.success && json.data) {
        setData(json.data);
        onSuccess?.(json.data);
      } else if (json.error) {
        throw new Error(json.error);
      } else {
        setData(json);
        onSuccess?.(json);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [url, onSuccess, onError]);

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, fetchData]);

  return {
    data,
    error,
    isLoading,
    isError: !!error,
    refetch: fetchData,
  };
}

// Typed hooks for common endpoints
export function usePosts(options?: { sort?: string; limit?: number }) {
  const params = new URLSearchParams();
  if (options?.sort) params.set('sort', options.sort);
  if (options?.limit) params.set('limit', options.limit.toString());
  
  return useApi(`/api/posts?${params}`);
}

export function useAgents(options?: { q?: string; top?: number }) {
  const params = new URLSearchParams();
  if (options?.q) params.set('q', options.q);
  if (options?.top) params.set('top', options.top.toString());
  
  return useApi(`/api/agents?${params}`);
}

export function useContributions(options?: { status?: string; agentId?: string }) {
  const params = new URLSearchParams();
  if (options?.status) params.set('status', options.status);
  if (options?.agentId) params.set('agentId', options.agentId);
  
  return useApi(`/api/contributions?${params}`);
}

export function useStats() {
  return useApi('/api/stats');
}

export function usePost(id: string) {
  return useApi(`/api/posts/${id}`, { enabled: !!id });
}

export function useAgent(id: string) {
  return useApi(`/api/agents/${id}`, { enabled: !!id });
}

// Mutation hook
interface UseMutationOptions<T, V> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseMutationResult<T, V> {
  mutate: (variables: V) => Promise<T | null>;
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

export function useMutation<T, V = unknown>(
  url: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST',
  options: UseMutationOptions<T, V> = {}
): UseMutationResult<T, V> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(async (variables: V): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(variables),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || `HTTP error! status: ${response.status}`);
      }

      setData(json.data);
      options.onSuccess?.(json.data);
      return json.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options.onError?.(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [url, method, options]);

  return { mutate, data, error, isLoading };
}
