export class UserRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  findById(id) {
    return this.#prisma.user.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
  }

  findByEmail(email, { includePassword = false } = {}) {
    return this.#prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        name: true,
        ...(includePassword ? { password: true } : {}),
        createdAt: true,
      },
    });
  }

  create(data) {
    return this.#prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
  }

  update(id, data) {
    return this.#prisma.user.update({
      where: {
        id: Number(id),
      },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
  }

  findBySocialAccount(provider, providerId) {
    return this.#prisma.user.findFirst({
      where: {
        socialAccounts: {
          some: { provider, providerId },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
  }

  createWithSocialAccount({ email, name, provider, providerId }) {
    return this.#prisma.user.create({
      data: {
        email,
        name,
        socialAccounts: {
          create: { provider, providerId },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
  }
}
