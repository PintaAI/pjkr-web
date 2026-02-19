import { PrismaClient } from '@prisma/client';
import { hashSync } from 'bcryptjs';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Korean vocabulary data
const koreanVocabulary = [
  { korean: '안녕하세요', indonesian: 'Halo', type: 'WORD', pos: 'KATA_KETERANGAN', examples: ['안녕하세요, 만나서 반갑습니다.'] },
  { korean: '감사합니다', indonesian: 'Terima kasih', type: 'WORD', pos: 'KATA_KETERANGAN', examples: ['도움을 주셔서 감사합니다.'] },
  { korean: '죄송합니다', indonesian: 'Maaf', type: 'WORD', pos: 'KATA_KETERANGAN', examples: ['늦어서 죄송합니다.'] },
  { korean: '사랑하다', indonesian: 'Mencintai', type: 'WORD', pos: 'KATA_KERJA', examples: ['나는 너를 사랑한다.'] },
  { korean: '먹다', indonesian: 'Makan', type: 'WORD', pos: 'KATA_KERJA', examples: ['밥을 먹어요.'] },
  { korean: '마시다', indonesian: 'Minum', type: 'WORD', pos: 'KATA_KERJA', examples: ['물을 마셔요.'] },
  { korean: '학교', indonesian: 'Sekolah', type: 'WORD', pos: 'KATA_BENDA', examples: ['학교에 갑니다.'] },
  { korean: '집', indonesian: 'Rumah', type: 'WORD', pos: 'KATA_BENDA', examples: ['집에서 쉬어요.'] },
  { korean: '친구', indonesian: 'Teman', type: 'WORD', pos: 'KATA_BENDA', examples: ['친구와 놀아요.'] },
  { korean: '예쁘다', indonesian: 'Cantik', type: 'WORD', pos: 'KATA_SIFAT', examples: ['꽃이 예뻐요.'] },
  { korean: '크다', indonesian: 'Besar', type: 'WORD', pos: 'KATA_SIFAT', examples: ['집이 커요.'] },
  { korean: '작다', indonesian: 'Kecil', type: 'WORD', pos: 'KATA_SIFAT', examples: ['강아지가 작아요.'] },
  { korean: '오늘 날씨가 좋네요', indonesian: 'Cuaca hari ini bagus ya', type: 'SENTENCE', pos: null, examples: [] },
  { korean: '어디에서 왔어요?', indonesian: 'Dari mana anda berasal?', type: 'SENTENCE', pos: null, examples: [] },
  { korean: '한국어를 배우고 있어요', indonesian: 'Saya sedang belajar bahasa Korea', type: 'SENTENCE', pos: null, examples: [] },
  { korean: '고생 끝에 낙이 온다', indonesian: 'Setelah kesulitan akan datang kemudahan', type: 'IDIOM', pos: null, examples: [] },
  { korean: '금강산도 식후경', indonesian: 'Bahkan Gunung Kumgang terlihat indah setelah makan', type: 'IDIOM', pos: null, examples: [] },
];

// Korean learning class topics
const classTopics = [
  { title: 'Korean Alphabet (Hangeul)', description: 'Learn the Korean writing system and basic pronunciation' },
  { title: 'Basic Greetings', description: 'Essential greeting phrases for daily conversation' },
  { title: 'Numbers and Time', description: 'Korean numbers, dates, and time expressions' },
  { title: 'Family and Relationships', description: 'Vocabulary for family members and relationships' },
  { title: 'Food and Dining', description: 'Korean food vocabulary and restaurant phrases' },
  { title: 'Shopping and Money', description: 'Shopping expressions and currency' },
  { title: 'Transportation', description: 'Getting around in Korea - buses, subway, taxi' },
  { title: 'Weather and Seasons', description: 'Weather vocabulary and seasonal expressions' },
  { title: 'Hobbies and Interests', description: 'Talking about your hobbies and free time' },
  { title: 'Korean Grammar Basics', description: 'Fundamental grammar patterns and sentence structure' },
  { title: 'Honorific Language', description: 'Formal and respectful speech in Korean' },
  { title: 'K-Pop and Korean Culture', description: 'Learn Korean through popular culture' },
];

