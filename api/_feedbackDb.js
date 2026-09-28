import fs from 'fs';
import path from 'path';

export const FEEDBACK_TYPES = [
  'General Feedback',
  'Job Listing Issue',
  'Website Issue',
  'Job Suggestion',
  'Feature Request',
  'Other'
];

export const FEEDBACK_STATUSES = ['unread', 'read', 'archived'];

function getStoragePath() {
  const primaryDir = path.resolve(process.cwd(), 'data');
  const primaryFile = path.resolve(primaryDir, 'feedback.json');

  try {
    if (!fs.existsSync(primaryDir)) {
      fs.mkdirSync(primaryDir, { recursive: true });
    }
    // Test write permission
    const testFile = path.resolve(primaryDir, '.write-test');
    fs.writeFileSync(testFile, 'ok');
    fs.unlinkSync(testFile);
    return primaryFile;
  } catch {
    // Fallback for restricted/read-only environments
    const fallbackDir = '/tmp';
    return path.resolve(fallbackDir, 'the_role_dispatch_feedback.json');
  }
}

const DB_PATH = getStoragePath();

// Sample seed data to ensure the admin experience is functional immediately
const INITIAL_SEEDS = [
  {
    id: 'fb_1727480001001_sug',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    type: 'Job Suggestion',
    subject: 'Request for Bangalore DevOps & Platform Engineering Roles',
    message: 'Could you please include listings for junior-to-mid Cloud & DevOps positions at verified engineering hubs in Bangalore? Love the authentic direct application links without middleman redirects!',
    status: 'unread',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'fb_1727480002002_iss',
    name: 'Karthik Raja',
    email: 'karthik.r@example.com',
    type: 'Job Listing Issue',
    subject: 'Amazon SDE 1 link redirected to career home instead of requisition',
    message: 'The listing for Amazon SDE 1 seemed to route to the main Amazon jobs portal rather than the direct job ID. The listing role is genuine, but direct link could be refreshed.',
    status: 'read',
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'fb_1727480003003_gen',
    name: 'Ananya Verma',
    email: 'ananya.v@example.com',
    type: 'General Feedback',
    subject: 'Clean and editorial layout is refreshing',
    message: 'The typographic hierarchy and lack of popup ads makes browsing jobs actually pleasant. Appreciate the verified company filters.',
    status: 'read',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

function readDb() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      writeDb(INITIAL_SEEDS);
      return INITIAL_SEEDS;
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return INITIAL_SEEDS;
  } catch (err) {
    console.error('[FeedbackDB] Failed to read database:', err);
    return INITIAL_SEEDS;
  }
}

function writeDb(records) {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tmp = `${DB_PATH}.tmp.${Date.now()}`;
    fs.writeFileSync(tmp, JSON.stringify(records, null, 2), 'utf-8');
    fs.renameSync(tmp, DB_PATH);
    return true;
  } catch (err) {
    console.error('[FeedbackDB] Failed to write database:', err);
    return false;
  }
}

export function getAllFeedback() {
  console.log(`[FEEDBACK_ADMIN_GET] Request received`);
  console.log(`[FEEDBACK_ADMIN_GET] Storage path being read: ${DB_PATH}`);
  console.log(`[FEEDBACK_ADMIN_GET] File exists: ${fs.existsSync(DB_PATH)}`);
  const records = readDb();
  console.log(`[FEEDBACK_ADMIN_GET] Records found: ${records.length}`);
  console.log(`[FEEDBACK_ADMIN_GET] Record IDs found: ${records.map(r => r.id).join(', ')}`);
  return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getFeedbackStats() {
  const records = readDb();
  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

  const total = records.length;
  const unread = records.filter(r => r.status === 'unread').length;
  const read = records.filter(r => r.status === 'read').length;
  const thisWeek = records.filter(r => new Date(r.createdAt).getTime() >= oneWeekAgo).length;

  return { total, unread, read, thisWeek };
}

export function getFeedbackById(id) {
  if (!id) return null;
  const records = readDb();
  return records.find(r => r.id === id) || null;
}

export function createFeedback({ name, email, type, subject, message }) {
  console.log(`[FEEDBACK_POST] Request received for type: "${type}"`);
  const records = readDb();
  const now = new Date().toISOString();
  const id = `fb_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  console.log(`[FEEDBACK_POST] Generated feedback ID: ${id}`);
  console.log(`[FEEDBACK_POST] Storage path: ${DB_PATH}`);

  const newRecord = {
    id,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    type,
    subject: subject.trim(),
    message: message.trim(),
    status: 'unread',
    createdAt: now,
    updatedAt: now
  };

  const updated = [newRecord, ...records];
  const writeSuccess = writeDb(updated);
  console.log(`[FEEDBACK_POST] Write succeeded: ${writeSuccess}`);
  console.log(`[FEEDBACK_POST] Total records after write: ${updated.length}`);

  if (!writeSuccess) {
    throw new Error('Database write operation failed');
  }

  return newRecord;
}

export function updateFeedback(id, fields = {}) {
  const records = readDb();
  const idx = records.findIndex(r => r.id === id);
  if (idx === -1) return null;

  const updatedRecord = {
    ...records[idx],
    ...fields,
    updatedAt: new Date().toISOString()
  };

  records[idx] = updatedRecord;
  writeDb(records);
  return updatedRecord;
}

export function deleteFeedback(id) {
  const records = readDb();
  const filtered = records.filter(r => r.id !== id);
  if (filtered.length === records.length) return false;
  writeDb(filtered);
  return true;
}

export function deleteMultipleFeedback(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return 0;
  const set = new Set(ids);
  const records = readDb();
  const filtered = records.filter(r => !set.has(r.id));
  const count = records.length - filtered.length;
  writeDb(filtered);
  return count;
}
