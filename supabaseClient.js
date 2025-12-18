// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://wfzcsihdemxdxokcjlzn.supabase.co"
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmemNzaWhkZW14ZHhva2NqbHpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NzU1MDQsImV4cCI6MjA4MTU1MTUwNH0.nbFataSrxiSwineSZSjeB0sKBii4kFq_huNaXmdpJ8s' 

export const supabase = createClient(supabaseUrl, supabaseAnonKey)