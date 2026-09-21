import { describe, it, expect, afterAll } from 'vitest';
import { createTestUser, cleanupTestUser } from '@/test-utils/factories';
import { db } from '@/lib/db';
import { createTaxonomyEntry, renameTaxonomyEntry, setTaxonomyActive } from './taxonomy-service';

async function makeAdmin() {
  const admin = await createTestUser();
  await db.user.update({ where: { id: admin.id }, data: { role: 'ADMIN' } });
  return admin;
}

function unique(prefix: string) {
  return `${prefix}${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
}

describe('admin taxonomy service', () => {
  const cleanupUserIds: string[] = [];
  const cleanupVibeIds: string[] = [];

  afterAll(async () => {
    await db.vibe.deleteMany({ where: { id: { in: cleanupVibeIds } } });
    await Promise.all(cleanupUserIds.map(cleanupTestUser));
  });

  it('creates a taxonomy entry, active by default, with an audit log entry', async () => {
    const admin = await makeAdmin();
    cleanupUserIds.push(admin.id);
    const name = unique('Vibe ');

    const entry = await createTaxonomyEntry('VIBE', admin.id, name);
    cleanupVibeIds.push(entry.id);

    expect(entry.name).toBe(name);
    expect(entry.isActive).toBe(true);

    const log = await db.auditLog.findFirst({ where: { actorId: admin.id, action: 'VIBE_CREATED', targetId: entry.id } });
    expect(log).not.toBeNull();
  });

  it('rejects creating a duplicate taxonomy entry', async () => {
    const admin = await makeAdmin();
    cleanupUserIds.push(admin.id);
    const name = unique('Vibe ');

    const entry = await createTaxonomyEntry('VIBE', admin.id, name);
    cleanupVibeIds.push(entry.id);

    await expect(createTaxonomyEntry('VIBE', admin.id, name)).rejects.toMatchObject({ code: 'DUPLICATE_NAME' });
  });

  it('renames a taxonomy entry and records an audit log entry', async () => {
    const admin = await makeAdmin();
    cleanupUserIds.push(admin.id);
    const entry = await createTaxonomyEntry('VIBE', admin.id, unique('Vibe '));
    cleanupVibeIds.push(entry.id);

    const newName = unique('Renamed ');
    const updated = await renameTaxonomyEntry('VIBE', admin.id, entry.id, newName);
    expect(updated.name).toBe(newName);

    const log = await db.auditLog.findFirst({ where: { actorId: admin.id, action: 'VIBE_UPDATED', targetId: entry.id } });
    expect(log).not.toBeNull();
  });

  it('toggles isActive and does not hard-delete', async () => {
    const admin = await makeAdmin();
    cleanupUserIds.push(admin.id);
    const entry = await createTaxonomyEntry('VIBE', admin.id, unique('Vibe '));
    cleanupVibeIds.push(entry.id);

    const disabled = await setTaxonomyActive('VIBE', admin.id, entry.id, false);
    expect(disabled.isActive).toBe(false);

    const stillExists = await db.vibe.findUnique({ where: { id: entry.id } });
    expect(stillExists).not.toBeNull();

    const reEnabled = await setTaxonomyActive('VIBE', admin.id, entry.id, true);
    expect(reEnabled.isActive).toBe(true);
  });

  it('rejects renaming a taxonomy entry that does not exist', async () => {
    const admin = await makeAdmin();
    cleanupUserIds.push(admin.id);

    await expect(renameTaxonomyEntry('VIBE', admin.id, 'does-not-exist', 'X')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});
