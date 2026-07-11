import './setup';
import { RequestsService } from '../src/modules/requests/requests.service';
import { NotFoundException } from '@nestjs/common';

describe('RequestsService', () => {
  let service: RequestsService;

  beforeEach(() => {
    service = new RequestsService();
  });

  it('createRequest applies provided fields and defaults', async () => {
    const request = await service.createRequest({
      projectId: 'p1',
      clientId: 'c1',
      title: 'New render',
      description: 'Please render the lobby',
      priority: 'high',
    });

    expect(request.id).toMatch(/^REQ-/);
    expect(request.projectId).toBe('p1');
    expect(request.clientId).toBe('c1');
    expect(request.title).toBe('New render');
    expect(request.priority).toBe('high');
    expect(request.status).toBe('pending');
    expect(request.createdAt).toBeDefined();
  });

  it('createRequest falls back to defaults when fields are missing', async () => {
    const request = await service.createRequest({});

    expect(request.projectId).toBe('default');
    expect(request.clientId).toBe('default');
    expect(request.title).toBe('Untitled Request');
    expect(request.description).toBe('');
    expect(request.priority).toBe('medium');
  });

  it('getRequestsByClient returns only that client\'s requests', async () => {
    await service.createRequest({ clientId: 'c1', title: 'A' });
    await service.createRequest({ clientId: 'c2', title: 'B' });
    await service.createRequest({ clientId: 'c1', title: 'C' });

    const results = await service.getRequestsByClient('c1');
    expect(results).toHaveLength(2);
    expect(results.every(r => r.clientId === 'c1')).toBe(true);
  });

  it('updateRequestStatus updates an existing request', async () => {
    const created = await service.createRequest({ clientId: 'c1' });

    const updated = await service.updateRequestStatus(created.id, 'completed');
    expect(updated.status).toBe('completed');

    const all = await service.findAll();
    expect(all.find(r => r.id === created.id)?.status).toBe('completed');
  });

  it('updateRequestStatus throws NotFoundException for a missing request', async () => {
    await expect(service.updateRequestStatus('REQ-missing', 'reviewed')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('findAll returns every created request', async () => {
    expect(await service.findAll()).toHaveLength(0);
    await service.createRequest({ clientId: 'c1' });
    await service.createRequest({ clientId: 'c2' });
    expect(await service.findAll()).toHaveLength(2);
  });
});
