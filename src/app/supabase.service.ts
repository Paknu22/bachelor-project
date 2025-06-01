import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Roles } from './Enums/roles.enum';
import { LocalFile } from './Interfaces/LocalFile';
import { environment } from '../environments/environment';
import { Database } from 'src/types/supabase';
import { Router } from '@angular/router';



type UserCaseAccessWithCase = Database['public']['Tables']['UserCaseAccess']['Row'] & {
  Case: Pick<Database['public']['Tables']['Case']['Row'], 'title'>;
};

let supabaseInstance: SupabaseClient | null = null;

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  

  constructor(private router: Router) {
    if (!supabaseInstance) {
      const supabaseUrl = environment.SUPABASE_URL;
      const supabaseKey = environment.SUPABASE_KEY;

      supabaseInstance = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    }

    this.supabase = supabaseInstance;
  }


  //Login with auth.id
  async loginWithEmail(email: string, password: string, hcaptchaToken: string) {
    return await this.supabase.auth.signInWithPassword({
    email,
    password,
    options: {
      captchaToken: hcaptchaToken, 
    },
  });
  }


    

  async getData(table: string) {
    const { data, error } = await this.supabase.from(table).select('*');
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    return data;
  }


  
  async checkUser(email: string, password: string) {
    try {
      const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });
  
      if (!authError) {
        const { user } = authData;
        const { data, error } = await this.supabase
          .from('Users')
          .select('id, name, email, role, company_id')
          .eq('auth_user_id', user?.id)
          .single();
  
        if (error) {
          throw error;
        }
  
        return data;
      }
  
      const { data: user, error: userError } = await this.supabase
        .from('Users')
        .select('id, name, email, password, role, company_id')
        .eq('email', email)
        .single();
  
      if (userError || !user || user.password !== password) {
        throw new Error('Invalid email or password.');
      }
  
      const { password: _, ...userDetails } = user;
      return userDetails;
    } catch (error) {
      throw error;
    }
  }



  
  async getUsersByCompany(company: number): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('Users')
      .select('id, name, email, role') // Fetch user data directly
      .eq('company_id', company); // Use company for filtering
  
    if (error) {
      console.error('Error fetching users by company:', error);
      throw error;
    }
    return data || [];
  }


  async createUser(name: string, email: string, password: string, hcaptchaToken: string) {
    const { data: authData, error: signupError } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        captchaToken: hcaptchaToken, // Pass the hCaptcha token
      },
    });

    if (signupError) throw signupError;

    const authUserId = authData.user?.id;
    const { error: userInsertError } = await this.supabase

        //Insert user details into the 'users' table
      .from('Users')
      .insert({
        name,
        email,
        auth_user_id: authUserId,
        // Change to null so can check user assignment
        // role: Roles.null, // Default role
        role: Roles.Worker, // Default role
        company_id: null   // Default null
      });

    if (userInsertError) throw userInsertError;

    return { authUserId };
  }

  async getUserDetails() {
    const { data: user } = await this.supabase.auth.getUser();
    const uid = user?.user?.id;
  
    const { data, error } = await this.supabase
      .from('Users')
      .select('*')
      .eq('auth_user_id', uid)
      .single();
    console.log('User details:', data); // Debugging log
    if (error) throw error;
    return data;
  }

  async updateUserEmail(userId: string, newEmail: string): Promise<any> {
    try {
      // Step 1: Ensure the user is authenticated
      const { data: session, error: sessionError } = await this.supabase.auth.getSession();
      if (sessionError || !session?.session?.user) {
        console.error('No user is logged in or session is invalid:', sessionError);
        throw new Error('User must be logged in to update email.');
      } 

      // Step 2: Validate the new email
      if (!newEmail || !newEmail.includes('@')) {
        throw new Error('Invalid email address.');
      }

      // Step 3: Update email in Supabase Auth
      const { error: authError } = await this.supabase.auth.updateUser({
        email: newEmail,
      });

      if (authError) {
        console.error('Error updating email in authentication:', authError);
        throw new Error('Failed to update email in authentication. Please ensure the email is valid and not already in use.');
      }

      // Step 4: Update email in the 'users' table
      const { data, error } = await this.supabase
        .from('Users')
        .update({ email: newEmail })
        .eq('id', userId);

      if (error) {
        console.error('Error updating email in the users table:', error);
        throw new Error('Failed to update email in the database.');
      }

      console.log('Email updated successfully in both authentication and users table.');
      return data;
    } catch (error) {
      console.error('Error updating email:', error);
      throw error;
    }
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<void> {
    try {
      const { data: session, error: sessionError } = await this.supabase.auth.getSession();
      if (sessionError || !session?.session?.user) {
        console.error('No user is logged in or session is invalid:', sessionError);
        throw new Error('User must be logged in to update password.');
      }

      if (!newPassword || newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      const { error: authError } = await this.supabase.auth.updateUser({
        password: newPassword,
      });

      if (authError) {
        console.error('Error updating password in authentication:', authError);
        throw new Error('Failed to update password in authentication.');
      }

      console.log('Password updated successfully.');
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }


  // Case part
  async createCase(companyId: number, title: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('Case')
      .insert([{ company_id: companyId, title }])
      .select('*')
      .single(); // Esures you get back the inserted row

    if (error) {
      console.error('Error creating case:', error);
      throw error;
    }

    return data;
  }


  async getCasesByCompany(companyId: number): Promise<any[]> {
    console.log('Fetching cases for company ID:', companyId); // Debugging log

    const { data, error } = await this.supabase
      .from('Case')
      .select('*')
      .eq('company_id', companyId);

    if (error) {
      console.error('Error fetching cases:', error);
      throw error;
    }

    console.log('Cases fetched from Supabase:', data); // Debugging log
    return data || [];
  }

  async getCasesById(caseId: number): Promise<any> {
    console.log('Fetching cases for case ID:', caseId);

    const { data, error } = await this.supabase
      .from('Case')
      .select('*')
      .eq('id', caseId)
      .single();

    if (error) {
      console.error('Error fetching case:', error);
      throw error;
    }

    console.log('Cases fetched from Supabase:', data);
    return data
  }

  async getTasksByCase(caseId: number): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('Task')
      .select('id, type, description')
      .eq('case_id', caseId);

    if (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
    
    return data || [];
  }

  //ResetPass 
  async resetPassword(email: string, hcaptchaToken: string): Promise<{ error: any }> {
    const redirectUrl = `${window.location.origin}/reset-password`;
    return await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo:  redirectUrl,
      captchaToken: hcaptchaToken,
    });
  }

  async UploadCaseFiles(caseId: number, selectedFiles: LocalFile[]): Promise<void> {
    for (const file of selectedFiles) {
      const blob = this.base64ToBlob(file.data);
      const fileForUpload = new File([blob], file.name, {
        type: this.getMimeType(file.data)
      });

      const filePath = `${caseId}/${file.name}`;

      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('case-files')
        .upload(filePath, fileForUpload, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload failed:', uploadError);
        throw uploadError;
      }

      const { error: dbError } = await this.supabase.from('CaseFiles').insert({
        case_id: caseId,
        file_name: file.name,
        file_path: filePath,
      });

      if (dbError) {
        console.error('Metadata insert failed:', dbError);
        throw dbError;
      }
    }
  }


  // Helper: Convert base64 string to Blob
  private base64ToBlob(base64: string): Blob {
    const [header, data] = base64.split(',');
    const byteCharacters = atob(data);
    const byteArrays = [];

    for (let i = 0; i < byteCharacters.length; i += 512) {
      const slice = byteCharacters.slice(i, i + 512);
      const byteNumbers = new Array(slice.length);
      for (let j = 0; j < slice.length; j++) {
        byteNumbers[j] = slice.charCodeAt(j);
      }
      byteArrays.push(new Uint8Array(byteNumbers));
    }

    const mimeMatch = header.match(/data:(.*);base64/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    return new Blob(byteArrays, { type: mimeType });
  }

  // Helper: Extract MIME type from base64
  private getMimeType(base64: string): string {
    const match = base64.match(/^data:(.+);base64,/);
    return match ? match[1] : 'application/octet-stream';
  }



  async getCurrentSession() {
    return await this.supabase.auth.getSession();
  }

  async updatePassword(newPassword: string) {
    return await this.supabase.auth.updateUser({ password: newPassword });
  }

  //Heler for add employee for modal
  getSupabaseClient() {
    return this.supabase;
  }

  //Method for assign
  async assignUserToCompany(email: string, role: Roles, companyId: number): Promise<void> {
    const { data: users, error: fetchError } = await this.supabase
      .from('Users')
      .select('id')
      .ilike('email', email);
      console.log('Matching user:', users);


    if (fetchError || !users || users.length === 0) {
      throw new Error('User with that email does not exist.');
    }

    const userId = users[0].id;

    const { error: updateError } = await this.supabase
      .from('Users')
      .update({ role, company_id: companyId })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }
  }

  async unassignUserFromCompany(email: string): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('Users') 
        .update({ company_id: null }) 
        .eq('email', email);
  
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to unassign user from company: ${error.message}`);
      }
  
      console.log('Unassign user response:', data);
    } catch (error) {
      console.error('Error in unassignUserFromCompany:', error);
      throw error;
    }
  }



  async RetrieveCaseFiles(caseId: string): Promise<{ name: string, path: string, url: string }[]> {
    // Fetch file metadata from your case_files table
    const { data: files, error } = await this.supabase
      .from('CaseFiles')
      .select('file_name, file_path')
      .eq('case_id', caseId);

    if (error) {
      console.error('Failed to fetch file records:', error);
      throw error;
    }

    const result: { name: string; path: string; url: string }[] = [];

    // Generate signed URLs for each file
    for (const file of files ?? []) {
      const { data: signedData, error: signedError } = await this.supabase.storage
        .from('case-files')
        .createSignedUrl(file.file_path, 60);

      if (signedError) {
        console.error('Error generating signed URL:', signedError);
        throw signedError;
      }

      result.push({
        name: file.file_name,
        path: file.file_path,
        url: signedData?.signedUrl,
      });
    }

    return result;
  }

  async addUserToCase(caseId: string, userId: string): Promise<void> {
    const { data, error } = await this.supabase
    .from('UserCaseAccess')
    .insert([{ user_id: userId, case_id: caseId }])
    .select('*')
    .single();

  if (error) {
    console.error('Error adding employee to case:', error);
    throw error;
  }

  return data;
  }




  async getAllowedCases(userId: string): Promise<{ id: string; title: string }[]> {
    console.log('Fetching cases for user with ID:', userId);
  
    const { data, error } = await this.supabase
      .from('UserCaseAccess')
      .select(`
        case_id,
        Case (
          title
        )
      `)
      .eq('user_id', userId) as unknown as { data: UserCaseAccessWithCase[] | null, error: any };
  
    if (error) {
      console.error('Error fetching cases:', error);
      throw error;
    }
  
    console.log('Cases fetched from Supabase:', data);
  
    return (data || []).map((item) => ({
      id: String(item.case_id ?? ''), 
      title: item.Case.title ?? '',     
    }));
    
  }

  //For modal to edit/remove employee
  async updateUserRole(email: string, role: string): Promise<void> {
    const { data: users, error: fetchError } = await this.supabase
      .from('Users')
      .select('id')
      .eq('email', email);

    if (fetchError || !users || users.length === 0) {
      throw new Error('User not found.');
    }

    const userId = users[0].id;

    const { error: updateError } = await this.supabase
      .from('Users')
      .update({ role })
      .eq('id', userId);

    if (updateError) {
      throw new Error('Failed to update user role.');
    }
  }
  async saveUserLog(userId: string, taskId: string): Promise<any> {
    const { data, error } = await this.supabase
    .from('TaskChangeLogs')
    .insert([{ user_id: userId, task_id: taskId }])
    .select('*')
    .single();

  if (error) {
    console.error('Error adding employee to case:', error);
    throw error;
  }
  console.log("Trying to save log! USER ID: ", userId, "   TASK ID: ", taskId);
  
  return data;
  }

  async loadUserLog(taskId: string): Promise<{ name: string; timestamp: string }[]> {
    const { data, error } = await this.supabase
      .from('TaskChangeLogs')
      .select(`
        created_at,
        user_id,
        Users (
          name
        )
      `)
      .eq('task_id', taskId) as unknown as { data: { created_at: string; user_id: string; Users: { name: string } }[] | null, error: any };
  
    if (error) {
      console.error('Error fetching user log:', error);
      throw error;
    }
  
    return (data || []).map(entry => ({
      name: entry.Users?.name ?? 'Unknown User',
      timestamp: entry.created_at
    }));
    
  }
  

  async createTask(caseId: string,){
    const { data, error} = await this.supabase
    .from('Task')
    .insert([{ case_id: caseId}])
    .select('*')
    .single();

    if (error) {
      console.error('Error adding task to case:', error);
      throw error;
    }
    console.log("Trying to save task! Company ID: ", caseId);
  
    return data;
  }

  async updateTask(taskId: string, descriptionText: string, registrationType: string){
    try {
      const { data, error } = await this.supabase
        .from('Task') 
        .update({ description: descriptionText, type: registrationType}) 
        .eq('id', taskId);
  
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to unassign user from company: ${error.message}`);
      }
  
      console.log('Unassign user response:', data);
    } catch (error) {
      console.error('Error in unassignUserFromCompany:', error);
      throw error;
    }
  }

  async uploadBlueprintPoint(taskId: string, pointOnBlueprint: { x: number, y: number}, filePath: string ): Promise<any>{
    try {
      const { data, error } = await this.supabase
        .from('Task') 
        .update({ point_on_blueprint: pointOnBlueprint, file_path_blueprint: filePath}) 
        .eq('id', taskId);
  
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed upload blueprint: ${error.message}`);
      }
  
      console.log('Completed upload of blueprint to task: ', data);
    } catch (error) {
      console.error('Error in uploadBlueprintPoint:', error);
      throw error;
    }
  }

  async loadTask(taskId: string): Promise<any>{
    const { data, error } = await this.supabase
    .from('Task')
    .select('id, type, description, point_on_blueprint, file_path_blueprint')
    .eq('id', taskId)
    .single();

  if (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
  
  return data;
}


//For manage employeees modal
async getEmployeesByCase(caseId: number): Promise<{ name: string; email: string; role: string }[]> {
  const { data, error } = await this.supabase
    .from('UserCaseAccess') 
    .select(`
      user_id,
      Users!inner (name, email, role)
    `)
    .eq('case_id', caseId);

  if (error) {
    console.error('Error fetching employees by case:', error);
    throw error;
  }

  return (data || []).map((entry: any) => ({
    name: entry.Users.name || 'Unknown',
    email: entry.Users.email || 'Unknown',
    role: entry.Users.role || 'Unknown',
  }));
}

async removeEmployeeFromCase(caseId: number, email: string): Promise<void> {
  const { data: user, error: fetchError } = await this.supabase
    .from('Users')
    .select('id')
    .eq('email', email)
    .single();

  if (fetchError || !user) {
    throw new Error('User not found.');
  }

  const userId = user.id;

  const { error: deleteError } = await this.supabase
    .from('UserCaseAccess')
    .delete()
    .eq('case_id', caseId)
    .eq('user_id', userId);

  if (deleteError) {
    console.error('Error removing employee from case:', deleteError);
    throw deleteError;
  }
}

async getCompanyEmployees(companyId: number): Promise<{ name: string; email: string; role: string }[]> {
  const { data, error } = await this.supabase
    .from('Users')
    .select('name, email, role')
    .eq('company_id', companyId); 

  if (error) {
    console.error('Error fetching company employees:', error);
    throw error;
  }

  return data || [];
}

async getUserByEmail(email: string): Promise<{ id: string } | null> {
  const { data, error } = await this.supabase
    .from('Users')
    .select('id')
    .eq('email', email)
    .single();

  if (error) {
    console.error(`Error fetching user by email (${email}):`, error);
    return null;
  }

  return data;
}


async UploadTaskImage(taskId: string, selectedFile: LocalFile): Promise<void> {
    const blob = this.base64ToBlob(selectedFile.data);
    const fileForUpload = new File([blob], selectedFile.name, {
    type: this.getMimeType(selectedFile.data)});

    const filePath = `${taskId}/${selectedFile.name}`;

    const { data: uploadData, error: uploadError } = await this.supabase.storage
      .from('task-images')
      .upload(filePath, fileForUpload, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload failed:', uploadError);
      throw uploadError;
    }

    const { error: dbError } = await this.supabase.from('TaskImages').insert({
      task_id: taskId,
      file_name: selectedFile.name,
      file_path: filePath,
    });

    if (dbError) {
      console.error('Metadata insert failed:', dbError);
      throw dbError;
    }
  }


  async RetrieveTaskImages(taskId: string): Promise<LocalFile[]> {
    const { data: files, error } = await this.supabase
      .from('TaskImages')
      .select('file_name, file_path')
      .eq('task_id', taskId);
  
    if (error) {
      console.error('Failed to fetch file records:', error);
      throw error;
    }
  
    const result: LocalFile[] = [];
  
    for (const file of files ?? []) {
      const { data: signedData, error: signedError } = await this.supabase.storage
        .from('task-images')
        .createSignedUrl(file.file_path, 60);
  
      if (signedError) {
        console.error('Error generating signed URL:', signedError);
        throw signedError;
      }
  
      result.push({
        name: file.file_name,
        path: signedData?.signedUrl || '',
        data: ''
      });
    }
    
    return result;
  }

  //For edit/remove case 
  async updateCase(caseId: number, updatedCase: any): Promise<{ error: any }> {
  const { error } = await this.supabase
    .from('Case')
    .update(updatedCase)
    .eq('id', caseId);

  return { error };
}
async deleteCase(caseId: number): Promise<{ error: any }> {
  const { error } = await this.supabase
    .from('Case')
    .delete()
    .eq('id', caseId);

  return { error };
}

  async generateSignedUrl(bucket: string, filePath: string, expiresInSeconds = 60): Promise<string> {
    const { data, error } = await this.supabase
      .storage
      .from(bucket)
      .createSignedUrl(filePath, expiresInSeconds);

    if (error) {
      console.error('Failed to generate signed URL:', error);
      throw error;
    }

    return data?.signedUrl || '';
  }

  async updateCaseEmployees(caseId: number, employeeIds: string[]): Promise<void> {
    const { error: deleteError } = await this.supabase
      .from('UserCaseAccess')
      .delete()
      .eq('case_id', caseId);

    if (deleteError) {
      console.error('Error clearing existing employee access:', deleteError);
      throw deleteError;
    }

    const insertData = employeeIds.map(userId => ({
      case_id: caseId,
      user_id: userId
    }));

    const { error: insertError } = await this.supabase
      .from('UserCaseAccess')
      .insert(insertData);

    if (insertError) {
      console.error('Error inserting new employee access:', insertError);
      throw insertError;
    }
  }


  async addCaseCustomTask(caseId: string, taskAttributeId: string){
    const { data, error} = await this.supabase
    .from('CaseCustomTask')
    .insert([{ case_id: caseId, task_attribute_id: taskAttributeId}])
    .select('*')
    .single();

    if (error) {
      console.error('Error handling task attribute id or case id:', error);
      throw error;
    }
    console.log("Trying to save task! Company ID: ", caseId);
  
    return data;
  }

  async loadCaseCustomTasks(caseId: string){
    const { data, error} = await this.supabase
    .from('CaseCustomTask')
    .select('task_attribute_id')
    .eq('case_id', caseId)

    if (error) {
      console.error('Failed to fetch task attribute:', error);
      throw error;
    }

    return data.map(entry => entry.task_attribute_id) ?? [];
  }

  async addTaskAttribute(taskId: string, taskAttributeId: Number){
    const { data, error} = await this.supabase
    .from('TaskAttributes')
    .insert([{ task_id: taskId, attribute_id: taskAttributeId}])
    .select('*')
    .single();

    if (error) {
      console.error('Error handling task attribute id or attribute id:', error);
      throw error;
    }
    console.log("Trying to save task! Task ID: ", taskId);
  
    return data;
  }

  async loadTaskAttribute(taskId: string){
    const { data, error} = await this.supabase
    .from('TaskAttributes')
    .select('attribute_id, value')
    .eq('task_id', taskId)

    if (error) {
      console.error('Failed to fetch task attribute:', error);
      throw error;
    }

    return data ?? [];
  }

  async updateTaskAttribute(taskId: string, attributeId: string, newValue: string){
    const { data, error} = await this.supabase
    .from('TaskAttributes')
    .update({ value: newValue })
    .eq('task_id', taskId)
    .eq('attribute_id', attributeId)

    if (error) {
      throw new Error('Failed to update task attribute value.');
    }

    return data;
  }

  //For delete user
  async deleteCurrentUser(): Promise<void> {
    // current session
    const { data: session, error: sessionError } = await this.supabase.auth.getSession();
    if (sessionError || !session?.session?.user) {
      throw new Error('No user session found.');
    }
    const authUserId = session.session.user.id;

    // Find user in Users table
    const { data: user, error: userError } = await this.supabase
      .from('Users')
      .select('id')
      .eq('auth_user_id', authUserId)
      .single();

    if (userError || !user) {
      throw new Error('User not found in Users table.');
    }

    // Delete from Users table by id (rest is done on server side)
    const { error: dbError } = await this.supabase
      .from('Users')
      .delete()
      .eq('id', user.id);

    if (dbError) throw new Error('Failed to delete user from database: ' + dbError.message);
  }
}