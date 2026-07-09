/**
 * CameraService — foto pela câmera + escolha da galeria.
 *
 * Fase atual: contrato. Implementação usará @capacitor/camera.
 */
import { type NativeResult, notImplemented } from "./types";

export type CameraSource = "camera" | "gallery" | "prompt";

export interface CameraOptions {
  source?: CameraSource;
  quality?: number; // 0..100
  allowEditing?: boolean;
  saveToGallery?: boolean;
}

export interface CameraPhoto {
  /** Data URL ou file:// URI, dependendo da plataforma. */
  path: string;
  format: "jpeg" | "png" | "webp";
  width?: number;
  height?: number;
}

export const CameraService = {
  async takePhoto(_opts?: CameraOptions): Promise<NativeResult<CameraPhoto>> {
    return notImplemented("CameraService.takePhoto");
  },
  async pickFromGallery(_opts?: CameraOptions): Promise<NativeResult<CameraPhoto>> {
    return notImplemented("CameraService.pickFromGallery");
  },
};
