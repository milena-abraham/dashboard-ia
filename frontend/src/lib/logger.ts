import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export type SystemEventType = 
  | 'app_start'
  | 'auth_login' 
  | 'auth_signup'
  | 'analysis_success'
  | 'analysis_error'
  | 'chat_session_started'
  | 'project_saved'
  | 'project_saved_auto';

export function logSystemEvent(type: SystemEventType, metadata: Record<string, any> = {}) {
  // Fire and forget
  addDoc(collection(db, 'system_logs'), {
    type,
    ...metadata,
    timestamp: serverTimestamp(),
  }).catch((err) => {
    // Silently ignore to not interrupt user flow
    console.warn('Could not log system event:', err.message);
  });
}
