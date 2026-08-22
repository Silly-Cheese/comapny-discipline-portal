import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyDE0nhogdC9LHPEhSlUF1AqnXmwPU64cXg",
  authDomain: "company-discipline-portal.firebaseapp.com",
  projectId: "company-discipline-portal",
  storageBucket: "company-discipline-portal.firebasestorage.app",
  messagingSenderId: "991390225414",
  appId: "1:991390225414:web:32b8d71a8fe2a323161f87"
};

export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export function normalize(value) {
  return String(value ?? "").trim();
}

export function normalizeEmail(value) {
  return normalize(value).toLowerCase();
}

export function normalizeRole(value) {
  return normalize(value).toLowerCase();
}

export function isManagement(profile) {
  const role = normalizeRole(profile?.role);
  return Boolean(
    profile?.permissions?.employeesView === true ||
    profile?.permissions?.employeesManage === true ||
    role === "manager" || role === "admin" || role === "administrator" || role === "owner"
  );
}

export function isSystemAdmin(profile) {
  const role = normalizeRole(profile?.role);
  return Boolean(
    profile?.permissions?.systemAdmin === true ||
    role === "admin" || role === "administrator" || role === "owner"
  );
}

export function canIssueDiscipline(profile) {
  const role = normalizeRole(profile?.role);
  return Boolean(
    profile?.permissions?.disciplineIssue === true ||
    profile?.permissions?.canIssueWriteups === true ||
    role === "manager" || role === "admin" || role === "administrator" || role === "owner"
  );
}

export function canReviewAppeals(profile) {
  const role = normalizeRole(profile?.role);
  return Boolean(
    profile?.permissions?.disciplineAppealsReview === true ||
    profile?.permissions?.canReviewAppeals === true ||
    role === "manager" || role === "admin" || role === "administrator" || role === "owner"
  );
}

export function canCrossDepartments(profile) {
  const role = normalizeRole(profile?.role);
  return Boolean(profile?.permissions?.employeesCrossDepartment === true || role === "admin" || role === "administrator" || role === "owner");
}

export async function loadOwnProfile(user = auth.currentUser) {
  if (!user) return null;
  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export function showMessage(element, text, type = "info") {
  if (!element) return;
  element.textContent = String(text ?? "");
  element.className = `message ${type}`;
}

export function clearMessage(element) {
  if (!element) return;
  element.textContent = "";
  element.className = "message";
}

export function setText(element, value, fallback = "—") {
  if (element) element.textContent = normalize(value) || fallback;
}

export function makeElement(tag, options = {}) {
  const el = document.createElement(tag);
  if (options.className) el.className = options.className;
  if (options.text !== undefined) el.textContent = String(options.text);
  if (options.type) el.type = options.type;
  if (options.href) el.href = options.href;
  if (options.dataset) Object.entries(options.dataset).forEach(([key, value]) => { el.dataset[key] = String(value); });
  return el;
}

export function statusClass(status) {
  const value = normalizeRole(status);
  if (["approved", "active", "completed", "reviewed", "acknowledged", "processed"].includes(value)) return "pill success";
  if (["pending", "under appeal", "submitted", "awaiting acknowledgment"].includes(value)) return "pill warning";
  if (["denied", "inactive", "terminated", "resigned", "overturned", "cancelled", "reduced"].includes(value)) return "pill danger";
  return "pill";
}

export function formatTimestamp(value) {
  try {
    const date = value?.toDate ? value.toDate() : value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(date);
  } catch {
    return "—";
  }
}

export function activationAllowed(employee) {
  if (!employee) return false;
  const status = normalizeRole(employee.status || employee.employmentStatus || "active");
  if (status !== "active") return false;
  if (employee.portalAccess === false) return false;
  return employee.portalAccess === true || employee.canSignup === true || employee.loginEnabled === true || employee.accountCreated === true;
}
