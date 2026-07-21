// Tầng gọi API cho màn nhật ký thao tác.
import api from '../../../shared/services/axios.js';

const AUDIT_LOG_URL = '/audit-logs';

export async function getAuditLogs({ action, targetType } = {}) {
  const res = await api.get(AUDIT_LOG_URL, {
    params: {
      action: action && action !== 'ALL' ? action : undefined,
      targetType: targetType && targetType !== 'ALL' ? targetType : undefined,
    },
  });
  return res.data;
}
