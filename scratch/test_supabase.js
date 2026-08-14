import { createClient } from '@supabase/supabase-js';

const url = 'https://yubfmflrgfflxoenumdq.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1YmZtZmxyZ2ZmbHhvZW51bWRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NTAwMDAsImV4cCI6MjA4NjUyNjAwMH0.placeholder';

const supabase = createClient(url, key);

async function test() {
  console.log('Testing Supabase REST endpoint...');
  const { data, error } = await supabase.from('documents').select('*');
  if (error) {
    console.log('Error querying documents table:', error.message);
  } else {
    console.log('Documents table exists! Found rows:', data.length);
  }
}

test();
