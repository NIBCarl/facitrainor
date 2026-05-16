import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing env variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Creating user...");
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'borjaclan2004@gmail.com',
    password: 'Faciadmin1535@:)',
    email_confirm: true,
    user_metadata: {
      full_name: 'System Admin',
      role: 'admin'
    }
  });

  if (error) {
    // If the user already exists, let's just fetch them and update the role
    if (error.message.includes("already registered")) {
        console.log("User already exists. Attempting to update existing user's role to admin...");
        // Wait, to update password of existing user:
        const { data: usersData } = await supabase.auth.admin.listUsers();
        const existingUser = usersData?.users.find(u => u.email === 'borjaclan2004@gmail.com');
        
        if (existingUser) {
            await supabase.auth.admin.updateUserById(existingUser.id, { password: 'Faciadmin1535@:)' });
            
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ role: 'admin' })
              .eq('id', existingUser.id);
            
            if (updateError) console.error("Profile Update Error:", updateError.message);
            else console.log("Existing user password updated and role set to ADMIN!");
        }
        return;
    }
    console.error("Auth Error:", error.message);
    return;
  }

  console.log("User created with ID:", data.user.id);

  // The database trigger created the profile with role 'trainee'. Let's update it to 'admin'.
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', data.user.id);

  if (updateError) {
    console.error("Profile Update Error:", updateError.message);
  } else {
    console.log("Profile updated to ADMIN successfully!");
  }
}

main();
