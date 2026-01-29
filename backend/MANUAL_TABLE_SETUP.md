# Manual Setup: Creating Tables in Fabric Lakehouse

Since we're experiencing connectivity issues with the Livy API, you'll need to create the tables manually in your Fabric Lakehouse.

## ⚠️ Important: Use Notebook, NOT SQL Endpoint

The SQL Endpoint is **read-only**. You must use a **Notebook** to create writable tables.

## Steps:

1. **Go to your Fabric Lakehouse**
   - Navigate to https://app.fabric.microsoft.com
   - Open your workspace
   - Find and open your Lakehouse

2. **Create a NEW NOTEBOOK** (not SQL Query)
   - Click **+ New item** or **New notebook**
   - Give it a name like "Setup Tables"
   - Make sure it's attached to your Lakehouse

3. **Add SQL Cell**
   - Click the **+ Code** button
   - Change the language to **SQL** (dropdown at bottom left of cell)
   - Or click **+SQL** if available

4. **Copy and Paste the SQL**
   - Open [FABRIC_SETUP_MANUAL.sql](../FABRIC_SETUP_MANUAL.sql)
   - Copy all the SQL statements
   - Paste them into your notebook cell

5. **Execute the Scripts**
   - Click the **Run cell** button (or Ctrl+Enter)
   - Wait for all tables to be created
   - You should see no errors

6. **Verify Tables Were Created**
   - Create a new SQL cell
   - Run this verification query:
   ```sql
   SELECT * FROM information_schema.tables 
   WHERE table_name LIKE 'wizard_%' 
      OR table_name LIKE 'key_%' 
      OR table_name LIKE 'service_%'
   ```
   - You should see 8 tables listed

## Tables Created:

✓ `wizard_sessions` - Main session tracking  
✓ `key_contacts` - Contact information  
✓ `service_orders` - Service order details  
✓ `hr_setup` - HR configuration  
✓ `hardware_setup` - Hardware requirements  
✓ `support_preferences` - Support level preferences  
✓ `file_uploads` - Document uploads  
✓ `wizard_audit_log` - Activity audit trail

## What Happens Next:

Once the tables exist in Fabric:
1. The backend will be able to connect and insert/query data
2. The frontend wizard will work normally
3. Data will persist in your Lakehouse

## Troubleshooting

**Error: "SQL Endpoint is read-only"**
→ Use a Notebook instead of SQL Query editor

**Error: "PRIMARY KEY not supported"**
→ Already fixed in the updated SQL script - no PRIMARY KEY constraints

**Error: "Table already exists"**
→ Safe to ignore, or add `IF NOT EXISTS` (which is already in the script)

**Tables not showing up**
→ Refresh your Lakehouse (F5 or refresh button)
→ Check the Notebook output to see if there were any errors
