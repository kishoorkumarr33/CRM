import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../config/firebase';
import {
  Customer,
  Lead,
  Deal,
  Task,
  Interaction,
  Employee,
  CRMNotification,
  UserProfile,
} from '../types/crm';
import {
  initialCustomers,
  initialLeads,
  initialDeals,
  initialTasks,
  initialInteractions,
  initialEmployees,
  initialNotifications,
} from './seedData';

// Helper to sanitize undefined values for Firestore
function sanitizeForFirestore<T extends object>(data: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

// ---------------- USER PROFILES & ROLES ----------------

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    if (auth.currentUser) {
      handleFirestoreError(error, OperationType.GET, path);
    }
    return null;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const path = `users/${profile.uid}`;
  try {
    await setDoc(doc(db, 'users', profile.uid), sanitizeForFirestore({
      ...profile,
      updatedAt: new Date().toISOString(),
    }), { merge: true });

    // If role is admin, record in admins collection for security rules check
    if (profile.role === 'admin') {
      await setDoc(doc(db, 'admins', profile.uid), {
        email: profile.email,
        assignedAt: new Date().toISOString(),
      }, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ---------------- SEED DATABASE ----------------

export async function seedInitialData(force = false): Promise<boolean> {
  try {
    const custSnap = await getDocs(collection(db, 'customers'));
    if (!custSnap.empty && !force) {
      return false; // Already seeded
    }

    const batch = writeBatch(db);

    // Seed Customers
    for (const item of initialCustomers) {
      batch.set(doc(db, 'customers', item.id), sanitizeForFirestore(item));
    }
    // Seed Leads
    for (const item of initialLeads) {
      batch.set(doc(db, 'leads', item.id), sanitizeForFirestore(item));
    }
    // Seed Deals
    for (const item of initialDeals) {
      batch.set(doc(db, 'deals', item.id), sanitizeForFirestore(item));
    }
    // Seed Tasks
    for (const item of initialTasks) {
      batch.set(doc(db, 'tasks', item.id), sanitizeForFirestore(item));
    }
    // Seed Interactions
    for (const item of initialInteractions) {
      batch.set(doc(db, 'interactions', item.id), sanitizeForFirestore(item));
    }
    // Seed Employees
    for (const item of initialEmployees) {
      batch.set(doc(db, 'employees', item.id), sanitizeForFirestore(item));
    }
    // Seed Notifications
    for (const item of initialNotifications) {
      batch.set(doc(db, 'notifications', item.id), sanitizeForFirestore(item));
    }

    await batch.commit();
    return true;
  } catch (err) {
    console.warn('Seeding warning:', err);
    return false;
  }
}

export async function clearAllCRMCollections(): Promise<boolean> {
  const collectionsToClear = ['customers', 'leads', 'deals', 'tasks', 'interactions', 'notifications'];
  try {
    for (const collName of collectionsToClear) {
      const snap = await getDocs(collection(db, collName));
      if (!snap.empty) {
        const batch = writeBatch(db);
        snap.forEach((docSnap) => {
          batch.delete(docSnap.ref);
        });
        await batch.commit();
      }
    }
    return true;
  } catch (err) {
    console.warn('Clear collections error:', err);
    return false;
  }
}

// ---------------- CUSTOMERS ----------------

export function subscribeCustomers(
  onData: (customers: Customer[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const path = 'customers';
  const q = query(collection(db, path));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Customer[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Customer);
      });
      // Sort by lastContactDate or createdDate descending
      list.sort((a, b) => (b.createdDate || '').localeCompare(a.createdDate || ''));
      onData(list);
    },
    (error) => {
      if (onError) onError(error);
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.GET, path);
      } else {
        console.warn(`Firestore subscription notice [${path}]:`, error);
      }
    }
  );
}

