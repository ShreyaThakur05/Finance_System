import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";

const BASE = "/api/v1/transactions";

const ANALYTICS_KEYS = ["summary", "recent", "monthly", "categories", "insights"];

export function useTransactions(params = {}) {
  return useQuery({
    queryKey: ["transactions", params],
    queryFn: () => api.get(BASE + "/", { params }).then((r) => r.data),
    keepPreviousData: true,
  });
}

export function useCreateTx() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post(BASE + "/", data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      ANALYTICS_KEYS.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
    },
  });
}

export function useUpdateTx() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`${BASE}/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      ANALYTICS_KEYS.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
    },
  });
}

export function useDeleteTx() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`${BASE}/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      ANALYTICS_KEYS.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
    },
  });
}
