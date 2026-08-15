import { PodStorageRepository } from '../podStorage.repository';

declare const jest: any;
declare const describe: any;
declare const it: any;
declare const expect: any;

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///mock_dir/',
  getInfoAsync: (uri: string) => Promise.resolve({
    exists: uri.includes('existing'),
    size: 1024,
  }),
  makeDirectoryAsync: () => Promise.resolve(),
  copyAsync: () => Promise.resolve(),
  deleteAsync: () => Promise.resolve(),
  getFreeDiskStorageAsync: () => Promise.resolve(500000000),
}));

describe('PodStorageRepository Unit Tests', () => {
  it('should ensure storage directory exists', async () => {
    const dir = await PodStorageRepository.ensureDirectoryExists();
    expect(dir).toContain('pod_photos');
  });

  it('should save local POD image with deterministic filename', async () => {
    const result = await PodStorageRepository.saveLocalPodImage('ship_100', 'file:///temp/photo.jpg');
    expect(result.localUri).toContain('ship_100');
    expect(result.filename).toContain('ship_100');
  });

  it('should get local POD image info', async () => {
    const info = await PodStorageRepository.getLocalPodImageInfo('file:///mock_dir/pod_photos/existing.jpg');
    expect(info).not.toBeNull();
    expect(info?.exists).toBe(true);
  });

  it('should delete local POD image', async () => {
    const success = await PodStorageRepository.deleteLocalPodImage('file:///mock_dir/pod_photos/existing.jpg');
    expect(success).toBe(true);
  });

  it('should return free disk space', async () => {
    const freeSpace = await PodStorageRepository.getFreeDiskSpace();
    expect(freeSpace).toBeGreaterThan(0);
  });
});
