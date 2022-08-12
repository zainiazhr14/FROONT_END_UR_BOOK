function b64e(str) {
  if (!str) return

  return window.btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
    return String.fromCharCode(Number('0x' + p1))
  }))
}

function b64d(str) {
  if (!str) return

  return decodeURIComponent(Array.prototype.map.call(window.atob(str), function(c) {
    return '%' + c.charCodeAt(0).toString(16)
  }).join(''))
}

export const encryption = {
  encrypt(text) {
    if (!text) return ''
    return b64e(text)
  },
  decrypt(text) {
    if (!text) return ''
    return b64d(text)
  }
};

export default encryption