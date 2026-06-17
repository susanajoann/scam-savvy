curl -X POST \
  "https://hmkzttbkxafznlgkkyhh.supabase.co/functions/v1/send-feedback-alert" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhta3p0dGJreGFmem5sZ2treWhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzA2NjAwMCwiZXhwIjoyMDkyNjQyMDAwfQ.bCZlkOrRvQ2O8g9xhqqJXTzwKqpAH5AjY8qgjOekIc4" \
-H "api key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhta3p0dGJreGFmem5sZ2treWhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzA2NjAwMCwiZXhwIjoyMDkyNjQyMDAwfQ.bCZlkOrRvQ2O8g9xhqqJXTzwKqpAH5AjY8qgjOekIc4" \
-d '{"message": "Test feedback message"}'