async function createUsers() {
  console.log('🔄 Creating users...');
  
  const users = [];
  
  // Create admin user
  const adminEmail = 'admin@example.com';
  const adminPassword = 'password123';
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = hashSync(adminPassword, 10);
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        role: 'ADMIN',
        name: 'Admin User',
        emailVerified: true,
        xp: faker.number.int({ min: 1000, max: 5000 }),
        level: faker.number.int({ min: 5, max: 10 }),
        currentStreak: faker.number.int({ min: 0, max: 30 }),
        accounts: {
          create: {
            providerId: 'email',
            accountId: adminEmail,
            password: hashedPassword,
          },
        },
      },
    });
    users.push(adminUser);
    console.log(`✅ Admin user created: ${adminUser.email}`);
  } else {
    users.push(existingAdmin);
    console.log(`✅ Admin user already exists: ${adminEmail}`);
  }

  // Create teachers (gurus)
  for (let i = 0; i < 5; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });
    
    const teacher = await prisma.user.create({
      data: {
        email,
        role: 'GURU',
        name: `${firstName} ${lastName}`,
        emailVerified: true,
        image: faker.image.avatar(),
        xp: faker.number.int({ min: 2000, max: 10000 }),
        level: faker.number.int({ min: 8, max: 20 }),
        currentStreak: faker.number.int({ min: 5, max: 100 }),
        accounts: {
          create: {
            providerId: 'email',
            accountId: email,
            password: hashSync('password123', 10),
          },
        },
      },
    });
    users.push(teacher);
  }

  // Create students (murids)
  for (let i = 0; i < 20; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });
    
    const student = await prisma.user.create({
      data: {
        email,
        role: 'MURID',
        name: `${firstName} ${lastName}`,
        emailVerified: faker.datatype.boolean(0.8),
        image: faker.image.avatar(),
        xp: faker.number.int({ min: 0, max: 3000 }),
        level: faker.number.int({ min: 1, max: 8 }),
        currentStreak: faker.number.int({ min: 0, max: 50 }),
        accounts: {
          create: {
            providerId: 'email',
            accountId: email,
            password: hashSync('password123', 10),
          },
        },
      },
    });
    users.push(student);
  }

  console.log(`✅ Created ${users.length} users total`);
  return users;
}

