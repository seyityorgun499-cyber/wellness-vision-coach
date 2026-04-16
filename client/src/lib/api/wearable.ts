/**
 * Myora – Wearable API (Giyilebilir Cihazlar)
 */

import { getCurrentSupabaseUserId, supabase } from './_common';
import type { WearableDevice, UserDevice, DeviceConnectData, WearableDataEntry, WearableSyncData } from './types';

function toCamelWearableDevice(row: any): WearableDevice {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    type: row.type,
    supportedMetrics: row.supported_metrics ?? [],
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
  } as WearableDevice;
}

function toCamelUserDevice(row: any): UserDevice {
  return {
    id: row.id,
    userId: row.user_id,
    deviceId: row.device_id,
    deviceName: row.device_name ?? null,
    isConnected: row.is_connected ?? true,
    lastSync: row.last_sync ?? null,
    device: row.wearable_devices ? toCamelWearableDevice(row.wearable_devices) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as UserDevice;
}

function toCamelWearableDataEntry(row: any): WearableDataEntry {
  return {
    id: row.id,
    userId: row.user_id,
    deviceId: row.device_id,
    metricType: row.metric_type,
    value: row.value != null ? String(row.value) : '0',
    unit: row.unit,
    recordedAt: row.recorded_at,
    syncedAt: row.synced_at,
    createdAt: row.created_at,
  } as WearableDataEntry;
}

export const wearableAPI = {
  /** Desteklenen tüm cihazları listele */
  getDevices: async (): Promise<WearableDevice[]> => {
    const { data, error } = await supabase
      .from('wearable_devices')
      .select('*')
      .eq('is_active', true)
      .order('brand', { ascending: true })
      .order('name', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(toCamelWearableDevice);
  },

  /** Kullanıcının bağlı cihazlarını listele */
  getUserDevices: async (): Promise<UserDevice[]> => {
    const userId = await getCurrentSupabaseUserId();
    const { data, error } = await supabase
      .from('user_devices')
      .select('*, wearable_devices(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toCamelUserDevice);
  },

  /** Yeni cihaz bağla */
  connectDevice: async (data: DeviceConnectData): Promise<UserDevice> => {
    const userId = await getCurrentSupabaseUserId();
    const { data: inserted, error } = await supabase
      .from('user_devices')
      .insert({ user_id: userId, device_id: data.deviceId, device_name: data.deviceName ?? null, is_connected: true })
      .select('*, wearable_devices(*)')
      .single();
    if (error) throw error;
    return toCamelUserDevice(inserted);
  },

  /** Cihaz bağlantı durumunu güncelle */
  setDeviceConnection: async (id: string, isConnected: boolean): Promise<UserDevice> => {
    const { data, error } = await supabase
      .from('user_devices')
      .update({ is_connected: isConnected, last_sync: isConnected ? new Date().toISOString() : null })
      .eq('id', id)
      .select('*, wearable_devices(*)')
      .single();
    if (error) throw error;
    return toCamelUserDevice(data);
  },

  /** Cihaz bağlantısını kes */
  disconnectDevice: async (id: string) => {
    const { error } = await supabase.from('user_devices').delete().eq('id', id);
    if (error) throw error;
  },

  /** Senkronize edilmiş verileri getir */
  getData: async (): Promise<WearableDataEntry[]> => {
    const userId = await getCurrentSupabaseUserId();
    const { data, error } = await supabase
      .from('wearable_data')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toCamelWearableDataEntry);
  },

  /** Cihazdan yeni veri senkronize et */
  syncData: async (data: WearableSyncData): Promise<WearableDataEntry> => {
    const userId = await getCurrentSupabaseUserId();
    const { data: device } = await supabase.from('user_devices').select('device_id').eq('id', data.deviceId).maybeSingle();
    const targetDeviceId = device?.device_id ?? data.deviceId;

    const { data: inserted, error } = await supabase
      .from('wearable_data')
      .insert({ user_id: userId, device_id: targetDeviceId, metric_type: data.metricType, value: data.value, unit: data.unit, recorded_at: data.recordedAt })
      .select('*')
      .single();
    if (error) throw error;
    return toCamelWearableDataEntry(inserted);
  },
};
