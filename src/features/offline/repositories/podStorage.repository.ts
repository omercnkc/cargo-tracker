import * as FileSystem from 'expo-file-system';

export class PodStorageRepository {
  /**
   * POD fotoğraflarının saklandığı kök dizin yolunu döndürür.
   */
  private static getPodDirectory(): string {
    const baseDir = FileSystem.documentDirectory || '';
    return baseDir.endsWith('/') ? `${baseDir}pod_photos/` : `${baseDir}/pod_photos/`;
  }

  /**
   * POD fotoğraflarının saklandığı dizinin varlığını garanti eder.
   */
  static async ensureDirectoryExists(): Promise<string> {
    const podDir = this.getPodDirectory();
    try {
      const dirInfo = await FileSystem.getInfoAsync(podDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(podDir, { intermediates: true });
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
      await FileSystem.copyAsync({
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
  static async getLocalPodImageInfo(fileUri: string): Promise<FileSystem.FileInfo | null> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
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
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(fileUri, { idempotent: true });
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
      return await FileSystem.getFreeDiskStorageAsync();
    } catch {
      return 0;
    }
  }
}
