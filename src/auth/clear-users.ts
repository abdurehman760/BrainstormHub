import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function clearAuthUsers() {
  try {
    // List all users
    const { data: users, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('Error fetching users:', error);
      return;
    }

    for (const user of users.users) {
      console.log(`Deleting user with ID: ${user.id}`);
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

      if (deleteError) {
        console.error(`Failed to delete user ${user.id}:`, deleteError);
      } else {
        console.log(`User ${user.id} deleted successfully.`);
      }
    }

    console.log('All users deleted successfully.');
  } catch (err) {
    console.error('Error:', err);
  }
}

clearAuthUsers();
