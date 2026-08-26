import { z } from 'zod';
import { createDocument } from 'zod-openapi';
import { signUpSchema, loginSchema } from '#controllers/auth/dto/auth.dto.js';

const userResponseSchema = z
  .object({
    id: z.number().int().positive(),
    email: z.string().email(),
    name: z.string().nullable(),
    createdAt: z.string(),
  })
  .meta({
    id: 'UserResponse',
    description: '인증 성공 시 반환되는 사용자 공개 정보',
  });

const pingResponseSchema = z
  .object({
    message: z.string(),
  })
  .meta({
    id: 'PingResponse',
    description: '서버 상태 확인 응답',
  });

const errorResponseSchema = z
  .object({
    success: z.literal(false),
    message: z.string(),
    details: z.record(z.string(), z.array(z.string())).optional(),
  })
  .meta({
    id: 'ErrorResponse',
    description: '공통 에러 응답',
  });

export const openApiDocument = createDocument({
  openapi: '3.1.0',
  info: {
    title: 'OAuth Social Login API',
    version: '1.0.0',
    description: '이메일 인증과 소셜 로그인 흐름만 남긴 인증 API 문서',
  },
  tags: [
    {
      name: 'Health',
      description: '서버 상태 확인',
    },
    {
      name: 'Auth',
      description: '로그인, 회원가입, 세션 확인',
    },
  ],
  components: {
    securitySchemes: {
      accessTokenCookie: {
        type: 'apiKey',
        in: 'cookie',
        name: 'accessToken',
        description: '로그인 성공 시 설정되는 Access Token 쿠키',
      },
    },
  },
  paths: {
    '/api/ping': {
      get: {
        tags: ['Health'],
        summary: '서버 상태 확인',
        responses: {
          200: {
            description: '서버 정상 응답',
            content: {
              'application/json': {
                schema: pingResponseSchema,
              },
            },
          },
        },
      },
    },
    '/api/auth/signup': {
      post: {
        tags: ['Auth'],
        summary: '이메일 회원가입',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: signUpSchema,
            },
          },
        },
        responses: {
          201: {
            description: '회원가입 성공',
            content: {
              'application/json': {
                schema: userResponseSchema,
              },
            },
          },
          400: {
            description: '입력값 검증 실패',
            content: {
              'application/json': {
                schema: errorResponseSchema,
              },
            },
          },
          409: {
            description: '이메일 중복',
            content: {
              'application/json': {
                schema: errorResponseSchema,
              },
            },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: '이메일 로그인',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: loginSchema,
            },
          },
        },
        responses: {
          200: {
            description: '로그인 성공',
            content: {
              'application/json': {
                schema: userResponseSchema,
              },
            },
          },
          400: {
            description: '입력값 검증 실패',
            content: {
              'application/json': {
                schema: errorResponseSchema,
              },
            },
          },
          401: {
            description: '인증 실패',
            content: {
              'application/json': {
                schema: errorResponseSchema,
              },
            },
          },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: '로그아웃',
        responses: {
          204: {
            description: '로그아웃 성공',
          },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: '현재 로그인 사용자 조회',
        security: [{ accessTokenCookie: [] }],
        responses: {
          200: {
            description: '사용자 조회 성공',
            content: {
              'application/json': {
                schema: userResponseSchema,
              },
            },
          },
          401: {
            description: '로그인 필요',
            content: {
              'application/json': {
                schema: errorResponseSchema,
              },
            },
          },
        },
      },
    },
  },
});
