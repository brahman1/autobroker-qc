import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: any;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: { sign: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('devrait bloquer un email existant', async () => {
    usersService.findByEmail.mockResolvedValue({ id: '1', email: 'test@example.com' });
    await expect(service.register({ email: 'test@example.com', password: '123', firstName: 'A', lastName: 'B' })).rejects.toThrow(BadRequestException);
  });

  it('normalise le courriel avant de vérifier et créer un compte', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    usersService.create.mockResolvedValue({ id: '1', email: 'client@test.fr', password: 'hash' });

    await service.register({ email: ' Client@Test.FR ', password: 'motdepasse-solide', firstName: 'A', lastName: 'B' });

    expect(usersService.findByEmail).toHaveBeenCalledWith('client@test.fr');
    expect(usersService.create).toHaveBeenCalledWith(expect.objectContaining({ email: 'client@test.fr' }));
  });
});