async function createKelas(users: any[]) {
  console.log('🔄 Creating classes...');
  
  const teachers = users.filter(user => user.role === 'GURU');
  const students = users.filter(user => user.role === 'MURID');
  const kelasList = [];

  for (const topic of classTopics) {
    const teacher = faker.helpers.arrayElement(teachers);
    const level = faker.helpers.arrayElement(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']);
    const type = faker.helpers.arrayElement(['REGULAR', 'EVENT', 'GROUP', 'PRIVATE', 'FUN']);
    const isPaidClass = faker.datatype.boolean(0.3);

    const kelas = await prisma.kelas.create({
      data: {
        title: topic.title,
        description: topic.description,
        jsonDescription: {
          content: topic.description,
          objectives: [
            faker.lorem.sentence(),
            faker.lorem.sentence(),
            faker.lorem.sentence(),
          ],
        },
        htmlDescription: `<p>${topic.description}</p><ul><li>${faker.lorem.sentence()}</li><li>${faker.lorem.sentence()}</li></ul>`,
        type,
        level,
        thumbnail: faker.image.url({ width: 400, height: 300 }),
        icon: faker.helpers.arrayElement(['📚', '🇰🇷', '💬', '📝', '🎵', '🎭', '🍜', '🏫']),
        isPaidClass,
        price: isPaidClass ? faker.number.int({ min: 50000, max: 500000 }) : null,
        discount: isPaidClass && faker.datatype.boolean(0.4) ? faker.number.int({ min: 10000, max: 100000 }) : null,
        promoCode: isPaidClass && faker.datatype.boolean(0.2) ? faker.string.alphanumeric(8).toUpperCase() : null,
        authorId: teacher.id,
        members: {
          connect: faker.helpers.arrayElements(students, { min: 3, max: 15 }).map(student => ({ id: student.id }))
        }
      },
    });
    kelasList.push(kelas);
  }

  console.log(`✅ Created ${kelasList.length} classes`);
  return kelasList;
}

async function createMateri(kelasList: any[]) {
  console.log('🔄 Creating materials...');
  
  let totalMateri = 0;

  for (const kelas of kelasList) {
    const materiCount = faker.number.int({ min: 3, max: 8 });
    
    for (let i = 0; i < materiCount; i++) {
      await prisma.materi.create({
        data: {
          title: `${kelas.title} - Lesson ${i + 1}`,
          description: faker.lorem.paragraph(),
          jsonDescription: {
            content: faker.lorem.paragraphs(3),
            exercises: [
              { type: 'reading', content: faker.lorem.paragraph() },
              { type: 'vocabulary', words: faker.helpers.arrayElements(koreanVocabulary, 5) },
              { type: 'grammar', explanation: faker.lorem.sentence() },
            ],
          },
          htmlDescription: `<h2>Lesson ${i + 1}</h2><p>${faker.lorem.paragraph()}</p><h3>Key Points:</h3><ul><li>${faker.lorem.sentence()}</li><li>${faker.lorem.sentence()}</li></ul>`,
          order: i + 1,
          isDemo: i === 0 && faker.datatype.boolean(0.5), // First lesson sometimes demo
          kelasId: kelas.id,
        },
      });
      totalMateri++;
    }
  }

  console.log(`✅ Created ${totalMateri} materials`);
}

async function createVocabularySets(users: any[], kelasList: any[]) {
  console.log('🔄 Creating vocabulary sets...');
  
  const teachers = users.filter(user => user.role === 'GURU');
  const vocabularySets = [];

  // Create class-specific vocabulary sets
  for (const kelas of kelasList) {
    const vocabSet = await prisma.vocabularySet.create({
      data: {
        title: `${kelas.title} Vocabulary`,
        description: `Essential vocabulary for ${kelas.title}`,
        icon: faker.helpers.arrayElement(['📖', '📚', '📝', '🔤', '📋']),
        isPublic: faker.datatype.boolean(0.7),
        userId: kelas.authorId,
        kelasId: kelas.id,
      },
    });
    vocabularySets.push(vocabSet);
  }

  // Create standalone vocabulary sets
  for (let i = 0; i < 8; i++) {
    const teacher = faker.helpers.arrayElement(teachers);
    const topics = ['Daily Conversation', 'Business Korean', 'Travel Phrases', 'K-Drama Words', 'Food Terms', 'Weather Words'];
    
    const vocabSet = await prisma.vocabularySet.create({
      data: {
        title: faker.helpers.arrayElement(topics),
        description: faker.lorem.sentence(),
        icon: faker.helpers.arrayElement(['📖', '📚', '📝', '🔤', '📋']),
        isPublic: faker.datatype.boolean(0.8),
        userId: teacher.id,
      },
    });
    vocabularySets.push(vocabSet);
  }

  console.log(`✅ Created ${vocabularySets.length} vocabulary sets`);
  return vocabularySets;
}

async function createVocabularyItems(users: any[], vocabularySets: any[]) {
  console.log('🔄 Creating vocabulary items...');
  
  const teachers = users.filter(user => user.role === 'GURU');
  let totalItems = 0;

  for (const vocabSet of vocabularySets) {
    const itemCount = faker.number.int({ min: 5, max: 20 });
    const selectedVocab = faker.helpers.arrayElements(koreanVocabulary, Math.min(itemCount, koreanVocabulary.length));
    
    for (const vocab of selectedVocab) {
      await prisma.vocabularyItem.create({
        data: {
          korean: vocab.korean,
          indonesian: vocab.indonesian,
          type: vocab.type as any,
          pos: vocab.pos as any,
          audioUrl: faker.datatype.boolean(0.4) ? faker.internet.url() + '/audio.mp3' : null,
          exampleSentences: vocab.examples,
          creatorId: vocabSet.userId,
          collectionId: vocabSet.id,
        },
      });
      totalItems++;
    }
  }

  // Create some standalone vocabulary items
  for (let i = 0; i < 30; i++) {
    const teacher = faker.helpers.arrayElement(teachers);
    const vocab = faker.helpers.arrayElement(koreanVocabulary);
    
    await prisma.vocabularyItem.create({
      data: {
        korean: vocab.korean,
        indonesian: vocab.indonesian,
        type: vocab.type as any,
        pos: vocab.pos as any,
        audioUrl: faker.datatype.boolean(0.3) ? faker.internet.url() + '/audio.mp3' : null,
        exampleSentences: vocab.examples,
        creatorId: teacher.id,
      },
    });
    totalItems++;
  }

  console.log(`✅ Created ${totalItems} vocabulary items`);
}

async function createCompletions(users: any[], kelasList: any[]) {
  console.log('🔄 Creating user completions...');
  
  const students = users.filter(user => user.role === 'MURID');
  let totalCompletions = 0;

  for (const student of students) {
    // Get classes this student is enrolled in
    const enrolledKelas = await prisma.kelas.findMany({
      where: {
        members: {
          some: { id: student.id }
        }
      },
      include: {
        materis: true
      }
    });

    for (const kelas of enrolledKelas) {
      // Sometimes complete the entire class
      const completeClass = faker.datatype.boolean(0.3);
      
      if (completeClass) {
        await prisma.userKelasCompletion.create({
          data: {
            userId: student.id,
            kelasId: kelas.id,
            isCompleted: true,
            completedAt: faker.date.recent({ days: 30 }),
          },
        });
        totalCompletions++;
      }

      // Complete individual materials
      for (const materi of kelas.materis) {
        if (faker.datatype.boolean(0.6)) {
          await prisma.userMateriCompletion.create({
            data: {
              userId: student.id,
              materiId: materi.id,
              isCompleted: true,
            },
          });
          totalCompletions++;
        }
      }
    }
  }

  console.log(`✅ Created ${totalCompletions} completions`);
}

async function main() {
  console.log('🌱 Starting database seed...');
  
  try {
    const users = await createUsers();
    const kelasList = await createKelas(users);
    await createMateri(kelasList);
    const vocabularySets = await createVocabularySets(users, kelasList);
    await createVocabularyItems(users, vocabularySets);
    await createCompletions(users, kelasList);
    
    console.log('🎉 Database seeded successfully!');
    console.log('📊 Summary:');
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   📚 Classes: ${kelasList.length}`);
    console.log(`   📖 Vocabulary Sets: ${vocabularySets.length}`);
    console.log(`   🔑 Admin: admin@example.com / password123`);
    console.log(`   🔑 All users: password123`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
