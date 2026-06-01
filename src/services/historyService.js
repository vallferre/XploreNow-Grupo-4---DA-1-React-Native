import api from './authService';

const HISTORY_ENDPOINT = '/history';

const normalizeHistoryEntry = (item, index) => ({
  id: String(
    item?.id ??
    item?.command_id ??
    item?.timestamp ??
    item?.created_at ??
    `${item?.action || item?.command || 'command'}-${index}`
  ),
  action: item?.action ?? item?.command ?? item?.name ?? 'Comando',
  success: Boolean(item?.success ?? item?.ok ?? item?.status === 'success'),
  timestamp: item?.timestamp ?? item?.created_at ?? item?.executed_at ?? null,
});

export const getCommandHistory = async () => {
  const response = await api.get(HISTORY_ENDPOINT);
  const payload = response.data;
  const history = Array.isArray(payload)
    ? payload
    : payload?.history ?? payload?.commands ?? payload?.items ?? [];

  return history.map(normalizeHistoryEntry);
};

