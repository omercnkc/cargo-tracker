import * as FileSystem from 'expo-file-system';

const FS = FileSystem as any;

export class PodStorageRepository {
  /**
   * POD fotoğraflarının saklandığı kök dizin yolunu döndürür.
   */
  private static getPodDirectory(): string {
    const baseDir = FS.documentDirectory || '';
    return baseDir.endsWith('/') ? `${baseDir}pod_photos/` : `${baseDir}/pod_photos/`;
  }

  /**
   * POD fotoğraflarının saklandığı dizinin varlığını garanti eder.
   */
  static async ensureDirectoryExists(): Promise<string> {
    const podDir = this.getPodDirectory();
    try {
      const dirInfo = await FS.getInfoAsync(podDir);
      if (!dirInfo.exists) {
        await FS.makeDirectoryAsync(podDir, { intermediates: true });
      }
    } catch {
      // Directory creation error handler
    }
    return podDir;
  }

  /**
   * Çekilen fotoğrafı kalıcı cihaz depolama alanına deterministik dosya adı ile kaydeder.
   */
  static async saveLocalPodImage(shipmentId: string, sourceUri: string): Promise<{ localUri: string; filename: string }> {
    const podDir = await this.ensureDirectoryExists();
    const timestamp = Date.now();
    const filename = `${shipmentId}_${timestamp}.jpg`;
    const targetUri = `${podDir}${filename}`;

    try {
      await FS.copyAsync({
        from: sourceUri,
        to: targetUri,
      });
      return { localUri: targetUri, filename };
    } catch (err) {
      // Fallback: Copy fails return sourceUri
      return { localUri: sourceUri, filename };
    }
  }

  /**
   * Yerel dosyanın varlığını ve bilgilerini kontrol eder.
   */
  static async getLocalPodImageInfo(fileUri: string): Promise<any> {
    try {
      const fileInfo = await FS.getInfoAsync(fileUri);
      return fileInfo.exists ? fileInfo : null;
    } catch {
      return null;
    }
  }

  /**
   * Temizlik: Başarıyla senkronize edilen veya silinen yerel görseli diskten kaldırır.
   */
  static async deleteLocalPodImage(fileUri: string): Promise<boolean> {
    try {
      const fileInfo = await FS.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        await FS.deleteAsync(fileUri, { idempotent: true });
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Pre-flight disk alanı kontrolü.
   */
  static async getFreeDiskSpace(): Promise<number> {
    try {
      return await FS.getFreeDiskStorageAsync();
    } catch {
      return 0;
    }
  }
}
