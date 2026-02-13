import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create associations
  const association1 = await prisma.association.create({
    data: {
      name: 'Association Espoir Tunisie',
      description: 'Aide aux familles défavorisées dans la région de Tunis. Nous nous concentrons sur la sécurité alimentaire et le soutien éducatif.',
      email: 'contact@espoir-tunisie.org',
      phone: '+216 71 000 001',
      address: 'Avenue Habib Bourguiba, Tunis 1000',
      status: 'ACTIVE',
      budget: 1800, // Starting budget from approved contributions
    },
  });

  const association2 = await prisma.association.create({
    data: {
      name: 'Croissant Rouge Sfax',
      description: 'Branche locale du Croissant Rouge, fournissant une aide humanitaire et des secours d\'urgence.',
      email: 'sfax@croissant-rouge.tn',
      phone: '+216 74 000 002',
      address: 'Rue de la République, Sfax 3000',
      status: 'ACTIVE',
      budget: 500,
    },
  });

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@charity.tn',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
    },
  });

  const associationAdmin = await prisma.user.create({
    data: {
      email: 'admin@espoir-tunisie.org',
      password: hashedPassword,
      name: 'Ahmed Ben Salah',
      role: 'ASSOCIATION_ADMIN',
      associationId: association1.id,
    },
  });

  const associationMember = await prisma.user.create({
    data: {
      email: 'membre@espoir-tunisie.org',
      password: hashedPassword,
      name: 'Fatma Khelifi',
      role: 'ASSOCIATION_MEMBER',
      associationId: association1.id,
    },
  });

  const donor = await prisma.user.create({
    data: {
      email: 'donateur@email.tn',
      password: hashedPassword,
      name: 'Mohamed Trabelsi',
      role: 'DONOR',
    },
  });

  // Create families
  const family1 = await prisma.family.create({
    data: {
      name: 'Famille Ben Ali',
      memberCount: 5,
      address: 'Cité Ettadhamen, Tunis',
      status: 'ELIGIBLE',
      associationId: association1.id,
    },
  });

  const family2 = await prisma.family.create({
    data: {
      name: 'Famille Gharbi',
      memberCount: 3,
      address: 'Bab El Khadra, Tunis',
      status: 'ELIGIBLE',
      associationId: association1.id,
    },
  });

  const family3 = await prisma.family.create({
    data: {
      name: 'Famille Mejri',
      memberCount: 4,
      address: 'La Marsa, Tunis',
      status: 'COOLDOWN',
      totalReceived: 300,
      lastDonationDate: new Date('2025-01-15'),
      associationId: association1.id,
    },
  });

  // Create beneficiaries with National IDs
  const beneficiary1 = await prisma.beneficiary.create({
    data: {
      nationalId: '12345678',
      firstName: 'Khaled',
      lastName: 'Ben Ali',
      email: 'khaled.benali@email.tn',
      phone: '+216 20 000 001',
      status: 'ELIGIBLE',
      familyId: family1.id,
      associationId: association1.id,
    },
  });

  const beneficiary2 = await prisma.beneficiary.create({
    data: {
      nationalId: '23456789',
      firstName: 'Amira',
      lastName: 'Ben Ali',
      status: 'ELIGIBLE',
      familyId: family1.id,
      associationId: association1.id,
    },
  });

  const beneficiary3 = await prisma.beneficiary.create({
    data: {
      nationalId: '34567890',
      firstName: 'Youssef',
      lastName: 'Gharbi',
      email: 'youssef.gharbi@email.tn',
      status: 'ELIGIBLE',
      familyId: family2.id,
      associationId: association1.id,
    },
  });

  const beneficiary4 = await prisma.beneficiary.create({
    data: {
      nationalId: '45678901',
      firstName: 'Leila',
      lastName: 'Mejri',
      status: 'PENDING_REVIEW',
      eligibilityNotes: 'En attente de vérification des revenus',
      familyId: family3.id,
      associationId: association1.id,
    },
  });

  // Create donation rules
  await prisma.donationRule.createMany({
    data: [
      {
        name: 'Période de repos familial',
        description: 'Nombre minimum de jours entre les dons à la même famille',
        type: 'FREQUENCY',
        value: 30,
        unit: 'days',
        isActive: true,
        associationId: association1.id,
      },
      {
        name: 'Montant maximum par membre',
        description: 'Montant maximum de don par membre de famille',
        type: 'AMOUNT',
        value: 100,
        unit: 'TND',
        isActive: true,
        associationId: association1.id,
      },
      {
        name: 'Membres minimum',
        description: 'Nombre minimum de membres pour être éligible',
        type: 'ELIGIBILITY',
        value: 2,
        unit: 'members',
        isActive: true,
        associationId: association1.id,
      },
    ],
  });

  // ==========================================================================
  // CONTRIBUTIONS (Money IN from donors)
  // ==========================================================================
  
  // Approved contributions (added to budget)
  await prisma.contribution.create({
    data: {
      amount: 500,
      currency: 'TND',
      status: 'APPROVED',
      type: 'ONE_TIME',
      method: 'CARD',
      notes: 'Contribution pour aider les familles',
      associationId: association1.id,
      donorId: donor.id,
      approvedAt: new Date('2025-01-20'),
      approvedBy: associationAdmin.id,
    },
  });

  await prisma.contribution.create({
    data: {
      amount: 1000,
      currency: 'TND',
      status: 'APPROVED',
      type: 'ONE_TIME',
      method: 'BANK_TRANSFER',
      notes: 'Soutien mensuel',
      associationId: association1.id,
      donorId: donor.id,
      approvedAt: new Date('2025-01-22'),
      approvedBy: associationAdmin.id,
    },
  });

  await prisma.contribution.create({
    data: {
      amount: 750,
      currency: 'TND',
      status: 'APPROVED',
      type: 'RECURRING',
      method: 'CARD',
      associationId: association1.id,
      donorId: donor.id,
      approvedAt: new Date('2025-01-25'),
      approvedBy: associationMember.id,
    },
  });

  // Pending contribution (anonymous donor)
  await prisma.contribution.create({
    data: {
      amount: 250,
      currency: 'TND',
      status: 'PENDING',
      type: 'ONE_TIME',
      method: 'CASH',
      notes: 'En attente de validation',
      associationId: association1.id,
      donorName: 'Donateur Anonyme',
      donorEmail: 'anon@email.tn',
    },
  });

  // ==========================================================================
  // DONATIONS (Aid OUT to beneficiaries - from budget)
  // ==========================================================================
  
  // Completed donations
  await prisma.donation.create({
    data: {
      amount: 200,
      currency: 'TND',
      status: 'COMPLETED',
      aidType: 'CASH',
      notes: 'Aide mensuelle famille Ben Ali',
      associationId: association1.id,
      beneficiaryId: beneficiary1.id,
      familyId: family1.id,
      processedById: associationAdmin.id,
    },
  });

  await prisma.donation.create({
    data: {
      amount: 150,
      currency: 'TND',
      status: 'COMPLETED',
      aidType: 'FOOD',
      notes: 'Colis alimentaire',
      associationId: association1.id,
      beneficiaryId: beneficiary3.id,
      familyId: family2.id,
      processedById: associationMember.id,
    },
  });

  await prisma.donation.create({
    data: {
      amount: 100,
      currency: 'TND',
      status: 'COMPLETED',
      aidType: 'MEDICAL',
      notes: 'Frais médicaux',
      associationId: association1.id,
      beneficiaryId: beneficiary2.id,
      familyId: family1.id,
      processedById: associationAdmin.id,
    },
  });

  // ==========================================================================
  // ACTIVITY LOGS (for transparency)
  // ==========================================================================
  
  await prisma.activityLog.createMany({
    data: [
      {
        action: 'CONTRIBUTION_APPROVED',
        details: 'Approved contribution of 500 TND from Mohamed Trabelsi',
        entityType: 'CONTRIBUTION',
        entityId: 'contrib-1',
        associationId: association1.id,
        userId: associationAdmin.id,
      },
      {
        action: 'DONATION_CREATED',
        details: 'Created donation of 200 TND to Khaled Ben Ali (Famille Ben Ali)',
        entityType: 'DONATION',
        entityId: 'donation-1',
        associationId: association1.id,
        userId: associationAdmin.id,
      },
      {
        action: 'BENEFICIARY_ADDED',
        details: 'Added new beneficiary: Khaled Ben Ali',
        entityType: 'BENEFICIARY',
        entityId: beneficiary1.id,
        associationId: association1.id,
        userId: associationAdmin.id,
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log('\n📋 Demo Accounts:');
  console.log('  Super Admin:        admin@charity.tn / password123');
  console.log('  Association Admin:  admin@espoir-tunisie.org / password123');
  console.log('  Association Member: membre@espoir-tunisie.org / password123');
  console.log('  Donor:              donateur@email.tn / password123');
  console.log('\n💰 System Overview:');
  console.log('  Association Budget: 1800 TND');
  console.log('  Total Contributions: 2500 TND (2250 approved + 250 pending)');
  console.log('  Total Donations: 450 TND');
  console.log('\n🔢 National IDs for testing:');
  console.log('  12345678, 23456789, 34567890, 45678901');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
