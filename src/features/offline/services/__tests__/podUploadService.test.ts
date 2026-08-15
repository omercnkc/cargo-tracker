import { PodUploadService } from '../podUpload.service';

declare const jest: any;
declare const describe: any;
declare const it: any;
declare const expect: any;

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///mock_dir/',
  readAsStringAsync: () => Promise.resolve('SGVsbG8gV29ybGQ='),
  getInfoAsync: () => Promise.resolve({ exists: true }),
  deleteAsync: () => Promise.resolve(),
  EncodingType: { Base64: 'base64' },
}));

jest.mock('../../../../services/supabase/supabase', () => ({
  supabase: {
    storage: {
      from: () => ({
        list: (_path: string, options?: any) => {
          if (options?.search?.includes('existing')) {
            return Promise.resolve({ data: [{ name: 'ship_existing.jpg' }], error: null });
          }
          return Promise.resolve({ data: [], error: null });
        },
        getPublicUrl: (path: string) => ({
          data: { publicUrl: `https://supabase.co/storage/v1/object/public/pod-images/${path}` },
        }),
        upload: () => Promise.resolve({ data: { path: 'uploaded' }, error: null }),
      }),
    },
    from: () => ({
      insert: () => Promise.resolve({ data: {}, error: null }),
      update: () => ({
        eq: () => Promise.resolve({ data: {}, error: null }),
      }),
    }),
  },
}));

describe('PodUploadService Unit Tests', () => {
  it('should bypass upload and return existing URL if pre-flight check finds file', async () => {
    const result = await PodUploadService.uploadPodImage(
      {
        shipmentId: 'ship_existing',
        localFileUri: 'file:///mock_dir/pod_photos/ship_existing.jpg',
        mimeType: 'image/jpeg',
        capturedAt: new Date().toISOString(),
      },
      'user_123'
    );

    expect(result.isExisting).toBe(true);
    expect(result.publicUrl).toContain('pod-images/user_123/ship_existing.jpg');
  });

  it('should upload image and return public URL if pre-flight check does not find file', async () => {
    const result = await PodUploadService.uploadPodImage(
      {
        shipmentId: 'ship_new',
        localFileUri: 'file:///mock_dir/pod_photos/ship_new.jpg',
        mimeType: 'image/jpeg',
        capturedAt: new Date().toISOString(),
      },
      'user_123'
    );

    expect(result.isExisting).toBe(false);
    expect(result.publicUrl).toContain('pod-images/user_123/ship_new.jpg');
  });
});
