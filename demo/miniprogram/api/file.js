import { fileUpload } from '../utils/fileUpload'

module.exports = {
  // 通用上传
  upload(filePath, formData) {
    return fileUpload({
      url: '/file/upload/' + formData.type,
      method: 'GET',
      filePath,
      formData,
      showToast: formData.showToast
    })
  }
}
