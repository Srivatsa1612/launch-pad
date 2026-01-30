// Test the staging profile save endpoint
const sqlService = require('./src/services/sqlService');

async function testStagingProfileSave() {
  try {
    console.log('Testing staging profile save...\n');
    
    // Ensure connection
    await sqlService.ensureConnection();
    
    // Test data
    const profile = {
      code: 'TEST-12345',
      companyName: 'Test Company',
      contactName: 'John Doe',
      contactEmail: 'john@test.com',
      contactPhone: '555-1234',
      billingName: 'Jane Doe',
      billingEmail: 'billing@test.com',
      billingPhone: '555-5678',
      techName: 'Tech Person',
      techEmail: 'tech@test.com',
      techPhone: '555-9999',
      emergencyName: 'Emergency Contact',
      emergencyEmail: 'emergency@test.com',
      emergencyPhone: '555-0000',
      serviceTier: 'Standard',
      startDate: '2026-02-01',
      contractTerm: 12,
      monthlyCommitment: 5000,
      hrisSystem: 'BambooHR',
      updateMethod: 'API',
      syncFrequency: 'daily',
      deviceChoice: 'Standard',
      giftChoice: 'Premium',
      supportLevel: 'Standard',
      notes: 'Test notes',
      adminNotes: 'Admin test notes',
      status: 'draft'
    };
    
    console.log('Calling sp_SaveProfileToStaging with:', {
      code: profile.code,
      companyName: profile.companyName
    });
    
    const result = await sqlService.query(`
      EXEC sp_SaveProfileToStaging
        @profileCode = @profileCode,
        @companyName = @companyName,
        @contactName = @contactName,
        @contactEmail = @contactEmail,
        @contactPhone = @contactPhone,
        @billingName = @billingName,
        @billingEmail = @billingEmail,
        @billingPhone = @billingPhone,
        @techName = @techName,
        @techEmail = @techEmail,
        @techPhone = @techPhone,
        @emergencyName = @emergencyName,
        @emergencyEmail = @emergencyEmail,
        @emergencyPhone = @emergencyPhone,
        @serviceTier = @serviceTier,
        @startDate = @startDate,
        @contractTerm = @contractTerm,
        @monthlyCommitment = @monthlyCommitment,
        @hrisSystem = @hrisSystem,
        @updateMethod = @updateMethod,
        @syncFrequency = @syncFrequency,
        @deviceChoice = @deviceChoice,
        @giftChoice = @giftChoice,
        @supportLevel = @supportLevel,
        @notes = @notes,
        @adminNotes = @adminNotes,
        @profileJson = @profileJson,
        @createdBy = @createdBy,
        @status = @status
    `, {
      profileCode: profile.code,
      companyName: profile.companyName,
      contactName: profile.contactName,
      contactEmail: profile.contactEmail,
      contactPhone: profile.contactPhone,
      billingName: profile.billingName,
      billingEmail: profile.billingEmail,
      billingPhone: profile.billingPhone,
      techName: profile.techName,
      techEmail: profile.techEmail,
      techPhone: profile.techPhone,
      emergencyName: profile.emergencyName,
      emergencyEmail: profile.emergencyEmail,
      emergencyPhone: profile.emergencyPhone,
      serviceTier: profile.serviceTier,
      startDate: profile.startDate,
      contractTerm: profile.contractTerm,
      monthlyCommitment: profile.monthlyCommitment,
      hrisSystem: profile.hrisSystem,
      updateMethod: profile.updateMethod,
      syncFrequency: profile.syncFrequency,
      deviceChoice: profile.deviceChoice,
      giftChoice: profile.giftChoice,
      supportLevel: profile.supportLevel,
      notes: profile.notes,
      adminNotes: profile.adminNotes,
      profileJson: JSON.stringify(profile),
      createdBy: 'admin@m-theorygrp.com',
      status: profile.status
    });
    
    console.log('\n✓ Success! Result:', result);
    
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    if (error.originalError) {
      console.error('Original error:', error.originalError.message);
    }
  } finally {
    await sqlService.disconnect();
    process.exit();
  }
}

testStagingProfileSave();
