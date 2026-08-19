/**
 * MR Central Upload Adapter for Lovable-Infinito v17.0
 * Substitui o UploadManager original mantendo a assinatura e comportamento.
 */

export const UploadManager = {
  /**
   * Realiza o upload de um arquivo para o MR Central.
   * @param {File} file - O arquivo a ser enviado.
   * @param {Object} options - Opções (inclui license_key e hwid).
   * @param {Function} onProgress - Callback de progresso (0-100).
   */
  async uploadFile(file, options, onProgress) {
    const { license_key, hwid } = options;

    if (!license_key) throw new Error("Chave de licença obrigatória para upload.");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("key", license_key);
    formData.append("hwid", hwid || "");

    const xhr = new XMLHttpRequest();
    
    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.ok && response.url) {
              resolve(response.url);
            } else {
              reject(new Error(response.error || "Erro no processamento do upload."));
            }
          } catch (e) {
            reject(new Error("Resposta inválida do servidor."));
          }
        } else {
          reject(new Error(`Erro HTTP ${xhr.status}: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener("error", () => reject(new Error("Falha na conexão de rede.")));
      xhr.addEventListener("abort", () => reject(new Error("Upload cancelado pelo usuário.")));

      xhr.open("POST", "https://mrsemlimites.lovable.app/api/public/ext-v17/upload");
      xhr.send(formData);
    });
  }
};
