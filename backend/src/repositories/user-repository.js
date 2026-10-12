const USER_FIELDS = ['id', 'email', 'name', 'createdAt'];

export class UserRepository {
  #db;

  constructor({ db }) {
    this.#db = db;
  }

  findById(id) {
    return this.#db.orm.public.User.where({ id: Number(id) })
      .select(...USER_FIELDS)
      .first();
  }

  findByEmail(email, { includePassword = false } = {}) {
    const fields = includePassword ? [...USER_FIELDS, 'password'] : USER_FIELDS;

    return this.#db.orm.public.User.where({ email })
      .select(...fields)
      .first();
  }

  create(data) {
    return this.#db.orm.public.User.select(...USER_FIELDS).create(data);
  }

  update(id, data) {
    return this.#db.orm.public.User.where({ id: Number(id) })
      .select(...USER_FIELDS)
      .update(data);
  }

  findBySocialAccount(provider, providerId) {
    return this.#db.orm.public.User.where((user) =>
      user.socialAccounts.some({ provider, providerId }),
    )
      .select(...USER_FIELDS)
      .first();
  }

  createWithSocialAccount({ email, name, provider, providerId }) {
    return this.#db.orm.public.User.select(...USER_FIELDS).create({
      email,
      name,
      socialAccounts: (accounts) => accounts.create([{ provider, providerId }]),
    });
  }
}
