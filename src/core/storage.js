/**
 * Being stored and retreived from storage.
 *
 * Current implementation stores to localStorage. Local Storage should always be
 * accessed through this instace.
 * The pupose is make it easier while want to change to cookies.
**/

import encryption from './encryption'

const PREFIX = process.env.REACT_APP_STORAGE_PREFIX

function generateStorageName(name) {
  return PREFIX && PREFIX !== '' ? PREFIX + '.' + name : name
}

export const storage = {
  set(name, val) {
    const encryptedName = generateStorageName(name)

    return window.localStorage && window.localStorage.setItem(
      encryptedName,
      encryption.encrypt(JSON.stringify(val))
    )
  },
  get(name) {
    const encryptedName = generateStorageName(name)

    if (!window.localStorage.getItem(encryptedName)) return

    const decryptValue = encryption.decrypt(
      window.localStorage.getItem(encryptedName)
    )

    return window.localStorage && JSON.parse(decryptValue)
  },
  remove(name) {
    const encryptedName = generateStorageName(name)

    return window.localStorage && window.localStorage.removeItem(encryptedName)
  },
  removeAll() {
    return window.localStorage && window.localStorage.clear()
  },
  list() {
    return window.localStorage
  }
}

export default storage