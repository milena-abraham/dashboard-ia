import { getFirestore } from 'firebase/firestore';
import { app, auth } from './firebaseAuth';

export const db = getFirestore(app);
export { app, auth };
export default app;