export async function createCustomer(customer: Customer): Promise<void> {
  const path = `customers/${customer.id}`;
  try {
    await setDoc(doc(db, 'customers', customer.id), sanitizeForFirestore({
      ...customer,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateCustomer(customer: Customer): Promise<void> {
  const path = `customers/${customer.id}`;
  try {
    await updateDoc(doc(db, 'customers', customer.id), sanitizeForFirestore({
      ...customer,
      updatedAt: new Date().toISOString(),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteCustomer(customerId: string): Promise<void> {
  const path = `customers/${customerId}`;
  try {
    await deleteDoc(doc(db, 'customers', customerId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ---------------- LEADS ----------------

export function subscribeLeads(
  onData: (leads: Lead[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const path = 'leads';
  const q = query(collection(db, path));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Lead[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Lead);
      });
      list.sort((a, b) => (b.createdDate || '').localeCompare(a.createdDate || ''));
      onData(list);
    },
    (error) => {
      if (onError) onError(error);
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.GET, path);
      } else {
        console.warn(`Firestore subscription notice [${path}]:`, error);
      }
    }
  );
}

export async function createLead(lead: Lead): Promise<void> {
  const path = `leads/${lead.id}`;
  try {
    await setDoc(doc(db, 'leads', lead.id), sanitizeForFirestore({
      ...lead,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateLead(lead: Lead): Promise<void> {
  const path = `leads/${lead.id}`;
  try {
    await updateDoc(doc(db, 'leads', lead.id), sanitizeForFirestore({
      ...lead,
      updatedAt: new Date().toISOString(),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteLead(leadId: string): Promise<void> {
  const path = `leads/${leadId}`;
  try {
    await deleteDoc(doc(db, 'leads', leadId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ---------------- DEALS ----------------

export function subscribeDeals(
  onData: (deals: Deal[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const path = 'deals';
  const q = query(collection(db, path));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Deal[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Deal);
      });
      list.sort((a, b) => (b.createdDate || '').localeCompare(a.createdDate || ''));
      onData(list);
    },
    (error) => {
      if (onError) onError(error);
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.GET, path);
      } else {
        console.warn(`Firestore subscription notice [${path}]:`, error);
      }
    }
  );
}

export async function createDeal(deal: Deal): Promise<void> {
  const path = `deals/${deal.id}`;
  try {
    await setDoc(doc(db, 'deals', deal.id), sanitizeForFirestore({
      ...deal,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateDeal(deal: Deal): Promise<void> {
  const path = `deals/${deal.id}`;
  try {
    await updateDoc(doc(db, 'deals', deal.id), sanitizeForFirestore({
      ...deal,
      updatedAt: new Date().toISOString(),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteDeal(dealId: string): Promise<void> {
  const path = `deals/${dealId}`;
  try {
    await deleteDoc(doc(db, 'deals', dealId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ---------------- TASKS ----------------

export function subscribeTasks(
  onData: (tasks: Task[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const path = 'tasks';
  const q = query(collection(db, path));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Task[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Task);
      });
      list.sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
      onData(list);
    },
    (error) => {
      if (onError) onError(error);
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.GET, path);
      } else {
        console.warn(`Firestore subscription notice [${path}]:`, error);
      }
    }
  );
}

export async function createTask(task: Task): Promise<void> {
  const path = `tasks/${task.id}`;
  try {
    await setDoc(doc(db, 'tasks', task.id), sanitizeForFirestore({
      ...task,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateTask(task: Task): Promise<void> {
  const path = `tasks/${task.id}`;
  try {
    await updateDoc(doc(db, 'tasks', task.id), sanitizeForFirestore({
      ...task,
      updatedAt: new Date().toISOString(),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  const path = `tasks/${taskId}`;
  try {
    await deleteDoc(doc(db, 'tasks', taskId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ---------------- INTERACTIONS ----------------

export function subscribeInteractions(
  onData: (interactions: Interaction[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const path = 'interactions';
  const q = query(collection(db, path));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Interaction[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Interaction);
      });
      list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      onData(list);
    },
    (error) => {
      if (onError) onError(error);
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.GET, path);
      } else {
        console.warn(`Firestore subscription notice [${path}]:`, error);
      }
    }
  );
}

export async function createInteraction(interaction: Interaction): Promise<void> {
  const path = `interactions/${interaction.id}`;
  try {
    await setDoc(doc(db, 'interactions', interaction.id), sanitizeForFirestore({
      ...interaction,
      createdAt: new Date().toISOString(),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteInteraction(interactionId: string): Promise<void> {
  const path = `interactions/${interactionId}`;
  try {
    await deleteDoc(doc(db, 'interactions', interactionId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ---------------- EMPLOYEES ----------------

export function subscribeEmployees(
  onData: (employees: Employee[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const path = 'employees';
  const q = query(collection(db, path));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Employee[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Employee);
      });
      list.sort((a, b) => a.name.localeCompare(b.name));
      onData(list);
    },
    (error) => {
      if (onError) onError(error);
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.GET, path);
      } else {
        console.warn(`Firestore subscription notice [${path}]:`, error);
      }
    }
  );
}

export async function createEmployee(employee: Employee): Promise<void> {
  const path = `employees/${employee.id}`;
  try {
    await setDoc(doc(db, 'employees', employee.id), sanitizeForFirestore({
      ...employee,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateEmployee(employee: Employee): Promise<void> {
  const path = `employees/${employee.id}`;
  try {
    await updateDoc(doc(db, 'employees', employee.id), sanitizeForFirestore({
      ...employee,
      updatedAt: new Date().toISOString(),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteEmployee(employeeId: string): Promise<void> {
  const path = `employees/${employeeId}`;
  try {
    await deleteDoc(doc(db, 'employees', employeeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ---------------- NOTIFICATIONS ----------------

export function subscribeNotifications(
  onData: (notifications: CRMNotification[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const path = 'notifications';
  const q = query(collection(db, path));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: CRMNotification[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as CRMNotification);
      });
      list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onData(list);
    },
    (error) => {
      if (onError) onError(error);
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.GET, path);
      } else {
        console.warn(`Firestore subscription notice [${path}]:`, error);
      }
    }
  );
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const path = `notifications/${id}`;
  try {
    await updateDoc(doc(db, 'notifications', id), { read: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function createNotification(notif: CRMNotification): Promise<void> {
  const path = `notifications/${notif.id}`;
  try {
    await setDoc(doc(db, 'notifications', notif.id), sanitizeForFirestore(notif));
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
