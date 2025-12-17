import { supabase } from './supabase';

export const profilesService = {
  // Test if profiles table exists and can insert
  async testConnection() {
    try {
      // First test if we can read from the table
      const { data, error } = await supabase
        .from('profiles')
        .select('count(*)')
        .limit(1);

      if (error) {
        console.error('Profiles table read test failed:', error);
        return { exists: false, canInsert: false, error: error.message };
      }

      console.log('Profiles table exists and readable');

      // Test if we can insert (try with a test record)
      const testEmail = `test-${Date.now()}@example.com`;
      const { data: insertData, error: insertError } = await supabase
        .from('profiles')
        .insert([{
          email: testEmail,
          first_name: 'Test',
          last_name: 'User',
          full_name: 'Test User',
          phone: '+919876543210'
        }])
        .select()
        .single();

      if (insertError) {
        console.error('Profiles table insert test failed:', insertError);
        return { exists: true, canInsert: false, error: insertError.message };
      }

      console.log('Profiles table insert test successful:', insertData);

      // Clean up test record
      await supabase.from('profiles').delete().eq('email', testEmail);

      return { exists: true, canInsert: true, error: null };
    } catch (error) {
      console.error('Profiles table connection test error:', error);
      return { exists: false, canInsert: false, error: error.message };
    }
  },

  // Get user profile by ID
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return { data: null, error: error.message };
    }
  },

  // Get user profile by email
  async getProfileByEmail(email) {
    try {
      const { data, error } = await supabase.rpc('get_profile_by_email', {
        user_email: email
      });

      if (error) throw error;
      return { data: data?.[0] || null, error: null };
    } catch (error) {
      console.error('Error fetching profile by email:', error);
      return { data: null, error: error.message };
    }
  },

  // Update user profile
  async updateProfile(userId, profileData) {
    try {
      const { data, error } = await supabase.rpc('update_user_profile', {
        user_id: userId,
        new_first_name: profileData.firstName || null,
        new_last_name: profileData.lastName || null,
        new_phone: profileData.phone || null,
        new_avatar_url: profileData.avatarUrl || null,
        new_password: profileData.password || null // ⚠️ NOT RECOMMENDED
      });

      if (error) throw error;
      return { success: data, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }
  },

  // Create profile manually (fallback if trigger doesn't work)
  async createProfile(userId, profileData) {
    try {
      console.log('📝 Creating profile with data:', { userId, profileData });
      
      // Validate required data
      if (!profileData.email || !profileData.firstName || !profileData.lastName) {
        throw new Error('Missing required profile data: email, firstName, and lastName are required');
      }

      // If no userId provided, let database generate one
      const profileRecord = {
        email: profileData.email,
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        full_name: `${profileData.firstName} ${profileData.lastName}`,
        phone: profileData.phone || null,
        password: profileData.password || null // ⚠️ NOT RECOMMENDED - for legacy support only
      };

      // Only add ID if provided
      if (userId) {
        profileRecord.id = userId;
      }

      console.log('📝 Profile record to insert:', profileRecord);

      // Check if profile already exists
      if (userId) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .single();

        if (existingProfile) {
          console.log('⚠️ Profile already exists for user:', userId);
          return { data: existingProfile, error: null };
        }
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert([profileRecord])
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase insert error:', error);
        console.log('📋 Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });

        // Check for specific error types
        if (error.code === '23505') { // Unique constraint violation
          console.log('⚠️ Profile already exists (unique constraint)');
          return { data: null, error: 'Profile already exists for this user' };
        }

        throw error;
      }

      console.log('✅ Profile created successfully:', data);
      return { data, error: null };
    } catch (error) {
      console.error('❌ Error creating profile:', error);
      return { 
        data: null, 
        error: error.message || 'Failed to create profile'
      };
    }
  },

  // Get all profiles (admin only)
  async getAllProfiles() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching all profiles:', error);
      return { data: [], error: error.message };
    }
  },

  // Delete profile (admin only)
  async deleteProfile(userId) {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting profile:', error);
      return { success: false, error: error.message };
    }
  },

  // Check if profile exists
  async profileExists(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return { exists: !!data, error: null };
    } catch (error) {
      console.error('Error checking profile existence:', error);
      return { exists: false, error: error.message };
    }
  },

  // Format profile data for display
  formatProfile(profile) {
    if (!profile) return null;

    return {
      id: profile.id,
      email: profile.email,
      firstName: profile.first_name || '',
      lastName: profile.last_name || '',
      fullName: profile.full_name || '',
      phone: profile.phone || '',
      avatarUrl: profile.avatar_url || '',
      createdAt: profile.created_at,
      updatedAt: profile.updated_at
    };
  },

  // Get user initials for avatar
  getUserInitials(profile) {
    if (!profile) return 'U';
    
    const firstName = profile.first_name || profile.firstName || '';
    const lastName = profile.last_name || profile.lastName || '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (profile.email) {
      return profile.email.charAt(0).toUpperCase();
    }
    
    return 'U';
  },

  // Get avatar color based on user ID
  getAvatarColor(userId) {
    const colors = [
      'bg-amber-100 text-amber-700',
      'bg-blue-100 text-blue-700',
      'bg-green-100 text-green-700',
      'bg-purple-100 text-purple-700',
      'bg-pink-100 text-pink-700',
      'bg-indigo-100 text-indigo-700',
      'bg-red-100 text-red-700',
      'bg-yellow-100 text-yellow-700'
    ];
    
    if (!userId) return colors[0];
    
    // Use the last character of UUID to determine color
    const hash = userId.charCodeAt(userId.length - 1);
    return colors[hash % colors.length];
  }
};