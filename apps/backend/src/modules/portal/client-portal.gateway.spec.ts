import { Test, TestingModule } from '@nestjs/testing';
import { ClientPortalGateway } from './client-portal.gateway';
import { AuthService } from '../auth/auth.service';
import { ProjectsService } from '../projects/projects.service';
import { RedisService } from '../storage/redis.service';
import { Socket } from 'socket.io';
import { UnauthorizedException } from '@nestjs/common';

describe('ClientPortalGateway', () => {
  let gateway: ClientPortalGateway;
  let authService: AuthService;
  let projectsService: ProjectsService;

  const mockUser = {
    id: 'user-123',
    username: 'Architect Bob',
    role: 'admin',
    email: 'bob@hexa.studio',
  };

  const mockSocket = {
    id: 'socket-123',
    join: jest.fn().mockResolvedValue(undefined),
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
    data: {},
    handshake: {
      auth: { token: 'valid-token' },
    },
    rooms: new Set(['project_test-project']),
  } as unknown as Socket;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientPortalGateway,
        {
          provide: AuthService,
          useValue: {
            validateToken: jest.fn().mockResolvedValue(mockUser),
          },
        },
        {
          provide: ProjectsService,
          useValue: {
            getProjectBySlug: jest.fn().mockResolvedValue({ slug: 'test-project' }),
          },
        },
        {
          provide: RedisService,
          useValue: {
            hset: jest.fn().mockResolvedValue(undefined),
            hdel: jest.fn().mockResolvedValue(undefined),
            hgetall: jest.fn().mockResolvedValue({}),
            expire: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    gateway = module.get<ClientPortalGateway>(ClientPortalGateway);
    authService = module.get<AuthService>(AuthService);
    projectsService = module.get<ProjectsService>(ProjectsService);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should authenticate user and attach to socket data', async () => {
      await gateway.handleConnection(mockSocket);
      expect(authService.validateToken).toHaveBeenCalledWith('valid-token');
      expect(mockSocket.data.user).toEqual(mockUser);
    });

    it('should disconnect socket if token is missing', async () => {
      const socketNoToken = { ...mockSocket, handshake: { auth: {} } } as unknown as Socket;
      socketNoToken.disconnect = jest.fn();
      await gateway.handleConnection(socketNoToken);
      expect(socketNoToken.disconnect).toHaveBeenCalled();
    });
  });

  describe('handleJoinProject', () => {
    it('should allow authorized user to join project room', async () => {
      mockSocket.data.user = mockUser;
      const payload = { projectId: 'test-project' };
      
      const result = await gateway.handleJoinProject(mockSocket, payload);

      expect(mockSocket.join).toHaveBeenCalledWith('project_test-project');
      expect(projectsService.getProjectBySlug).toHaveBeenCalledWith('test-project');
      expect(result.status).toBe('joined');
    });

    it('should throw UnauthorizedException if user is not authenticated', async () => {
      mockSocket.data.user = undefined;
      const payload = { projectId: 'test-project' };

      await expect(gateway.handleJoinProject(mockSocket, payload)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('handleSyncState', () => {
    const syncPayload = {
      projectId: 'test-project',
      position: { x: 1, y: 2, z: 3 },
      rotation: { x: 0, y: 0, z: 0 },
      activeElementId: 'element-1',
    };

    it('should broadcast as architect_state_updated for admin users', () => {
      mockSocket.data.user = { ...mockUser, role: 'admin' };
      gateway.handleSyncState(mockSocket, syncPayload);

      expect(mockSocket.to).toHaveBeenCalledWith('project_test-project');
      expect(mockSocket.emit).toHaveBeenCalledWith('architect_state_updated', expect.objectContaining({
        userName: mockUser.username,
        ...syncPayload,
      }));
    });

    it('should broadcast as user_state_updated for regular users', () => {
      mockSocket.data.user = { ...mockUser, role: 'user' };
      gateway.handleSyncState(mockSocket, syncPayload);

      expect(mockSocket.to).toHaveBeenCalledWith('project_test-project');
      expect(mockSocket.emit).toHaveBeenCalledWith('user_state_updated', expect.objectContaining({
        userName: mockUser.username,
        ...syncPayload,
      }));
    });
  });

  describe('handleMaterialUpdate', () => {
    const materialPayload = {
      projectId: 'test-project',
      materialId: 'brushed_titanium',
      targetObjectId: 'facade-01',
      source: 'voice',
    };

    it('should broadcast material_applied for admin users', () => {
      mockSocket.data.user = { ...mockUser, role: 'admin' };
      gateway.handleMaterialUpdate(mockSocket, materialPayload);

      expect(mockSocket.to).toHaveBeenCalledWith('project_test-project');
      expect(mockSocket.emit).toHaveBeenCalledWith('material_applied', expect.objectContaining({
        userName: mockUser.username,
        materialId: 'brushed_titanium',
        source: 'voice',
      }));
    });

    it('should broadcast material_applied for editor users', () => {
      mockSocket.data.user = { ...mockUser, role: 'editor' };
      gateway.handleMaterialUpdate(mockSocket, materialPayload);

      expect(mockSocket.to).toHaveBeenCalledWith('project_test-project');
      expect(mockSocket.emit).toHaveBeenCalledWith('material_applied', expect.objectContaining({
        materialId: 'brushed_titanium',
      }));
    });

    it('should reject regular users with UnauthorizedException', () => {
      mockSocket.data.user = { ...mockUser, role: 'user' };

      expect(() => gateway.handleMaterialUpdate(mockSocket, materialPayload)).toThrow(
        'Only architects can apply material updates',
      );
    });
  });
});
