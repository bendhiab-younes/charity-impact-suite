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
      lastDonationDate: new Date('2024-01-15'),
      associationId: association1.id,
    },
  });

  // Create beneficiaries
  await prisma.beneficiary.createMany({
    data: [
      {
        firstName: 'Khaled',
        lastName: 'Ben Ali',
        email: 'khaled.benali@email.tn',
        phone: '+216 20 000 001',
        status: 'ELIGIBLE',
        familyId: family1.id,
        associationId: association1.id,
      },
      {
        firstName: 'Amira',
        lastName: 'Ben Ali',
        status: 'ELIGIBLE',
        familyId: family1.id,
        associationId: association1.id,
      },
      {
        firstName: 'Youssef',
        lastName: 'Gharbi',
        email: 'youssef.gharbi@email.tn',
        status: 'ELIGIBLE',
        familyId: family2.id,
        associationId: association1.id,
      },
      {
        firstName: 'Leila',
        lastName: 'Mejri',
        status: 'PENDING_REVIEW',
        eligibilityNotes: 'En attente de vérification des revenus',
        familyId: family3.id,
        associationId: association1.id,
      },
    ],
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
        name: 'Montant maximum mensuel',
        description: 'Montant maximum de don par famille par mois',
        type: 'AMOUNT',
        value: 500,
        unit: 'TND',
        isActive: true,
        associationId: association1.id,
      },
      {
        name: 'Seuil de revenu',
        description: 'Revenu annuel maximum du ménage pour être éligible',
        type: 'ELIGIBILITY',
        value: 15000,
        unit: 'TND',
        isActive: true,
        associationId: association1.id,
      },
    ],
  });

  // Create donations
  await prisma.donation.createMany({
    data: [
      {
        amount: 150,
        currency: 'TND',
        status: 'COMPLETED',
        type: 'ONE_TIME',
        method: 'CASH',
        associationId: association1.id,
        donorId: donor.id,
        familyId: family1.id,
        processedAt: new Date('2024-01-10'),
      },
      {
        amount: 200,
        currency: 'TND',
        status: 'COMPLETED',
        type: 'ONE_TIME',
        method: 'BANK_TRANSFER',
        associationId: association1.id,
        donorId: donor.id,
        familyId: family2.id,
        processedAt: new Date('2024-01-12'),
      },
      {
        amount: 100,
        currency: 'TND',
        status: 'PENDING',
        type: 'ONE_TIME',
        method: 'CASH',
        notes: 'Don en attente d\'approbation',
        associationId: association1.id,
        familyId: family1.id,
      },
      {
        amount: 300,
        currency: 'TND',
        status: 'COMPLETED',
        type: 'ONE_TIME',
        method: 'CASH',
        associationId: association1.id,
        familyId: family3.id,
        processedAt: new Date('2024-01-15'),
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log('\n📋 Demo Accounts:');
  console.log('  Super Admin:        admin@charity.tn / password123');
  console.log('  Association Admin:  admin@espoir-tunisie.org / password123');
  console.log('  Association Member: membre@espoir-tunisie.org / password123');
  console.log('  Donor:              donateur@email.tn / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
