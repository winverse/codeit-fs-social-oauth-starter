import postgres from '@prisma/orm-postgres/runtime';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import contractJson from '../src/prisma/contract.json' with { type: 'json' };

const SEED_PASSWORD = 'Test1234!';

class Seeder {
  #db;
  #numUsersToCreate;
  #hashedPassword;

  constructor(db, numUsersToCreate = 5) {
    this.#db = db;
    this.#numUsersToCreate = numUsersToCreate;
  }

  #xs(n) {
    return Array.from({ length: n }, (_, i) => i + 1);
  }

  #makeUserInput() {
    return {
      email: faker.internet.email(),
      name: faker.person.fullName(),
      password: this.#hashedPassword,
    };
  }

  async #resetDb() {
    return this.#db.orm.public.User.deleteAll();
  }

  async #seedUsers() {
    const data = this.#xs(this.#numUsersToCreate).map(() =>
      this.#makeUserInput(),
    );

    return await this.#db.orm.public.User.select('id').createAll(data);
  }

  async run() {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('⚠️ 프로덕션 환경에서는 시딩을 실행하지 않습니다');
    }

    if (!process.env.DATABASE_URL?.includes('localhost')) {
      throw new Error(
        '⚠️ localhost 데이터베이스에만 시딩을 실행할 수 있습니다',
      );
    }

    console.log('🌱 시딩 시작...');

    this.#hashedPassword = await bcrypt.hash(SEED_PASSWORD, 10);

    await this.#resetDb();
    console.log('✅ 기존 데이터 삭제 완료');

    const users = await this.#seedUsers();
    console.log(`✅ ${users.length}명의 유저가 생성되었습니다`);
    console.log(`🔑 모든 유저의 비밀번호: ${SEED_PASSWORD}`);

    console.log('✅ 데이터 시딩 완료');
  }
}

const db = postgres({
  contractJson,
  url: process.env.DATABASE_URL,
});
const seeder = new Seeder(db, 5);

seeder
  .run()
  .catch((e) => {
    console.error('❌ 시딩 에러:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.close();
  });
