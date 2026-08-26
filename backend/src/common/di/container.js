import {
  createContainer as createAwilixContainer,
  asClass,
  asValue,
  InjectionMode,
  Lifetime,
} from 'awilix';
import { prisma } from '#db/prisma.js';
import { config } from '#config';
import { UserRepository } from '#repository';
import { AuthService, SocialAuthService } from '#services';
import { AuthController, SocialAuthController, Controller } from '#controllers';
import {
  PasswordProvider,
  TokenProvider,
  CookieProvider,
  OAuthStateProvider,
} from '#providers';
import { AuthMiddleware } from '#middlewares';

export const createContainer = () => {
  const container = createAwilixContainer({
    injectionMode: InjectionMode.PROXY,
    strict: true,
  });

  container.register({
    // 1. Providers / Data Access
    prisma: asValue(prisma),
    oauthStateSecret: asValue(config.OAUTH_STATE_SECRET),
    clientBaseUrl: asValue(config.CLIENT_BASE_URL),
    userRepository: asClass(UserRepository, { lifetime: Lifetime.SINGLETON }),
    passwordProvider: asClass(PasswordProvider, {
      lifetime: Lifetime.SINGLETON,
    }),
    tokenProvider: asClass(TokenProvider, { lifetime: Lifetime.SINGLETON }),
    cookieProvider: asClass(CookieProvider, { lifetime: Lifetime.SINGLETON }),
    oauthStateProvider: asClass(OAuthStateProvider, {
      lifetime: Lifetime.SINGLETON,
    }),

    // 2. Services
    authService: asClass(AuthService, { lifetime: Lifetime.SINGLETON }),
    socialAuthService: asClass(SocialAuthService, {
      lifetime: Lifetime.SINGLETON,
    }),

    // 3. Middlewares
    authMiddleware: asClass(AuthMiddleware, { lifetime: Lifetime.SINGLETON }),

    // 4. Controllers
    authController: asClass(AuthController, { lifetime: Lifetime.SINGLETON }),
    socialAuthController: asClass(SocialAuthController, {
      lifetime: Lifetime.SINGLETON,
    }),

    // 5. Root Controller
    controller: asClass(Controller, { lifetime: Lifetime.SINGLETON }),
  });

  return container.cradle;
};
