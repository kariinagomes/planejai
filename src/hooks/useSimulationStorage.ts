import { useCallback } from 'react';

import { type SimulationFormData, type SimulationRecord } from '@/data/simulation';

const LOCAL_STORAGE_KEY = 'simulation-data';

export const useSimulationStorage = () => {
  const saveFormData = (formData: SimulationFormData) => {
    const id = crypto.randomUUID();
    const record: SimulationRecord = { ...formData, id, createdAt: new Date().toISOString() };

    const storage = localStorage.getItem(LOCAL_STORAGE_KEY);
    const savedData = storage ? (JSON.parse(storage) as SimulationRecord[]) : [];

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...savedData, record]));

    return id;
  };

  const getFormData = useCallback((id: string) => {
    const storage = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!storage) return null;
    const savedData = JSON.parse(storage) as SimulationRecord[];
    return savedData.find((record) => record.id === id) || null;
  }, []);

  const updateSimulation = useCallback((id: string, data: SimulationRecord) => {
    const storage = localStorage.getItem(LOCAL_STORAGE_KEY);
    const savedData = storage ? (JSON.parse(storage) as SimulationRecord[]) : [];

    const updated = savedData.map((record) => (record.id === id ? { ...data } : record));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const getAllFormData = () => {
    const storage = localStorage.getItem(LOCAL_STORAGE_KEY);
    return storage ? (JSON.parse(storage) as SimulationRecord[]) : [];
  };

  const deleteSimulation = (id: string) => {
    const storage = localStorage.getItem(LOCAL_STORAGE_KEY);
    const savedData = storage ? (JSON.parse(storage) as SimulationRecord[]) : [];
    const updated = savedData.filter((record) => record.id !== id);

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  };

  return { saveFormData, getFormData, getAllFormData, updateSimulation, deleteSimulation };
};
