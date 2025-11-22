import { getLocalRegistrations } from './localRegistrationService';
import { projectId, publicAnonKey } from './supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-6f7662b1`;

/**
 * Migrates local registrations from localStorage to Supabase
 * This is a one-time migration to centralize all registration data
 */
export async function migrateLocalRegistrationsToSupabase(): Promise<{
  success: boolean;
  migrated: number;
  errors: number;
}> {
  try {
    // Get all local registrations
    const localRegs = getLocalRegistrations();
    
    if (localRegs.length === 0) {
      console.log('📦 No local registrations to migrate');
      return { success: true, migrated: 0, errors: 0 };
    }

    console.log(`🚀 Starting migration of ${localRegs.length} local registrations...`);

    let migrated = 0;
    let errors = 0;

    // Migrate each registration
    for (const reg of localRegs) {
      try {
        const response = await fetch(`${BASE_URL}/registrations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            userId: reg.userId,
            eventId: reg.eventId,
            status: reg.status,
            createdAt: reg.createdAt,
            updatedAt: reg.updatedAt,
            id: reg.id // Preserve original ID
          })
        });

        if (response.ok) {
          migrated++;
          console.log(`✅ Migrated registration ${reg.id}`);
        } else {
          errors++;
          console.warn(`⚠️ Failed to migrate registration ${reg.id}:`, response.status);
        }
      } catch (error) {
        errors++;
        console.error(`❌ Error migrating registration ${reg.id}:`, error);
      }
    }

    console.log(`✅ Migration completed: ${migrated} successful, ${errors} errors`);
    
    return {
      success: errors === 0,
      migrated,
      errors
    };
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return {
      success: false,
      migrated: 0,
      errors: 0
    };
  }
}

/**
 * Check if migration is needed (has local data but not in Supabase)
 */
export function needsMigration(): boolean {
  const localRegs = getLocalRegistrations();
  return localRegs.length > 0;
}
