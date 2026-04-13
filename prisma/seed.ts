import { PrismaClient, UserRole, UserStatus, RequestStatus, ComplaintStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create seeded users
  const hashedPassword = await bcrypt.hash('superadmin123', 10);
  const hashedPassword2 = await bcrypt.hash('admin123', 10);
  const hashedPassword3 = await bcrypt.hash('staff123', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@umak.edu.ph' },
    update: {},
    create: {
      email: 'superadmin@umak.edu.ph',
      password: hashedPassword,
      name: 'Super Admin',
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@umak.edu.ph' },
    update: {},
    create: {
      email: 'admin@umak.edu.ph',
      password: hashedPassword2,
      name: 'Admin User',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@umak.edu.ph' },
    update: {},
    create: {
      email: 'staff@umak.edu.ph',
      password: hashedPassword3,
      name: 'Staff User',
      role: UserRole.STAFF,
      status: UserStatus.ACTIVE,
    },
  });

  console.log('Created users:', { superAdmin, admin, staff });

  // Create colleges list
  const colleges = [
    'College of Business and Financial Management',
    'College of Continuing Advanced and Professional Studies',
    'College of Construction Sciences and Engineering',
    'College of Computing and Information Sciences',
    'College of Engineering Technology',
    'College of Governance and Public Policy',
    'College of Human Kinetics',
    'College of Innovative Teacher Education',
    'CITE-Higher School ng UMak',
    'College of Tourism and Hospitality Management',
    'Institute of Arts and Design',
    'Institute of Disaster and Emergency Management',
    'Institutes of Imaging Health Sciences',
    'Institute of Accountancy',
    'Institutes of Nursing',
    'Institutes of Pharmacy',
    'Institute of Psychology',
    'Institute of Social Works',
    'School of Law',
    'Other',
  ];

  for (let i = 0; i < colleges.length; i++) {
    await prisma.managedList.upsert({
      where: { id: `college-${i}` },
      update: {},
      create: {
        listType: 'college',
        label: colleges[i],
        value: colleges[i],
        sortOrder: i,
      },
    });
  }

  // Create purposes list
  const purposes = [
    'Employment',
    'Graduate School',
    'Scholarship',
    'Transfer',
    'Board Exam',
    'Agency',
    'Other',
  ];

  for (let i = 0; i < purposes.length; i++) {
    await prisma.managedList.upsert({
      where: { id: `purpose-${i}` },
      update: {},
      create: {
        listType: 'purpose',
        label: purposes[i],
        value: purposes[i],
        sortOrder: i,
      },
    });
  }

  // Create complaint types
  const complaintTypes = [
    'Academic Dishonesty',
    'Harassment',
    'Uniform Violation',
    'Disrespect to Faculty/Staff',
    'Vandalism',
    'Theft',
    'Physical Altercation',
    'Verbal Abuse',
    'Cyberbullying',
    'Substance Abuse',
    'Other',
  ];

  for (let i = 0; i < complaintTypes.length; i++) {
    await prisma.managedList.upsert({
      where: { id: `complaint-${i}` },
      update: {},
      create: {
        listType: 'complaint_type',
        label: complaintTypes[i],
        value: complaintTypes[i],
        sortOrder: i,
      },
    });
  }

  // Create year levels
  const yearLevels = [
    'Grade 11',
    'Grade 12',
    'First Year Level',
    'Second Year Level',
    'Third Year Level',
    'Fourth Year Level',
    'Fifth Year Level',
  ];

  for (let i = 0; i < yearLevels.length; i++) {
    await prisma.managedList.upsert({
      where: { id: `yearlevel-${i}` },
      update: {},
      create: {
        listType: 'year_level',
        label: yearLevels[i],
        value: yearLevels[i],
        sortOrder: i,
      },
    });
  }

  // Create office hours (Monday-Friday, 8:00 AM - 5:00 PM)
  const officeHours = [
    { day: 1, open: '08:00', close: '17:00', isOpen: true },  // Monday
    { day: 2, open: '08:00', close: '17:00', isOpen: true },  // Tuesday
    { day: 3, open: '08:00', close: '17:00', isOpen: true },  // Wednesday
    { day: 4, open: '08:00', close: '17:00', isOpen: true },  // Thursday
    { day: 5, open: '08:00', close: '17:00', isOpen: true },  // Friday
    { day: 6, open: '00:00', close: '00:00', isOpen: false }, // Saturday
    { day: 0, open: '00:00', close: '00:00', isOpen: false }, // Sunday
  ];

  for (const hours of officeHours) {
    await prisma.officeHours.upsert({
      where: { id: `office-${hours.day}` },
      update: {},
      create: {
        dayOfWeek: hours.day,
        openTime: hours.open,
        closeTime: hours.close,
        isOpen: hours.isOpen,
      },
    });
  }

  // Create system settings
  await prisma.systemSetting.upsert({
    where: { key: 'max_file_size' },
    update: {},
    create: {
      key: 'max_file_size',
      value: '10485760', // 10MB
      description: 'Maximum file upload size in bytes',
    },
  });

  await prisma.systemSetting.upsert({
    where: { key: 'allowed_file_types' },
    update: {},
    create: {
      key: 'allowed_file_types',
      value: 'pdf,jpg,jpeg,png,doc,docx',
      description: 'Allowed file types for uploads',
    },
  });

  await prisma.systemSetting.upsert({
    where: { key: 'certificate_validity_months' },
    update: {},
    create: {
      key: 'certificate_validity_months',
      value: '6',
      description: 'Certificate validity period in months',
    },
  });

  await prisma.systemSetting.upsert({
    where: { key: 'app_name' },
    update: {},
    create: {
      key: 'app_name',
      value: 'iCSFD+',
      description: 'Application name',
    },
  });

  await prisma.systemSetting.upsert({
    where: { key: 'app_tagline' },
    update: {},
    create: {
      key: 'app_tagline',
      value: 'Your digital gateway to student services at the University of Makati',
      description: 'Application tagline',
    },
  });

  // Create sample announcement
  await prisma.announcement.create({
    data: {
      title: 'Welcome to iCSFD+',
      content: 'The Center for Student Formation and Discipline is now accepting online requests for certificates and clearances. Please use this portal to submit your requests and track their status.',
      isPinned: true,
      isActive: true,
      postedFrom: new Date(),
      createdBy: superAdmin.id,
    },
  });

  // Create CMS content
  await prisma.cmsContent.create({
    data: {
      key: 'hero_title',
      label: 'Hero Title',
      value: 'Center for Student Formation and Discipline',
    },
  });

  await prisma.cmsContent.create({
    data: {
      key: 'hero_subtitle',
      label: 'Hero Subtitle',
      value: 'University of Makati. University of Character.',
    },
  });

  await prisma.cmsContent.create({
    data: {
      key: 'about_text',
      label: 'About CSFD',
      value: 'The Center for Student Formation and Discipline (CSFD) is committed to developing well-rounded individuals who embody the core values of the University of Makati. We provide comprehensive student services including certificate issuance, disciplinary guidance, and character formation programs.',
    },
  });

  await prisma.cmsContent.create({
    data: {
      key: 'vision',
      label: 'Vision',
      value: 'A leading center for student formation and discipline that produces graduates of character and integrity.',
    },
  });

  await prisma.cmsContent.create({
    data: {
      key: 'mission',
      label: 'Mission',
      value: 'To provide holistic student formation programs and fair disciplinary processes that nurture responsible, ethical, and community-oriented individuals.',
    },
  });

  await prisma.cmsContent.create({
    data: {
      key: 'contact_email',
      label: 'Contact Email',
      value: 'csfd@umak.edu.ph',
    },
  });

  await prisma.cmsContent.create({
    data: {
      key: 'contact_phone',
      label: 'Contact Phone',
      value: '8883-1875',
    },
  });

  await prisma.cmsContent.create({
    data: {
      key: 'contact_address',
      label: 'Contact Address',
      value: 'University of Makati, J.P. Rizal Extension, West Rembo, Makati City',
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
